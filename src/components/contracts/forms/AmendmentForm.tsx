import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, Edit2, Save, X, FileEdit } from 'lucide-react';
import { useAmandemenKontrak, AmandemenInput, AmandemenKontrak } from '@/hooks/useAmandemenKontrak';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface AmendmentFormProps {
  idKontrak: string;
  tanggalMulai?: string;
  tanggalSelesai?: string;
  nilaiAwal?: string;
}

interface AmendmentDraft {
  no_amandemen: string;
  tanggal_amandemen: string;
  jenis_amandemen: string;
  nilai_kontrak_baru: string;
  durasi_amandemen: string;
  tanggal_mulai_baru: string;
  tanggal_selesai_baru: string;
  alasan_perubahan: string;
}

const emptyDraft: AmendmentDraft = {
  no_amandemen: '',
  tanggal_amandemen: '',
  jenis_amandemen: '',
  nilai_kontrak_baru: '',
  durasi_amandemen: '',
  tanggal_mulai_baru: '',
  tanggal_selesai_baru: '',
  alasan_perubahan: '',
};

export const AmendmentForm = ({ idKontrak, tanggalMulai, tanggalSelesai, nilaiAwal }: AmendmentFormProps) => {
  const { amendments, isLoading, addAmendment, updateAmendment, deleteAmendment, getNextNomorUrut } = useAmandemenKontrak(idKontrak);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AmendmentDraft>(emptyDraft);

  // Get the latest end date: from last amendment or original contract
  const getLatestEndDate = () => {
    if (amendments.length > 0) {
      const last = amendments[amendments.length - 1];
      return last.tanggal_selesai_baru || tanggalSelesai || '';
    }
    return tanggalSelesai || '';
  };

  const getLatestValue = () => {
    if (amendments.length > 0) {
      const last = amendments[amendments.length - 1];
      return last.nilai_kontrak_baru?.toString() || nilaiAwal || '';
    }
    return nilaiAwal || '';
  };

  const handleDurationChange = (value: string) => {
    const duration = parseInt(value);
    const baseEndDate = getLatestEndDate();
    if (baseEndDate && duration) {
      const endDate = new Date(baseEndDate);
      endDate.setDate(endDate.getDate() + duration);
      setDraft(d => ({
        ...d,
        durasi_amandemen: value,
        tanggal_selesai_baru: endDate.toISOString().split('T')[0],
      }));
    } else {
      setDraft(d => ({ ...d, durasi_amandemen: value }));
    }
  };

  const handleAddNew = () => {
    setEditingId(null);
    setDraft({
      ...emptyDraft,
      tanggal_mulai_baru: tanggalMulai || '',
    });
    setShowForm(true);
  };

const handleEdit = (amendment: AmandemenKontrak) => {
  setEditingId(amendment.id_amandemen);
  setDraft({
    no_amandemen: amendment.no_amandemen || '',
    tanggal_amandemen: amendment.tanggal_amandemen?.split('T')[0] || '', // ← tambah split
    jenis_amandemen: amendment.jenis_amandemen || '',
    nilai_kontrak_baru: amendment.nilai_kontrak_baru?.toString() || '',
    durasi_amandemen: amendment.durasi_amandemen?.toString() || '',
    tanggal_mulai_baru: amendment.tanggal_mulai_baru?.split('T')[0] || '', // ← tambah split
    tanggal_selesai_baru: amendment.tanggal_selesai_baru?.split('T')[0] || '', // ← tambah split
    alasan_perubahan: amendment.alasan_perubahan || '',
  });
  setShowForm(true);
};

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setDraft(emptyDraft);
  };

  const handleSave = async () => {
    const payload = {
      id_kontrak: idKontrak,
      nomor_urut: editingId ? amendments.find(a => a.id_amandemen === editingId)!.nomor_urut : getNextNomorUrut(),
      no_amandemen: draft.no_amandemen || null,
      tanggal_amandemen: draft.tanggal_amandemen || null,
      jenis_amandemen: draft.jenis_amandemen || null,
      nilai_kontrak_baru: draft.nilai_kontrak_baru ? parseFloat(draft.nilai_kontrak_baru) : null,
      durasi_amandemen: draft.durasi_amandemen ? parseInt(draft.durasi_amandemen) : null,
      tanggal_mulai_baru: draft.tanggal_mulai_baru || null,
      tanggal_selesai_baru: draft.tanggal_selesai_baru || null,
      alasan_perubahan: draft.alasan_perubahan || null,
      amendment_documents: [],
    };

    if (editingId) {
      await updateAmendment.mutateAsync({ id: editingId, ...payload });
    } else {
      await addAmendment.mutateAsync(payload as AmandemenInput);
    }
    handleCancel();
  };

  const getJenisBadgeClass = (jenis: string) => {
    switch (jenis) {
      case 'Nilai': return 'bg-blue-100 text-blue-800';
      case 'Waktu': return 'bg-green-100 text-green-800';
      case 'Nilai dan Waktu': return 'bg-purple-100 text-purple-800';
      default: return '';
    }
  };

  const formatCurrency = (v: number | null | undefined) => {
    if (!v) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v);
  };

  if (isLoading) {
    return <div className="animate-pulse h-20 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FileEdit className="h-5 w-5" />
          Amandemen Kontrak ({amendments.length})
        </h3>
        {!showForm && (
          <Button onClick={handleAddNew} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tambah Amandemen
          </Button>
        )}
      </div>

      {/* Existing amendments list */}
      {amendments.length > 0 && (
        <div className="space-y-3">
          {amendments.map((amendment) => (
            <Card key={amendment.id_amandemen} className="border">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-bold">#{amendment.nomor_urut}</Badge>
                    <span className="font-medium">{amendment.no_amandemen || `Amandemen ke-${amendment.nomor_urut}`}</span>
                    {amendment.jenis_amandemen && (
                      <Badge className={getJenisBadgeClass(amendment.jenis_amandemen)}>
                        {amendment.jenis_amandemen}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(amendment)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Amandemen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Amandemen ke-{amendment.nomor_urut} akan dihapus secara permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteAmendment.mutate(amendment.id_amandemen)}>
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Tanggal:</span>
                    <p className="font-medium">
                      {amendment.tanggal_amandemen ? new Date(amendment.tanggal_amandemen).toLocaleDateString('id-ID') : '-'}
                    </p>
                  </div>
                  {amendment.nilai_kontrak_baru && (
                    <div>
                      <span className="text-muted-foreground">Nilai Baru:</span>
                      <p className="font-medium">{formatCurrency(amendment.nilai_kontrak_baru)}</p>
                    </div>
                  )}
                  {amendment.durasi_amandemen && (
                    <div>
                      <span className="text-muted-foreground">Durasi:</span>
                      <p className="font-medium">{amendment.durasi_amandemen} hari</p>
                    </div>
                  )}
                  {amendment.tanggal_selesai_baru && (
                    <div>
                      <span className="text-muted-foreground">Selesai Baru:</span>
                      <p className="font-medium">{new Date(amendment.tanggal_selesai_baru).toLocaleDateString('id-ID')}</p>
                    </div>
                  )}
                </div>
                {amendment.alasan_perubahan && (
                  <p className="text-sm text-muted-foreground mt-2 italic">
                    Alasan: {amendment.alasan_perubahan}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Add/Edit form */}
      {showForm && (
        <Card className="border-2 border-primary/20">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">
                {editingId ? 'Edit Amandemen' : `Amandemen ke-${getNextNomorUrut()}`}
              </h4>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>No. Amandemen</Label>
                <Input
                  value={draft.no_amandemen}
                  onChange={(e) => setDraft(d => ({ ...d, no_amandemen: e.target.value }))}
                  placeholder="Masukkan nomor amandemen"
                />
              </div>
              <div>
                <Label>Tanggal Amandemen</Label>
                <Input
                  type="date"
                  value={draft.tanggal_amandemen}
                  onChange={(e) => setDraft(d => ({ ...d, tanggal_amandemen: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <Label>Jenis Amandemen</Label>
              <Select
                value={draft.jenis_amandemen}
                onValueChange={(v) => setDraft(d => ({ ...d, jenis_amandemen: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis amandemen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Nilai">Nilai</SelectItem>
                  <SelectItem value="Waktu">Waktu</SelectItem>
                  <SelectItem value="Nilai dan Waktu">Nilai dan Waktu</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(draft.jenis_amandemen === 'Nilai' || draft.jenis_amandemen === 'Nilai dan Waktu') && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Nilai Sebelumnya (IDR)</Label>
                  <Input value={getLatestValue()} readOnly className="bg-muted" />
                  <p className="text-xs text-muted-foreground mt-1">Nilai dari kontrak/amandemen sebelumnya</p>
                </div>
                <div>
                  <Label>Nilai Kontrak Baru (IDR) *</Label>
                  <Input
                    type="number"
                    value={draft.nilai_kontrak_baru}
                    onChange={(e) => setDraft(d => ({ ...d, nilai_kontrak_baru: e.target.value }))}
                    placeholder="Masukkan nilai kontrak baru"
                  />
                </div>
              </div>
            )}

           {(draft.jenis_amandemen === 'Waktu' || draft.jenis_amandemen === 'Nilai dan Waktu') && (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <div>
      <Label>Tanggal Mulai Baru</Label>
      <Input
        type="date"
        value={draft.tanggal_mulai_baru}
        onChange={(e) => {
          const mulai = e.target.value;
          const selesai = draft.tanggal_selesai_baru;
          let durasi = '';
          if (mulai && selesai) {
            const diff = Math.round(
              (new Date(selesai).getTime() - new Date(mulai).getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;
            durasi = diff > 0 ? diff.toString() : '';
          }
          setDraft(d => ({ ...d, tanggal_mulai_baru: mulai, durasi_amandemen: durasi }));
        }}
      />
    </div>
    <div>
      <Label>Tanggal Selesai Baru</Label>
      <Input
        type="date"
        value={draft.tanggal_selesai_baru}
        onChange={(e) => {
          const selesai = e.target.value;
          const mulai = draft.tanggal_mulai_baru;
          let durasi = '';
          if (mulai && selesai) {
            const diff = Math.round(
              (new Date(selesai).getTime() - new Date(mulai).getTime()) / (1000 * 60 * 60 * 24)
            ) + 1;
            durasi = diff > 0 ? diff.toString() : '';
          }
          setDraft(d => ({ ...d, tanggal_selesai_baru: selesai, durasi_amandemen: durasi }));
        }}
      />
    </div>
    <div>
      <Label>Durasi (Hari)</Label>
      <Input
        value={draft.durasi_amandemen}
        readOnly
        className="bg-muted"
        placeholder="Otomatis dihitung"
      />
      <p className="text-xs text-muted-foreground mt-1">
        Dihitung dari selisih tanggal
      </p>
    </div>
  </div>
)}

            <div>
              <Label>Alasan Perubahan</Label>
              <Textarea
                value={draft.alasan_perubahan}
                onChange={(e) => setDraft(d => ({ ...d, alasan_perubahan: e.target.value }))}
                placeholder="Masukkan alasan perubahan..."
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCancel}>Batal</Button>
              <Button onClick={handleSave} disabled={addAmendment.isPending || updateAmendment.isPending}>
                <Save className="h-4 w-4 mr-2" />
                {editingId ? 'Perbarui' : 'Simpan'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {amendments.length === 0 && !showForm && (
        <div className="text-center py-8 text-muted-foreground border-2 border-dashed rounded-lg">
          <FileEdit className="h-10 w-10 mx-auto mb-3 opacity-50" />
          <p>Belum ada amandemen untuk kontrak ini</p>
          <Button variant="link" onClick={handleAddNew} className="mt-2">
            Tambah Amandemen Pertama
          </Button>
        </div>
      )}
    </div>
  );
};
