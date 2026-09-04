export const getEffectiveTanggalSelesai = (contract: {
  has_amendment?: boolean;
  tanggal_selesai_baru?: string | null;
  tanggal_selesai?: string | null;
}): string | null => {
  if (contract.has_amendment && contract.tanggal_selesai_baru) {
    return contract.tanggal_selesai_baru;
  }
  return contract.tanggal_selesai ?? null;
};

// Tanggal mulai efektif: pakai tanggal_mulai_baru dari amandemen waktu kalau ada,
// supaya perhitungan durasi/progress konsisten dengan tanggal selesai efektif di atas.
export const getEffectiveTanggalMulai = (contract: {
  has_amendment?: boolean;
  tanggal_mulai_baru?: string | null;
  tanggal_mulai?: string | null;
}): string | null => {
  if (contract.has_amendment && contract.tanggal_mulai_baru) {
    return contract.tanggal_mulai_baru;
  }
  return contract.tanggal_mulai ?? null;
};
