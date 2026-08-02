import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export const useUnitPriceProgress = (contractId?: string) => {
  const { data: progressItems = [], isLoading, error } = useQuery({
    queryKey: ['unit-price-progress', contractId],
    queryFn: async () => {
      if (!contractId) return [];

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/progressunitprice/kontrak/${contractId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error("Gagal ambil progress");

      // mapping backend → FE lama
      return data.map((p: any) => ({
        id_progress: p.idProgress,
        id_kontrak: p.idKontrak,
        nama_item: p.namaItem,
        satuan: p.satuan,
        qty_rencana: p.qtyRencana,
        qty_aktual: p.qtyAktual,
        harga_satuan: p.hargaSatuan,
        tanggal_update: p.tanggalUpdate,
        total_rencana: p.totalRencana,
        total_aktual: p.totalAktual
      }));
    },
    enabled: !!contractId
  });

  const progressSummary = useMemo(() => {
    if (!progressItems.length) return {
      totalPlannedValue: 0,
      totalActualValue: 0,
      totalItems: 0,
      completedItems: 0,
      progressPercentage: 0,
      remainingValue: 0
    };

    const totalPlannedValue = progressItems.reduce((sum, item) =>
      sum + item.total_rencana, 0);

    const totalActualValue = progressItems.reduce((sum, item) =>
      sum + item.total_aktual, 0);

    const completedItems = progressItems.filter(item =>
      item.qty_aktual >= item.qty_rencana).length;

    const progressPercentage = totalPlannedValue > 0
      ? (totalActualValue / totalPlannedValue) * 100
      : 0;

    return {
      totalPlannedValue,
      totalActualValue,
      totalItems: progressItems.length,
      completedItems,
      progressPercentage,
      remainingValue: totalPlannedValue - totalActualValue
    };
  }, [progressItems]);

  return {
    progressItems,
    progressSummary,
    isLoading,
    error
  };
};