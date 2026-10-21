import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowLeft, Bell, Camera, CheckCircle2, Download, Fingerprint, FileText, Link2, Loader2, ShieldCheck, Smartphone, Sparkles, Upload, WifiOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

const API_URL = 'https://bekontrak-production.up.railway.app/api';
const URL_APK = `${API_URL}/app/android`;

interface InfoApk {
  tersedia: boolean;
  versi?: string;
  ukuran?: number;
  catatan?: string | null;
  diunggahPada?: string;
}

const ukuranMb = (b?: number) => (b ? `${(b / 1024 / 1024).toFixed(1).replace('.', ',')} MB` : '-');
const tanggal = (v?: string) =>
  v ? new Date(v).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-';

const FITUR = [
  { icon: Fingerprint, teks: 'Buka dengan sidik jari' },
  { icon: Bell, teks: 'Ringkasan setiap pagi' },
  { icon: Camera, teks: 'Foto progress dari lapangan' },
  { icon: Sparkles, teks: 'Asisten AI MAESTRO' },
  { icon: FileText, teks: 'Laporan PDF & bagikan' },
  { icon: WifiOff, teks: 'Tetap bisa dibuka offline' },
];

const LANGKAH = [
  'Ketuk tombol Unduh APK (atau pindai QR code dengan kamera HP).',
  'Buka file MAESTRO.apk yang sudah terunduh.',
  'Jika muncul peringatan, izinkan "Pasang aplikasi dari sumber ini" lalu kembali.',
  'Ketuk Pasang, buka MAESTRO, dan masuk dengan akun MAESTRO Anda.',
];

/** Halaman publik unduhan MAESTRO Mobile (Android). Super Admin dapat mengunggah APK versi baru di sini. */
const DownloadApp = () => {
  const [info, setInfo] = useState<InfoApk | null>(null);
  const { user } = useAuth();
  const halaman = `${window.location.origin}/download`;

  const muat = () =>
    fetch(`${API_URL}/app/android/info`)
      .then((r) => r.json())
      .then(setInfo)
      .catch(() => setInfo({ tersedia: false }));

  useEffect(() => { muat(); }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#002060] via-[#003B8E] to-[#0055B3] text-white">
      <div className="pointer-events-none fixed -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
      <div className="pointer-events-none fixed -bottom-24 -left-16 h-80 w-80 rounded-full bg-[#E4002B]/20 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="flex items-center justify-between">
          <div className="relative pl-3">
            <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E4002B]" />
            <div className="text-2xl font-black tracking-widest">MAESTRO</div>
            <div className="text-[10px] font-medium uppercase tracking-wider text-white/60">Contract Management</div>
          </div>
          <Link to={user ? '/' : '/auth'} className="flex items-center gap-1.5 text-sm text-white/80 hover:text-white">
            <ArrowLeft className="h-4 w-4" /> {user ? 'Kembali ke MAESTRO' : 'Masuk ke MAESTRO web'}
          </Link>
        </div>

        <div className="mt-10 grid items-center gap-10 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">
              <Smartphone className="h-3.5 w-3.5" /> Aplikasi Android
            </div>
            <h1 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">
              MAESTRO Mobile<br /><span className="text-blue-200">kontrak di genggaman.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base text-white/80">
              Pantau kontrak, tagihan, approval dokumen, dan progress pekerjaan langsung dari HP, sampai ke lapangan.
              Masuk dengan akun MAESTRO yang sama; data mengikuti hak akses akun Anda.
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {info === null ? (
                <Button disabled className="h-12 rounded-xl px-6 text-base"><Loader2 className="mr-2 h-5 w-5 animate-spin" />Memuat…</Button>
              ) : info.tersedia ? (
                <Button asChild className="h-12 rounded-xl bg-white px-6 text-base font-bold text-[#002060] hover:bg-blue-50">
                  <a href={URL_APK} download><Download className="mr-2 h-5 w-5" />Unduh APK</a>
                </Button>
              ) : (
                <div className="rounded-xl bg-white/10 px-4 py-3 text-sm">APK belum tersedia. Silakan cek kembali nanti.</div>
              )}
              {info?.tersedia && (
                <div className="text-sm text-white/75">
                  Versi <b className="text-white">{info.versi}</b> · {ukuranMb(info.ukuran)} · diperbarui {tanggal(info.diunggahPada)}
                </div>
              )}
            </div>
            {info?.catatan && <p className="mt-3 max-w-xl text-sm text-white/70">Yang baru: {info.catatan}</p>}

            <div className="mt-8 grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-3">
              {FITUR.map(({ icon: Icon, teks }) => (
                <div key={teks} className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2.5 text-sm font-medium">
                  <Icon className="h-4 w-4 shrink-0 text-blue-200" /> {teks}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-white p-6 text-center text-gray-900 shadow-2xl">
            <div className="text-lg font-bold">Pindai untuk mengunduh</div>
            <div className="text-sm text-gray-500">Arahkan kamera HP Android ke kode ini</div>
            <div className="mx-auto mt-5 w-fit rounded-2xl border border-gray-100 p-4">
              <QRCodeSVG value={halaman} size={220} level="M" fgColor="#002060" />
            </div>
            <div className="mt-4 break-all text-xs text-gray-400">{halaman}</div>
            <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-gray-500">
              <ShieldCheck className="h-4 w-4 text-green-600" /> Android 7.0 ke atas · resmi dari MAESTRO
            </div>
          </div>
        </div>

        <div className="mt-12 rounded-3xl bg-white/10 p-6 backdrop-blur">
          <div className="text-lg font-bold">Cara memasang</div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {LANGKAH.map((l, i) => (
              <div key={i} className="rounded-2xl bg-white/10 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-sm font-bold text-[#002060]">{i + 1}</div>
                <p className="mt-3 text-sm text-white/85">{l}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs text-white/60">
            Peringatan "sumber tidak dikenal" muncul karena aplikasi dipasang di luar Play Store; ini normal untuk aplikasi internal.
          </p>
        </div>

        {user && <KhususSuperAdmin onSelesai={setInfo} />}

        <p className="mt-10 text-center text-xs text-white/40">© 2025 Pertamina Patra Niaga · MAESTRO</p>
      </div>
    </div>
  );
};

/** Dirender hanya saat sudah login, supaya pengunjung publik tidak memicu permintaan hak akses */
function KhususSuperAdmin({ onSelesai }: { onSelesai: (i: InfoApk) => void }) {
  const { isSuperAdmin } = usePermissions();
  return isSuperAdmin ? <UnggahApk onSelesai={onSelesai} /> : null;
}

/** Kotak unggah APK baru, hanya untuk Super Admin */
function UnggahApk({ onSelesai }: { onSelesai: (i: InfoApk) => void }) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [versi, setVersi] = useState('');
  const [catatan, setCatatan] = useState('');
  const [persen, setPersen] = useState<number | null>(null);
  // Bawaan: server mengambil APK dari link EAS (tidak bergantung kecepatan internet pengunggah)
  const [cara, setCara] = useState<'link' | 'file'>('link');
  const [link, setLink] = useState('');
  const [mengambil, setMengambil] = useState(false);

  const berhasil = (data: InfoApk) => {
    onSelesai(data);
    setFile(null); setLink(''); setVersi(''); setCatatan('');
    toast({ title: 'APK berhasil disimpan', description: `Versi ${data?.versi} sekarang tersedia di halaman ini.` });
  };

  const ambilDariLink = async () => {
    if (!link.trim() || !versi.trim()) return;
    setMengambil(true);
    try {
      const res = await fetch(`${API_URL}/app/android/dari-link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` },
        body: JSON.stringify({ url: link.trim(), versi: versi.trim(), catatan: catatan.trim() || null }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok) berhasil(data);
      else toast({ title: 'Gagal mengambil APK', description: data?.message ?? `HTTP ${res.status}`, variant: 'destructive' });
    } catch {
      toast({ title: 'Gagal mengambil APK', description: 'Tidak dapat terhubung ke server MAESTRO. Coba lagi.', variant: 'destructive' });
    } finally {
      setMengambil(false);
    }
  };

  const unggah = () => {
    if (!file || !versi.trim()) return;
    const form = new FormData();
    form.append('file', file);
    form.append('versi', versi.trim());
    if (catatan.trim()) form.append('catatan', catatan.trim());

    // XHR supaya kemajuan unggah file besar terlihat
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_URL}/app/android`);
    xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('token') ?? ''}`);
    xhr.upload.onprogress = (e) => e.lengthComputable && setPersen(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      setPersen(null);
      let data: any = null;
      try { data = JSON.parse(xhr.responseText); } catch { /* bukan JSON */ }
      if (xhr.status >= 200 && xhr.status < 300) {
        berhasil(data);
      } else {
        toast({ title: 'Gagal mengunggah APK', description: data?.message ?? `HTTP ${xhr.status}`, variant: 'destructive' });
      }
    };
    xhr.onerror = () => {
      setPersen(null);
      toast({ title: 'Gagal mengunggah APK', description: 'Koneksi terputus saat mengunggah. Pakai "Ambil dari link EAS" supaya tidak bergantung kecepatan internet.', variant: 'destructive' });
    };
    setPersen(0);
    xhr.send(form);
  };

  return (
    <div className="mt-8 rounded-3xl bg-white p-6 text-gray-900 shadow-xl">
      <div className="flex items-center gap-2 text-lg font-bold"><Upload className="h-5 w-5 text-blue-600" /> Unggah APK versi baru</div>
      <p className="text-sm text-gray-500">Hanya Super Admin. Link &amp; QR code di atas tetap sama setelah APK diganti.</p>
      <div className="mt-4 inline-flex rounded-xl bg-gray-100 p-1 text-sm font-semibold">
        <button type="button" onClick={() => setCara('link')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${cara === 'link' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          <Link2 className="h-4 w-4" /> Ambil dari link EAS
        </button>
        <button type="button" onClick={() => setCara('file')}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 ${cara === 'file' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'}`}>
          <Upload className="h-4 w-4" /> Unggah file
        </button>
      </div>
      <div className="mt-4 grid gap-4 md:grid-cols-[1.4fr_0.6fr]">
        {cara === 'link' ? (
          <div>
            <Label htmlFor="link">Link unduhan APK dari expo.dev</Label>
            <Input id="link" className="mt-1" placeholder="https://expo.dev/artifacts/eas/....apk" value={link} onChange={(e) => setLink(e.target.value)} />
            <p className="mt-1 text-xs text-gray-500">
              Di halaman build expo.dev, buka menu <b>⋮</b> di samping <b>Install</b>, lalu klik kanan <b>Download</b> dan pilih <b>Salin alamat link</b> (link diawali expo.dev/artifacts/). Server MAESTRO yang mengambil
              APK-nya, jadi tidak bergantung kecepatan internet Anda. Link EAS hanya berlaku sementara, tapi salinan di MAESTRO tetap.
            </p>
          </div>
        ) : (
          <div>
            <Label htmlFor="apk">File APK</Label>
            <Input id="apk" type="file" accept=".apk,application/vnd.android.package-archive" className="mt-1"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            <p className="mt-1 text-xs text-gray-500">Butuh internet yang cukup cepat; file besar bisa terputus di tengah jalan.</p>
          </div>
        )}
        <div>
          <Label htmlFor="versi">Versi</Label>
          <Input id="versi" className="mt-1" placeholder="mis. 1.0.0" value={versi} onChange={(e) => setVersi(e.target.value)} />
        </div>
      </div>
      <div className="mt-3">
        <Label htmlFor="catatan">Yang baru (opsional)</Label>
        <Textarea id="catatan" className="mt-1" rows={2} placeholder="mis. Tambah fitur kalender & ekspor PDF"
          value={catatan} onChange={(e) => setCatatan(e.target.value)} />
      </div>
      {mengambil && (
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-600">
          <Loader2 className="h-4 w-4 animate-spin text-blue-600" /> Server MAESTRO sedang mengambil APK dari expo.dev…
        </div>
      )}
      {persen !== null && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-gray-500"><span>Mengunggah…</span><span>{persen}%</span></div>
          <Progress value={persen} className="h-2" />
        </div>
      )}
      <div className="mt-4 flex justify-end">
        {cara === 'link' ? (
          <Button onClick={ambilDariLink} disabled={!link.trim() || !versi.trim() || mengambil} className="bg-black text-white hover:bg-gray-800">
            {mengambil ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Ambil &amp; simpan APK
          </Button>
        ) : (
          <Button onClick={unggah} disabled={!file || !versi.trim() || persen !== null} className="bg-black text-white hover:bg-gray-800">
            {persen !== null ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Unggah APK
          </Button>
        )}
      </div>
    </div>
  );
}

export default DownloadApp;
