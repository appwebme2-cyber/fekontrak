import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface ModuleGuardProps {
  moduleKey: string;
  children: React.ReactNode;
}

/**
 * Membatasi akses ke halaman berdasarkan visibilitas menu yang diatur di
 * /role-settings, supaya menyembunyikan menu di sidebar juga benar-benar
 * memblokir akses langsung lewat URL (bukan hanya menyembunyikan link).
 */
const ModuleGuard = ({ moduleKey, children }: ModuleGuardProps) => {
  const { canViewMenu } = usePermissions();

  if (!canViewMenu(moduleKey)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
          <p className="text-muted-foreground">Anda tidak memiliki akses ke halaman ini.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ModuleGuard;
