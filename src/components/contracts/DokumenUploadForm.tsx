import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, X, CheckCircle, Clock, XCircle, Trash2, ExternalLink } from 'lucide-react';
import { useDokumenApproval, DokumenApproval } from '@/hooks/useDokumenApproval';
import { useAuth } from '@/hooks/useAuth';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

interface DokumenUploadFormProps {
  idKontrak: string;
  judulKontrak?: string;
}

const TIPE_DOKUMEN = ['Evident Progress', 'Report Vendor', 'Persetujuan Pelaksanaan'];

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'Approved') return <Badge className="bg-green-100 text-green-800"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
  if (status === 'Rejected') return <Badge className="bg-red-100 text-red-800"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '-';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

export const DokumenUploadForm = ({ idKontrak, judulKontrak }: DokumenUploadFormProps) => {
  const { dokumens, isLoading, uploadDokumen, deleteDokumen, getFileUrl } = useDokumenApproval(idKontrak);
  const { userProfile } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    tipe_dokumen: '',
    nama_dokumen: '',
    deskripsi_dokumen: '',
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !form.tipe_dokumen || !form.nama_dokumen) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('idKontrak', idKontrak);
    formData.append('tipeDokumen', form.tipe_dokumen);
    formData.append('namaDokumen', form.nama_dokumen);
    formData.append('deskripsiDokumen', form.deskripsi_dokumen);
    formData.append('uploadedBy', userProfile?.fullName || userProfile?.email || 'Unknown');

    await uploadDokumen.mutateAsync(formData);
    setForm({ tipe_dokumen: '', nama_dokumen: '', deskripsi_dokumen: '' });
    setSelectedFile(null);
    if (fileRef.current) fileRef.current.value = '';
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-800">Dokumen & Approval</h3>
            <p className="text-sm text-gray-500">Upload evident, report, dan persetujuan pelaksanaan</p>
          </div>
        </div>
        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Upload className="h-4 w-4" />
          Upload Dokumen
        </Button>
      </div>

      {/* Form Upload */}
      {showForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Upload Dokumen Baru</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => setShowForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Tipe Dokumen *</Label>
                <Select value={form.tipe_dokumen} onValueChange={(v) => setForm(f => ({ ...f, tipe_dokumen: v }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe dokumen" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPE_DOKUMEN.map(t => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Nama Dokumen *</Label>
                <Input
                  value={form.nama_dokumen}
                  onChange={(e) => setForm(f => ({ ...f, nama_dokumen: e.target.value }))}
                  placeholder="Contoh: Laporan Progress Minggu 1"
                />
              </div>
            </div>

            <div>
              <Label>Deskripsi</Label>
              <Textarea
                value={form.deskripsi_dokumen}
                onChange={(e) => setForm(f => ({ ...f, deskripsi_dokumen: e.target.value }))}
                placeholder="Keterangan tambahan..."
                rows={2}
              />
            </div>

            <div>
              <Label>File *</Label>
              <div
                className="mt-1 border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 transition-colors"
                onClick={() => fileRef.current?.click()}
              >
                {selectedFile ? (
                  <div className="flex items-center justify-center gap-2 text-blue-600">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">{selectedFile.name}</span>
                    <span className="text-gray-400 text-sm">({formatFileSize(selectedFile.size)})</span>
                  </div>
                ) : (
                  <div className="text-gray-400">
                    <Upload className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Klik untuk pilih file</p>
                    <p className="text-xs mt-1">PDF, Word, Excel, JPG, PNG</p>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowForm(false)}>Batal</Button>
              <Button
                onClick={handleUpload}
                disabled={!selectedFile || !form.tipe_dokumen || !form.nama_dokumen || uploadDokumen.isPending}
              >
                {uploadDokumen.isPending ? 'Mengupload...' : 'Upload'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Daftar Dokumen */}
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : dokumens.length === 0 ? (
        <div className="text-center py-12 text-gray-400 border-2 border-dashed rounded-lg">
          <FileText className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Belum ada dokumen yang diupload</p>
        </div>
      ) : (
        <div className="space-y-3">
          {dokumens.map((dok) => (
            <Card key={dok.id_dokumen} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-gray-100 rounded-lg mt-1">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800">{dok.nama_dokumen}</span>
                        <Badge variant="outline" className="text-xs">{dok.tipe_dokumen}</Badge>
                        <StatusBadge status={dok.status_approval} />
                      </div>
                      {dok.deskripsi_dokumen && (
                        <p className="text-sm text-gray-500 mt-1">{dok.deskripsi_dokumen}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                        <span>{dok.nama_file}</span>
                        <span>{formatFileSize(dok.ukuran_file)}</span>
                        <span>Diupload oleh: {dok.uploaded_by || '-'}</span>
                        {dok.created_at && (
                          <span>{new Date(dok.created_at).toLocaleDateString('id-ID')}</span>
                        )}
                      </div>
                      {dok.catatan_reviewer && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs text-gray-600">
                          <span className="font-medium">Catatan reviewer: </span>{dok.catatan_reviewer}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-1 ml-2">
                    {dok.file_url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-blue-600"
                      >
                        <a href={getFileUrl(dok.file_url) || '#'} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="text-red-500">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Hapus Dokumen?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Dokumen "{dok.nama_dokumen}" akan dihapus permanen.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Batal</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteDokumen.mutate(dok.id_dokumen)}>
                            Hapus
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
