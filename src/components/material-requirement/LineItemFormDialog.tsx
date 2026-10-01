import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calculator } from 'lucide-react';
import { RabItem } from '@/hooks/useRabItems';
import { MaterialRequirementLine, LineJenis } from '@/hooks/useMaterialRequirementLines';
import { RabItemCombobox } from './RabItemCombobox';
import { VolumeCalculatorDialog } from './VolumeCalculatorDialog';

interface LineItemFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jenis: LineJenis;
  rabItems: RabItem[];
  rabItemsLoading?: boolean;
  line: MaterialRequirementLine | null;
  onSubmit: (data: Partial<MaterialRequirementLine>) => Promise<void>;
  isLoading?: boolean;
}

const emptyForm = {
  id_rab_item: '',
  kode_item_snapshot: '',
  uraian_pekerjaan: '',
  satuan: '',
  volume_kalkulasi: '',
  catatan_kalkulasi: '',
  volume_klaim: '',
};

export function LineItemFormDialog({ open, onOpenChange, jenis, rabItems, rabItemsLoading, line, onSubmit, isLoading }: LineItemFormDialogProps) {
  const [form, setForm] = useState(emptyForm);
  const [calcOpen, setCalcOpen] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(line ? {
        id_rab_item: line.id_rab_item || '',
        kode_item_snapshot: line.kode_item_snapshot || '',
        uraian_pekerjaan: line.uraian_pekerjaan,
        satuan: line.satuan,
        volume_kalkulasi: String(line.volume_kalkulasi ?? ''),
        catatan_kalkulasi: line.catatan_kalkulasi || '',
        volume_klaim: line.volume_klaim != null ? String(line.volume_klaim) : '',
      } : emptyForm);
    }
  }, [open, line]);

  const handleRabItemChange = (item: RabItem | null) => {
    if (!item) {
      setForm({ ...form, id_rab_item: '', kode_item_snapshot: '' });
      return;
    }
    setForm({
      ...form,
      id_rab_item: item.id_rab_item,
      kode_item_snapshot: item.kode_item,
      uraian_pekerjaan: form.uraian_pekerjaan || item.uraian_pekerjaan,
      satuan: form.satuan || item.satuan,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      jenis,
      id_rab_item: form.id_rab_item || null,
      kode_item_snapshot: form.kode_item_snapshot || null,
      uraian_pekerjaan: form.uraian_pekerjaan,
      satuan: form.satuan,
      volume_kalkulasi: form.volume_kalkulasi ? Number(form.volume_kalkulasi) : 0,
      catatan_kalkulasi: form.catatan_kalkulasi || null,
      volume_klaim: form.volume_klaim ? Number(form.volume_klaim) : null,
    });
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle>
              {line ? 'Edit' : 'Tambah'} Baris {jenis === 'Pekerjaan' ? 'Pekerjaan' : 'Material (BOM)'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="min-w-0 space-y-4">
            <div>
              <Label>Kode Item RAB (opsional)</Label>
              <RabItemCombobox items={rabItems} value={form.id_rab_item} onValueChange={handleRabItemChange} isLoading={rabItemsLoading} />
            </div>

            <div>
              <Label>Uraian {jenis === 'Pekerjaan' ? 'Pekerjaan' : 'Material'}</Label>
              <Textarea
                value={form.uraian_pekerjaan}
                onChange={(e) => setForm({ ...form, uraian_pekerjaan: e.target.value })}
                rows={2}
                required
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Satuan</Label>
                <Input value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} placeholder="Ea/m/m2/Kg" required />
              </div>
              <div>
                <Label className="flex items-center justify-between">
                  <span>Volume Kalkulasi</span>
                  <Button type="button" variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={() => setCalcOpen(true)}>
                    <Calculator className="h-3 w-3 mr-1" /> Bantu
                  </Button>
                </Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={form.volume_kalkulasi}
                  onChange={(e) => setForm({ ...form, volume_kalkulasi: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label>Volume Klaim</Label>
                <Input
                  type="number"
                  step="0.0001"
                  value={form.volume_klaim}
                  onChange={(e) => setForm({ ...form, volume_klaim: e.target.value })}
                  placeholder="opsional"
                />
              </div>
            </div>

            <div>
              <Label>Catatan Kalkulasi / Justifikasi</Label>
              <Textarea
                value={form.catatan_kalkulasi}
                onChange={(e) => setForm({ ...form, catatan_kalkulasi: e.target.value })}
                rows={3}
                placeholder="Jelaskan dasar perhitungan volume ini..."
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
              <Button type="submit" disabled={isLoading}>{line ? 'Simpan Perubahan' : 'Tambah'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <VolumeCalculatorDialog
        open={calcOpen}
        onOpenChange={setCalcOpen}
        onApply={(result) => {
          setForm((f) => ({
            ...f,
            volume_kalkulasi: String(result.volume),
            satuan: f.satuan || result.satuan,
            catatan_kalkulasi: f.catatan_kalkulasi ? `${f.catatan_kalkulasi}\n${result.catatan}` : result.catatan,
          }));
        }}
      />
    </>
  );
}
