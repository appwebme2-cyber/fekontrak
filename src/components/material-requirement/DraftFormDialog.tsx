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
import { useContracts } from '@/hooks/useContracts';
import { MaterialRequirementDraft } from '@/hooks/useMaterialRequirementDrafts';
import { KontrakCombobox } from './KontrakCombobox';

interface DraftFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  draft: MaterialRequirementDraft | null;
  onSubmit: (data: Partial<MaterialRequirementDraft>) => Promise<void>;
  isLoading?: boolean;
}

const emptyForm = {
  id_kontrak: '',
  nomor_mrf: '',
  tag_unit: '',
  lokasi_area: '',
  tanggal_rekomendasi: '',
  problem: '',
  rekomendasi_solusi: '',
  catatan: '',
};

export function DraftFormDialog({ open, onOpenChange, draft, onSubmit, isLoading }: DraftFormDialogProps) {
  const { contracts, isLoading: contractsLoading } = useContracts();
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (open) {
      setForm(draft ? {
        id_kontrak: draft.id_kontrak,
        nomor_mrf: draft.nomor_mrf || '',
        tag_unit: draft.tag_unit,
        lokasi_area: draft.lokasi_area || '',
        tanggal_rekomendasi: draft.tanggal_rekomendasi ? draft.tanggal_rekomendasi.slice(0, 10) : '',
        problem: draft.problem || '',
        rekomendasi_solusi: draft.rekomendasi_solusi || '',
        catatan: draft.catatan || '',
      } : emptyForm);
    }
  }, [open, draft]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      id_kontrak: form.id_kontrak,
      nomor_mrf: form.nomor_mrf || null,
      tag_unit: form.tag_unit,
      lokasi_area: form.lokasi_area || null,
      tanggal_rekomendasi: form.tanggal_rekomendasi || null,
      problem: form.problem || null,
      rekomendasi_solusi: form.rekomendasi_solusi || null,
      catatan: form.catatan || null,
      status: draft?.status || 'Draft',
      rekomendasi_documents: draft?.rekomendasi_documents || [],
      gambar_kerja_documents: draft?.gambar_kerja_documents || [],
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader>
          <DialogTitle>{draft ? 'Edit Draft Kebutuhan' : 'Draft Kebutuhan Baru'}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Kontrak</Label>
            <KontrakCombobox
              contracts={contracts}
              value={form.id_kontrak}
              onValueChange={(v) => setForm({ ...form, id_kontrak: v })}
              disabled={!!draft}
              isLoading={contractsLoading}
            />
            {draft && <p className="text-xs text-muted-foreground mt-1">Kontrak tidak dapat diubah setelah draft dibuat.</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nomor MRF</Label>
              <Input value={form.nomor_mrf} onChange={(e) => setForm({ ...form, nomor_mrf: e.target.value })} placeholder="mis. 07/MRF/..." />
            </div>
            <div>
              <Label>Tag / Unit</Label>
              <Input value={form.tag_unit} onChange={(e) => setForm({ ...form, tag_unit: e.target.value })} placeholder="mis. 102-C-504" required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Lokasi / Area</Label>
              <Input value={form.lokasi_area} onChange={(e) => setForm({ ...form, lokasi_area: e.target.value })} />
            </div>
            <div>
              <Label>Tanggal Rekomendasi</Label>
              <Input type="date" value={form.tanggal_rekomendasi} onChange={(e) => setForm({ ...form, tanggal_rekomendasi: e.target.value })} />
            </div>
          </div>

          <div>
            <Label>Problem</Label>
            <Textarea value={form.problem} onChange={(e) => setForm({ ...form, problem: e.target.value })} rows={2} placeholder="Jelaskan kerusakan/masalah di lapangan..." />
          </div>

          <div>
            <Label>Rekomendasi / Solusi</Label>
            <Textarea value={form.rekomendasi_solusi} onChange={(e) => setForm({ ...form, rekomendasi_solusi: e.target.value })} rows={2} placeholder="Solusi/perbaikan yang direkomendasikan..." />
          </div>

          <div>
            <Label>Catatan</Label>
            <Textarea value={form.catatan} onChange={(e) => setForm({ ...form, catatan: e.target.value })} rows={2} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
            <Button type="submit" disabled={isLoading || !form.id_kontrak || !form.tag_unit}>
              {draft ? 'Simpan Perubahan' : 'Buat Draft'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
