import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: ReactNode;
  description?: ReactNode;
  /** Tombol aksi di sisi kanan (Tambah, Export, Refresh, dll.) */
  actions?: ReactNode;
}

/**
 * Header standar halaman daftar: ikon dalam kotak biru muda, judul, dan keterangan singkat
 * (mengikuti gaya halaman Laporan Harian). Halaman detail memakai header datanya sendiri.
 */
export const PageHeader = ({ icon: Icon, title, description, actions }: PageHeaderProps) => (
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex min-w-0 items-center gap-3">
      <div className="shrink-0 rounded-lg bg-blue-100 p-2">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
      <div className="min-w-0">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        {description && <div className="text-sm text-gray-500">{description}</div>}
      </div>
    </div>
    {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
  </div>
);
