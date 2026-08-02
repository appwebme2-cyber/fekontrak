import { useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { programKerjaOptionsStatic, plannerOptionsStatic } from '@/utils/contractStaticOptions';

interface TechnicalDetailsFormProps {
  formData: {
    status_kontrak: string;
    tanggal_mulai: string;
    tanggal_selesai: string;
    disiplin: string;
    direksi_pekerjaan: string;
    id_program_kerja?: string;
    id_planner?: string;
    kbo_bagian?: string;
    tkdn_percentage: string;
    aktivitas_saat_ini: string;
    kendala: string;
    tanggal_mpl?: number;
    tanggal_mpa?: number;
    masa_pemeliharaan_hari?: number;
  };
  setFormData: (data: any) => void;
}

export const TechnicalDetailsForm = ({ formData, setFormData }: TechnicalDetailsFormProps) => {
  const isContractActive = formData.status_kontrak !== 'Pre-KOM';

  // Hitung MPL otomatis: (Tanggal Selesai - Tanggal Mulai) + 1, dalam hari (tanggal mulai = hari ke-1)
  const computedMpl = (() => {
    if (!formData.tanggal_mulai || !formData.tanggal_selesai) return undefined;
    const start = new Date(formData.tanggal_mulai);
    const end = new Date(formData.tanggal_selesai);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return undefined;
    const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000);
    if (diffDays < 0) return undefined; // Tanggal Selesai lebih awal dari Tanggal Mulai
    return diffDays + 1;
  })();

  // Sinkronkan hasil hitung MPL ke formData agar ikut terkirim ke backend
  useEffect(() => {
    if (computedMpl !== formData.tanggal_mpl) {
      setFormData({ ...formData, tanggal_mpl: computedMpl });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedMpl]);

  // Hitung otomatis tanggal selesai pemeliharaan
  const tanggalSelesaiPemeliharaan = (() => {
    if (!formData.tanggal_selesai || !formData.masa_pemeliharaan_hari) return null;
    const selesai = new Date(formData.tanggal_selesai);
    selesai.setDate(selesai.getDate() + Number(formData.masa_pemeliharaan_hari));
    return selesai.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
  })();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Detail Teknis</h3>

      {isContractActive && (
        <div className="space-y-4">
          <h4 className="text-md font-semibold">Periode Kontrak</h4>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tanggal_mulai">Tanggal Mulai</Label>
              <Input
                id="tanggal_mulai"
                type="date"
                value={formData.tanggal_mulai || ''}
                onChange={(e) => setFormData({ ...formData, tanggal_mulai: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="tanggal_selesai">Tanggal Selesai</Label>
              <Input
                id="tanggal_selesai"
                type="date"
                value={formData.tanggal_selesai || ''}
                onChange={(e) => setFormData({ ...formData, tanggal_selesai: e.target.value })}
              />
            </div>
          </div>

          {/* MPL (auto), MPA (manual hari) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="tanggal_mpl">MPL (Masa Penyelesaian Lingkup)</Label>
              <Input
                id="tanggal_mpl"
                type="text"
                readOnly
                value={computedMpl != null ? `${computedMpl} hari` : ''}
                placeholder="Otomatis dari Tanggal Mulai & Selesai"
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Dihitung otomatis dari Tanggal Mulai sampai Tanggal Selesai (tanggal mulai dihitung hari ke-1).
              </p>
            </div>
            <div>
              <Label htmlFor="tanggal_mpa">MPA (Masa Penyelesaian Administrasi) — hari</Label>
              <Input
                id="tanggal_mpa"
                type="number"
                min="0"
                value={formData.tanggal_mpa ?? ''}
                onChange={(e) => setFormData({ ...formData, tanggal_mpa: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Jumlah hari, contoh: 30"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="masa_pemeliharaan_hari">Masa Pemeliharaan (hari)</Label>
              <Input
                id="masa_pemeliharaan_hari"
                type="number"
                min="0"
                value={formData.masa_pemeliharaan_hari ?? ''}
                onChange={(e) => setFormData({ ...formData, masa_pemeliharaan_hari: e.target.value ? parseInt(e.target.value) : undefined })}
                placeholder="Contoh: 365"
              />
              {tanggalSelesaiPemeliharaan && (
                <p className="text-xs text-blue-600 mt-1">
                  Selesai pemeliharaan: <span className="font-medium">{tanggalSelesaiPemeliharaan}</span>
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="disiplin">Disiplin</Label>
          <Select
            value={formData.disiplin}
            onValueChange={(value) => setFormData({ ...formData, disiplin: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih disiplin" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Instrumentasi">Instrumentasi</SelectItem>
              <SelectItem value="Stationary">Stationary</SelectItem>
              <SelectItem value="Electrical">Electrical</SelectItem>
              <SelectItem value="Rotating">Rotating</SelectItem>
              <SelectItem value="Alat Berat">Alat Berat</SelectItem>
              <SelectItem value="Tools">Tools</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="direksi_pekerjaan">Direksi Pekerjaan</Label>
          <Select
            value={formData.direksi_pekerjaan}
            onValueChange={(value) => setFormData({ ...formData, direksi_pekerjaan: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih direksi pekerjaan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="MA5">MA5</SelectItem>
              <SelectItem value="MA6">MA6</SelectItem>
              <SelectItem value="MA7">MA7</SelectItem>
              <SelectItem value="Workshop">Workshop</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="kbo_bagian">KBO Bagian</Label>
        <Input
          id="kbo_bagian"
          value={formData.kbo_bagian || ''}
          onChange={(e) => setFormData({ ...formData, kbo_bagian: e.target.value })}
          placeholder="Masukkan KBO Bagian"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="id_program_kerja">Program Kerja</Label>
          <Select
            value={formData.id_program_kerja || ''}
            onValueChange={(value) => setFormData({ ...formData, id_program_kerja: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih program kerja" />
            </SelectTrigger>
            <SelectContent>
              {programKerjaOptionsStatic.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="id_planner">Planner</Label>
          <Select
            value={formData.id_planner || ''}
            onValueChange={(value) => setFormData({ ...formData, id_planner: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih planner" />
            </SelectTrigger>
            <SelectContent>
              {plannerOptionsStatic.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="tkdn_percentage">TKDN (%)</Label>
        <Input
          id="tkdn_percentage"
          type="number"
          min="0"
          max="100"
          value={formData.tkdn_percentage}
          onChange={(e) => setFormData({ ...formData, tkdn_percentage: e.target.value })}
          placeholder="Masukkan persentase TKDN"
        />
      </div>
    </div>
  );
};