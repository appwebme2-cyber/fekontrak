import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useContracts } from "@/hooks/useContracts";
import { useVendors } from "@/hooks/useVendors";
import { sanitizeInput } from "@/utils/security";
import * as XLSX from 'xlsx';

const API_URL = "https://bekontrak-production.up.railway.app/api";

type ImportType = 'kontrak' | 'tagihan' | 'vendor';

interface ImportError {
  row: number;
  field: string;
  message: string;
}

interface ImportProgress {
  current: number;
  total: number;
  status: string;
}

const parseDate = (dateString: string | number | null | undefined): string => {
  console.log('🔍 parseDate input:', dateString, 'type:', typeof dateString);
  
  if (!dateString && dateString !== 0) {
    return new Date().toISOString().split('T')[0];
  }
  
  if (typeof dateString === 'number' || (!isNaN(Number(dateString)) && Number(dateString) > 1000)) {
    const excelSerial = Number(dateString);
    if (excelSerial > 0 && excelSerial < 2958465) {
      try {
        const excelEpoch = new Date(1900, 0, 1);
        const millisecondsPerDay = 24 * 60 * 60 * 1000;
        const adjustedSerial = excelSerial > 59 ? excelSerial - 1 : excelSerial;
        const targetDate = new Date(excelEpoch.getTime() + (adjustedSerial - 1) * millisecondsPerDay);
        if (!isNaN(targetDate.getTime())) {
          return targetDate.toISOString().split('T')[0];
        }
      } catch (error) {
        console.error('❌ Excel serial conversion failed:', error);
      }
    }
  }
  
  const cleanDate = String(dateString).trim();
  if (!cleanDate) return new Date().toISOString().split('T')[0];
  
  const formats = [
    { regex: /^(\d{1,2})-(\d{1,2})-(\d{4})$/, order: 'DMY' },
    { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, order: 'DMY' },
    { regex: /^(\d{4})-(\d{1,2})-(\d{1,2})$/, order: 'YMD' },
    { regex: /^(\d{1,2})-(\d{1,2})-(\d{2})$/, order: 'DMY2' },
    { regex: /^(\d{1,2})\/(\d{1,2})\/(\d{2})$/, order: 'DMY2' },
  ];
  
  for (const format of formats) {
    const match = cleanDate.match(format.regex);
    if (match) {
      console.log('🎯 Date format matched:', format.order, match);
      let day: string, month: string, year: string;
      
      if (format.order === 'DMY' || format.order === 'DMY2') {
        [, day, month, year] = match;
        if (format.order === 'DMY2') {
          year = parseInt(year) < 50 ? `20${year}` : `19${year}`;
        }
      } else {
        [, year, month, day] = match;
      }
      
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime()) && date.getFullYear() > 1900 && date.getFullYear() < 2100) {
        const result = date.toISOString().split('T')[0];
        console.log('✅ Date parsed successfully:', result);
        return result;
      }
    }
  }
  
  try {
    const directParse = new Date(cleanDate);
    if (!isNaN(directParse.getTime()) && directParse.getFullYear() > 1900) {
      return directParse.toISOString().split('T')[0];
    }
  } catch (error) {}
  
  return new Date().toISOString().split('T')[0];
};

export function useImportData() {
  const [previewData, setPreviewData] = useState<any[] | null>(null);
  const [errors, setErrors] = useState<ImportError[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState<ImportProgress>({ current: 0, total: 0, status: '' });
  const [importType, setImportType] = useState<ImportType | null>(null);
  
  const { toast } = useToast();
  const { contracts } = useContracts();
  const { vendors } = useVendors();

  const mapStatusKontrak = (status: string): string => {
    const statusMapping: { [key: string]: string } = {
      'Pre-KOM': 'Pre-KOM',
      'Aktif': 'Aktif',
      'Selesai': 'Selesai',
      'Terminated': 'Terminated',
      'Active': 'Aktif',
      'Completed': 'Selesai',
      'pre-kom': 'Pre-KOM',
      'aktif': 'Aktif',
      'selesai': 'Selesai',
      'terminated': 'Terminated',
      'active': 'Aktif',
      'completed': 'Selesai'
    };
    return statusMapping[status] || statusMapping[status?.toLowerCase()] || 'Pre-KOM';
  };

  const validateContractRow = (row: any, rowIndex: number): ImportError[] => {
    const errors: ImportError[] = [];
    
    if (!row['Judul Kontrak']?.toString().trim()) {
      errors.push({ row: rowIndex, field: 'Judul Kontrak', message: 'Wajib diisi' });
    }
    
    const validTypes = ['Lumpsum', 'Unit Price', 'TSA', 'LTSA', 'TSA/LTSA'];
    if (!row['Tipe Kontrak'] || !validTypes.includes(row['Tipe Kontrak'])) {
      errors.push({ row: rowIndex, field: 'Tipe Kontrak', message: `Harus berupa: ${validTypes.join(', ')}` });
    }
    
    const validStatuses = ['Pre-KOM', 'Aktif', 'Selesai', 'Terminated', 'Active', 'Completed'];
    if (!row['Status Kontrak'] || !validStatuses.includes(row['Status Kontrak'])) {
      errors.push({ row: rowIndex, field: 'Status Kontrak', message: 'Status tidak valid' });
    }
    
    if (!row['Nama Vendor']?.toString().trim()) {
      errors.push({ row: rowIndex, field: 'Nama Vendor', message: 'Wajib diisi' });
    }
    
    if (!row['Nilai Awal'] || isNaN(Number(row['Nilai Awal']))) {
      errors.push({ row: rowIndex, field: 'Nilai Awal', message: 'Harus berupa angka' });
    }
    
    if (row['Nama Vendor']) {
      const vendor = vendors.find(v => 
        v.nama_vendor.toLowerCase().trim() === row['Nama Vendor'].toString().toLowerCase().trim()
      );
      if (!vendor) {
        errors.push({ 
          row: rowIndex, 
          field: 'Nama Vendor', 
          message: `Vendor "${row['Nama Vendor']}" tidak ditemukan dalam sistem` 
        });
      }
    }
    
    return errors;
  };

  const validateInvoiceRow = (row: any, rowIndex: number): ImportError[] => {
    const errors: ImportError[] = [];
    
    if (!row['Nomor Tagihan']?.trim()) {
      errors.push({ row: rowIndex, field: 'Nomor Tagihan', message: 'Wajib diisi' });
    }
    
    if (!row['Judul Kontrak']?.trim()) {
      errors.push({ row: rowIndex, field: 'Judul Kontrak', message: 'Wajib diisi' });
    }
    
    if (!row['Nilai Tagihan'] || isNaN(Number(row['Nilai Tagihan']))) {
      errors.push({ row: rowIndex, field: 'Nilai Tagihan', message: 'Harus berupa angka' });
    }
    
    const contract = contracts.find(c => 
      c.judul_kontrak.toLowerCase() === row['Judul Kontrak']?.toLowerCase()
    );
    if (row['Judul Kontrak'] && !contract) {
      errors.push({ row: rowIndex, field: 'Judul Kontrak', message: 'Kontrak tidak ditemukan dalam sistem' });
    }
    
    return errors;
  };

  const validateVendorRow = (row: any, rowIndex: number): ImportError[] => {
    const errors: ImportError[] = [];

    if (!row['Nama Vendor']?.toString().trim()) {
      errors.push({ row: rowIndex, field: 'Nama Vendor', message: 'Wajib diisi' });
    }

    if (row['Score'] !== undefined && row['Score'] !== '' && isNaN(Number(row['Score']))) {
      errors.push({ row: rowIndex, field: 'Score', message: 'Harus berupa angka' });
    }

    return errors;
  };

  const processFile = async (file: File, type: ImportType) => {
    setIsProcessing(true);
    setImportType(type);
    
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        dateNF: 'DD-MM-YYYY'
      });
      
      const allErrors: ImportError[] = [];
      const processedData = jsonData.map((row, index) => {
        const rowIndex = index + 2;
        let rowErrors: ImportError[] = [];

        if (type === 'kontrak') {
          rowErrors = validateContractRow(row, rowIndex);
        } else if (type === 'tagihan') {
          rowErrors = validateInvoiceRow(row, rowIndex);
        } else if (type === 'vendor') {
          rowErrors = validateVendorRow(row, rowIndex);
        }

        allErrors.push(...rowErrors);
        return row;
      });
      
      setPreviewData(processedData);
      setErrors(allErrors);
      
      toast({
        title: "File berhasil diproses",
        description: `${processedData.length} baris data${allErrors.length > 0 ? ` (${allErrors.length} error)` : ''}`,
        variant: allErrors.length > 0 ? "destructive" : "default"
      });
      
    } catch (error: any) {
      toast({
        title: "Error memproses file",
        description: error.message || 'Terjadi kesalahan saat memproses file',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const executeImport = async () => {
    if (!previewData || errors.length > 0 || !importType) return;
    
    setIsProcessing(true);
    setProgress({ current: 0, total: previewData.length, status: 'Memproses import...' });
    
    const token = localStorage.getItem("token");
    let successCount = 0;
    let errorCount = 0;
    const importErrors: string[] = [];
    
    try {
      let processed = 0;

      for (const row of previewData) {
        processed++;
        setProgress({ current: processed, total: previewData.length, status: `Memproses baris ${processed}...` });
        
        try {
          if (importType === 'kontrak') {
            // ===== IMPORT KONTRAK =====
            const vendor = vendors.find(v => 
              v.nama_vendor.toLowerCase().trim() === row['Nama Vendor'].toString().toLowerCase().trim()
            );
            
            if (!vendor) throw new Error(`Vendor "${row['Nama Vendor']}" tidak ditemukan`);
            
            const tanggalTerima = parseDate(row['Tanggal Terima Dokumen']);
            const today = new Date().toISOString().split('T')[0];

            const payload = {
              idVendor: vendor.id,
              judulKontrak: sanitizeInput(row['Judul Kontrak']?.toString() || ''),
              noDokumenKontrak: sanitizeInput(row['No Dokumen Kontrak']?.toString() || '') || null,
              noPoPr: sanitizeInput(row['No PO/PR']?.toString() || '') || null,
              direksiPekerjaan: sanitizeInput(row['Direksi Pekerjaan']?.toString() || '') || null,
              tipeKontrak: sanitizeInput(row['Tipe Kontrak']?.toString() || ''),
              statusKontrak: mapStatusKontrak(row['Status Kontrak']?.toString() || 'Pre-KOM'),
              tanggalSpbDiterima: tanggalTerima,
              tanggalTerimaDokumen: tanggalTerima,
              slaKomHari: 14,
              estimasiTanggalKom: today,
              nilaiAwal: Number(row['Nilai Awal']) || 0,
              durasiKontrakHari: Number(row['Durasi Kontrak (Hari)']) || null,
              progressPlan: Number(row['Progress Plan']) || 0,
              progressActual: Number(row['Progress Actual']) || 0,
              tanggalMulai: row['Tanggal Mulai'] ? parseDate(row['Tanggal Mulai']) : null,
              tanggalSelesai: row['Tanggal Selesai'] ? parseDate(row['Tanggal Selesai']) : null,
              disiplin: sanitizeInput(row['Disiplin']?.toString() || '') || null,
            };

            console.log('📤 Inserting kontrak via API:', payload);
            const res = await fetch(`${API_URL}/Contracts`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
            
            console.log('✅ Contract inserted successfully');
            successCount++;

          } else if (importType === 'tagihan') {
            // ===== IMPORT TAGIHAN =====
            const contract = contracts.find(c => 
              c.judul_kontrak.toLowerCase().trim() === row['Judul Kontrak']?.toString().toLowerCase().trim()
            );
            
            if (!contract) throw new Error(`Kontrak "${row['Judul Kontrak']}" tidak ditemukan`);
            
            const payload = {
              idKontrak: contract.id_kontrak,
              nomorTagihan: sanitizeInput(row['Nomor Tagihan']?.toString() || ''),
              tanggalTagihan: parseDate(row['Tanggal Tagihan']),
              tipeKontrak: contract.tipe_kontrak,
              nilaiTagihan: Number(row['Nilai Tagihan']) || 0,
              statusTagihan: row['Status Tagihan']?.toString() || 'Punchlist',
              termin: row['Termin']?.toString() || null,
            };

            console.log('📤 Inserting tagihan via API:', payload);
            const res = await fetch(`${API_URL}/tagihan`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify(payload)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);
            
            console.log('✅ Tagihan inserted successfully');
            successCount++;

          } else if (importType === 'vendor') {
            // ===== IMPORT VENDOR =====
            const namaVendor = row['Nama Vendor']?.toString().trim();
            if (!namaVendor) throw new Error('Nama Vendor kosong');

            const scoreRaw = row['Score'];
            const payload = {
              namaVendor: sanitizeInput(namaVendor),
              npwp: sanitizeInput(row['NPWP']?.toString() || '') || null,
              alamat: sanitizeInput(row['Alamat']?.toString() || '') || null,
              picNama: sanitizeInput(row['Nama PIC']?.toString() || '') || null,
              picKontak: sanitizeInput(row['Kontak PIC']?.toString() || '') || null,
              statusVendor: sanitizeInput(row['Status Vendor']?.toString() || '') || null,
              score: scoreRaw !== undefined && scoreRaw !== '' ? Number(scoreRaw) : null,
            };

            // Cari vendor yang sudah ada berdasarkan nama (case-insensitive)
            const existing = vendors.find(v =>
              v.nama_vendor.toLowerCase().trim() === namaVendor.toLowerCase()
            );

            if (existing) {
              // ===== UPDATE vendor yang sudah ada =====
              console.log('📤 Updating vendor via API:', payload);
              const res = await fetch(`${API_URL}/vendors/${existing.id}`, {
                method: "PUT",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
              });

              const data = await res.json();
              if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

              console.log('✅ Vendor updated successfully');
            } else {
              // ===== INSERT vendor baru =====
              console.log('📤 Inserting vendor via API:', payload);
              const res = await fetch(`${API_URL}/vendors`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(payload)
              });

              const data = await res.json();
              if (!res.ok) throw new Error(data.message || `HTTP ${res.status}`);

              console.log('✅ Vendor inserted successfully');
            }

            successCount++;
          }
          
        } catch (rowError: any) {
          errorCount++;
          const errorMsg = `Baris ${processed}: ${rowError.message}`;
          console.error('❌ Row processing error:', errorMsg);
          importErrors.push(errorMsg);
        }
      }
      
      if (successCount > 0) {
        toast({
          title: "Import Berhasil",
          description: `${successCount} data berhasil diimport${errorCount > 0 ? `, ${errorCount} gagal` : ''}`,
        });
        resetImport();
      }
      
      if (errorCount > 0 && successCount === 0) {
        toast({
          title: "Import Gagal",
          description: importErrors.slice(0, 3).join('; '),
          variant: "destructive",
        });
      }
      
    } catch (error: any) {
      toast({
        title: "Import Gagal",
        description: error.message || 'Terjadi kesalahan saat import',
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const resetImport = () => {
    setPreviewData(null);
    setErrors([]);
    setProgress({ current: 0, total: 0, status: '' });
    setImportType(null);
  };

  return {
    previewData,
    errors,
    isProcessing,
    progress,
    processFile,
    executeImport,
    resetImport
  };
}