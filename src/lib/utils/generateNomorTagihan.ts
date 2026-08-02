export const generateNomorTagihan = (
  kboBagian: string | null | undefined,
  jumlahTagihanExisting: number,
  date: Date = new Date()
): string => {
  const urutan = jumlahTagihanExisting + 1;
  const bulan = String(date.getMonth() + 1).padStart(2, '0');
  const tahun = date.getFullYear();
  const bagian = kboBagian || '-';

  return `no.SPB/Tagihan-${urutan}/${bagian}/${bulan}/${tahun}`;
};
