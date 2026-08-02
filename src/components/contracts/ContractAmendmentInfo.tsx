
import { Badge } from "@/components/ui/badge";
import { useAmandemenKontrak } from '@/hooks/useAmandemenKontrak';
import { FileEdit, Calendar, Coins } from 'lucide-react';

interface ContractAmendmentInfoProps {
  contract: any;
  fieldText: (text: any) => React.ReactNode;
  formatCurrency: (amount: number | null | undefined) => string;
}

export const ContractAmendmentInfo = ({ 
  contract, 
  fieldText, 
  formatCurrency 
}: ContractAmendmentInfoProps) => {
  const { amendments, isLoading } = useAmandemenKontrak(contract.id_kontrak);

  if (isLoading) {
    return <div className="animate-pulse h-20 bg-muted rounded" />;
  }

  if (!amendments || amendments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p className="text-lg">Tidak ada amandemen untuk kontrak ini</p>
        <p className="text-sm mt-2">Kontrak masih menggunakan nilai dan periode asli</p>
      </div>
    );
  }

  const getAmendmentTypeBadge = (type: string) => {
    switch (type) {
      case 'Nilai':
        return <Badge className="bg-blue-100 text-blue-800">Nilai</Badge>;
      case 'Waktu':
        return <Badge className="bg-green-100 text-green-800">Waktu</Badge>;
      case 'Nilai dan Waktu':
        return <Badge className="bg-purple-100 text-purple-800">Nilai & Waktu</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <FileEdit className="h-5 w-5 text-orange-600" />
        <span className="font-semibold">Total {amendments.length} Amandemen</span>
      </div>

      {amendments.map((amendment) => (
        <div key={amendment.id_amandemen} className="border rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="font-bold">#{amendment.nomor_urut}</Badge>
            <span className="font-medium">{amendment.no_amandemen || `Amandemen ke-${amendment.nomor_urut}`}</span>
            {amendment.jenis_amandemen && getAmendmentTypeBadge(amendment.jenis_amandemen)}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <label className="text-muted-foreground text-xs">Tanggal Amandemen</label>
              <p className="font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {amendment.tanggal_amandemen 
                  ? new Date(amendment.tanggal_amandemen).toLocaleDateString('id-ID') 
                  : '-'}
              </p>
            </div>

            {(amendment.jenis_amandemen === 'Nilai' || amendment.jenis_amandemen === 'Nilai dan Waktu') && amendment.nilai_kontrak_baru && (
              <div>
                <label className="text-muted-foreground text-xs">Nilai Kontrak Baru</label>
                <p className="font-medium flex items-center gap-1 text-green-600">
                  <Coins className="h-3 w-3" />
                  {formatCurrency(amendment.nilai_kontrak_baru)}
                </p>
              </div>
            )}

            {(amendment.jenis_amandemen === 'Waktu' || amendment.jenis_amandemen === 'Nilai dan Waktu') && (
              <>
                {amendment.durasi_amandemen && (
                  <div>
                    <label className="text-muted-foreground text-xs">Tambahan Durasi</label>
                    <p className="font-medium">{amendment.durasi_amandemen} hari</p>
                  </div>
                )}
                {amendment.tanggal_selesai_baru && (
                  <div>
                    <label className="text-muted-foreground text-xs">Tanggal Selesai Baru</label>
                    <p className="font-medium">{new Date(amendment.tanggal_selesai_baru).toLocaleDateString('id-ID')}</p>
                  </div>
                )}
              </>
            )}
          </div>

          {amendment.alasan_perubahan && (
            <div className="bg-muted/50 rounded p-3">
              <label className="text-muted-foreground text-xs">Alasan</label>
              <p className="text-sm">{amendment.alasan_perubahan}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};
