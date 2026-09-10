import { useState } from 'react';

// State yang tersimpan di sessionStorage per tab, bukan di komponen saja.
// Dipakai untuk filter halaman daftar (search, dropdown, dll) supaya nilainya
// tetap ada waktu user pindah ke halaman lain (mis. buka detail kontrak) lalu
// kembali (tombol back browser atau navigasi balik) - bukan reset ke default.
export function usePersistedState<T>(key: string, defaultValue: T): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = sessionStorage.getItem(key);
      return stored !== null ? (JSON.parse(stored) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  });

  const setPersistedState = (value: T) => {
    setState(value);
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Private browsing / storage penuh - abaikan, tetap jalan tanpa persist.
    }
  };

  return [state, setPersistedState];
}
