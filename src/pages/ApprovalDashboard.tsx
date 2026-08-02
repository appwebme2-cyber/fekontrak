import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  CheckCircle, XCircle, Clock, FileText,
  ExternalLink, Search, Filter, ClipboardCheck
} from 'lucide-react';
import { useDokumenApproval, DokumenApproval } from '@/hooks/useDokumenApproval';
import { useAuth } from '@/hooks/useAuth';

const StatusBadge = ({ status }: { status: string }) => {
  if (status === 'Approved') return <Badge className="bg-green-100 text-green-800 border-green-300"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
  if (status === 'Rejected') return <Badge className="bg-red-100 text-red-800 border-red-300"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
  return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
};

const formatFileSize = (bytes?: number) => {
  if (!bytes) return '-';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
};

const ApprovalDashboard = () => {
  const { dokumens, isLoading, reviewDokumen, getFileUrl } = useDokumenApproval();
  const { userProfile } = useAuth();

  const [filterStatus, setFilterStatus] = useState('all');
  const [filterTipe, setFilterTipe] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDok, setSelectedDok] = useState<DokumenApproval | null>(null);
  const [reviewDialog, setReviewDialog] = useState(false);
  const [reviewAction, setReviewAction] = useState<'Approved' | 'Rejected'>('Approved');
  const [catatan, setCatatan] = useState('');

  const filtered = dokumens.filter(d => {
    const matchStatus = filterStatus === 'all' || d.status_approval === filterStatus;
    const matchTipe = filterTipe === 'all' || d.tipe_dokumen === filterTipe;
    const matchSearch = !searchTerm ||
      d.nama_dokumen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (d.judul_kontrak || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchTipe && matchSearch;
  });

  const stats = {
    total: dokumens.length,
    pending: dokumens.filter(d => d.status_approval === 'Pending').length,
    approved: dokumens.filter(d => d.status_approval === 'Approved').length,
    rejected: dokumens.filter(d => d.status_approval === 'Rejected').length,
  };

  const handleReview = (dok: DokumenApproval, action: 'Approved' | 'Rejected') => {
    setSelectedDok(dok);
    setReviewAction(action);
    setCatatan('');
    setReviewDialog(true);
  };

  const handleConfirmReview = async () => {
    if (!selectedDok) return;
    await reviewDokumen.mutateAsync({
      id: selectedDok.id_dokumen,
      status: reviewAction,
      catatan,
      reviewedBy: userProfile?.fullName || userProfile?.email || 'PIC'
    });
    setReviewDialog(false);
    setSelectedDok(null);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-card rounded-2xl shadow-lg border p-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-100 rounded-xl">
            <ClipboardCheck className="h-7 w-7 text-blue-600" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Approval Dokumen</h1>
            <p className="text-gray-500">Review dan setujui dokumen dari vendor</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-blue-600 font-medium">Total</p>
              <p className="text-3xl font-bold text-blue-700">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-300" />
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-yellow-600 font-medium">Pending</p>
              <p className="text-3xl font-bold text-yellow-700">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-300" />
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-green-600 font-medium">Approved</p>
              <p className="text-3xl font-bold text-green-700">{stats.approved}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-300" />
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-red-600 font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-700">{stats.rejected}</p>
            </div>
            <XCircle className="h-8 w-8 text-red-300" />
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-3 flex-wrap">
            <div className="flex-1 min-w-[200px] relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama dokumen atau kontrak..."
                className="pl-9"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterTipe} onValueChange={setFilterTipe}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Semua Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="Evident Progress">Evident Progress</SelectItem>
                <SelectItem value="Report Vendor">Report Vendor</SelectItem>
                <SelectItem value="Persetujuan Pelaksanaan">Persetujuan Pelaksanaan</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* List Dokumen */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <ClipboardCheck className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Tidak ada dokumen ditemukan</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((dok) => (
            <Card key={dok.id_dokumen} className="hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <FileText className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-800">{dok.nama_dokumen}</span>
                        <Badge variant="outline" className="text-xs">{dok.tipe_dokumen}</Badge>
                        <StatusBadge status={dok.status_approval} />
                      </div>
                      {dok.judul_kontrak && (
                        <p className="text-sm text-blue-600 mt-1">📋 {dok.judul_kontrak}</p>
                      )}
                      {dok.deskripsi_dokumen && (
                        <p className="text-sm text-gray-500 mt-1">{dok.deskripsi_dokumen}</p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 flex-wrap">
                        <span>📎 {dok.nama_file}</span>
                        <span>{formatFileSize(dok.ukuran_file)}</span>
                        <span>👤 {dok.uploaded_by || '-'}</span>
                        {dok.created_at && (
                          <span>📅 {new Date(dok.created_at).toLocaleDateString('id-ID')}</span>
                        )}
                      </div>
                      {dok.catatan_reviewer && (
                        <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                          <span className="font-medium text-gray-600">Catatan: </span>
                          <span className="text-gray-500">{dok.catatan_reviewer}</span>
                          {dok.reviewed_by && <span className="ml-2 text-gray-400">— {dok.reviewed_by}</span>}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 min-w-[120px]">
                    {dok.file_url && (
                      <Button variant="outline" size="sm" asChild className="gap-1">
                        <a href={getFileUrl(dok.file_url) || '#'} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-3 w-3" /> Lihat File
                        </a>
                      </Button>
                    )}
                    {dok.status_approval === 'Pending' && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 gap-1"
                          onClick={() => handleReview(dok, 'Approved')}
                        >
                          <CheckCircle className="h-3 w-3" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          className="gap-1"
                          onClick={() => handleReview(dok, 'Rejected')}
                        >
                          <XCircle className="h-3 w-3" /> Reject
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={reviewDialog} onOpenChange={setReviewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reviewAction === 'Approved'
                ? <><CheckCircle className="h-5 w-5 text-green-600" /> Approve Dokumen</>
                : <><XCircle className="h-5 w-5 text-red-600" /> Reject Dokumen</>
              }
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {selectedDok && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="font-medium">{selectedDok.nama_dokumen}</p>
                <p className="text-sm text-gray-500">{selectedDok.tipe_dokumen}</p>
              </div>
            )}
            <div>
              <Label>Catatan {reviewAction === 'Rejected' ? '(wajib untuk reject)' : '(opsional)'}</Label>
              <Textarea
                value={catatan}
                onChange={(e) => setCatatan(e.target.value)}
                placeholder="Tambahkan catatan untuk vendor..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialog(false)}>Batal</Button>
            <Button
              onClick={handleConfirmReview}
              disabled={reviewDokumen.isPending || (reviewAction === 'Rejected' && !catatan.trim())}
              className={reviewAction === 'Approved' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {reviewDokumen.isPending ? 'Memproses...' : `Konfirmasi ${reviewAction}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ApprovalDashboard;
