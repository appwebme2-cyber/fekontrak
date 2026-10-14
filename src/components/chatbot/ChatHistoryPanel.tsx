import { useEffect, useState } from 'react';
import { MessageSquare, Trash2 } from 'lucide-react';
import type { ChatSessionSummary } from '@/hooks/useChatbot';

interface Props {
  sessions: ChatSessionSummary[];
  loading: boolean;
  activeId: string | null;
  onLoad: () => void;
  onOpen: (id: string) => void;
  onDelete: (id: string) => void;
}

const formatTime = (iso: string) => {
  // Waktu dari server dalam UTC tanpa zona; tandai sebagai UTC supaya tampil dalam waktu lokal
  const date = new Date(/[zZ]|[+-]\d\d:\d\d$/.test(iso) ? iso : `${iso}Z`);
  if (Number.isNaN(date.getTime())) return '';
  const sameDay = date.toDateString() === new Date().toDateString();
  return sameDay
    ? date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
};

/** Daftar percakapan tersimpan milik user yang sedang login. */
export const ChatHistoryPanel = ({ sessions, loading, activeId, onLoad, onOpen, onDelete }: Props) => {
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => { onLoad(); }, [onLoad]);

  if (loading && sessions.length === 0) {
    return <div className="p-6 text-center text-xs text-gray-500">Memuat riwayat...</div>;
  }

  if (sessions.length === 0) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">
        Belum ada percakapan tersimpan. Percakapan akan muncul di sini setelah Anda bertanya.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-gray-100">
      {sessions.map((s) => (
        <li key={s.id} className={`group flex items-center gap-2 px-4 py-2.5 hover:bg-gray-50 ${s.id === activeId ? 'bg-red-50/60' : ''}`}>
          <button type="button" onClick={() => onOpen(s.id)} className="flex min-w-0 flex-1 items-start gap-2 text-left">
            <MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-gray-400" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm text-gray-800">{s.judul}</span>
              <span className="block text-[11px] text-gray-400">{formatTime(s.updatedAt)}</span>
            </span>
          </button>
          {confirmId === s.id ? (
            <span className="flex shrink-0 items-center gap-1 text-[11px]">
              <button type="button" onClick={() => { onDelete(s.id); setConfirmId(null); }} className="rounded bg-red-600 px-2 py-0.5 font-medium text-white hover:bg-red-700">
                Hapus
              </button>
              <button type="button" onClick={() => setConfirmId(null)} className="rounded px-2 py-0.5 text-gray-600 hover:bg-gray-100">
                Batal
              </button>
            </span>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmId(s.id)}
              title="Hapus percakapan"
              className="shrink-0 rounded p-1 text-gray-400 opacity-60 hover:bg-gray-100 hover:text-red-600 group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
};
