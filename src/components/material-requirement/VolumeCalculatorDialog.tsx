import { useMemo, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  PIPE_NPS_OPTIONS,
  INSULATION_THICKNESS_OPTIONS,
  INCH_TO_M,
  JACKET_ROLL_USABLE_LENGTH_M,
  JACKET_ROLL_EFFECTIVE_WIDTH_M,
  JACKET_OVERLAP_M,
} from './pipeReference';

type CalcMode = 'keliling' | 'luas_cat' | 'plat' | 'jacket';

const MODE_LABELS: Record<CalcMode, string> = {
  keliling: 'Keliling Pipa dari NPS',
  luas_cat: 'Luas Cat Pipa (π×D×L)',
  plat: 'Volume Potong Plat (Ring/Support)',
  jacket: 'Kebutuhan Alum. Jacket per Meter',
};

interface VolumeCalculatorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply: (result: { volume: number; satuan: string; catatan: string }) => void;
}

export function VolumeCalculatorDialog({ open, onOpenChange, onApply }: VolumeCalculatorDialogProps) {
  const [mode, setMode] = useState<CalcMode>('keliling');

  // Keliling & Luas cat & Jacket - pakai NPS
  const [nps, setNps] = useState(PIPE_NPS_OPTIONS[4].label); // default 2"
  const [panjang, setPanjang] = useState('1');
  const [tebalIsolasi, setTebalIsolasi] = useState(INSULATION_THICKNESS_OPTIONS[2].inch); // default 2"

  // Plat
  const [odPlat, setOdPlat] = useState('190');
  const [idPlat, setIdPlat] = useState('80');
  const [jumlahKeping, setJumlahKeping] = useState('2');

  const odInch = PIPE_NPS_OPTIONS.find((p) => p.label === nps)?.odInch ?? 0;
  const odM = odInch * INCH_TO_M;

  const result = useMemo(() => {
    if (mode === 'keliling') {
      const keliling = Math.PI * odM;
      return {
        volume: Number(keliling.toFixed(4)),
        satuan: 'm',
        catatan: `Keliling pipa ${nps} (OD ${odInch}") = π × ${odM.toFixed(4)} m = ${keliling.toFixed(4)} m`,
      };
    }
    if (mode === 'luas_cat') {
      const p = parseFloat(panjang) || 0;
      const luas = Math.PI * odM * p;
      return {
        volume: Number(luas.toFixed(4)),
        satuan: 'm2',
        catatan: `Luas cat pipa ${nps} sepanjang ${p} m = π × ${odM.toFixed(4)} × ${p} = ${luas.toFixed(4)} m²`,
      };
    }
    if (mode === 'plat') {
      const od = parseFloat(odPlat) || 0;
      const id = parseFloat(idPlat) || 0;
      const jml = parseFloat(jumlahKeping) || 0;
      const panjangPotong = ((Math.PI * od) + (Math.PI * id)) * jml / 1000;
      return {
        volume: Number(panjangPotong.toFixed(4)),
        satuan: 'm',
        catatan: `Potong plat OD ${od}mm, ID ${id}mm, ${jml} keping = ((π×${od}) + (π×${id})) × ${jml} / 1000 = ${panjangPotong.toFixed(4)} m`,
      };
    }
    // jacket
    const p = parseFloat(panjang) || 0;
    const thicknessM = tebalIsolasi * INCH_TO_M;
    const kelilingIsolasi = Math.PI * (odM + 2 * thicknessM);
    const lebarDibutuhkan = kelilingIsolasi + JACKET_OVERLAP_M;
    const jumlahPotonganPerRoll = Math.floor(JACKET_ROLL_USABLE_LENGTH_M / lebarDibutuhkan);
    const coveragePerRoll = jumlahPotonganPerRoll * JACKET_ROLL_EFFECTIVE_WIDTH_M;
    const kebutuhanRollPerMeter = coveragePerRoll > 0 ? 1 / coveragePerRoll : 0;
    const kebutuhanTotal = kebutuhanRollPerMeter * p;
    return {
      volume: Number(kebutuhanTotal.toFixed(6)),
      satuan: 'Roll',
      catatan: `Alum. jacket pipa ${nps} + isolasi ${tebalIsolasi}", panjang ${p} m: keliling setelah isolasi ${kelilingIsolasi.toFixed(4)} m, ${jumlahPotonganPerRoll} potongan/roll (coverage ${coveragePerRoll.toFixed(4)} m/roll) => ${kebutuhanRollPerMeter.toFixed(6)} roll/m × ${p} m = ${kebutuhanTotal.toFixed(6)} roll (estimasi, mohon verifikasi ulang)`,
    };
  }, [mode, odM, odInch, nps, panjang, tebalIsolasi, odPlat, idPlat, jumlahKeping]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Kalkulator Bantu Volume</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Jenis Perhitungan</Label>
            <Select value={mode} onValueChange={(v) => setMode(v as CalcMode)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(MODE_LABELS) as CalcMode[]).map((m) => (
                  <SelectItem key={m} value={m}>{MODE_LABELS[m]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {(mode === 'keliling' || mode === 'luas_cat' || mode === 'jacket') && (
            <div>
              <Label>Ukuran Pipa (NPS)</Label>
              <Select value={nps} onValueChange={setNps}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PIPE_NPS_OPTIONS.map((p) => (
                    <SelectItem key={p.label} value={p.label}>{p.label} (OD {p.odInch}")</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {(mode === 'luas_cat' || mode === 'jacket') && (
            <div>
              <Label>Panjang Pipa (m)</Label>
              <Input type="number" step="0.01" value={panjang} onChange={(e) => setPanjang(e.target.value)} />
            </div>
          )}

          {mode === 'jacket' && (
            <div>
              <Label>Tebal Isolasi</Label>
              <Select value={String(tebalIsolasi)} onValueChange={(v) => setTebalIsolasi(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {INSULATION_THICKNESS_OPTIONS.map((t) => (
                    <SelectItem key={t.inch} value={String(t.inch)}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {mode === 'plat' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>OD Plat (mm)</Label>
                <Input type="number" step="1" value={odPlat} onChange={(e) => setOdPlat(e.target.value)} />
              </div>
              <div>
                <Label>ID Plat (mm)</Label>
                <Input type="number" step="1" value={idPlat} onChange={(e) => setIdPlat(e.target.value)} />
              </div>
              <div className="col-span-2">
                <Label>Jumlah Keping</Label>
                <Input type="number" step="1" value={jumlahKeping} onChange={(e) => setJumlahKeping(e.target.value)} />
              </div>
            </div>
          )}

          <div className="rounded-lg border bg-muted/30 p-3 space-y-1">
            <p className="text-xs text-muted-foreground">{result.catatan}</p>
            <p className="text-lg font-semibold">
              {result.volume} <span className="text-sm font-normal text-muted-foreground">{result.satuan}</span>
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button type="button" onClick={() => { onApply(result); onOpenChange(false); }}>
            Gunakan Hasil Ini
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
