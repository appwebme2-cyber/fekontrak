import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Factory } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { usePermissions } from '@/hooks/usePermissions';
import { useRuList } from '@/hooks/useRuList';
import { RU_CHANGED_EVENT, RU_REQUIRED_EVENT, setActiveRu } from '@/lib/activeRu';

/**
 * Multi-RU: muncul saat Super Admin / Head Office menyimpan data baru ketika "Semua RU" dipilih
 * (server menolak dengan header X-Ru-Required). RU dipilih tanpa memuat ulang halaman supaya
 * isian formulir tidak hilang; pengguna cukup menekan Simpan lagi.
 */
export const RuRequiredDialog = () => {
  const { isCrossRu } = usePermissions();
  const { rus } = useRuList(isCrossRu);
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [ru, setRu] = useState('');

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener(RU_REQUIRED_EVENT, handler);
    return () => window.removeEventListener(RU_REQUIRED_EVENT, handler);
  }, []);

  if (!isCrossRu) return null;

  const pilih = () => {
    if (!ru) return;
    setActiveRu(ru);
    window.dispatchEvent(new Event(RU_CHANGED_EVENT));
    queryClient.invalidateQueries();
    setOpen(false);
    toast({
      title: `${rus.find((r) => r.idRu === ru)?.label ?? ru} dipilih`,
      description: 'Silakan tekan Simpan sekali lagi. Data baru akan masuk ke RU ini.',
    });
    setRu('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Factory className="h-5 w-5 text-blue-600" /> Pilih RU dulu
          </DialogTitle>
          <DialogDescription>
            Saat ini "Semua RU" dipilih, jadi sistem tidak tahu data baru ini milik RU mana.
            Pilih RU tujuan, lalu tekan Simpan sekali lagi. Isian formulir Anda tidak hilang.
          </DialogDescription>
        </DialogHeader>
        <Select value={ru} onValueChange={setRu}>
          <SelectTrigger><SelectValue placeholder="Pilih Refinery Unit..." /></SelectTrigger>
          <SelectContent>
            {rus.map((r) => (
              <SelectItem key={r.idRu} value={r.idRu}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={() => setOpen(false)}>Batal</Button>
          <Button onClick={pilih} disabled={!ru}>Pilih RU</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
