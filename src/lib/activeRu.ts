// RU yang sedang dipilih Super Admin / Head Office lewat pemilih RU di header (multi-RU).
// Dikirim ke server sebagai header "X-Ru" oleh authFetchInterceptor. Kosong = semua RU.
// Untuk user RU biasa nilai ini diabaikan server (selalu data RU-nya sendiri).
const STORAGE_KEY = 'maestro_ru_aktif';

export const getActiveRu = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEY) || null;
  } catch {
    return null;
  }
};

export const setActiveRu = (ru: string | null) => {
  try {
    if (ru) localStorage.setItem(STORAGE_KEY, ru);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // localStorage tidak tersedia: pilihan RU tidak diingat, tetap "Semua RU"
  }
};
