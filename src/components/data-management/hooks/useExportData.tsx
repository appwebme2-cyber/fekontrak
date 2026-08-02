import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useContracts } from "@/hooks/useContracts";
import { useTagihans } from "@/hooks/useTagihans";
import { useVendors } from "@/hooks/useVendors";
import * as XLSX from 'xlsx';
import { format } from "date-fns";

export function useExportData() {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  const { contracts } = useContracts();
  const { tagihans } = useTagihans();
  const { vendors } = useVendors();

  const formatValue = (value: any, field: string) => {
    if (value === null || value === undefined) return '';
    
    if (field.includes('tanggal') || field.includes('_at')) {
      if (value instanceof Date) {
        return format(value, 'yyyy-MM-dd');
      }
      if (typeof value === 'string') {
        try {
          return format(new Date(value), 'yyyy-MM-dd');
        } catch {
          return value;
        }
      }
    }
    
    if (field.includes('nilai') || field.includes('harga')) {
      return typeof value === 'number' ? value : '';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Ya' : 'Tidak';
    }
    
    return value;
  };

  const getFieldLabel = (field: string) => {
    const labels: Record<string, string> = {
      // Contract fields
      judul_kontrak: 'Judul Kontrak',
      tipe_kontrak: 'Tipe Kontrak',
      status_kontrak: 'Status Kontrak',
      direksi_pekerjaan: 'Direksi Pekerjaan',
      disiplin: 'Disiplin',
      nilai_awal: 'Nilai Awal',
      nilai_kontrak_baru: 'Nilai Kontrak Baru',
      tkdn_percentage: 'Persentase TKDN',
      tanggal_kom: 'Tanggal KOM',
      tanggal_mulai: 'Tanggal Mulai',
      tanggal_selesai: 'Tanggal Selesai',
      tanggal_lkp: 'Tanggal LKP',
      progress_plan: 'Progress Rencana (%)',
      progress_actual: 'Progress Aktual (%)',
      aktivitas_saat_ini: 'Aktivitas Saat Ini',
      kendala: 'Kendala',
      has_amendment: 'Ada Amandemen',
      no_amandemen: 'No. Amandemen',
      tanggal_amandemen: 'Tanggal Amandemen',
      jenis_amandemen: 'Jenis Amandemen',
      no_dokumen_kontrak: 'No. Dokumen Kontrak',
      no_po_pr: 'No. PO/PR',
      nama_vendor: 'Nama Vendor',
      created_at: 'Tanggal Dibuat',
      updated_at: 'Tanggal Diubah',
      
      // Invoice fields
      nomor_tagihan: 'Nomor Tagihan',
      tanggal_tagihan: 'Tanggal Tagihan',
      nilai_tagihan: 'Nilai Tagihan',
      termin: 'Termin',
      status_tagihan: 'Status Tagihan',
      memo_required: 'Memo Diperlukan',
      tanggal_pengiriman_memo: 'Tanggal Kirim Memo',
      dokumen_memo: 'Dokumen Memo',
      catatan: 'Catatan',
      kontrak_title: 'Judul Kontrak',

      // Vendor fields
      status_vendor: 'Status Vendor',
      score: 'Score',
      npwp: 'NPWP',
      alamat: 'Alamat',
      pic_nama: 'Nama PIC',
      pic_kontak: 'Kontak PIC'
    };
    
    return labels[field] || field;
  };

  const exportContracts = async (selectedFields: string[], fileFormat: 'excel' | 'csv') => {
    setIsExporting(true);
    try {
      // Create vendor lookup
      const vendorLookup = vendors.reduce((acc, vendor) => {
        acc[vendor.id_vendor] = vendor.nama_vendor;
        return acc;
      }, {} as Record<string, string>);

      // Prepare data
      const exportData = contracts.map(contract => {
        const row: any = {};
        
        selectedFields.forEach(field => {
          if (field === 'nama_vendor') {
            row[getFieldLabel(field)] = vendorLookup[contract.id_vendor] || '';
          } else {
            row[getFieldLabel(field)] = formatValue(contract[field as keyof typeof contract], field);
          }
        });
        
        return row;
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Kontrak');

      // Generate filename
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const filename = `kontrak_export_${timestamp}.${fileFormat === 'excel' ? 'xlsx' : 'csv'}`;

      // Download file
      if (fileFormat === 'csv') {
        XLSX.writeFile(workbook, filename, { bookType: 'csv' });
      } else {
        XLSX.writeFile(workbook, filename);
      }

      toast({
        title: "Export Berhasil",
        description: `Data kontrak berhasil diexport ke ${filename}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Gagal",
        description: "Terjadi kesalahan saat export data kontrak",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportInvoices = async (selectedFields: string[], fileFormat: 'excel' | 'csv') => {
    setIsExporting(true);
    try {
      // Create contract lookup
      const contractLookup = contracts.reduce((acc, contract) => {
        acc[contract.id_kontrak] = contract.judul_kontrak;
        return acc;
      }, {} as Record<string, string>);

      // Prepare data
      const exportData = tagihans.map(tagihan => {
        const row: any = {};
        
        selectedFields.forEach(field => {
          if (field === 'kontrak_title') {
            row[getFieldLabel(field)] = contractLookup[tagihan.id_kontrak] || '';
          } else {
            row[getFieldLabel(field)] = formatValue(tagihan[field as keyof typeof tagihan], field);
          }
        });
        
        return row;
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Tagihan');

      // Generate filename
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const filename = `tagihan_export_${timestamp}.${fileFormat === 'excel' ? 'xlsx' : 'csv'}`;

      // Download file
      if (fileFormat === 'csv') {
        XLSX.writeFile(workbook, filename, { bookType: 'csv' });
      } else {
        XLSX.writeFile(workbook, filename);
      }

      toast({
        title: "Export Berhasil",
        description: `Data tagihan berhasil diexport ke ${filename}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Gagal",
        description: "Terjadi kesalahan saat export data tagihan",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportVendors = async (selectedFields: string[], fileFormat: 'excel' | 'csv') => {
    setIsExporting(true);
    try {
      // Prepare data (vendor self-contained, tidak perlu lookup)
      const exportData = vendors.map(vendor => {
        const row: any = {};

        selectedFields.forEach(field => {
          row[getFieldLabel(field)] = formatValue(vendor[field as keyof typeof vendor], field);
        });

        return row;
      });

      // Create worksheet
      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Vendor');

      // Generate filename
      const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
      const filename = `vendor_export_${timestamp}.${fileFormat === 'excel' ? 'xlsx' : 'csv'}`;

      // Download file
      if (fileFormat === 'csv') {
        XLSX.writeFile(workbook, filename, { bookType: 'csv' });
      } else {
        XLSX.writeFile(workbook, filename);
      }

      toast({
        title: "Export Berhasil",
        description: `Data vendor berhasil diexport ke ${filename}`,
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Gagal",
        description: "Terjadi kesalahan saat export data vendor",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportContracts,
    exportInvoices,
    exportVendors,
    isExporting
  };
}