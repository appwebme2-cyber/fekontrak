import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Calculator, Trash2 } from 'lucide-react';
import { useMaterialRequirementDrafts, MaterialRequirementDraft } from '@/hooks/useMaterialRequirementDrafts';
import { DraftFormDialog } from '@/components/material-requirement/DraftFormDialog';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { usePermissions } from '@/hooks/usePermissions';

const statusColor: Record<string, string> = {
  Draft: 'bg-yellow-100 text-yellow-800',
  Final: 'bg-green-100 text-green-800',
};

const MaterialRequirementList = () => {
  const navigate = useNavigate();
  const { drafts, isLoading, createDraft, deleteDraft } = useMaterialRequirementDrafts();
  const { canCreate, canDelete } = usePermissions();
  const [searchQuery, setSearchQuery] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [deletingDraft, setDeletingDraft] = useState<MaterialRequirementDraft | null>(null);

  const filtered = drafts.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.tag_unit.toLowerCase().includes(q) ||
      (d.nomor_mrf || '').toLowerCase().includes(q) ||
      (d.kontrak?.judul_kontrak || '').toLowerCase().includes(q) ||
      (d.problem || '').toLowerCase().includes(q)
    );
  });

  const handleCreate = async (data: Partial<MaterialRequirementDraft>) => {
    const created = await createDraft.mutateAsync(data);
    setFormOpen(false);
    navigate(`/material-requirement/${created.id_draft}`);
  };

  const confirmDelete = () => {
    if (!deletingDraft) return;
    deleteDraft.mutate(deletingDraft.id_draft);
    setDeletingDraft(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 py-7 px-6 md:px-12 text-white mb-2 shadow-lg">
        <h1 className="text-2xl md:text-3xl font-bold mb-1 flex items-center gap-2">
          <Calculator className="h-7 w-7" /> Kebutuhan Material & Pekerjaan
        </h1>
        <p className="text-blue-100/85">
          Draft kebutuhan material & pekerjaan dari Rekomendasi/MRF, dicocokkan ke RAB kontrak
        </p>
      </div>

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-700">Daftar Draft ({filtered.length})</h2>
        {canCreate && (
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Draft Baru
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari Tag/Unit, nomor MRF, kontrak, atau problem..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex items-center justify-center min-h-60">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg text-gray-600">Memuat data...</p>
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery ? 'Tidak ada draft ditemukan' : 'Belum ada draft kebutuhan'}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery ? `Tidak ada draft yang cocok dengan "${searchQuery}"` : 'Mulai dengan membuat draft pertama dari sebuah Rekomendasi/MRF'}
            </p>
            {canCreate && !searchQuery && (
              <Button onClick={() => setFormOpen(true)}>
                <Plus className="mr-2 h-4 w-4" /> Buat Draft Pertama
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((d) => (
            <Card
              key={d.id_draft}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/material-requirement/${d.id_draft}`)}
            >
              <CardContent className="pt-5 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <p className="font-semibold text-base">{d.tag_unit}</p>
                    {d.nomor_mrf && <p className="text-xs text-muted-foreground">{d.nomor_mrf}</p>}
                  </div>
                  <Badge className={statusColor[d.status] || 'bg-gray-100 text-gray-800'}>{d.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">{d.kontrak?.judul_kontrak}</p>
                {d.problem && <p className="text-sm line-clamp-2">{d.problem}</p>}
                <div className="flex justify-between items-center pt-2">
                  <span className="text-xs text-muted-foreground">{d.lines.length} baris kebutuhan</span>
                  {canDelete && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-destructive"
                      onClick={(e) => { e.stopPropagation(); setDeletingDraft(d); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <DraftFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        draft={null}
        onSubmit={handleCreate}
        isLoading={createDraft.isPending}
      />

      <ConfirmDeleteDialog
        open={!!deletingDraft}
        onOpenChange={(open) => !open && setDeletingDraft(null)}
        onConfirm={confirmDelete}
        title="Hapus Draft Kebutuhan?"
        description={`Apakah Anda yakin ingin menghapus draft untuk '${deletingDraft?.tag_unit}'? Semua baris kebutuhan di dalamnya juga akan terhapus.`}
      />
    </div>
  );
};

export default MaterialRequirementList;
