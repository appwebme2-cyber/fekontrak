
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect } from 'react';
import { useKonfigurasiSistem } from '@/hooks/useNewDatabase';

interface BasicInfoFormProps {
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

export const BasicInfoForm = ({ formData, setFormData }: BasicInfoFormProps) => {
  const { konfigurasi } = useKonfigurasiSistem();
  
  const slaKomSetting = konfigurasi.find(config => config.nama_setting === 'SLA_KOM');
  const slaKomHari = slaKomSetting ? parseInt(slaKomSetting.nilai_setting) : 14;

  useEffect(() => {
    if (formData.tanggal_terima_dokumen) {
      const terimaDokumen = new Date(formData.tanggal_terima_dokumen);
      const maksimalKom = new Date(terimaDokumen);
      maksimalKom.setDate(maksimalKom.getDate() + slaKomHari);
      
      setFormData({
        ...formData,
        tanggal_maksimal_kom: maksimalKom.toISOString().split('T')[0]
      });
    }
  }, [formData.tanggal_terima_dokumen, slaKomHari]);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Informasi Dasar Kontrak</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="judul_kontrak">Judul Kontrak *</Label>
          <Textarea
            id="judul_kontrak"
            value={formData.judul_kontrak || ''}
            onChange={(e) => {
              const newValue = e.target.value;
              setFormData(prev => ({ ...prev, judul_kontrak: newValue }));
            }}
            placeholder="Masukkan judul kontrak"
            required
            rows={3}
            className="resize-none"
          />
        </div>

        <div>
          <Label htmlFor="tipe_kontrak">Tipe Kontrak *</Label>
          <Select
            value={formData.tipe_kontrak || ''}
            onValueChange={(value) => {
              setFormData(prev => ({ ...prev, tipe_kontrak: value }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih tipe kontrak" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Lumpsum">Lumpsum</SelectItem>
              <SelectItem value="Unit Price">Unit Price</SelectItem>
              <SelectItem value="TSA/LTSA">TSA/LTSA</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="status_kontrak">Status Kontrak *</Label>
          <Select
            value={formData.status_kontrak || ''}
            onValueChange={(value) => {
              setFormData(prev => ({ ...prev, status_kontrak: value }));
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih status kontrak" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Pre-KOM">Pre-KOM</SelectItem>
              <SelectItem value="Aktif">Aktif</SelectItem>
              <SelectItem value="Selesai">Selesai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="nilai_awal">Nilai Kontrak (IDR)</Label>
          <Input
            id="nilai_awal"
            type="number"
            value={formData.nilai_awal || ''}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, nilai_awal: e.target.value }));
            }}
            placeholder="0"
          />
        </div>

        <div>
          <Label htmlFor="tanggal_terima_dokumen">Tanggal Terima Dokumen Kontrak *</Label>
          <Input
            id="tanggal_terima_dokumen"
            type="date"
            value={formData.tanggal_terima_dokumen || ''}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, tanggal_terima_dokumen: e.target.value }));
            }}
            required
          />
        </div>

        <div>
          <Label htmlFor="no_dokumen_kontrak">No Dokumen Kontrak</Label>
          <Input
            id="no_dokumen_kontrak"
            value={formData.no_dokumen_kontrak || ''}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, no_dokumen_kontrak: e.target.value }));
            }}
            placeholder="Nomor dokumen kontrak"
          />
        </div>

        <div>
          <Label htmlFor="no_po_pr">No PO/PR</Label>
          <Input
            id="no_po_pr"
            value={formData.no_po_pr || ''}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, no_po_pr: e.target.value }));
            }}
            placeholder="Nomor PO/PR"
          />
        </div>

        <div>
          <Label htmlFor="tanggal_maksimal_kom">Tanggal Maksimal KOM</Label>
          <Input
            id="tanggal_maksimal_kom"
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
          <Label htmlFor="tanggal_kom">Tanggal Aktual KOM</Label>
          <Input
            id="tanggal_kom"
            type="date"
            value={formData.tanggal_kom || ''}
            onChange={(e) => {
              setFormData(prev => ({ ...prev, tanggal_kom: e.target.value }));
            }}
          />
        </div>
      </div>
    </div>
  );
};
