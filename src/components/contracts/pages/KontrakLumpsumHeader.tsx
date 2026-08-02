
import { Button } from '@/components/ui/button';

interface KontrakLumpsumHeaderProps {
  isAdmin: boolean;
  onAddContract: () => void;
}

export function KontrakLumpsumHeader({ isAdmin, onAddContract }: KontrakLumpsumHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-gray-900">Kontrak Lumpsum</h1>
      {isAdmin && (
        <Button
          onClick={onAddContract}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Tambah Kontrak Lumpsum
        </Button>
      )}
    </div>
  );
}
