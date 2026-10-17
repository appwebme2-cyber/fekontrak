import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

type GuardLevel = 'admin' | 'superAdmin' | 'crossRu';

const DENIED_MESSAGE: Record<GuardLevel, string> = {
  admin: 'Halaman ini hanya untuk admin.',
  superAdmin: 'Pengaturan ini berlaku untuk semua RU, hanya untuk Super Admin.',
  crossRu: 'Halaman ini hanya untuk Super Admin dan Head Office.',
};

/**
 * Membatasi halaman khusus admin (Pengguna, Vendor, Master Data, Pengaturan, Report Akses,
 * Pemakaian AI) supaya tidak bisa dibuka non-admin lewat URL langsung. Menu-nya sendiri sudah
 * disembunyikan di sidebar; tampilan penolakan sama dengan ModuleGuard.
 * Multi-RU: level "superAdmin" untuk pengaturan global, "crossRu" untuk halaman lintas RU.
 */
const AdminGuard = ({ children, level = 'admin' }: { children: React.ReactNode; level?: GuardLevel }) => {
  const { isAdmin, isSuperAdmin, isCrossRu } = usePermissions();

  const allowed = level === 'superAdmin' ? isSuperAdmin : level === 'crossRu' ? isCrossRu : isAdmin;

  if (!allowed) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
          <p className="text-muted-foreground">{DENIED_MESSAGE[level]}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AdminGuard;
