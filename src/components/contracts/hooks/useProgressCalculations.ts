
export function useProgressCalculations() {
  // Calculate KOM warning for Pre-KOM contracts
  const getKomWarning = (terimaDokumen: string | null, maksimalKom: string | null) => {
    if (!terimaDokumen || !maksimalKom) return null;
    
    const now = new Date();
    const maxKomDate = new Date(maksimalKom);
    const diffTime = maxKomDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 4 && diffDays >= 0) {
      return `KOM harus dilakukan dalam ${diffDays} hari!`;
    }
    
    return null;
  };

  // Calculate KOM progress for Pre-KOM contracts
  const calculateKomProgress = (terimaDokumen: string | null, maksimalKom: string | null) => {
    if (!terimaDokumen || !maksimalKom) return { progress: 0, remainingDays: 0 };
    
    const start = new Date(terimaDokumen);
    const end = new Date(maksimalKom);
    const current = new Date();
    
    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.ceil((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, totalDays - elapsedDays);
    
    const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);
    
    return { progress, remainingDays };
  };

  // Calculate contract duration progress for active/completed contracts
  const calculateDurationProgress = (startDate: string | null, endDate: string | null) => {
    if (!startDate || !endDate) return { progress: 0, remainingDays: 0, lateDays: 0, totalDays: 0 };

    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date();

    const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    const elapsedDays = Math.max(0, Math.ceil((current.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    const remainingDays = Math.max(0, totalDays - elapsedDays);
    // Dihitung terpisah dari remainingDays (yang di-clamp ke 0) supaya jumlah hari
    // keterlambatan tidak hilang saat kontrak sudah lewat tanggal selesai.
    const lateDays = Math.max(0, elapsedDays - totalDays);

    const progress = Math.min(Math.max((elapsedDays / totalDays) * 100, 0), 100);

    return { progress, remainingDays, lateDays, totalDays };
  };

  return {
    getKomWarning,
    calculateKomProgress,
    calculateDurationProgress,
  };
}
