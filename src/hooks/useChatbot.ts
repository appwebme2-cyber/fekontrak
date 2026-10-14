import { useCallback, useEffect, useRef, useState } from 'react';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export interface ChatSeries {
  name: string;
  values: number[];
}

export interface ChatBlock {
  type: 'text' | 'table' | 'chart' | 'link';
  text?: string;
  title?: string;
  columns?: string[];
  rows?: string[][];
  chartType?: 'bar' | 'line' | 'pie';
  labels?: string[];
  series?: ChatSeries[];
  unit?: string;
  href?: string;
  label?: string;
}

/** Halaman yang sedang dibuka, dikirim supaya chatbot paham "kontrak ini" / "tagihan ini". */
export interface ChatPageContext {
  path: string;
  pageTitle?: string;
  kontrakId?: string;
  tagihanId?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  /** Pertanyaan user, atau JSON mentah jawaban (dikirim balik sebagai riwayat percakapan). */
  content: string;
  blocks?: ChatBlock[];
  isError?: boolean;
}

export interface ChatSessionSummary {
  id: string;
  judul: string;
  updatedAt: string;
}

const STORAGE_KEY = 'maestro_chatbot_messages';
const SESSION_KEY = 'maestro_chatbot_session';
const HISTORY_LIMIT = 12;

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

// Percakapan yang sedang terbuka disimpan per tab (sessionStorage) supaya tidak hilang saat pindah
// halaman; percakapan lengkap tersimpan di server dan bisa dibuka lagi lewat Riwayat.
const readStorage = <T,>(key: string, fallback: T): T => {
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key: string, value: unknown) => {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // penyimpanan penuh/diblokir: hanya hidup di memori
  }
};

/** Jawaban tersimpan berupa JSON {"blocks":[...]}; kalau bukan JSON tampilkan sebagai teks. */
const blocksFromRaw = (raw: string): ChatBlock[] => {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.blocks)) return parsed.blocks;
  } catch {
    // bukan JSON
  }
  return [{ type: 'text', text: raw }];
};

const errorMessage = (text: string): ChatMessage => ({
  id: newId(),
  role: 'assistant',
  content: '',
  isError: true,
  blocks: [{ type: 'text', text }],
});

interface StreamResult {
  answer?: { blocks?: ChatBlock[] };
  raw?: string;
  sisa?: number;
  sessionId?: string;
  message?: string;
}

/** Baca respons Server-Sent Events: "status" berkali-kali, lalu "done" atau "error". */
const readEventStream = async (
  res: Response,
  onStatus: (text: string) => void,
): Promise<{ ok: boolean; data: StreamResult }> => {
  if (!res.body) {
    const text = await res.text();
    throw new Error(text || 'Respons kosong dari server.');
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    let sep: number;
    while ((sep = buffer.indexOf('\n\n')) >= 0) {
      const chunk = buffer.slice(0, sep);
      buffer = buffer.slice(sep + 2);

      let event = 'message';
      let dataText = '';
      for (const line of chunk.split('\n')) {
        if (line.startsWith('event:')) event = line.slice(6).trim();
        else if (line.startsWith('data:')) dataText += line.slice(5).trim();
      }
      if (!dataText) continue;

      const data = JSON.parse(dataText) as StreamResult & { text?: string };
      if (event === 'status' && data.text) onStatus(data.text);
      else if (event === 'done') return { ok: true, data };
      else if (event === 'error') return { ok: false, data };
    }
  }
  throw new Error('Koneksi terputus sebelum jawaban selesai. Coba lagi.');
};

export const useChatbot = () => {
  const [messages, setMessages] = useState<ChatMessage[]>(() => readStorage<ChatMessage[]>(STORAGE_KEY, []));
  const [sessionId, setSessionId] = useState<string | null>(() => readStorage<string | null>(SESSION_KEY, null));
  const [isLoading, setIsLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState<number | null>(null);
  const [sessions, setSessions] = useState<ChatSessionSummary[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => { writeStorage(STORAGE_KEY, messages.slice(-40)); }, [messages]);
  useEffect(() => { writeStorage(SESSION_KEY, sessionId); }, [sessionId]);

  /** Ambil sisa kuota. Mengembalikan false kalau akun ini tidak diizinkan memakai chatbot (403/401). */
  const fetchQuota = useCallback(async (): Promise<boolean> => {
    try {
      const res = await fetch(`${API_URL}/Chat/quota`, { headers: authHeader() });
      if (!res.ok) return false;
      const data = await res.json();
      setRemaining(data.sisa);
      setLimit(data.limit);
      return true;
    } catch {
      return false;
    }
  }, []);

  const send = useCallback(async (question: string, context?: ChatPageContext) => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    const history = messages
      .filter((m) => !m.isError)
      .slice(-HISTORY_LIMIT)
      .map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, { id: newId(), role: 'user', content: trimmed }]);
    setIsLoading(true);
    setStatusText(null);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_URL}/Chat/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeader() },
        body: JSON.stringify({ question: trimmed, history, context, sessionId }),
        signal: controller.signal,
      });

      // Penolakan sebelum proses dimulai (login habis, kuota, dll.) datang sebagai JSON biasa
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (typeof data.sisa === 'number') setRemaining(data.sisa);
        if (res.status === 401) throw new Error('Sesi login sudah berakhir. Silakan login ulang.');
        throw new Error(data.message || `Gagal memproses pertanyaan (${res.status}).`);
      }

      const { ok, data } = await readEventStream(res, setStatusText);
      if (!ok) throw new Error(data.message || 'Gagal memproses pertanyaan.');

      if (typeof data.sisa === 'number') setRemaining(data.sisa);
      if (data.sessionId) setSessionId(data.sessionId);
      setMessages((prev) => [
        ...prev,
        {
          id: newId(),
          role: 'assistant',
          content: data.raw ?? JSON.stringify(data.answer ?? {}),
          blocks: Array.isArray(data.answer?.blocks) ? data.answer.blocks : [],
        },
      ]);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      setMessages((prev) => [
        ...prev,
        errorMessage(err instanceof Error && err.message ? err.message : 'Terjadi kesalahan. Coba lagi.'),
      ]);
    } finally {
      setIsLoading(false);
      setStatusText(null);
      abortRef.current = null;
    }
  }, [isLoading, messages, sessionId]);

  /** Mulai percakapan baru (percakapan lama tetap ada di Riwayat). */
  const reset = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
    setStatusText(null);
    setMessages([]);
    setSessionId(null);
  }, []);

  const loadSessions = useCallback(async () => {
    setSessionsLoading(true);
    try {
      const res = await fetch(`${API_URL}/Chat/sessions`, { headers: authHeader() });
      if (res.ok) setSessions(await res.json());
    } catch {
      // daftar riwayat gagal dimuat: biarkan daftar lama
    } finally {
      setSessionsLoading(false);
    }
  }, []);

  const openSession = useCallback(async (id: string) => {
    abortRef.current?.abort();
    try {
      const res = await fetch(`${API_URL}/Chat/sessions/${encodeURIComponent(id)}`, { headers: authHeader() });
      if (!res.ok) throw new Error();
      const data: { messages: { id: string; role: string; content: string }[] } = await res.json();
      setMessages(data.messages.map((m) =>
        m.role === 'assistant'
          ? { id: m.id, role: 'assistant', content: m.content, blocks: blocksFromRaw(m.content) }
          : { id: m.id, role: 'user', content: m.content },
      ));
      setSessionId(id);
      return true;
    } catch {
      return false;
    }
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/Chat/sessions/${encodeURIComponent(id)}`, { method: 'DELETE', headers: authHeader() });
      if (!res.ok) return false;
      setSessions((prev) => prev.filter((s) => s.id !== id));
      if (id === sessionId) {
        setMessages([]);
        setSessionId(null);
      }
      return true;
    } catch {
      return false;
    }
  }, [sessionId]);

  return {
    messages, isLoading, statusText, remaining, limit, sessionId,
    sessions, sessionsLoading,
    send, reset, fetchQuota, loadSessions, openSession, deleteSession,
  };
};
