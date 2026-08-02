
export const useFormValidation = (formData: any) => {
  // Basic form validation - hanya field wajib
  const isBasicValid = Boolean(
    formData.judul_kontrak?.trim() &&
    formData.tipe_kontrak &&
    formData.status_kontrak &&
    formData.tanggal_terima_dokumen
  );

  // Technical details validation - selalu valid
  const isTechnicalValid = true;

  // Vendor validation - selalu valid untuk sekarang
  const isVendorValid = true;

  // Progress validation - selalu valid
  const isProgressValid = true;

  return {
    isBasicValid,
    isTechnicalValid,
    isVendorValid,
    isProgressValid
  };
};
