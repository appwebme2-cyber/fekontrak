
import { useMemo } from 'react';
import { useContracts } from './useContracts';
import { useTagihans } from './useTagihans';
import { useVendors } from './useVendors';
import { useKonfigurasiSistem } from './useKonfigurasiSistem';

export const useApplicationData = () => {
  const { contracts, isLoading: contractsLoading, error: contractsError } = useContracts();
  const { tagihans, isLoading: tagihansLoading, error: tagihansError } = useTagihans();
  const { vendors, isLoading: vendorsLoading, error: vendorsError } = useVendors();
  const { konfigurasi, isLoading: konfigLoading, error: konfigError } = useKonfigurasiSistem();

  const isLoading = contractsLoading || tagihansLoading || vendorsLoading || konfigLoading;
  const hasError = contractsError || tagihansError || vendorsError || konfigError;

  // Memoized processed data untuk avoid recalculation
  const processedData = useMemo(() => {
    if (!contracts.length) return null;

    // Combine contracts with vendor data
    const contractsWithVendors = contracts.map(contract => ({
      ...contract,
      vendor_name: vendors.find(v => v.id_vendor === contract.id_vendor)?.nama_vendor || 'Unknown'
    }));

    // Group tagihans by contract
    const tagihansByContract = tagihans.reduce((acc, tagihan) => {
      if (!acc[tagihan.id_kontrak]) {
        acc[tagihan.id_kontrak] = [];
      }
      acc[tagihan.id_kontrak].push(tagihan);
      return acc;
    }, {} as Record<string, typeof tagihans>);

    return {
      contractsWithVendors,
      tagihansByContract,
      totalContracts: contracts.length,
      activeContracts: contracts.filter(c => c.status_kontrak === 'Active' || c.status_kontrak === 'Aktif').length,
      totalVendors: vendors.length,
      totalTagihans: tagihans.length
    };
  }, [contracts, vendors, tagihans]);

  return {
    // Raw data
    contracts,
    tagihans,
    vendors,
    konfigurasi,
    
    // Loading states
    isLoading,
    hasError,
    
    // Processed data
    processedData,
    
    // Quick access functions
    getVendorName: (vendorId: string) => {
      const vendor = vendors.find(v => v.id_vendor === vendorId);
      return vendor?.nama_vendor || 'Vendor tidak ditemukan';
    },
    
    getContractTagihans: (contractId: string) => {
      return tagihans.filter(t => t.id_kontrak === contractId);
    },
    
    getKonfigValue: (settingName: string) => {
      const setting = konfigurasi.find(k => k.nama_setting === settingName);
      return setting?.nilai_setting;
    }
  };
};
