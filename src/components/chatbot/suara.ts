import { useCallback, useEffect, useRef, useState } from 'react';
import type { ChatBlock } from '@/hooks/useChatbot';

// Suara untuk Asisten MAESTRO memakai fitur bawaan browser (tanpa biaya/server tambahan):
// - dikte: Web Speech API (Chrome/Edge; pengenalan suara diproses layanan browser),
// - bacakan jawaban: speechSynthesis dengan suara Bahasa Indonesia bila tersedia.

interface HasilDikte {
  readonly isFinal: boolean;
  readonly 0: { readonly transcript: string };
}
interface PengenalSuara {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((e: { resultIndex: number; results: ArrayLike<HasilDikte> }) => void) | null;
  onerror: ((e: { error: string }) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}
type KonstruktorPengenal = new () => PengenalSuara;

const pengenal = (): KonstruktorPengenal | null => {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { SpeechRecognition?: KonstruktorPengenal; webkitSpeechRecognition?: KonstruktorPengenal };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
};

const PESAN_GALAT: Record<string, string> = {
  'not-allowed': 'Izin mikrofon ditolak. Izinkan mikrofon untuk situs ini di pengaturan browser.',
  'service-not-allowed': 'Izin mikrofon ditolak. Izinkan mikrofon untuk situs ini di pengaturan browser.',
  'no-speech': 'Suara tidak terdengar. Coba lagi dan bicara lebih dekat ke mikrofon.',
  'audio-capture': 'Mikrofon tidak ditemukan.',
  network: 'Pengenalan suara butuh koneksi internet.',
};

/**
 * Dikte pertanyaan: teks hasil ucapan dikirim ke onTeks (sementara & akhir). Mengembalikan status untuk tombol.
 * Teks tidak dikirim otomatis; pengguna masih bisa memeriksa/mengubahnya sebelum menekan Kirim.
 */
export function useDikte(onTeks: (teks: string) => void) {
  const didukung = !!pengenal();
  const [aktif, setAktif] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const ref = useRef<PengenalSuara | null>(null);
  const onTeksRef = useRef(onTeks);
  onTeksRef.current = onTeks;

  const berhenti = useCallback(() => ref.current?.stop(), []);

  const mulai = useCallback((teksAwal: string) => {
    const Kelas = pengenal();
    if (!Kelas) return;
    setGalat(null);
    const r = new Kelas();
    r.lang = 'id-ID';
    r.continuous = false;
    r.interimResults = true;
    const awalan = teksAwal.trim() ? `${teksAwal.trim()} ` : '';
    r.onresult = (e) => {
      let teks = '';
      for (let i = 0; i < e.results.length; i++) teks += e.results[i][0].transcript;
      onTeksRef.current(awalan + teks.trim());
    };
    r.onerror = (e) => { if (e.error !== 'aborted') setGalat(PESAN_GALAT[e.error] ?? 'Pengenalan suara gagal. Coba lagi.'); };
    r.onend = () => { setAktif(false); ref.current = null; };
    ref.current = r;
    setAktif(true);
    r.start();
  }, []);

  useEffect(() => () => ref.current?.abort(), []);

  return { didukung, aktif, galat, mulai, berhenti, hapusGalat: () => setGalat(null) };
}

/** Teks jawaban untuk dibacakan: paragraf dibaca, tabel/grafik cukup disebut judulnya */
export const teksUntukDibaca = (blocks: ChatBlock[]) =>
  blocks
    .map((b) => {
      if (b.type === 'text') return (b.text ?? '').replace(/\*\*/g, '').replace(/[#>`_]/g, ' ');
      if (b.type === 'table') return `Tabel ${b.title ?? ''} ditampilkan di layar.`;
      if (b.type === 'chart') return `Grafik ${b.title ?? ''} ditampilkan di layar.`;
      return '';
    })
    .filter(Boolean)
    .join('. ')
    .replace(/\s+/g, ' ')
    .trim();

const suaraIndonesia = () => {
  const semua = window.speechSynthesis?.getVoices() ?? [];
  const id = semua.filter((v) => v.lang?.toLowerCase().startsWith('id'));
  // Utamakan suara online/natural (mis. "Microsoft Gadis Online (Natural)" di Edge, "Google Bahasa Indonesia" di Chrome)
  return id.find((v) => /natural|online/i.test(v.name)) ?? id.find((v) => /google/i.test(v.name)) ?? id[0] ?? null;
};

/** Bacakan jawaban; hanya satu jawaban dibacakan sekaligus. `dibaca` = id pesan yang sedang dibacakan. */
export function useBacakan() {
  const didukung = typeof window !== 'undefined' && 'speechSynthesis' in window;
  const [dibaca, setDibaca] = useState<string | null>(null);

  useEffect(() => {
    if (!didukung) return;
    // Daftar suara di Chrome baru tersedia setelah event ini
    window.speechSynthesis.getVoices();
    const muat = () => window.speechSynthesis.getVoices();
    window.speechSynthesis.addEventListener?.('voiceschanged', muat);
    return () => {
      window.speechSynthesis.removeEventListener?.('voiceschanged', muat);
      window.speechSynthesis.cancel();
    };
  }, [didukung]);

  const hentikan = useCallback(() => {
    if (didukung) window.speechSynthesis.cancel();
    setDibaca(null);
  }, [didukung]);

  const bacakan = useCallback((id: string, teks: string) => {
    if (!didukung || !teks) return;
    window.speechSynthesis.cancel();
    // Kalimat panjang dipecah: beberapa browser berhenti sendiri pada teks yang sangat panjang
    const kalimat = teks.match(/[^.!?]+[.!?]*/g)?.map((k) => k.trim()).filter(Boolean) ?? [teks];
    const suara = suaraIndonesia();
    kalimat.forEach((k, i) => {
      const u = new SpeechSynthesisUtterance(k);
      u.lang = 'id-ID';
      if (suara) u.voice = suara;
      u.rate = 1.02;
      if (i === kalimat.length - 1) {
        u.onend = () => setDibaca((cur) => (cur === id ? null : cur));
        u.onerror = () => setDibaca((cur) => (cur === id ? null : cur));
      }
      window.speechSynthesis.speak(u);
    });
    setDibaca(id);
  }, [didukung]);

  return { didukung, dibaca, bacakan, hentikan };
}
