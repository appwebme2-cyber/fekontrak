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

/** Diam selama ini (ms) setelah bicara = pertanyaan dianggap selesai lalu dikirim */
export const JEDA_KIRIM = 2000;
// Ucapan "kirim" di akhir kalimat = kirim sekarang (kata "kirim" tidak ikut terkirim)
const KATA_KIRIM = /[\s,.]*\bkirim\b[\s.!]*$/i;

/**
 * Dikte pertanyaan: teks ucapan ditampilkan lewat onTeks selama bicara. Pertanyaan dikirim otomatis lewat
 * onSelesai bila pengguna diam ±2 detik atau mengucapkan "kirim". Bila tombol mikrofon ditekan lagi untuk
 * berhenti, teks tidak dikirim (pengguna bisa memeriksa/mengubahnya dulu).
 */
export function useDikte(onTeks: (teks: string) => void, onSelesai?: (teks: string) => void) {
  const didukung = !!pengenal();
  const [aktif, setAktif] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const ref = useRef<PengenalSuara | null>(null);
  const jeda = useRef<ReturnType<typeof setTimeout> | null>(null);
  const kirimSaatSelesai = useRef(false);
  const teksTerakhir = useRef('');
  const onTeksRef = useRef(onTeks);
  const onSelesaiRef = useRef(onSelesai);
  onTeksRef.current = onTeks;
  onSelesaiRef.current = onSelesai;

  const hapusJeda = () => {
    if (jeda.current) clearTimeout(jeda.current);
    jeda.current = null;
  };

  /** Berhenti manual (tombol): teks tetap di kotak, tidak dikirim */
  const berhenti = useCallback(() => {
    hapusJeda();
    kirimSaatSelesai.current = false;
    ref.current?.stop();
  }, []);

  const mulai = useCallback((teksAwal: string) => {
    const Kelas = pengenal();
    if (!Kelas) return;
    setGalat(null);
    kirimSaatSelesai.current = false;
    const r = new Kelas();
    r.lang = 'id-ID';
    r.continuous = true;
    r.interimResults = true;
    const awalan = teksAwal.trim() ? `${teksAwal.trim()} ` : '';
    teksTerakhir.current = awalan.trim();

    const selesaikan = () => {
      hapusJeda();
      kirimSaatSelesai.current = true;
      r.stop();
    };

    r.onresult = (e) => {
      let teks = '';
      for (let i = 0; i < e.results.length; i++) teks += e.results[i][0].transcript;
      const lengkap = (awalan + teks.trim()).trim();
      if (KATA_KIRIM.test(lengkap)) {
        teksTerakhir.current = lengkap.replace(KATA_KIRIM, '').trim();
        onTeksRef.current(teksTerakhir.current);
        selesaikan();
        return;
      }
      teksTerakhir.current = lengkap;
      onTeksRef.current(lengkap);
      // Hitung ulang jeda diam setiap ada ucapan baru
      hapusJeda();
      jeda.current = setTimeout(selesaikan, JEDA_KIRIM);
    };
    r.onerror = (e) => {
      hapusJeda();
      kirimSaatSelesai.current = false;
      if (e.error !== 'aborted') setGalat(PESAN_GALAT[e.error] ?? 'Pengenalan suara gagal. Coba lagi.');
    };
    r.onend = () => {
      hapusJeda();
      setAktif(false);
      ref.current = null;
      const teks = teksTerakhir.current;
      if (kirimSaatSelesai.current && teks) onSelesaiRef.current?.(teks);
      kirimSaatSelesai.current = false;
    };
    ref.current = r;
    setAktif(true);
    r.start();
  }, []);

  useEffect(() => () => { hapusJeda(); ref.current?.abort(); }, []);

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

// ===================================================================== TEMAN MENUNGGU
// Selama Asisten mencari jawaban untuk pertanyaan lewat suara, Asisten "bergumam" seperti orang yang sedang
// mengecek data: sapaan sesuai topik, kabar tiap langkah dari server, dan sesekali kalimat pengisi.

const acak = <T,>(list: readonly T[]) => list[Math.floor(Math.random() * list.length)];

const SAPAAN_TOPIK: [RegExp, string[]][] = [
  [/tagihan|invoice|bayar|pembayaran|sla/i, ['Oke, aku cek data tagihannya dulu ya.', 'Siap, sebentar ya, aku lihat tagihannya.']],
  [/approval|dokumen|persetujuan/i, ['Oke, aku cek dokumen yang masuk dulu ya.', 'Sebentar ya, aku lihat dokumen approval-nya.']],
  [/material|bom|rab/i, ['Sebentar ya, aku buka data kebutuhan materialnya.', 'Oke, aku cek draft materialnya dulu.']],
  [/laporan|harian|maintenance/i, ['Oke, aku cek laporan hariannya dulu ya.', 'Sebentar, aku lihat laporan dari lapangan.']],
  [/vendor|kontraktor|rekanan/i, ['Sebentar ya, aku cari data vendornya.', 'Oke, aku cek vendornya dulu.']],
  [/amandemen|addendum/i, ['Oke, aku cek amandemennya dulu ya.']],
  [/kom\b|kontrak|progress|s-?curve|nilai/i, ['Siap, aku lihat data kontraknya sebentar ya.', 'Oke, sebentar ya, aku cek kontraknya dulu.']],
];
const SAPAAN_UMUM = ['Oke, sebentar ya, aku cek dulu.', 'Siap, aku carikan dulu ya.', 'Hmm, sebentar ya, aku lihat datanya.'];

/** Kabar langkah dari server (status) -> ucapan santai; null = tidak diucapkan */
const dariStatus = (status: string): string | null => {
  const s = status.toLowerCase();
  if (s.startsWith('memahami')) return null; // sudah diwakili sapaan pembuka
  if (s.includes('menyusun jawaban')) return acak(['Oke, sudah ketemu. Aku rangkum dulu ya.', 'Datanya sudah dapat, tinggal aku susun jawabannya.']);
  if (s.includes('statistik')) return acak(['Sekarang aku hitung angkanya, biar akurat.', 'Aku jumlahkan dulu ya angka-angkanya.']);
  if (s.includes('detail kontrak')) return 'Aku buka detail kontraknya dulu.';
  if (s.includes('mencari kontrak')) return acak(['Lagi aku cari kontraknya.', 'Aku telusuri daftar kontraknya dulu.']);
  if (s.includes('tagihan')) return acak(['Lagi aku telusuri tagihannya.', 'Aku cek tahap-tahap tagihannya dulu.']);
  if (s.includes('amandemen')) return 'Aku lihat riwayat amandemennya.';
  if (s.includes('query')) return acak(['Datanya lagi aku olah ya.', 'Aku olah datanya dulu supaya tepat.']);
  return acak(['Aku ambil datanya dulu ya.', 'Sedang aku kumpulkan datanya.']);
};

const ISIAN = [
  'Masih aku proses ya, sebentar lagi.',
  'Datanya lumayan banyak, aku pastikan dulu supaya akurat.',
  'Sedikit lagi ya.',
  'Hampir selesai, tinggal aku rapikan.',
];
const JEDA_ISIAN = 7000; // ms tanpa suara sebelum kalimat pengisi
const MAKS_ISIAN = 3;

const ucapkan = (teks: string) => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
  const u = new SpeechSynthesisUtterance(teks);
  u.lang = 'id-ID';
  const suara = suaraIndonesia();
  if (suara) u.voice = suara;
  u.rate = 1.05;
  window.speechSynthesis.speak(u);
};

/**
 * Aktif selama menunggu jawaban atas pertanyaan lewat suara. Jawaban yang datang dibacakan dengan bacakan()
 * yang membatalkan semua ucapan pengisi yang masih antre.
 */
export function useTemanTunggu(aktif: boolean, pertanyaan: string | null, status: string | null) {
  const terakhir = useRef(0);
  const jumlahIsian = useRef(0);
  const sudahDiucap = useRef(new Set<string>());

  const bicara = (teks: string) => {
    terakhir.current = Date.now();
    ucapkan(teks);
  };

  // Sapaan pembuka + kalimat pengisi berkala selama menunggu
  useEffect(() => {
    if (!aktif) return;
    jumlahIsian.current = 0;
    sudahDiucap.current = new Set();
    const topik = SAPAAN_TOPIK.find(([pola]) => pola.test(pertanyaan ?? ''));
    bicara(acak(topik ? topik[1] : SAPAAN_UMUM));
    const t = setInterval(() => {
      if (window.speechSynthesis?.speaking || jumlahIsian.current >= MAKS_ISIAN) return;
      if (Date.now() - terakhir.current < JEDA_ISIAN) return;
      jumlahIsian.current++;
      bicara(ISIAN[(jumlahIsian.current - 1) % ISIAN.length]);
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- pertanyaan dibaca sekali saat mulai menunggu
  }, [aktif]);

  // Kabar langkah dari server diucapkan (satu kali per jenis, tidak menumpuk)
  useEffect(() => {
    if (!aktif || !status) return;
    const kalimat = dariStatus(status);
    const kunci = status.replace(/".*"/, '').trim();
    if (!kalimat || sudahDiucap.current.has(kunci)) return;
    if (window.speechSynthesis?.pending) return; // masih ada antrean ucapan; lewati supaya tidak cerewet
    sudahDiucap.current.add(kunci);
    bicara(kalimat);
  }, [aktif, status]);
}
