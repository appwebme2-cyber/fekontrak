import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Pencil, Plus, Trash2, Settings2, FileText, Image as ImageIcon, Sparkles, Download } from 'lucide-react';
import { useMaterialRequirementDraft, useMaterialRequirementDrafts, MaterialRequirementDraft, AiExtractionResult } from '@/hooks/useMaterialRequirementDrafts';
import { useMaterialRequirementLines, MaterialRequirementLine, LineJenis } from '@/hooks/useMaterialRequirementLines';
import { useMaterialRequirementDocumentUpload } from '@/hooks/useMaterialRequirementDocumentUpload';
import { useRabItems } from '@/hooks/useRabItems';
import { usePermissions } from '@/hooks/usePermissions';
import { DraftFormDialog } from '@/components/material-requirement/DraftFormDialog';
import { LineItemFormDialog } from '@/components/material-requirement/LineItemFormDialog';
import { RabItemManagerDialog } from '@/components/material-requirement/RabItemManagerDialog';
import { AiExtractionReviewDialog } from '@/components/material-requirement/AiExtractionReviewDialog';
import { AiGenerateProgress } from '@/components/material-requirement/AiGenerateProgress';
import { exportDraftToExcel, getMatchStatus } from '@/components/material-requirement/exportDraftToExcel';
import { ConfirmDeleteDialog } from '@/components/shared/ConfirmDeleteDialog';
import { DocumentUploadArea } from '@/components/contracts/forms/components/DocumentUploadArea';
import { DocumentList } from '@/components/contracts/forms/components/DocumentList';

function getMatchBadge(kalkulasi: number, klaim: number | null | undefined) {
  switch (getMatchStatus(kalkulasi, klaim)) {
    case 'Belum ada klaim':
      return <Badge variant="outline" className="text-muted-foreground">Belum ada klaim</Badge>;
    case 'Sesuai':
      return <Badge className="bg-green-100 text-green-800">Sesuai</Badge>;
    case 'Overclaim':
      return <Badge className="bg-red-100 text-red-800">Overclaim</Badge>;
    default:
      return <Badge className="bg-amber-100 text-amber-800">Underclaim</Badge>;
  }
}

const LineTable = ({
  lines,
  canEdit,
  canDelete,
  onEdit,
  onDelete,
}: {
  lines: MaterialRequirementLine[];
  canEdit: boolean;
  canDelete: boolean;
  onEdit: (l: MaterialRequirementLine) => void;
  onDelete: (l: MaterialRequirementLine) => void;
}) => {
  if (lines.length === 0) {
    return <p className="text-sm text-muted-foreground py-8 text-center">Belum ada baris. Klik "Tambah Baris" untuk mulai.</p>;
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Kode RAB</TableHead>
          <TableHead>Uraian</TableHead>
          <TableHead>Satuan</TableHead>
          <TableHead className="text-right">Vol. Kalkulasi</TableHead>
          <TableHead className="text-right">Vol. Klaim</TableHead>
          <TableHead>Status</TableHead>
          {(canEdit || canDelete) && <TableHead className="text-right">Aksi</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {lines.map((l) => (
          <TableRow key={l.id_line}>
            <TableCell className="font-mono text-xs">{l.kode_item_snapshot || '-'}</TableCell>
            <TableCell className="text-sm max-w-xs">
              <p className="line-clamp-2">{l.uraian_pekerjaan}</p>
              {l.catatan_kalkulasi && <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{l.catatan_kalkulasi}</p>}
            </TableCell>
            <TableCell className="text-sm">{l.satuan}</TableCell>
            <TableCell className="text-right text-sm">{l.volume_kalkulasi}</TableCell>
            <TableCell className="text-right text-sm">{l.volume_klaim ?? '-'}</TableCell>
            <TableCell>{getMatchBadge(l.volume_kalkulasi, l.volume_klaim)}</TableCell>
            {(canEdit || canDelete) && (
              <TableCell className="text-right whitespace-nowrap">
                {canEdit && (
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(l)}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
                {canDelete && (
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={() => onDelete(l)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                )}
              </TableCell>
            )}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

const MaterialRequirementDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { draft, isLoading, refresh, extractAi } = useMaterialRequirementDraft(id);
  const { updateDraft } = useMaterialRequirementDrafts();
  const { createLine, updateLine, deleteLine, deleteAllLines } = useMaterialRequirementLines(id || '');
  const { rabItems, isLoading: rabItemsLoading } = useRabItems(draft?.id_kontrak);
  const { canEdit, canDelete, canCreate } = usePermissions();

  const [editDraftOpen, setEditDraftOpen] = useState(false);
  const [rabManagerOpen, setRabManagerOpen] = useState(false);
  const [lineDialog, setLineDialog] = useState<{ open: boolean; jenis: LineJenis; line: MaterialRequirementLine | null }>({
    open: false, jenis: 'Pekerjaan', line: null,
  });
  const [deletingLine, setDeletingLine] = useState<MaterialRequirementLine | null>(null);
  const [aiReviewOpen, setAiReviewOpen] = useState(false);
  const [aiResult, setAiResult] = useState<AiExtractionResult | null>(null);
  const [applyingAi, setApplyingAi] = useState(false);

  const { uploading, handleFileUpload, removeDocument } = useMaterialRequirementDocumentUpload({
    formData: {
      rekomendasi_documents: draft?.rekomendasi_documents || [],
      gambar_kerja_documents: draft?.gambar_kerja_documents || [],
    },
    setFormData: async (data: any) => {
      if (!draft) return;
      await updateDraft.mutateAsync({
        id: draft.id_draft,
        id_kontrak: draft.id_kontrak,
        nomor_mrf: draft.nomor_mrf,
        tag_unit: draft.tag_unit,
        lokasi_area: draft.lokasi_area,
        tanggal_rekomendasi: draft.tanggal_rekomendasi,
        problem: draft.problem,
        rekomendasi_solusi: draft.rekomendasi_solusi,
        status: draft.status,
        catatan: draft.catatan,
        rekomendasi_documents: data.rekomendasi_documents,
        gambar_kerja_documents: data.gambar_kerja_documents,
      });
      refresh();
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-60">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!draft) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-lg text-gray-600 mb-4">Draft tidak ditemukan.</p>
          <Button onClick={() => navigate('/material-requirement')}>Kembali ke Daftar</Button>
        </CardContent>
      </Card>
    );
  }

  const pekerjaanLines = draft.lines.filter((l) => l.jenis === 'Pekerjaan');
  const materialLines = draft.lines.filter((l) => l.jenis === 'Material');

  const handleUpdateDraft = async (data: Partial<MaterialRequirementDraft>) => {
    await updateDraft.mutateAsync({ id: draft.id_draft, ...data });
    setEditDraftOpen(false);
    refresh();
  };

  const handleLineSubmit = async (data: Partial<MaterialRequirementLine>) => {
    if (lineDialog.line) {
      await updateLine.mutateAsync({ id: lineDialog.line.id_line, ...data });
    } else {
      await createLine.mutateAsync(data);
    }
    setLineDialog({ open: false, jenis: lineDialog.jenis, line: null });
    refresh();
  };

  const confirmDeleteLine = () => {
    if (!deletingLine) return;
    deleteLine.mutate(deletingLine.id_line, { onSuccess: refresh });
    setDeletingLine(null);
  };

  const handleExtractAi = async () => {
    const result = await extractAi.mutateAsync();
    setAiResult(result);
    setAiReviewOpen(true);
  };

  const handleApplyAiResult = async (data: {
    replaceExisting: boolean;
    problem?: string;
    rekomendasi_solusi?: string;
    tag_unit?: string;
    lines: { jenis: 'Pekerjaan' | 'Material'; id_rab_item?: string; kode_item_snapshot?: string; uraian_pekerjaan: string; satuan: string; volume_kalkulasi: number; volume_klaim?: number; catatan_kalkulasi?: string }[];
  }) => {
    setApplyingAi(true);
    try {
      if (data.problem !== undefined || data.rekomendasi_solusi !== undefined || data.tag_unit !== undefined) {
        await updateDraft.mutateAsync({
          id: draft.id_draft,
          id_kontrak: draft.id_kontrak,
          nomor_mrf: draft.nomor_mrf,
          tag_unit: data.tag_unit || draft.tag_unit,
          lokasi_area: draft.lokasi_area,
          tanggal_rekomendasi: draft.tanggal_rekomendasi,
          problem: data.problem ?? draft.problem,
          rekomendasi_solusi: data.rekomendasi_solusi ?? draft.rekomendasi_solusi,
          status: draft.status,
          catatan: draft.catatan,
          rekomendasi_documents: draft.rekomendasi_documents,
          gambar_kerja_documents: draft.gambar_kerja_documents,
        });
      }
      // Hasil AI sudah ada di memori, jadi baris lama baru dihapus setelah ekstraksi berhasil
      if (data.replaceExisting) {
        await deleteAllLines.mutateAsync();
      }
      for (const line of data.lines) {
        await createLine.mutateAsync(line);
      }
      setAiReviewOpen(false);
      refresh();
    } finally {
      setApplyingAi(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/material-requirement')}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
        </Button>
      </div>

      <div className="rounded-2xl bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 py-6 px-6 md:px-10 text-white shadow-lg">
        <div className="flex justify-between items-start flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold">{draft.tag_unit}</h1>
              <Badge className="bg-white/20 text-white border-0">{draft.status}</Badge>
            </div>
            {draft.nomor_mrf && <p className="text-blue-100/85 text-sm">{draft.nomor_mrf}</p>}
            <p className="text-blue-100/85 text-sm mt-1">{draft.kontrak?.judul_kontrak}</p>
          </div>
          <div className="flex gap-2">
            {/* Export tidak mengubah data, jadi tersedia untuk semua role termasuk viewer */}
            <Button variant="secondary" size="sm" onClick={() => exportDraftToExcel(draft)}>
              <Download className="h-4 w-4 mr-1" /> Export Excel
            </Button>
            {canEdit && (
              <Button variant="secondary" size="sm" onClick={() => setEditDraftOpen(true)}>
                <Pencil className="h-4 w-4 mr-1" /> Edit Header
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader><CardTitle className="text-base">Problem</CardTitle></CardHeader>
          <CardContent><p className="text-sm whitespace-pre-wrap">{draft.problem || '-'}</p></CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-base">Rekomendasi / Solusi</CardTitle></CardHeader>
          <CardContent><p className="text-sm whitespace-pre-wrap">{draft.rekomendasi_solusi || '-'}</p></CardContent>
        </Card>
      </div>

      {canCreate && (
        <div className="flex flex-col items-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExtractAi}
            disabled={extractAi.isPending || (draft.rekomendasi_documents.length === 0 && draft.gambar_kerja_documents.length === 0)}
            className="border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            {extractAi.isPending ? 'Memproses dokumen...' : 'Auto Ekstrak & Generate dengan AI (Beta)'}
          </Button>
          <AiGenerateProgress active={extractAi.isPending} hasRabItems={rabItems.length > 0} />
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> Dokumen Rekomendasi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {canEdit && (
              <DocumentUploadArea
                sectionKey="rekomendasi_documents"
                onFileUpload={(files, section) => handleFileUpload(files, section as any)}
                uploading={uploading}
              />
            )}
            <DocumentList
              documents={draft.rekomendasi_documents}
              onRemoveDocument={(docId) => removeDocument('rekomendasi_documents', docId)}
              onPreviewDocument={(doc: any) => doc.url && window.open(doc.url, '_blank')}
              disabled={!canEdit}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2"><ImageIcon className="h-4 w-4" /> Gambar Rencana Kerja</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {canEdit && (
              <DocumentUploadArea
                sectionKey="gambar_kerja_documents"
                onFileUpload={(files, section) => handleFileUpload(files, section as any)}
                uploading={uploading}
              />
            )}
            <DocumentList
              documents={draft.gambar_kerja_documents}
              onRemoveDocument={(docId) => removeDocument('gambar_kerja_documents', docId)}
              onPreviewDocument={(doc: any) => doc.url && window.open(doc.url, '_blank')}
              disabled={!canEdit}
            />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-base">Item RAB Kontrak</CardTitle>
          <Button variant="outline" size="sm" onClick={() => setRabManagerOpen(true)}>
            <Settings2 className="h-4 w-4 mr-1" /> Kelola Item RAB ({rabItems.length})
          </Button>
        </CardHeader>
      </Card>

      <Tabs defaultValue="pekerjaan">
        <TabsList>
          <TabsTrigger value="pekerjaan">Daftar Pekerjaan ({pekerjaanLines.length})</TabsTrigger>
          <TabsTrigger value="material">Daftar Material / BOM ({materialLines.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="pekerjaan">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Daftar Pekerjaan</CardTitle>
              {canCreate && (
                <Button size="sm" onClick={() => setLineDialog({ open: true, jenis: 'Pekerjaan', line: null })}>
                  <Plus className="h-4 w-4 mr-1" /> Tambah Baris
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <LineTable
                lines={pekerjaanLines}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={(l) => setLineDialog({ open: true, jenis: 'Pekerjaan', line: l })}
                onDelete={setDeletingLine}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="material">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-base">Daftar Material (BOM)</CardTitle>
              {canCreate && (
                <Button size="sm" onClick={() => setLineDialog({ open: true, jenis: 'Material', line: null })}>
                  <Plus className="h-4 w-4 mr-1" /> Tambah Material
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <LineTable
                lines={materialLines}
                canEdit={canEdit}
                canDelete={canDelete}
                onEdit={(l) => setLineDialog({ open: true, jenis: 'Material', line: l })}
                onDelete={setDeletingLine}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DraftFormDialog
        open={editDraftOpen}
        onOpenChange={setEditDraftOpen}
        draft={draft}
        onSubmit={handleUpdateDraft}
        isLoading={updateDraft.isPending}
      />

      <LineItemFormDialog
        open={lineDialog.open}
        onOpenChange={(open) => setLineDialog({ ...lineDialog, open })}
        jenis={lineDialog.jenis}
        rabItems={rabItems}
        rabItemsLoading={rabItemsLoading}
        line={lineDialog.line}
        onSubmit={handleLineSubmit}
        isLoading={createLine.isPending || updateLine.isPending}
      />

      <RabItemManagerDialog
        open={rabManagerOpen}
        onOpenChange={setRabManagerOpen}
        idKontrak={draft.id_kontrak}
        judulKontrak={draft.kontrak?.judul_kontrak}
      />

      <ConfirmDeleteDialog
        open={!!deletingLine}
        onOpenChange={(open) => !open && setDeletingLine(null)}
        onConfirm={confirmDeleteLine}
        title="Hapus Baris Kebutuhan?"
        description={`Apakah Anda yakin ingin menghapus baris '${deletingLine?.uraian_pekerjaan}'?`}
      />

      <AiExtractionReviewDialog
        open={aiReviewOpen}
        onOpenChange={setAiReviewOpen}
        result={aiResult}
        rabItems={rabItems}
        existingLineCount={draft.lines.length}
        onApply={handleApplyAiResult}
        isApplying={applyingAi}
      />
    </div>
  );
};

export default MaterialRequirementDetail;
