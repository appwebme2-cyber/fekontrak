
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';  
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect } from 'react';
import { useKonfigurasiSistem } from '@/hooks/useNewDatabase';

interface NewBasicInfoFormProps {
  formData: {
    judul_kontrak: string;
    no_dokumen_kontrak?: string;
    no_po_pr?: string;
    tipe_kontrak: string;
    status_kontrak: string;
    nilai_awal: string;
    tanggal_terima_dokumen: string;
    tanggal_maksimal_kom: string;
    tanggal_kom: string;
  };
  setFormData: (data: any) => void;
}

export const NewBasicInfoForm = ({ formData, setFormData }: NewBasicInfoFormProps) => {
  const { konfigurasi } = useKonfigurasiSistem();
  
  const slaKomSetting = konfigurasi.find(config => config.nama_setting === 'SLA_KOM');
  const slaKomHari = slaKomSetting ? parseInt(slaKomSetting.nilai_setting) : 14;

  // Handle tanggal maksimal KOM calculation
  useEffect(() => {
    if (formData.tanggal_terima_dokumen) {
      const terimaDokumen = new Date(formData.tanggal_terima_dokumen);
      const maksimalKom = new Date(terimaDokumen);
      maksimalKom.setDate(maksimalKom.getDate() + slaKomHari);
      
      const newFormData = {
        ...formData,
        tanggal_maksimal_kom: maksimalKom.toISOString().split('T')[0]
      };
      setFormData(newFormData);
    }
  }, [formData.tanggal_terima_dokumen, slaKomHari]);

  // Simple update handlers
  const updateField = (field: string, value: string) => {
    console.log(`🔄 Updating field ${field} with value:`, value);
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Informasi Dasar Kontrak</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="judul_kontrak_new">Judul Kontrak *</Label>
          <Textarea
            id="judul_kontrak_new"
            value={formData.judul_kontrak || ''}
            onChange={(e) => updateField('judul_kontrak', e.target.value)}
            placeholder="Masukkan judul kontrak"
            required
            rows={3}
            className="resize-none"
          />
        </div>

        <div>
          <Label htmlFor="tipe_kontrak_new">Tipe Kontrak *</Label>
          <Select
            value={formData.tipe_kontrak || ''}
            onValueChange={(value) => updateField('tipe_kontrak', value)}
          >
            <SelectTrigger id="tipe_kontrak_new">
              <SelectValue placeholder="Pilih tipe kontrak" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Lumpsum">Lumpsum</SelectItem>
              <SelectItem value="Unit Price">Unit Price</SelectItem>
              <SelectItem value="TSA">TSA</SelectItem>
              <SelectItem value="LTSA">LTSA</SelectItem>
              <SelectItem value="TSA/LTSA">TSA/LTSA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status_kontrak_new">Status Kontrak *</Label>
          <Select
            value={formData.status_kontrak || ''}
            onValueChange={(value) => updateField('status_kontrak', value)}
          >
            <SelectTrigger id="status_kontrak_new">
              <SelectValue placeholder="Pilih status kontrak" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pre-KOM">Pre-KOM</SelectItem>
              <SelectItem value="Aktif">Aktif</SelectItem>
              <SelectItem value="Selesai">Selesai</SelectItem>
              <SelectItem value="Terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="nilai_awal_new">Nilai Kontrak (IDR)</Label>
          <Input
            id="nilai_awal_new"
            type="number"
            value={formData.nilai_awal || ''}
            onChange={(e) => updateField('nilai_awal', e.target.value)}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="tanggal_terima_dokumen_new">Tanggal Terima Dokumen Kontrak *</Label>
          <Input
            id="tanggal_terima_dokumen_new"
            type="date"
            value={formData.tanggal_terima_dokumen || ''}
            onChange={(e) => updateField('tanggal_terima_dokumen', e.target.value)}
            required
          />
        </div>

        <div>
          <Label htmlFor="no_dokumen_kontrak_new">No Dokumen Kontrak</Label>
          <Input
            id="no_dokumen_kontrak_new"
            value={formData.no_dokumen_kontrak || ''}
            onChange={(e) => updateField('no_dokumen_kontrak', e.target.value)}
            placeholder="Nomor dokumen kontrak"
          />
        </div>

        <div>
          <Label htmlFor="no_po_pr_new">No PO/PR</Label>
          <Input
            id="no_po_pr_new"
            value={formData.no_po_pr || ''}
            onChange={(e) => updateField('no_po_pr', e.target.value)}
            placeholder="Nomor PO/PR"
          />
        </div>

        <div>
          <Label htmlFor="tanggal_maksimal_kom_new">Tanggal Maksimal KOM</Label>
          <Input
            id="tanggal_maksimal_kom_new"
            type="date"
            value={formData.tanggal_maksimal_kom || ''}
            readOnly
            className="bg-gray-100"
          />
          <p className="text-xs text-gray-500 mt-1">
            Otomatis dihitung dari tanggal terima dokumen + SLA KOM ({slaKomHari} hari)
          </p>
        </div>

        <div>
          <Label htmlFor="tanggal_kom_new">Tanggal Aktual KOM</Label>
          <Input
            id="tanggal_kom_new"
            type="date"
            value={formData.tanggal_kom || ''}
            onChange={(e) => updateField('tanggal_kom', e.target.value)}
          />
        </div>
      </div>
    </div>
  );
};
