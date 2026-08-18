import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, Clock, TrendingDown } from 'lucide-react';
import { useKonfigurasiSistem, useUpdateKonfigurasi, useCreateKonfigurasi } from '@/hooks/useNewDatabase';

const SETTINGS = [
  {
    group: 'Kontrak Lumpsum',
    items: [
      { key: 'Badge_Lumpsum_Kritis_Bulan',  label: 'Waktu Kritis (bulan)',  default: 3, satuan: 'bulan' },
      { key: 'Badge_Lumpsum_Menipis_Bulan', label: 'Waktu Menipis (bulan)', default: 5, satuan: 'bulan' },
    ],
  },
  {
    group: 'Kontrak Unit Price & TSA',
    items: [
      { key: 'Badge_UnitPriceTSA_Kritis_Bulan',  label: 'Waktu Kritis (bulan)',  default: 6, satuan: 'bulan' },
      { key: 'Badge_UnitPriceTSA_Menipis_Bulan', label: 'Waktu Menipis (bulan)', default: 8, satuan: 'bulan' },
    ],
  },
  {
    group: 'Progress Pekerjaan',
    items: [
      { key: 'Badge_Progress_Warning_Persen', label: 'Progress Lambat (%)',    default: 10, satuan: '%' },
      { key: 'Badge_Progress_Alert_Persen',   label: 'Progress Tertinggal (%)', default: 20, satuan: '%' },
      { key: 'Badge_Progress_Danger_Persen',  label: 'Progress Kritis (%)',    default: 40, satuan: '%' },
    ],
  },
];

const BadgeThresholdSettings: React.FC = () => {
  const { konfigurasi } = useKonfigurasiSistem();
  const updateKonfigurasi = useUpdateKonfigurasi();
  const createKonfigurasi = useCreateKonfigurasi();

  const [values, setValues] = useState<Record<string, string>>({});

  useEffect(() => {
    const initial: Record<string, string> = {};
    SETTINGS.flatMap((g) => g.items).forEach(({ key, default: def }) => {
      const found = konfigurasi.find((k) => k.nama_setting === key);
      initial[key] = found ? found.nilai_setting : String(def);
    });
    setValues(initial);
  }, [konfigurasi]);

  const handleSave = async (key: string, defaultVal: number) => {
    const existing = konfigurasi.find((k) => k.nama_setting === key);
    const val = values[key] ?? String(defaultVal);
    if (existing) {
      await updateKonfigurasi.mutateAsync({ id: existing.id_setting, nilai_setting: val });
    } else {
      await createKonfigurasi.mutateAsync({ nama_setting: key, nilai_setting: val });
    }
  };

  const handleSaveAll = async () => {
    for (const { items } of SETTINGS) {
      for (const { key, default: def } of items) {
        await handleSave(key, def);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Atur threshold badge peringatan yang muncul di card kontrak.
        </p>
        <Button onClick={handleSaveAll} className="flex items-center gap-2">
          <Save className="h-4 w-4" />
          Simpan Semua
        </Button>
      </div>

      {SETTINGS.map(({ group, items }) => (
        <Card key={group}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {group.includes('Progress') ? (
                <TrendingDown className="h-4 w-4 text-orange-600" />
              ) : (
                <Clock className="h-4 w-4 text-blue-600" />
              )}
              {group}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {items.map(({ key, label, default: def, satuan }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm font-medium">{label}</Label>
                  <p className="text-xs text-muted-foreground">Default: {def} {satuan}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={1}
                    className="w-24 text-center"
                    value={values[key] ?? ''}
                    onChange={(e) => setValues((prev) => ({ ...prev, [key]: e.target.value }))}
                  />
                  <span className="text-sm text-muted-foreground w-10">{satuan}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSave(key, def)}
                    className="flex items-center gap-1"
                  >
                    <Save className="h-3 w-3" />
                    Simpan
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}

      <Card className="border-dashed">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            <strong>Waktu Kritis/Menipis</strong> — dihitung dari hari ini ke tanggal selesai kontrak (atau tanggal selesai amandemen jika ada).
            <br />
            <strong>Progress</strong> — deviasi antara progress yang seharusnya dicapai saat ini vs progress aktual.
            Contoh: jika kontrak sudah berjalan 50% durasi tapi aktual baru 30%, deviasi = 20%.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default BadgeThresholdSettings;
