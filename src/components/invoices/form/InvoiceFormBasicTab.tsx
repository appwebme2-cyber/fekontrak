
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Building2, Calendar, FileText } from 'lucide-react';
import { ContractSearchDialog } from './components/ContractSearchDialog';
import { useState, useEffect } from 'react';
import { useTagihanCount } from '@/hooks/useTagihans';
import { generateNomorTagihan } from '@/lib/utils/generateNomorTagihan';

interface Contract {
  id_kontrak: string;
  judul_kontrak: string;
  no_dokumen_kontrak: string;
  tipe_kontrak: string;
  direksi_pekerjaan: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  kbo_bagian?: string;
  vendor: {
    nama_vendor: string;
  };
}

interface InvoiceFormBasicTabProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  selectedContract?: Contract | null;
  isEditMode?: boolean;
}

export const InvoiceFormBasicTab = ({
  formData,
  updateFormData,
  selectedContract,
  isEditMode = false
}: InvoiceFormBasicTabProps) => {
  const [contractDialogOpen, setContractDialogOpen] = useState(false);
  const { jumlahTagihan } = useTagihanCount(formData.id_kontrak);

  const handleSelectContract = (contract: Contract) => {
    console.log('🎯 Contract selected:', contract);
    updateFormData('id_kontrak', contract.id_kontrak);
    updateFormData('direksi_pekerjaan', contract.direksi_pekerjaan);
    updateFormData('tipe_kontrak', contract.tipe_kontrak);
    updateFormData('kbo_bagian', contract.kbo_bagian);
    setContractDialogOpen(false);
  };

  useEffect(() => {
    if (!isEditMode && formData.id_kontrak) {
      updateFormData('nomor_tagihan', generateNomorTagihan(formData.kbo_bagian, jumlahTagihan));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.id_kontrak, formData.kbo_bagian, jumlahTagihan, isEditMode]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  return (
    <div className="space-y-4 mt-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="nomor_tagihan">Nomor Tagihan *</Label>
          <Input
            id="nomor_tagihan"
            value={formData.nomor_tagihan}
            onChange={(e) => updateFormData('nomor_tagihan', e.target.value)}
            placeholder="Otomatis setelah kontrak dipilih"
            readOnly={!isEditMode}
            className={!isEditMode ? 'bg-muted' : undefined}
            required
          />
        </div>

        <div>
          <Label htmlFor="tanggal_tagihan">Tanggal Tagihan *</Label>
          <Input
            id="tanggal_tagihan"
            type="date"
            value={formData.tanggal_tagihan}
            onChange={(e) => updateFormData('tanggal_tagihan', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Contract Selection */}
      <div>
        <Label>Kontrak *</Label>
        {selectedContract ? (
          <Card className="mt-2 border-2 border-primary/20 bg-primary/5">
            <CardContent className="p-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-medium text-foreground">
                  {selectedContract.judul_kontrak}
                </h4>
                <Badge variant="outline">
                  {selectedContract.tipe_kontrak}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground mb-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    <span>{selectedContract.no_dokumen_kontrak || 'No. Dokumen: -'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    <span>{selectedContract.vendor?.nama_vendor}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    <span>{formatDate(selectedContract.tanggal_mulai)} - {formatDate(selectedContract.tanggal_selesai)}</span>
                  </div>
                  <div>
                    <Badge variant="secondary" className="text-xs">
                      {selectedContract.direksi_pekerjaan}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setContractDialogOpen(true)}
                className="w-full"
              >
                <Search className="h-4 w-4 mr-2" />
                {isEditMode ? 'Ganti Kontrak' : 'Pilih Kontrak Lain'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => setContractDialogOpen(true)}
            className="w-full mt-2 h-12 border-dashed"
          >
            <Search className="h-4 w-4 mr-2" />
            Pilih Kontrak
          </Button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="termin">Termin</Label>
          <Input
            id="termin"
            value={formData.termin}
            onChange={(e) => updateFormData('termin', e.target.value)}
            placeholder="Masukkan termin"
          />
        </div>

        <div>
          <Label htmlFor="nilai_tagihan">Nilai Tagihan *</Label>
          <Input
            id="nilai_tagihan"
            type="number"
            value={formData.nilai_tagihan}
            onChange={(e) => updateFormData('nilai_tagihan', e.target.value)}
            placeholder="Masukkan nilai tagihan"
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="catatan">Catatan</Label>
        <Textarea
          id="catatan"
          value={formData.catatan}
          onChange={(e) => updateFormData('catatan', e.target.value)}
          placeholder="Masukkan catatan"
          rows={4}
        />
      </div>

      {/* Contract Search Dialog */}
      <ContractSearchDialog
        open={contractDialogOpen}
        onOpenChange={setContractDialogOpen}
        onSelectContract={handleSelectContract}
        selectedContractId={formData.id_kontrak}
      />
    </div>
  );
};
