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

const STORAGE_KEY = 'maestro_chatbot_messages';
const HISTORY_LIMIT = 12;

const newId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

// Riwayat disimpan per tab (sessionStorage) supaya tidak hilang saat pindah halaman,
// dan otomatis hilang saat tab ditutup.
const loadMessages = (): ChatMessage[] => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const useChatbot = (enabled: boolean) => {
  const [messages, setMessages] = useState<ChatMessage[]>(loadMessages);
  const [isLoading, setIsLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);
  const [limit, setLimit] = useState<number | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-40)));
    } catch {
      // penyimpanan penuh/diblokir: riwayat hanya hidup di memori
    }
  }, [messages]);

  const fetchQuota = useCallback(async () => {
    if (!enabled) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/Chat/quota`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setRemaining(data.sisa);
      setLimit(data.limit);
    } catch {
      // kuota hanya informasi; abaikan kalau gagal
    }
  }, [enabled]);

  const send = useCallback(async (question: string, context?: ChatPageContext) => {
    const trimmed = question.trim();
    if (!trimmed || isLoading) return;

    const history = messages
      .filter((m) => !m.isError)
      .slice(-HISTORY_LIMIT)
      .map((m) => ({ role: m.role, content: m.content }));

    const userMessage: ChatMessage = { id: newId(), role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/Chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ question: trimmed, history, context }),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        if (typeof data.sisa === 'number') setRemaining(data.sisa);
        if (res.status === 401) throw new Error('Sesi login sudah berakhir. Silakan login ulang.');
        throw new Error(data.message || `Gagal memproses pertanyaan (${res.status}).`);
      }

      setRemaining(data.sisa);
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
        {
          id: newId(),
          role: 'assistant',
          content: '',
          isError: true,
          blocks: [{ type: 'text', text: err instanceof Error && err.message ? err.message : 'Terjadi kesalahan. Coba lagi.' }],
        },
      ]);
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [isLoading, messages]);

  const reset = useCallback(() => {
    abortRef.current?.abort();
    setIsLoading(false);
    setMessages([]);
  }, []);

  return { messages, isLoading, remaining, limit, send, reset, fetchQuota };
};
