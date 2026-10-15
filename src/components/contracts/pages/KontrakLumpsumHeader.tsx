
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { FileText } from 'lucide-react';

interface KontrakLumpsumHeaderProps {
  isAdmin: boolean;
  onAddContract: () => void;
}

export function KontrakLumpsumHeader({ isAdmin, onAddContract }: KontrakLumpsumHeaderProps) {
  return (
    <PageHeader
      icon={FileText}
      title="Kontrak Lumpsum"
      description="Daftar kontrak pekerjaan dengan nilai borongan (lumpsum)"
      actions={isAdmin && (
        <Button
          onClick={onAddContract}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Tambah Kontrak Lumpsum
        </Button>
      )}
    />
  );
}
