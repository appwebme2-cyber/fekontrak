import { File, FileImage, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

/** Ikon jenis file (PDF/Word/gambar/lainnya), pengganti emoji 📄📝🖼️📁. Warna PDF merah seperti di kartu dokumen kontrak. */
export const FileTypeIcon = ({ type, className }: { type?: string | null; className?: string }) => {
  const t = (type ?? '').toLowerCase();
  const base = cn('h-5 w-5 shrink-0', className);
  if (t.includes('pdf')) return <FileText className={cn(base, 'text-red-500')} aria-hidden />;
  if (t.includes('word') || t.includes('document')) return <FileText className={cn(base, 'text-blue-500')} aria-hidden />;
  if (t.includes('image')) return <FileImage className={cn(base, 'text-green-600')} aria-hidden />;
  return <File className={cn(base, 'text-gray-500')} aria-hidden />;
};
