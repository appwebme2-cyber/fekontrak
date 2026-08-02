import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Info } from 'lucide-react';

interface ProgressFormProps {
  formData: {
    progress_plan?: number;
    progress_actual?: number;
    aktivitas_saat_ini?: string;
    kendala?: string;
    tipe_kontrak: string;
    tanggal_lkp?: string;
  };
  setFormData: (data: any) => void;
}

export const ProgressForm = ({ formData, setFormData }: ProgressFormProps) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Progress & Aktivitas Kontrak</h3>

      {/* Tanggal LKP */}
      <div>
        <Label htmlFor="tanggal_lkp">Tanggal Laporan Kemajuan Progres (LKP)</Label>
        <Input
          id="tanggal_lkp"
          type="date"
          value={formData.tanggal_lkp || ''}
          onChange={e => setFormData({ ...formData, tanggal_lkp: e.target.value })}
        />
        <p className="text-xs text-gray-500 mt-1">Cut-off tanggal pelaporan progress pekerjaan</p>
      </div>

      {/* Progress Kontrak - Read Only dari S-Curve */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-md font-medium text-gray-700">Progress Kontrak</h4>
          <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
            <Info className="h-3 w-3" />
            Diperbarui otomatis dari S-Curve
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="progress_plan">Progress Plan (%)</Label>
            <Input
              id="progress_plan"
              type="number"
              value={formData.progress_plan ?? 0}
              readOnly
              className="bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
          <div>
            <Label htmlFor="progress_actual">Progress Aktual (%)</Label>
            <Input
              id="progress_actual"
              type="number"
              value={formData.progress_actual ?? 0}
              readOnly
              className="bg-gray-50 text-gray-600 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* Aktivitas & Kendala */}
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-700">Aktivitas & Kendala</h4>
        <div>
          <Label htmlFor="aktivitas_saat_ini">Aktivitas Saat Ini</Label>
          <Textarea
            id="aktivitas_saat_ini"
            value={formData.aktivitas_saat_ini || ''}
            onChange={e => setFormData({ ...formData, aktivitas_saat_ini: e.target.value })}
            placeholder="Jelaskan aktivitas yang sedang berlangsung..."
            rows={3}
          />
        </div>
        <div>
          <Label htmlFor="kendala">Kendala</Label>
          <Textarea
            id="kendala"
            value={formData.kendala || ''}
            onChange={e => setFormData({ ...formData, kendala: e.target.value })}
            placeholder="Jelaskan kendala yang dialami (jika ada)..."
            rows={3}
          />
        </div>
      </div>
    </div>
  );
};