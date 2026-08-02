import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { format } from "date-fns";

export function useTemplateGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateContractTemplate = async () => {
    setIsGenerating(true);
    
    try {
      // Contoh tanggal mulai & selesai
      const contohMulai = new Date();
      const contohSelesai = new Date();
      contohSelesai.setDate(contohSelesai.getDate() + 365);

      // Define headers for contract template - improved
      const headers = [
        'Judul Kontrak',
        'Tipe Kontrak', 
        'Status Kontrak',
        'Nama Vendor',
        'Nilai Awal',
        'Direksi Pekerjaan',
        'Disiplin',
        'Tanggal Terima Dokumen',
        'Tanggal Mulai',
        'Tanggal Selesai',
        'No PO/PR',
        'No Dokumen Kontrak'
      ];
      
      // Example data
      const exampleData = [
        {
          'Judul Kontrak': 'Pemeliharaan Pompa Sentrifugal',
          'Tipe Kontrak': 'Lumpsum',
          'Status Kontrak': 'Pre-KOM',
          'Nama Vendor': 'PT ABC Engineering',
          'Nilai Awal': 500000000,
          'Direksi Pekerjaan': 'MA5',
          'Disiplin': 'Rotating',
          'Tanggal Terima Dokumen': format(new Date(), 'dd-MM-yyyy'),
          'Tanggal Mulai': format(contohMulai, 'dd-MM-yyyy'),
          'Tanggal Selesai': format(contohSelesai, 'dd-MM-yyyy'),
          'No PO/PR': 'PO-2024-001',
          'No Dokumen Kontrak': 'DOC-001/2024'
        },
        {
          'Judul Kontrak': 'Service Agreement LTSA Compressor',
          'Tipe Kontrak': 'TSA/LTSA',
          'Status Kontrak': 'Aktif',
          'Nama Vendor': 'PT DEF Service',
          'Nilai Awal': 1200000000,
          'Direksi Pekerjaan': 'MA7',
          'Disiplin': 'Stationary',
          'Tanggal Terima Dokumen': format(new Date(), 'dd-MM-yyyy'),
          'Tanggal Mulai': format(contohMulai, 'dd-MM-yyyy'),
          'Tanggal Selesai': format(contohSelesai, 'dd-MM-yyyy'),
          'No PO/PR': 'PO-2024-003',
          'No Dokumen Kontrak': 'DOC-003/2024'
        }
      ];

      const ws = XLSX.utils.json_to_sheet(exampleData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 35 }, // Judul Kontrak
        { wch: 15 }, // Tipe Kontrak
        { wch: 15 }, // Status Kontrak
        { wch: 25 }, // Nama Vendor
        { wch: 15 }, // Nilai Awal
        { wch: 20 }, // Direksi Pekerjaan
        { wch: 15 }, // Disiplin
        { wch: 22 }, // Tanggal Terima Dokumen
        { wch: 18 }, // Tanggal Mulai
        { wch: 18 }, // Tanggal Selesai
        { wch: 15 }, // No PO/PR
        { wch: 20 }  // No Dokumen Kontrak
      ];

      // Add validation notes
      const notes = [
        '',
        'CATATAN VALIDASI:',
        'Tipe Kontrak: Lumpsum, Unit Price, TSA, LTSA, atau TSA/LTSA',
        'Status Kontrak: Pre-KOM, Aktif, Selesai, atau Terminated',
        'Nama Vendor: Harus sesuai dengan vendor yang sudah terdaftar',
        'Nilai Awal: Harus berupa angka tanpa pemisah ribuan',
        'Tanggal: Format DD-MM-YYYY',
        'Tanggal Mulai & Tanggal Selesai: Format DD-MM-YYYY (opsional, isi untuk kontrak aktif)',
        'Direksi Pekerjaan: MA5, MA6, MA7, atau Workshop',
        'Disiplin: Instrumentasi, Electric, Rotating, Stationary, Alat Berat, atau Tools',
        'No PO/PR & No Dokumen: Opsional, boleh dikosongkan',
        'SLA KOM: Otomatis 14 hari dari sistem (tidak perlu diisi)',
        '',
        'STATUS MAPPING (Otomatis):',
        '- "Aktif" akan diubah menjadi "Active"',
        '- "Selesai" akan diubah menjadi "Completed"',
        '- Status lain tetap sesuai input',
        '',
        'PENTING: Pastikan nama vendor sudah terdaftar di sistem!'
      ];

      // Add notes starting from row 4
      notes.forEach((note, index) => {
        const cellRef = XLSX.utils.encode_cell({ r: index + 3, c: 0 });
        ws[cellRef] = { v: note, t: 's' };
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template Kontrak');
      
      XLSX.writeFile(wb, `Template_Import_Kontrak_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);

      toast({
        title: "Template Downloaded",
        description: "Template kontrak berhasil didownload",
      });
      
    } catch (error) {
      console.error('Error generating contract template:', error);
      toast({
        title: "Error",
        description: "Gagal membuat template kontrak",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateInvoiceTemplate = async () => {
    setIsGenerating(true);
    
    try {
      const headers = [
        'Nomor Tagihan',
        'Judul Kontrak', 
        'Nilai Tagihan',
        'Tanggal Tagihan',
        'Status Tagihan',
        'Termin'
      ];

      const exampleData = [
        {
          'Nomor Tagihan': 'INV-001/MA5/2025',
          'Judul Kontrak': 'Contoh Pekerjaan Maintenance Instrumentasi',
          'Nilai Tagihan': 50000000,
          'Tanggal Tagihan': format(new Date(), 'dd-MM-yyyy'),
          'Status Tagihan': 'Punchlist',
          'Termin': 'Termin 1 - 50%'
        },
        {
          'Nomor Tagihan': 'INV-002/MA6/2025',
          'Judul Kontrak': 'Contoh Pekerjaan Unit Price Electric',
          'Nilai Tagihan': 75000000,
          'Tanggal Tagihan': format(new Date(), 'dd-MM-yyyy'),
          'Status Tagihan': 'BAST / BAPP',
          'Termin': 'Termin 2 - 30%'
        }
      ];

      const ws = XLSX.utils.json_to_sheet(exampleData);
      
      // Set column widths
      ws['!cols'] = [
        { wch: 25 }, // Nomor Tagihan
        { wch: 35 }, // Judul Kontrak
        { wch: 15 }, // Nilai Tagihan
        { wch: 18 }, // Tanggal Tagihan
        { wch: 18 }, // Status Tagihan
        { wch: 20 }  // Termin
      ];

      // Add validation notes
      const notes = [
        '',
        'CATATAN PENTING:',
        '1. Nomor Tagihan: Wajib diisi, format bebas (contoh: INV-001/MA5/2025)',
        '2. Judul Kontrak: Harus persis sama dengan judul kontrak yang sudah ada di sistem',
        '3. Nilai Tagihan: Dalam format angka tanpa pemisah ribuan (contoh: 50000000)',
        '4. Tanggal Tagihan: Format DD-MM-YYYY (contoh: 18-09-2025)',
        '5. Status Tagihan: Pilih salah satu status berikut:',
        '   - Punchlist | BAST / BAPP | Pengajuan | BAST I Vendor',
        '   - SA | PA | Verification | Payment / Selesai',
        '6. Termin: Opsional, keterangan termin pembayaran (contoh: Termin 1 - 50%)',
        '',
        'PENTING: Pastikan kontrak sudah terdaftar di sistem sebelum import tagihan!'
      ];

      // Add notes starting from row 4
      notes.forEach((note, index) => {
        const cellRef = XLSX.utils.encode_cell({ r: index + 3, c: 0 });
        ws[cellRef] = { v: note, t: 's' };
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template Tagihan');
      
      XLSX.writeFile(wb, `Template_Import_Tagihan_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);

      toast({
        title: "Template Downloaded", 
        description: "Template tagihan berhasil didownload",
      });
      
    } catch (error) {
      console.error('Error generating invoice template:', error);
      toast({
        title: "Error",
        description: "Gagal membuat template tagihan",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVendorTemplate = async () => {
    setIsGenerating(true);

    try {
      const exampleData = [
        {
          'Nama Vendor': 'PT ABC Engineering',
          'NPWP': '01.234.567.8-901.000',
          'Alamat': 'Jl. Industri No. 1, Cilacap',
          'Nama PIC': 'Budi Santoso',
          'Kontak PIC': '081234567890',
          'Status Vendor': 'Active',
          'Score': 85
        },
        {
          'Nama Vendor': 'PT DEF Service',
          'NPWP': '09.876.543.2-109.000',
          'Alamat': 'Jl. Pelabuhan No. 5, Cilacap',
          'Nama PIC': 'Siti Aminah',
          'Kontak PIC': '081298765432',
          'Status Vendor': 'Active',
          'Score': 90
        }
      ];

      const ws = XLSX.utils.json_to_sheet(exampleData);

      // Set column widths
      ws['!cols'] = [
        { wch: 25 }, // Nama Vendor
        { wch: 22 }, // NPWP
        { wch: 35 }, // Alamat
        { wch: 20 }, // Nama PIC
        { wch: 18 }, // Kontak PIC
        { wch: 15 }, // Status Vendor
        { wch: 10 }  // Score
      ];

      // Add validation notes
      const notes = [
        '',
        'CATATAN VALIDASI:',
        'Nama Vendor: WAJIB diisi.',
        '  - Jika nama sudah ada di sistem → data vendor akan DIPERBARUI (overwrite)',
        '  - Jika nama belum ada → vendor BARU akan ditambahkan',
        'Status Vendor: Active, Inactive, atau Blacklist',
        'Score: Opsional, berupa angka (contoh: 85)',
        'NPWP, Alamat, Nama PIC, Kontak PIC: Opsional, boleh dikosongkan'
      ];

      // Add notes starting from row 4
      notes.forEach((note, index) => {
        const cellRef = XLSX.utils.encode_cell({ r: index + 3, c: 0 });
        ws[cellRef] = { v: note, t: 's' };
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template Vendor');

      XLSX.writeFile(wb, `Template_Import_Vendor_${format(new Date(), 'dd-MM-yyyy')}.xlsx`);

      toast({
        title: "Template Downloaded",
        description: "Template vendor berhasil didownload",
      });

    } catch (error) {
      console.error('Error generating vendor template:', error);
      toast({
        title: "Error",
        description: "Gagal membuat template vendor",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateContractTemplate,
    generateInvoiceTemplate,
    generateVendorTemplate,
    isGenerating
  };
}