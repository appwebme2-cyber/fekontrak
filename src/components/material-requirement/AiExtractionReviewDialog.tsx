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
import { Sparkles, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { AiExtractionResult } from '@/hooks/useMaterialRequirementDrafts';
import { RabItem } from '@/hooks/useRabItems';
import { RabItemCombobox } from './RabItemCombobox';

interface ReviewLine {
  checked: boolean;
  jenis: 'Pekerjaan' | 'Material';
  id_rab_item: string;
  uraian_pekerjaan: string;
  satuan: string;
  volume_kalkulasi: string;
  volume_klaim: string;
  catatan_kalkulasi: string;
  aiSuggestedKode?: string | null;
}

interface AiExtractionReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: AiExtractionResult | null;
  rabItems: RabItem[];
  existingLineCount: number;
  onApply: (data: {
    replaceExisting: boolean;
    problem?: string;
    rekomendasi_solusi?: string;
    tag_unit?: string;
    lines: { jenis: 'Pekerjaan' | 'Material'; id_rab_item?: string; kode_item_snapshot?: string; uraian_pekerjaan: string; satuan: string; volume_kalkulasi: number; volume_klaim?: number; catatan_kalkulasi?: string }[];
  }) => Promise<void>;
  isApplying?: boolean;
}

export function AiExtractionReviewDialog({ open, onOpenChange, result, rabItems, existingLineCount, onApply, isApplying }: AiExtractionReviewDialogProps) {
  const [replaceExisting, setReplaceExisting] = useState(false);
  const [problem, setProblem] = useState('');
  const [rekomendasiSolusi, setRekomendasiSolusi] = useState('');
  const [tagUnit, setTagUnit] = useState('');
  const [lines, setLines] = useState<ReviewLine[]>([]);

  useEffect(() => {
    if (open && result) {
      setReplaceExisting(false);
      setProblem(result.problem || '');
      setRekomendasiSolusi(result.rekomendasi_solusi || '');
      setTagUnit(result.tag_unit || '');
      setLines(result.lines.map((l) => {
        const matched = l.kode_item ? rabItems.find((r) => r.kode_item === l.kode_item) : undefined;
        return {
          checked: true,
          jenis: l.jenis,
          id_rab_item: matched?.id_rab_item || '',
          uraian_pekerjaan: l.uraian_pekerjaan,
          satuan: l.satuan,
          volume_kalkulasi: String(l.volume_kalkulasi ?? ''),
          volume_klaim: l.volume_klaim != null ? String(l.volume_klaim) : '',
          catatan_kalkulasi: l.catatan_kalkulasi || '',
          aiSuggestedKode: l.kode_item,
        };
      }));
    }
  }, [open, result, rabItems]);

  const updateLine = (idx: number, patch: Partial<ReviewLine>) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const handleRabItemChange = (idx: number, item: RabItem | null) => {
    if (!item) {
      updateLine(idx, { id_rab_item: '' });
      return;
    }
    updateLine(idx, {
      id_rab_item: item.id_rab_item,
      uraian_pekerjaan: item.uraian_pekerjaan,
      satuan: item.satuan,
    });
  };

  const handleApply = async () => {
    const checkedLines = lines
      .filter((l) => l.checked)
      .map((l) => {
        const matched = rabItems.find((r) => r.id_rab_item === l.id_rab_item);
        return {
          jenis: l.jenis,
          id_rab_item: matched?.id_rab_item,
          kode_item_snapshot: matched?.kode_item,
          uraian_pekerjaan: l.uraian_pekerjaan,
          satuan: l.satuan,
          volume_kalkulasi: Number(l.volume_kalkulasi) || 0,
          volume_klaim: l.volume_klaim !== '' ? Number(l.volume_klaim) : undefined,
          catatan_kalkulasi: l.catatan_kalkulasi || undefined,
        };
      });
    await onApply({
      replaceExisting: existingLineCount > 0 && replaceExisting,
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
            <Sparkles className="h-5 w-5 text-purple-600" /> Hasil Auto Ekstrak & Generate AI
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium px-2 py-0.5 rounded bg-primary/10 text-primary">{line.jenis}</span>
                          {line.id_rab_item && (
                            <span className="text-xs font-medium px-2 py-0.5 rounded bg-green-100 text-green-800 flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Tercocokkan ke RAB
                            </span>
                          )}
                          {line.aiSuggestedKode && !line.id_rab_item && (
                            <span className="text-xs text-amber-700">AI usulkan kode "{line.aiSuggestedKode}" tapi tidak ditemukan di master RAB</span>
                          )}
                        </div>
                        <div>
                          <Label className="text-xs text-muted-foreground">Kode Item RAB</Label>
                          <RabItemCombobox
                            items={rabItems}
                            value={line.id_rab_item}
                            onValueChange={(item) => handleRabItemChange(idx, item)}
                          />
                        </div>
                        <Textarea
                          value={line.uraian_pekerjaan}
                          onChange={(e) => updateLine(idx, { uraian_pekerjaan: e.target.value })}
                          rows={1}
                          className="text-sm"
                        />
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs text-muted-foreground">Satuan</Label>
                            <Input
                              value={line.satuan}
                              onChange={(e) => updateLine(idx, { satuan: e.target.value })}
                              placeholder="Satuan"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Vol. Kalkulasi</Label>
                            <Input
                              type="number"
                              step="0.0001"
                              value={line.volume_kalkulasi}
                              onChange={(e) => updateLine(idx, { volume_kalkulasi: e.target.value })}
                              placeholder="Volume"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-muted-foreground">Vol. Klaim (dari tagihan)</Label>
                            <Input
                              type="number"
                              step="0.0001"
                              value={line.volume_klaim}
                              onChange={(e) => updateLine(idx, { volume_klaim: e.target.value })}
                              placeholder="kosong"
                            />
                          </div>
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

        {existingLineCount > 0 && (
          <label className={`flex items-start gap-2 rounded-lg border p-3 text-sm cursor-pointer ${replaceExisting ? 'border-amber-300 bg-amber-50' : 'bg-muted/20'}`}>
            <Checkbox
              checked={replaceExisting}
              onCheckedChange={(v) => setReplaceExisting(!!v)}
              className="mt-0.5"
            />
            <span>
              <span className="font-medium">Ganti semua {existingLineCount} baris yang sudah ada di draft ini</span>
              <span className="block text-xs text-muted-foreground">
                Dicentang: baris lama (pekerjaan &amp; material) dihapus lalu diganti hasil di atas, jadi tidak dobel.
                Tidak dicentang: hasil di atas ditambahkan di bawah baris yang sudah ada.
              </span>
            </span>
          </label>
        )}

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
