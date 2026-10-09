import { useRef, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, X, FileSpreadsheet } from 'lucide-react';
import { useRabItems, RabItem } from '@/hooks/useRabItems';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { useToast } from '@/hooks/use-toast';
import { parseRabExcel, ParsedRabItem } from './parseRabExcel';

interface RabItemManagerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  idKontrak: string;
  judulKontrak?: string;
}

const emptyForm = {
  kode_item: '',
  kategori: '',
  uraian_pekerjaan: '',
  satuan: '',
  harga_satuan_upah: '',
  harga_satuan_material: '',
  harga_satuan_alat: '',
};

export function RabItemManagerDialog({ open, onOpenChange, idKontrak, judulKontrak }: RabItemManagerDialogProps) {
  const { rabItems, isLoading, createRabItem, updateRabItem, importRabItems, deleteRabItem } = useRabItems(idKontrak);
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importPreview, setImportPreview] = useState<{ fileName: string; items: ParsedRabItem[] } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [showForm, setShowForm] = useState(false);
  const [deletingItem, setDeletingItem] = useState<RabItem | null>(null);

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ''; // supaya file yang sama bisa dipilih ulang
    if (!file) return;
    try {
      const items = parseRabExcel(await file.arrayBuffer());
      if (items.length === 0) {
        toast({ title: 'Tidak ada item terbaca', description: 'Pastikan file berisi sheet RAB dengan kolom URAIAN, SAT, UPAH, MATERIAL, ALAT.', variant: 'destructive' });
        return;
      }
      setImportPreview({ fileName: file.name, items });
    } catch (err: any) {
      toast({ title: 'Gagal membaca file', description: err.message || 'File Excel tidak bisa dibaca', variant: 'destructive' });
    }
  };

  const confirmImport = async () => {
    if (!importPreview) return;
    await importRabItems.mutateAsync({ idKontrak, items: importPreview.items });
    setImportPreview(null);
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
  };

  const handleEdit = (item: RabItem) => {
    setEditingId(item.id_rab_item);
    setForm({
      kode_item: item.kode_item,
      kategori: item.kategori || '',
      uraian_pekerjaan: item.uraian_pekerjaan,
      satuan: item.satuan,
      harga_satuan_upah: item.harga_satuan_upah != null ? String(item.harga_satuan_upah) : '',
      harga_satuan_material: item.harga_satuan_material != null ? String(item.harga_satuan_material) : '',
      harga_satuan_alat: item.harga_satuan_alat != null ? String(item.harga_satuan_alat) : '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      id_kontrak: idKontrak,
      kode_item: form.kode_item,
      kategori: form.kategori || null,
      uraian_pekerjaan: form.uraian_pekerjaan,
      satuan: form.satuan,
      harga_satuan_upah: form.harga_satuan_upah ? Number(form.harga_satuan_upah) : null,
      harga_satuan_material: form.harga_satuan_material ? Number(form.harga_satuan_material) : null,
      harga_satuan_alat: form.harga_satuan_alat ? Number(form.harga_satuan_alat) : null,
    };
    if (editingId) {
      await updateRabItem.mutateAsync({ id: editingId, ...payload });
    } else {
      await createRabItem.mutateAsync(payload);
    }
    resetForm();
  };

  const confirmDelete = () => {
    if (!deletingItem) return;
    deleteRabItem.mutate(deletingItem.id_rab_item);
    setDeletingItem(null);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) resetForm(); }}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Kelola Item RAB{judulKontrak ? ` — ${judulKontrak}` : ''}</DialogTitle>
          </DialogHeader>

          <div className="flex justify-between items-center mb-2">
            <p className="text-sm text-muted-foreground">
              Daftar item RAB kontrak ini, dipakai untuk mencocokkan baris pekerjaan pada draft kebutuhan.
            </p>
            {!showForm && (
              <div className="flex gap-2 shrink-0">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileSelected}
                />
                <Button size="sm" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <FileSpreadsheet className="h-4 w-4 mr-1" /> Import dari Excel
                </Button>
                <Button size="sm" onClick={() => setShowForm(true)}>
                  <Plus className="h-4 w-4 mr-1" /> Tambah Item
                </Button>
              </div>
            )}
          </div>

          {importPreview && (
            <div className="border rounded-lg p-4 space-y-3 mb-4 bg-muted/20">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-medium">Pratinjau impor: {importPreview.items.length} item terbaca</p>
                  <p className="text-xs text-muted-foreground truncate">{importPreview.fileName}</p>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={() => setImportPreview(null)}><X className="h-4 w-4" /></Button>
              </div>
              <ul className="text-xs space-y-1">
                {importPreview.items.slice(0, 5).map((it, i) => (
                  <li key={i} className="truncate">
                    <span className="font-mono mr-2">{it.kode_item}</span>
                    {it.uraian_pekerjaan} <span className="text-muted-foreground">({it.satuan})</span>
                  </li>
                ))}
                {importPreview.items.length > 5 && (
                  <li className="text-muted-foreground">... dan {importPreview.items.length - 5} item lainnya</li>
                )}
              </ul>
              <p className="text-xs text-muted-foreground">
                Item yang kode dan uraiannya sudah ada di kontrak ini akan dilewati, jadi aman kalau diimpor ulang.
              </p>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setImportPreview(null)}>Batal</Button>
                <Button type="button" onClick={confirmImport} disabled={importRabItems.isPending}>
                  {importRabItems.isPending ? 'Mengimpor...' : `Import ${importPreview.items.length} Item`}
                </Button>
              </div>
            </div>
          )}

          {showForm && (
            <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-3 mb-4 bg-muted/20">
              <div className="flex justify-between items-center">
                <p className="text-sm font-medium">{editingId ? 'Edit Item RAB' : 'Item RAB Baru'}</p>
                <Button type="button" variant="ghost" size="sm" onClick={resetForm}><X className="h-4 w-4" /></Button>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Kode Item</Label>
                  <Input value={form.kode_item} onChange={(e) => setForm({ ...form, kode_item: e.target.value })} placeholder="mis. 2.1.1.1.21" required />
                </div>
                <div>
                  <Label>Kategori</Label>
                  <Input value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })} placeholder="mis. Pekerjaan Pipa" />
                </div>
              </div>
              <div>
                <Label>Uraian Pekerjaan</Label>
                <Input value={form.uraian_pekerjaan} onChange={(e) => setForm({ ...form, uraian_pekerjaan: e.target.value })} required />
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label>Satuan</Label>
                  <Input value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })} placeholder="Ea/m/m2" required />
                </div>
                <div>
                  <Label>Harga Upah</Label>
                  <Input type="number" value={form.harga_satuan_upah} onChange={(e) => setForm({ ...form, harga_satuan_upah: e.target.value })} />
                </div>
                <div>
                  <Label>Harga Material</Label>
                  <Input type="number" value={form.harga_satuan_material} onChange={(e) => setForm({ ...form, harga_satuan_material: e.target.value })} />
                </div>
                <div>
                  <Label>Harga Alat</Label>
                  <Input type="number" value={form.harga_satuan_alat} onChange={(e) => setForm({ ...form, harga_satuan_alat: e.target.value })} />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={resetForm}>Batal</Button>
                <Button type="submit" disabled={createRabItem.isPending || updateRabItem.isPending}>
                  {editingId ? 'Simpan Perubahan' : 'Tambah'}
                </Button>
              </div>
            </form>
          )}

          {isLoading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Memuat item RAB...</p>
          ) : rabItems.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Belum ada item RAB untuk kontrak ini.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Uraian</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rabItems.map((item) => (
                  <TableRow key={item.id_rab_item}>
                    <TableCell className="font-mono text-xs">{item.kode_item}</TableCell>
                    <TableCell className="text-sm">{item.uraian_pekerjaan}</TableCell>
                    <TableCell className="text-sm">{item.satuan}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleEdit(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => setDeletingItem(item)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDeleteDialog
        open={!!deletingItem}
        onOpenChange={(open) => !open && setDeletingItem(null)}
        onConfirm={confirmDelete}
        title="Hapus Item RAB?"
        description={`Apakah Anda yakin ingin menghapus item RAB '${deletingItem?.kode_item}'?`}
      />
    </>
  );
}
