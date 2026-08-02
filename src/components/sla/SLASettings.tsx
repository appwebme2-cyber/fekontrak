import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Clock, Save, RotateCcw } from 'lucide-react';
import { useSLASetting, useUpdateSLASetting } from '@/hooks/useSLASetting';

const SLASettings = () => {
  const { slaSetting, isLoading } = useSLASetting();
  const updateSLA = useUpdateSLASetting();
  const [edited, setEdited] = useState<Record<string, any>>({});

  const getValue = (kode: string, field: string, original: any) =>
    edited[kode]?.[field] !== undefined ? edited[kode][field] : original;

  const handleChange = (kode: string, field: string, value: any) => {
    setEdited(prev => ({
      ...prev,
      [kode]: { ...prev[kode], [field]: value }
    }));
  };

  const isDirty = (kode: string) => !!edited[kode];

  const handleSave = async (s: any) => {
    await updateSLA.mutateAsync({
      kode_tahap:     s.kode_tahap,
      batas_hari:     getValue(s.kode_tahap, 'batas_hari',     s.batas_hari),
      warning_persen: getValue(s.kode_tahap, 'warning_persen', s.warning_persen),
      is_aktif:       getValue(s.kode_tahap, 'is_aktif',       s.is_aktif),
    });
    setEdited(prev => {
      const next = { ...prev };
      delete next[s.kode_tahap];
      return next;
    });
  };

  const handleReset = (kode: string) => {
    setEdited(prev => {
      const next = { ...prev };
      delete next[kode];
      return next;
    });
  };

  const dirtyCount = Object.keys(edited).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-5 w-5 text-blue-600" />
            Pengaturan SLA tahapan tagihan
          </CardTitle>
          {dirtyCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {dirtyCount} perubahan belum disimpan
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {/* Header kolom */}
        <div className="grid grid-cols-[32px_1fr_100px_110px_64px_80px] gap-3 px-5 py-2 bg-muted/50 border-y text-xs font-medium text-muted-foreground uppercase tracking-wide">
          <span />
          <span>Tahapan</span>
          <span className="text-center">Batas hari</span>
          <span className="text-center">Warning (%)</span>
          <span className="text-center">Aktif</span>
          <span />
        </div>

        {slaSetting.map((s) => {
          const dirty        = isDirty(s.kode_tahap);
          const batasHari    = getValue(s.kode_tahap, 'batas_hari',     s.batas_hari);
          const warnPersen   = getValue(s.kode_tahap, 'warning_persen', s.warning_persen);
          const isAktif      = getValue(s.kode_tahap, 'is_aktif',       s.is_aktif);

          return (
            <div
              key={s.kode_tahap}
              className={`grid grid-cols-[32px_1fr_100px_110px_64px_80px] gap-3 px-5 py-3 border-b last:border-b-0 items-center transition-colors ${dirty ? 'bg-blue-50/40' : 'hover:bg-muted/30'}`}
            >
              {/* Nomor urut */}
              <div className="w-7 h-7 rounded-full bg-muted border flex items-center justify-center text-xs font-medium text-muted-foreground">
                {s.urutan}
              </div>

              {/* Nama tahap */}
              <div>
                <p className={`text-sm font-medium ${!isAktif ? 'line-through text-muted-foreground' : ''}`}>
                  {s.nama_tahap}
                </p>
              </div>

              {/* Batas hari */}
              <div className="flex items-center gap-1 justify-center">
                <Input
                  type="number"
                  min={1}
                  max={90}
                  value={batasHari}
                  disabled={!isAktif}
                  onChange={e => handleChange(s.kode_tahap, 'batas_hari', parseInt(e.target.value) || 1)}
                  className={`w-16 h-8 text-center text-sm ${dirty ? 'border-blue-300 bg-blue-50' : ''}`}
                />
                <span className="text-xs text-muted-foreground">hr</span>
              </div>

              {/* Warning % */}
              <div className="flex items-center gap-1 justify-center">
                <Input
                  type="number"
                  min={1}
                  max={99}
                  value={warnPersen}
                  disabled={!isAktif}
                  onChange={e => handleChange(s.kode_tahap, 'warning_persen', parseInt(e.target.value) || 80)}
                  className={`w-16 h-8 text-center text-sm ${dirty ? 'border-blue-300 bg-blue-50' : ''}`}
                />
                <span className="text-xs text-muted-foreground">%</span>
              </div>

              {/* Toggle aktif */}
              <div className="flex justify-center">
                <Switch
                  checked={isAktif}
                  onCheckedChange={v => handleChange(s.kode_tahap, 'is_aktif', v)}
                />
              </div>

              {/* Aksi */}
              <div className="flex gap-1 justify-end">
                {dirty && (
                  <>
                    <Button
                      size="sm"
                      className="h-7 w-7 p-0"
                      onClick={() => handleSave(s)}
                      disabled={updateSLA.isPending}
                    >
                      <Save className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 w-7 p-0"
                      onClick={() => handleReset(s.kode_tahap)}
                    >
                      <RotateCcw className="h-3 w-3" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default SLASettings;