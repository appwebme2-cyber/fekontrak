import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { useLocation } from 'react-router-dom';
import { ArrowLeft, Bot, History, Maximize2, MessageCircle, Minimize2, SquarePen, Send, X } from 'lucide-react';
import { useChatbot, type ChatPageContext } from '@/hooks/useChatbot';
import { ChatAnswerBlocks } from './ChatAnswerBlocks';
import { ChatHistoryPanel } from './ChatHistoryPanel';
import { ChatPinGate } from './ChatPinGate';

const SUGGESTIONS = [
  'Berapa jumlah kontrak aktif per tipe?',
  'Kontrak mana saja yang terlambat?',
  'Kontrak yang berakhir dalam 30 hari ke depan',
  'Tren nilai tagihan per bulan tahun ini',
  'Vendor dengan nilai kontrak terbesar',
  'Ringkas laporan harian minggu ini',
];

const PAGE_TITLES: Record<string, string> = {
  '/dashboard': 'Executive Dashboard',
  '/contract-performance': 'Performance Monitoring',
  '/favorites': 'Favorit',
  '/kontrak-lumpsum': 'Kontrak Lumpsum',
  '/kontrak-unit-price': 'Kontrak Unit Price',
  '/kontrak-tsa-ltsa': 'Kontrak TSA/LTSA',
  '/amandemen': 'Amandemen',
  '/invoices': 'Tagihan',
  '/user-purchase': 'User Purchase (PADI)',
  '/approval': 'Approval Dokumen',
  '/laporan-harian': 'Laporan Harian',
  '/material-requirement': 'Kebutuhan Material & Pekerjaan',
};

const buildPageContext = (pathname: string): ChatPageContext => {
  const kontrak = pathname.match(/^\/contracts\/([^/]+)/);
  if (kontrak) return { path: pathname, pageTitle: 'Detail Kontrak', kontrakId: decodeURIComponent(kontrak[1]) };

  const tagihan = pathname.match(/^\/(?:invoices|invoice-detail)\/([^/]+)/);
  if (tagihan) return { path: pathname, pageTitle: 'Detail Tagihan', tagihanId: decodeURIComponent(tagihan[1]) };

  if (/^\/material-requirement\/[^/]+/.test(pathname)) return { path: pathname, pageTitle: 'Detail Draft Kebutuhan Material' };
  if (/^\/user-purchase\/[^/]+/.test(pathname)) return { path: pathname, pageTitle: 'Detail User Purchase (PADI)' };

  return { path: pathname, pageTitle: PAGE_TITLES[pathname] };
};

/** Chatbot melayang di pojok kanan bawah; hanya dirender untuk pengguna internal (lihat Layout). */
export const ChatbotWidget = () => {
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  // Siapa yang boleh memakai chatbot ditentukan server (env Chat__AllowedRoles); tombol baru muncul setelah dicek
  const [allowed, setAllowed] = useState(false);
  const {
    messages, isLoading, statusText, remaining, limit, sessionId, sessions, sessionsLoading, pinUnlocked,
    send, reset, fetchQuota, loadSessions, openSession, deleteSession, verifyPin,
  } = useChatbot();
  // Konten chatbot terkunci sampai PIN benar (dicek server di setiap permintaan)
  const locked = !pinUnlocked;
  const location = useLocation();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let cancelled = false;
    fetchQuota().then((ok) => { if (!cancelled) setAllowed(ok); });
    return () => { cancelled = true; };
  }, [fetchQuota]);

  useEffect(() => {
    if (open) {
      fetchQuota();
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open, fetchQuota]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, isLoading, open]);

  const quotaExhausted = remaining === 0;

  const submit = (text?: string) => {
    const question = (text ?? input).trim();
    if (!question || isLoading || quotaExhausted) return;
    setInput('');
    send(question, buildPageContext(location.pathname));
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  };

  if (!allowed) return null;

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Buka Asisten MAESTRO"
        className="fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg transition-transform hover:scale-105 active:scale-95"
        style={{ background: '#E31E24' }}
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div
      className={`fixed z-40 flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl
        inset-x-2 bottom-2 top-16 sm:inset-x-auto sm:top-auto sm:right-5 sm:bottom-5
        ${expanded ? 'sm:h-[85vh] sm:w-[760px]' : 'sm:h-[620px] sm:w-[420px]'} sm:max-h-[calc(100vh-2.5rem)] sm:max-w-[calc(100vw-2.5rem)]`}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 text-white" style={{ background: 'linear-gradient(135deg, #002D6E, #004FA0)' }}>
        <Bot className="h-5 w-5 shrink-0" />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold">Asisten MAESTRO</div>
          <div className="text-[11px] text-blue-100">
            {remaining !== null && limit !== null ? `Sisa ${remaining} dari ${limit} pertanyaan hari ini` : 'Tanya data kontrak, tagihan, dan lainnya'}
          </div>
        </div>
        {!locked && (<>
        <button
          type="button"
          onClick={() => setShowHistory((v) => !v)}
          title={showHistory ? 'Kembali ke percakapan' : 'Riwayat percakapan'}
          className={`rounded p-1.5 hover:bg-white/15 ${showHistory ? 'bg-white/20' : ''}`}
        >
          {showHistory ? <ArrowLeft className="h-4 w-4" /> : <History className="h-4 w-4" />}
        </button>
        <button type="button" onClick={() => { reset(); setShowHistory(false); }} title="Percakapan baru" className="rounded p-1.5 hover:bg-white/15">
          <SquarePen className="h-4 w-4" />
        </button>
        </>)}
        <button type="button" onClick={() => setExpanded((v) => !v)} title={expanded ? 'Perkecil' : 'Perbesar'} className="hidden rounded p-1.5 hover:bg-white/15 sm:block">
          {expanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>
        <button type="button" onClick={() => setOpen(false)} title="Tutup" className="rounded p-1.5 hover:bg-white/15">
          <X className="h-4 w-4" />
        </button>
      </div>

      {locked && <ChatPinGate onVerify={verifyPin} />}

      {!locked && showHistory && (
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="border-b border-gray-100 px-4 py-2 text-xs font-medium text-gray-500">Riwayat percakapan (50 terakhir)</div>
          <ChatHistoryPanel
            sessions={sessions}
            loading={sessionsLoading}
            activeId={sessionId}
            onLoad={loadSessions}
            onOpen={async (id) => { if (await openSession(id)) setShowHistory(false); }}
            onDelete={deleteSession}
          />
        </div>
      )}

      {/* Messages */}
      <div ref={scrollRef} className={`flex-1 space-y-4 overflow-y-auto bg-gray-50/60 px-4 py-4 ${showHistory || locked ? 'hidden' : ''}`}>
        {messages.length === 0 && (
          <div className="space-y-3">
            <div className="rounded-xl border border-gray-200 bg-white p-3 text-sm text-gray-700">
              Halo! Saya bisa membantu menjawab pertanyaan seputar <strong>kontrak, amandemen, progress, tagihan</strong>, juga laporan harian, PADI, approval dokumen, dan kebutuhan material di MAESTRO,
              lengkap dengan tabel dan grafik. Saya hanya membaca data, tidak bisa mengubahnya.
            </div>
            <div className="text-xs font-medium text-gray-500">Contoh pertanyaan:</div>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  disabled={isLoading || quotaExhausted}
                  className="rounded-full border border-gray-200 bg-white px-3 py-1 text-left text-xs text-gray-700 hover:border-red-300 hover:bg-red-50 disabled:opacity-50"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) =>
          m.role === 'user' ? (
            <div key={m.id} className="flex justify-end">
              <div className="max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-br-sm px-3.5 py-2 text-sm text-white" style={{ background: '#E31E24' }}>
                {m.content}
              </div>
            </div>
          ) : (
            <div key={m.id} className="flex gap-2">
              <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#004FA0]">
                <Bot className="h-4 w-4" />
              </div>
              <div className={`min-w-0 flex-1 rounded-2xl rounded-tl-sm border px-3.5 py-2.5 ${m.isError ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
                <ChatAnswerBlocks blocks={m.blocks ?? []} onNavigate={() => setExpanded(false)} />
              </div>
            </div>
          ),
        )}

        {isLoading && (
          <div className="flex gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[#004FA0]">
              <Bot className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2 rounded-2xl rounded-tl-sm border border-gray-200 bg-white px-3.5 py-2.5 text-xs text-gray-500">
              <span className="flex gap-1">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
              </span>
              {statusText ?? 'Mengambil dan menganalisis data...'}
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className={`border-t border-gray-200 bg-white p-3 ${showHistory || locked ? 'hidden' : ''}`}>
        {quotaExhausted && (
          <div className="mb-2 rounded-md bg-amber-50 px-3 py-1.5 text-xs text-amber-700">
            Batas pertanyaan hari ini sudah habis. Silakan coba lagi besok.
          </div>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            maxLength={2000}
            disabled={quotaExhausted}
            placeholder="Tulis pertanyaan... (Enter untuk kirim)"
            className="max-h-32 min-h-[40px] flex-1 resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm focus:border-red-400 focus:outline-none focus:ring-2 focus:ring-red-500/15 disabled:bg-gray-50"
          />
          <button
            type="button"
            onClick={() => submit()}
            disabled={!input.trim() || isLoading || quotaExhausted}
            aria-label="Kirim"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white transition-opacity disabled:opacity-40"
            style={{ background: '#E31E24' }}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-1.5 text-[10px] text-gray-400">Jawaban AI bisa keliru. Cek kembali data penting di menu terkait.</div>
      </div>
    </div>
  );
};
