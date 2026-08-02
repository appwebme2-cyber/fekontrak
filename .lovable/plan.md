## Rencana Perubahan Multi-Amandemen

### 1. Database Migration
- Buat tabel baru `amandemen_kontrak` untuk menyimpan multiple amendments per kontrak
- Kolom: id, id_kontrak, nomor_amandemen (urutan ke-1,2,...n), no_amandemen, tanggal_amandemen, jenis_amandemen, nilai_kontrak_baru, durasi_amandemen, tanggal_mulai_baru, tanggal_selesai_baru, alasan_perubahan, amendment_documents
- Migrasi data existing dari kolom amendment di tabel kontrak ke tabel baru
- Tetap pertahankan `has_amendment` di tabel kontrak sebagai flag

### 2. Update Form Input (AmendmentForm)
- Ubah form agar bisa menambah/edit/hapus multiple amendments
- Tampilkan daftar amandemen yang sudah ada
- Tombol "Tambah Amandemen" untuk input amandemen baru

### 3. Update Tampilan
- ContractAmendmentBadge: tampilkan jumlah amandemen & detail tiap amandemen
- ContractAmendmentInfo & detail pages: list semua amandemen
- Halaman Amandemen: sesuaikan query dari tabel baru

### 4. Update Hooks & Utils
- Buat hook `useAmandemen` untuk CRUD ke tabel baru
- Update contractFormUtils untuk handle multi-amendment
