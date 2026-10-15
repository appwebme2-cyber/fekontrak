import { useState } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Calculator, Trash2, ExternalLink, Hammer, Package } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
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
      <PageHeader
        icon={Calculator}
        title="Kebutuhan Material & Pekerjaan"
        description="Draft kebutuhan material & pekerjaan dari Rekomendasi/MRF, dicocokkan ke RAB kontrak"
      />

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
              className="group overflow-hidden cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
              onClick={() => navigate(`/material-requirement/${d.id_draft}`)}
            >
              {/* Header bergaya sama dengan kartu kontrak & tagihan */}
              <div className="p-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <div className="flex justify-between items-start gap-2 mb-2">
                  <Badge className={`${statusColor[d.status] || 'bg-gray-100 text-gray-800'} text-xs font-medium`}>{d.status}</Badge>
                  <div className="flex gap-1 flex-shrink-0 -mt-1 -mr-1">
                    {canDelete && (
                      <button
                        title="Hapus Draft"
                        className="p-2 text-white/80 hover:text-white hover:bg-red-500/30 rounded-lg transition-colors"
                        onClick={(e) => { e.stopPropagation(); setDeletingDraft(d); }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      title="Buka Draft"
                      className="p-2 text-white/80 hover:text-white hover:bg-white/20 rounded-lg transition-colors"
                      onClick={(e) => { e.stopPropagation(); navigate(`/material-requirement/${d.id_draft}`); }}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
                <p className="font-semibold text-lg leading-tight truncate" title={d.tag_unit}>{d.tag_unit}</p>
                <p className="text-sm text-white/80 truncate mb-1">MRF: {d.nomor_mrf || '-'}</p>
                {/* Judul kontrak maks. 2 baris, selalu setinggi 2 baris; judul lengkap di tooltip */}
                <Tooltip delayDuration={200}>
                  <TooltipTrigger asChild>
                    <p className="text-sm text-white/90 leading-tight line-clamp-2 min-h-[2.5em] cursor-default">
                      {d.kontrak?.judul_kontrak || 'Kontrak tidak ditemukan'}
                    </p>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="start" className="max-w-sm border-gray-900 bg-gray-900 text-white">
                    {d.kontrak?.judul_kontrak || 'Kontrak tidak ditemukan'}
                  </TooltipContent>
                </Tooltip>
              </div>

              <CardContent className="pt-4 space-y-3">
                <div>
                  <div className="text-xs font-medium text-gray-500 mb-0.5">Problem</div>
                  <p className={`text-sm line-clamp-2 min-h-[2.5rem] ${d.problem ? 'text-gray-800' : 'text-gray-400 italic'}`}>
                    {d.problem || 'Belum diisi'}
                  </p>
                </div>
                <div className="flex items-center gap-4 border-t pt-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Hammer className="h-4 w-4 text-blue-600" />
                    {d.lines.filter((l) => l.jenis !== 'Material').length} pekerjaan
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Package className="h-4 w-4 text-amber-600" />
                    {d.lines.filter((l) => l.jenis === 'Material').length} material
                  </span>
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
