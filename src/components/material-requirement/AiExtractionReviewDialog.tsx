import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { AiExtractionResult } from '@/hooks/useMaterialRequirementDrafts';

interface ReviewLine {
  checked: boolean;
  jenis: 'Pekerjaan' | 'Material';
  uraian_pekerjaan: string;
  satuan: string;
  volume_kalkulasi: string;
  catatan_kalkulasi: string;
}

interface AiExtractionReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: AiExtractionResult | null;
  onApply: (data: {
    problem?: string;
    rekomendasi_solusi?: string;
    tag_unit?: string;
    lines: { jenis: 'Pekerjaan' | 'Material'; uraian_pekerjaan: string; satuan: string; volume_kalkulasi: number; catatan_kalkulasi?: string }[];
  }) => Promise<void>;
  isApplying?: boolean;
}

export function AiExtractionReviewDialog({ open, onOpenChange, result, onApply, isApplying }: AiExtractionReviewDialogProps) {
  const [problem, setProblem] = useState('');
  const [rekomendasiSolusi, setRekomendasiSolusi] = useState('');
  const [tagUnit, setTagUnit] = useState('');
  const [lines, setLines] = useState<ReviewLine[]>([]);

  useEffect(() => {
    if (open && result) {
      setProblem(result.problem || '');
      setRekomendasiSolusi(result.rekomendasi_solusi || '');
      setTagUnit(result.tag_unit || '');
      setLines(result.lines.map((l) => ({
        checked: true,
        jenis: l.jenis,
        uraian_pekerjaan: l.uraian_pekerjaan,
        satuan: l.satuan,
        volume_kalkulasi: String(l.volume_kalkulasi ?? ''),
        catatan_kalkulasi: l.catatan_kalkulasi || '',
      })));
    }
  }, [open, result]);

  const updateLine = (idx: number, patch: Partial<ReviewLine>) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const handleApply = async () => {
    const checkedLines = lines
      .filter((l) => l.checked)
      .map((l) => ({
        jenis: l.jenis,
        uraian_pekerjaan: l.uraian_pekerjaan,
        satuan: l.satuan,
        volume_kalkulasi: Number(l.volume_kalkulasi) || 0,
        catatan_kalkulasi: l.catatan_kalkulasi || undefined,
      }));
    await onApply({
      problem: problem || undefined,
      rekomendasi_solusi: rekomendasiSolusi || undefined,
      tag_unit: tagUnit || undefined,
      lines: checkedLines,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" /> Hasil Ekstraksi AI
          </DialogTitle>
          <DialogDescription className="flex items-start gap-2 text-amber-700">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            Hasil ekstraksi AI, mohon periksa & edit kembali sebelum diterapkan ke draft. Hapus centang pada baris yang tidak relevan.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Tag/Unit</Label>
              <Input value={tagUnit} onChange={(e) => setTagUnit(e.target.value)} />
            </div>
          </div>
          <div>
            <Label>Problem</Label>
            <Textarea value={problem} onChange={(e) => setProblem(e.target.value)} rows={2} />
          </div>
          <div>
            <Label>Rekomendasi/Solusi</Label>
            <Textarea value={rekomendasiSolusi} onChange={(e) => setRekomendasiSolusi(e.target.value)} rows={2} />
          </div>

          <div>
            <Label className="mb-2 block">Baris Pekerjaan & Material yang Diusulkan ({lines.length})</Label>
            {lines.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center border rounded-lg">Tidak ada baris yang berhasil diekstrak.</p>
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {lines.map((line, idx) => (
                  <div key={idx} className="border rounded-lg p-3 space-y-2 bg-muted/20">
                    <div className="flex items-start gap-2">
                      <Checkbox
                        checked={line.checked}
                        onCheckedChange={(v) => updateLine(idx, { checked: !!v })}
                        className="mt-1"
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">{line.jenis}</span>
                        </div>
                        <Textarea
                          value={line.uraian_pekerjaan}
                          onChange={(e) => updateLine(idx, { uraian_pekerjaan: e.target.value })}
                          rows={1}
                          className="text-sm"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            value={line.satuan}
                            onChange={(e) => updateLine(idx, { satuan: e.target.value })}
                            placeholder="Satuan"
                          />
                          <Input
                            type="number"
                            step="0.0001"
                            value={line.volume_kalkulasi}
                            onChange={(e) => updateLine(idx, { volume_kalkulasi: e.target.value })}
                            placeholder="Volume"
                          />
                        </div>
                        {line.catatan_kalkulasi && (
                          <p className="text-xs text-muted-foreground">{line.catatan_kalkulasi}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button type="button" onClick={handleApply} disabled={isApplying}>
            {isApplying ? 'Menerapkan...' : 'Terapkan ke Draft'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
