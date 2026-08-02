
import { useMemo } from 'react';
import { useContracts, useKonfigurasiSistem } from '@/hooks/useNewDatabase';
import { 
  analyzeContractProgressDeviations, 
  getProgressStatusConfig,
  ContractProgressAnalysis 
} from '@/lib/utils/progressUtils';

export interface ProgressDeviationStatus extends ContractProgressAnalysis {
  is_warning: boolean;
}

export const useProgressDeviation = () => {
  const { contracts: kontraks = [] } = useContracts();
  const { konfigurasi = [] } = useKonfigurasiSistem();

  const deviationSettings = useMemo(() => {
    return getProgressStatusConfig(konfigurasi);
  }, [konfigurasi]);

  const progressDeviations = useMemo(() => {
    if (!deviationSettings.warningEnabled) return [];

    const analyses = analyzeContractProgressDeviations(kontraks, deviationSettings);
    
    return analyses.map(analysis => ({
      ...analysis,
      is_warning: analysis.isWarning
    }));
  }, [kontraks, deviationSettings]);

  const warnings = progressDeviations.filter(item => item.is_warning);

  return {
    progressDeviations,
    warnings,
    deviationSettings,
    totalWarnings: warnings.length,
    getContractProgressStatus: (contractId: string) => {
      return progressDeviations.find(item => item.id_kontrak === contractId);
    }
  };
};
