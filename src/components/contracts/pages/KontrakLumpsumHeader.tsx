
import { Button } from '@/components/ui/button';
import { PageHeader } from '@/components/PageHeader';
import { FileText, Plus } from 'lucide-react';

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
        <Button onClick={onAddContract}>
          <Plus className="mr-2 h-4 w-4" />
          Tambah Kontrak Lumpsum
        </Button>
      )}
    />
  );
}
