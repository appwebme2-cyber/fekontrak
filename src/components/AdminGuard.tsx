import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

/**
 * Membatasi halaman khusus admin (Pengguna, Vendor, Master Data, Pengaturan, Report Akses,
 * Pemakaian AI) supaya tidak bisa dibuka non-admin lewat URL langsung. Menu-nya sendiri sudah
 * disembunyikan di sidebar; tampilan penolakan sama dengan ModuleGuard.
 */
const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const { isAdmin } = usePermissions();

  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
          <p className="text-muted-foreground">Halaman ini hanya untuk admin.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
