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
