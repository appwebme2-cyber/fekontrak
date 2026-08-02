import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, FileText, Calendar, Coins, Building, 
  CheckCircle, Clock, AlertCircle, Mail, Upload, User,
  MapPin, Phone, Eye, Download
} from 'lucide-react';
import { InvoiceDocumentList } from '@/components/invoices/form/components/InvoiceDocumentList';
import { TagihanDocument } from '@/lib/utils/typeUtils';
import { jsonToTagihanDocuments } from '@/lib/utils/databaseTypes';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';
import { InvoiceSlaSection } from '@/components/invoices/InvoiceSlaSection';

const API_URL = "https://bekontrak-production.up.railway.app/api";

const getToken = () => localStorage.getItem("token");

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Fetch tagihan detail dari backend
  const { data: invoice, isLoading } = useQuery({
    queryKey: ['invoice', id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/tagihan/${id}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) throw new Error("Gagal ambil detail tagihan");
      const data = await res.json();

      // Map camelCase → snake_case
      return {
        id_tagihan: data.idTagihan,
        id_kontrak: data.idKontrak,
        nomor_tagihan: data.nomorTagihan,
        tanggal_tagihan: data.tanggalTagihan,
        tipe_kontrak: data.tipeKontrak,
        termin: data.termin,
        nilai_tagihan: data.nilaiTagihan,
        status_tagihan: data.statusTagihan,
        memo_required: data.memoRequired,
        tanggal_pengiriman_memo: data.tanggalPengirimanMemo,
        //dokumen_tagihan: data.dokumenTagihan,
        dokumen_tagihan: data.dokumenTagihan 
  ? (typeof data.dokumenTagihan === 'string' 
      ? JSON.parse(data.dokumenTagihan) 
      : data.dokumenTagihan)
  : [],
        
        dokumen_memo: data.dokumenMemo,
        catatan: data.catatan,
        kontrak: data.kontrak ? {
          id_kontrak: data.kontrak.idKontrak,
          judul_kontrak: data.kontrak.judulKontrak,
          tipe_kontrak: data.kontrak.tipeKontrak,
          nilai_awal: data.kontrak.nilaiAwal,
          nilai_kontrak_baru: data.kontrak.nilaiKontrakBaru,
          tanggal_mulai: data.kontrak.tanggalMulai,
          tanggal_selesai: data.kontrak.tanggalSelesai,
          status_kontrak: data.kontrak.statusKontrak,
          direksi_pekerjaan: data.kontrak.direksiPekerjaan,
          has_amendment: data.kontrak.hasAmendment,
          vendor: data.kontrak.vendor ? {
            nama_vendor: data.kontrak.vendor.namaVendor,
            alamat: data.kontrak.vendor.alamat,
            pic_nama: data.kontrak.vendor.picNama,
            pic_kontak: data.kontrak.vendor.picKontak,
          } : null
        } : null
      };
    },
    enabled: !!id
  });

  // Fetch semua tagihan dari kontrak yang sama
  const { data: allInvoices = [] } = useQuery({
    queryKey: ['contract-invoices', invoice?.id_kontrak],
    queryFn: async () => {
      if (!invoice?.id_kontrak) return [];
      const res = await fetch(`${API_URL}/tagihan/kontrak/${invoice.id_kontrak}`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      if (!res.ok) return [];
      const data = await res.json();
      return data.map((t: any) => ({
        id_tagihan: t.idTagihan,
        id_kontrak: t.idKontrak,
        nomor_tagihan: t.nomorTagihan,
        tanggal_tagihan: t.tanggalTagihan,
        termin: t.termin,
        nilai_tagihan: t.nilaiTagihan,
        status_tagihan: t.statusTagihan,
        catatan: t.catatan,
      }));
    },
    enabled: !!invoice?.id_kontrak
  });

  const statusOptions = ['Punchlist','BAST/BAPP','Pengajuan','BAST I Vendor','SA','PA','Verification','Payment/Selesai'];

  const getStatusProgress = (status: string) => {
    const idx = statusOptions.indexOf(status);
    return idx >= 0 ? ((idx + 1) / statusOptions.length) * 100 : 0;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'Punchlist': 'bg-red-100 text-red-800 border-red-200',
      'BAST/BAPP': 'bg-orange-100 text-orange-800 border-orange-200',
      'Pengajuan': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'BAST I Vendor': 'bg-blue-100 text-blue-800 border-blue-200',
      'SA': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'PA': 'bg-purple-100 text-purple-800 border-purple-200',
      'Verification': 'bg-pink-100 text-pink-800 border-pink-200',
      'Payment/Selesai': 'bg-green-100 text-green-800 border-green-200'
    };
    return colors[status] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const getStatusIcon = (status: string) => {
    if (status === 'Payment/Selesai') return <CheckCircle className="h-4 w-4" />;
    if (['Punchlist', 'BAST/BAPP'].includes(status)) return <AlertCircle className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);

  const formatDate = (dateString: string) => {
    try { return format(parseISO(dateString), 'dd MMMM yyyy', { locale: idLocale }); }
    catch { return dateString; }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Memuat detail tagihan...</p>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Tagihan tidak ditemukan</p>
        <Button onClick={() => navigate('/invoices')} className="mt-4">Kembali ke Daftar Tagihan</Button>
      </div>
    );
  }

  const totalTagihan = allInvoices.reduce((sum: number, inv: any) => sum + (inv.nilai_tagihan || 0), 0);
  const nilaiKontrak = invoice.kontrak?.nilai_kontrak_baru || invoice.kontrak?.nilai_awal || 0;
  const documents: TagihanDocument[] = jsonToTagihanDocuments(invoice.dokumen_tagihan);

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/invoices')} className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Detail Tagihan Kontrak</h1>
            <p className="text-gray-600">{invoice.kontrak?.judul_kontrak}</p>
          </div>
        </div>
      </div>

      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                {invoice.kontrak?.has_amendment && (
                  <Badge className="bg-yellow-500/20 text-yellow-100 border-yellow-300">Amandemen</Badge>
                )}
                <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                  {invoice.kontrak?.status_kontrak}
                </Badge>
              </div>
              <p className="text-sm opacity-90">Status Kontrak</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{invoice.kontrak?.vendor?.nama_vendor}</p>
              <p className="text-sm opacity-90">Vendor</p>
            </div>
            <div>
              <p className="text-xl font-bold">{formatCurrency(nilaiKontrak)}</p>
              <p className="text-sm opacity-90">Nilai Kontrak</p>
            </div>
            <div>
              <p className="text-xl font-bold">{formatCurrency(totalTagihan)}</p>
              <p className="text-sm opacity-90">Total Tagihan</p>
            </div>
          </div>
          {invoice.kontrak?.direksi_pekerjaan && (
            <div className="mt-4 pt-4 border-t border-white/20">
              <p className="text-sm opacity-90">Direksi Pekerjaan</p>
              <p className="font-medium">{invoice.kontrak.direksi_pekerjaan}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="termin" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="termin">Semua Termin</TabsTrigger>
          <TabsTrigger value="informasi">Informasi Kontrak</TabsTrigger>
          <TabsTrigger value="dokumen">Dokumen</TabsTrigger>
        </TabsList>

        <TabsContent value="termin" className="space-y-6">
          <h2 className="text-xl font-semibold">Semua Termin Tagihan ({allInvoices.length})</h2>
          <div className="grid gap-4">
            {allInvoices.map((inv: any, index: number) => {
              const termProgress = getStatusProgress(inv.status_tagihan);
              const isCurrentInvoice = inv.id_tagihan === invoice.id_tagihan;
              return (
                <Card key={inv.id_tagihan} className={isCurrentInvoice ? 'ring-2 ring-blue-500' : ''}>
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-3 gap-6">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={getStatusColor(inv.status_tagihan)}>
                            <div className="flex items-center gap-1">
                              {getStatusIcon(inv.status_tagihan)}
                              {inv.status_tagihan}
                            </div>
                          </Badge>
                          {isCurrentInvoice && <Badge variant="outline" className="text-xs">Saat Ini</Badge>}
                        </div>
                        <h3 className="font-semibold text-lg">{inv.nomor_tagihan}</h3>
                        <p className="text-sm text-gray-600">{inv.termin || `Termin ${index + 1}`}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Nilai & Tanggal</p>
                        <p className="font-bold text-lg text-green-600 mb-2">{formatCurrency(inv.nilai_tagihan)}</p>
                        <p className="text-sm text-gray-600">{formatDate(inv.tanggal_tagihan)}</p>
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600">Progress</span>
                          <span className="font-medium">{Math.round(termProgress)}%</span>
                        </div>
                        <Progress value={termProgress} className="h-2 mb-4" />
                        <div className="space-y-1">
                          {statusOptions.slice(0, 4).map((status) => {
                            const isActive = statusOptions.indexOf(inv.status_tagihan) >= statusOptions.indexOf(status);
                            const isCurrent = inv.status_tagihan === status;
                            return (
                              <div key={status} className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${isCurrent ? 'bg-blue-600' : isActive ? 'bg-green-500' : 'bg-gray-300'}`} />
                                <span className={`text-xs ${isCurrent ? 'font-semibold text-blue-600' : isActive ? 'text-green-700' : 'text-gray-500'}`}>{status}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                    {inv.catatan && (
                      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">Catatan</p>
                        <p className="text-sm text-gray-800">{inv.catatan}</p>
                      </div>
                    )}
                     <div className="mt-4 pt-4 border-t">
                      <InvoiceSlaSection idTagihan={inv.id_tagihan} statusTagihan={inv.status_tagihan} />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="informasi" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Building className="h-5 w-5" />Informasi Kontrak</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><p className="text-sm text-gray-600">Judul Kontrak</p><p className="font-semibold">{invoice.kontrak?.judul_kontrak}</p></div>
                <div><p className="text-sm text-gray-600">Status</p><Badge variant="outline">{invoice.kontrak?.status_kontrak}</Badge></div>
                <div><p className="text-sm text-gray-600">Tipe</p><Badge variant="secondary">{invoice.kontrak?.tipe_kontrak}</Badge></div>
                <div><p className="text-sm text-gray-600">Nilai Kontrak</p><p className="font-semibold">{formatCurrency(nilaiKontrak)}</p></div>
                <div>
                  <p className="text-sm text-gray-600">Periode</p>
                  <p className="font-semibold">
                    {invoice.kontrak?.tanggal_mulai && invoice.kontrak?.tanggal_selesai
                      ? `${formatDate(invoice.kontrak.tanggal_mulai)} - ${formatDate(invoice.kontrak.tanggal_selesai)}`
                      : 'N/A'}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><User className="h-5 w-5" />Informasi Vendor</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div><p className="text-sm text-gray-600">Nama Vendor</p><p className="font-semibold">{invoice.kontrak?.vendor?.nama_vendor}</p></div>
                {invoice.kontrak?.vendor?.alamat && <div><p className="text-sm text-gray-600">Alamat</p><p className="font-semibold">{invoice.kontrak.vendor.alamat}</p></div>}
                {invoice.kontrak?.vendor?.pic_nama && (
                  <div>
                    <p className="text-sm text-gray-600">PIC</p>
                    <p className="font-semibold">{invoice.kontrak.vendor.pic_nama}</p>
                    {invoice.kontrak.vendor.pic_kontak && <p className="text-sm text-gray-500">{invoice.kontrak.vendor.pic_kontak}</p>}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card className="md:col-span-2">
              <CardHeader><CardTitle className="flex items-center gap-2"><Coins className="h-5 w-5" />Ringkasan Tagihan</CardTitle></CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center"><p className="text-2xl font-bold text-blue-600">{allInvoices.length}</p><p className="text-sm text-gray-600">Total Termin</p></div>
                  <div className="text-center"><p className="text-2xl font-bold text-green-600">{formatCurrency(totalTagihan)}</p><p className="text-sm text-gray-600">Total Tagihan</p></div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-orange-600">{nilaiKontrak > 0 ? Math.round((totalTagihan / nilaiKontrak) * 100) : 0}%</p>
                    <p className="text-sm text-gray-600">Persentase Realisasi</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="dokumen" className="space-y-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="h-5 w-5" />Dokumen Tagihan</CardTitle></CardHeader>
            <CardContent>
              {documents.length > 0 ? (
                <InvoiceDocumentList documents={documents} onRemove={() => {}} title="" />
              ) : (
                <div className="text-center py-8">
                  <Upload className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">Belum ada dokumen</p>
                </div>
              )}
            </CardContent>
          </Card>
          {invoice.memo_required && invoice.dokumen_memo && (
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Mail className="h-5 w-5" />Dokumen Memo</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-blue-600" />
                    <span className="font-medium">Dokumen Memo</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button variant="ghost" size="sm" onClick={() => window.open(invoice.dokumen_memo, '_blank')} className="h-8 w-8 p-0">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { const a = document.createElement('a'); a.href = invoice.dokumen_memo; a.download = 'memo'; a.click(); }} className="h-8 w-8 p-0">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InvoiceDetail;