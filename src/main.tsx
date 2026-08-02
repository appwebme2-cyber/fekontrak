import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './lib/authFetchInterceptor'

// Setelah deploy baru, chunk lazy-load lama (hash berubah) bisa gagal dimuat.
// Reload sekali untuk ambil index.html & referensi chunk terbaru; pakai jendela waktu
// (bukan flag permanen) supaya tetap bisa reload lagi kalau masalah ini terulang nanti.
window.addEventListener('vite:preloadError', () => {
  const key = 'vite-preload-reload-at';
  const last = Number(sessionStorage.getItem(key) || 0);
  if (Date.now() - last > 10_000) {
    sessionStorage.setItem(key, String(Date.now()));
    window.location.reload();
  }
});

createRoot(document.getElementById("root")!).render(<App />);
