import { CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { FileText, Calendar, Coins, CheckCircle, Clock, Plus, FileEdit, Download, ExternalLink, Mail } from 'lucide-react';
import ContractDetailInfo from "./ContractDetailInfo";
import ContractDocumentsCard from "./ContractDocumentsCard";
import { ContractAmendments } from "./ContractAmendments";
import { Kontrak } from "@/types/database";
import { useQuery } from '@tanstack/react-query';
import { SCurveManager } from "./SCurveManager";
import { DokumenUploadForm } from "./DokumenUploadForm";
import { usePermissions } from '@/hooks/usePermissions';
import { jsonToTagihanDocuments } from '@/lib/utils/databaseTypes';
import { formatFileSize } from '@/lib/utils/formatters';

interface ContractDetailContentProps {
  contract: Kontrak;
  getVendorName: () => string;
  formatCurrency: (amount: number | null | undefined) => string;
  fieldText: (text: string | number | boolean | null | undefined) => React.ReactNode;
  billingPercentage: number;
  onAddTagihan?: () => void;
}

export const ContractDetailContent = ({
  contract,
  getVendorName,
  formatCurrency,
  fieldText,
  billingPercentage,
  onAddTagihan,
}: ContractDetailContentProps) => {
  const { canCreate, isVendor } = usePermissions();

  const { data: tagihans = [], isLoading: isLoadingTagihans } = useQuery({
    queryKey: ['contractTagihans', contract.id_kontrak],
    enabled: !!contract?.id_kontrak,
    queryFn: async () => {
      const res = await fetch(`https://bekontrak-production.up.railway.app/api/tagihan/kontrak/${contract?.id_kontrak}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (!res.ok) return [];
      return await res.json() || [];
    },
  });

  const getStatusBadge = (status: string) => {
    const statusColors = {
      'Punchlist': 'bg-red-100 text-red-800 border-red-200',
      'BAST/BAPP': 'bg-orange-100 text-orange-800 border-orange-200',
      'Pengajuan': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'BAST I Vendor': 'bg-blue-100 text-blue-800 border-blue-200',
      'SA': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'PA': 'bg-purple-100 text-purple-800 border-purple-200',
      'Verification': 'bg-pink-100 text-pink-800 border-pink-200',
      'Payment/Selesai': 'bg-green-100 text-green-800 border-green-200'
    };
    return <Badge className={statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800 border-gray-200'}>{status}</Badge>;
  };

  const getProgressPercentage = (status: string) => {
    const progressMap: Record<string, number> = {
      'Punchlist': 12.5, 'BAST/BAPP': 25, 'Pengajuan': 37.5,
      'BAST I Vendor': 50, 'SA': 62.5, 'PA': 75,
      'Verification': 87.5, 'Payment/Selesai': 100
    };
    return progressMap[status] || 0;
  };

  // Jumlah tab: vendor 4 tab, lainnya 6 tab
  const tabCols = isVendor ? 'grid-cols-4' : 'grid-cols-6';

  return (
    <CardContent className="p-0">
      <Tabs defaultValue="details" className="w-full">
        <TabsList className={`grid w-full ${tabCols} bg-gray-100`}>
          <TabsTrigger value="details" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 transition-all duration-200">
            Detail Kontrak
          </TabsTrigger>

          {/* Amandemen: sembunyikan untuk vendor */}
          {!isVendor && (
            <TabsTrigger value="amandemen" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 transition-all duration-200">
              <FileEdit className="h-4 w-4 mr-1" />Amandemen
            </TabsTrigger>
          )}

          {/* S-Curve: sembunyikan untuk vendor */}
          {!isVendor && (
            <TabsTrigger value="scurve" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 transition-all duration-200">
              S-Curve
            </TabsTrigger>
          )}

          <TabsTrigger value="documents" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 transition-all duration-200">
            Dokumen
          </TabsTrigger>
          <TabsTrigger value="approval-dokumen" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 transition-all duration-200">
            Dok. Progress
          </TabsTrigger>
          <TabsTrigger value="billing" className="text-gray-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 transition-all duration-200">
            Daftar Tagihan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="animate-fade-in">
          <ContractDetailInfo
            contract={contract}
            getVendorName={getVendorName}
            formatCurrency={formatCurrency}
            fieldText={fieldText}
            billingPercentage={billingPercentage}
          />
        </TabsContent>

        {!isVendor && (
          <TabsContent value="amandemen" className="animate-fade-in">
            <div className="p-8">
              <ContractAmendments
                idKontrak={(contract as any).idKontrak || contract.id_kontrak}
                tanggalMulai={(contract as any).tanggalMulai || contract.tanggal_mulai}
                tanggalSelesai={(contract as any).tanggalSelesai || contract.tanggal_selesai}
                nilaiAwal={((contract as any).nilaiAwal || contract.nilai_awal)?.toString()}
              />
            </div>
          </TabsContent>
        )}

        {!isVendor && (
          <TabsContent value="scurve">
            <div className="p-8">
              <SCurveManager
                idKontrak={(contract as any).idKontrak || contract.id_kontrak}
                judulKontrak={(contract as any).judulKontrak || contract.judul_kontrak}
                hasAmendment={!!contract.has_amendment}
              />
            </div>
          </TabsContent>
        )}

        <TabsContent value="documents" className="animate-fade-in">
          <ContractDocumentsCard
            contractDocuments={contract.contract_documents || []}
            amendmentDocuments={contract.amendment_documents || []}
          />
        </TabsContent>

        <TabsContent value="approval-dokumen">
          <div className="p-8">
            <DokumenUploadForm
              idKontrak={(contract as any).idKontrak || contract.id_kontrak}
            />
          </div>
        </TabsContent>

        <TabsContent value="billing" className="animate-fade-in">
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                Daftar Tagihan Termin
              </h3>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">Total: {tagihans.length} tagihan</div>
                {onAddTagihan && canCreate && (
                  <Button onClick={onAddTagihan} className="bg-primary text-primary-foreground hover:bg-primary/90 transition-colors flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Tambah Tagihan
                  </Button>
                )}
              </div>
            </div>

            {isLoadingTagihans ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
              </div>
            ) : tagihans.length > 0 ? (
              <div className="space-y-4">
                {tagihans.map((tagihan, index) => (
                  <div key={tagihan.id_tagihan} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                          <span className="text-blue-600 font-semibold">{index + 1}</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">{tagihan.nomor_tagihan}</h4>
                          <p className="text-sm text-gray-500">{tagihan.termin || `Termin ${index + 1}`}</p>
                        </div>
                      </div>
                      {getStatusBadge(tagihan.status_tagihan)}
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-green-600">
                          <Coins className="h-4 w-4" />
                          <span className="text-sm font-medium">Nilai Tagihan</span>
                        </div>
                        <p className="text-xl font-bold text-green-600">{formatCurrency(tagihan.nilai_tagihan)}</p>
                        <div className="flex items-center gap-2 text-gray-500">
                          <Calendar className="h-4 w-4" />
                          <span className="text-sm">{tagihan.tanggal_tagihan ? new Date(tagihan.tanggal_tagihan).toLocaleDateString('id-ID') : '-'}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-blue-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm font-medium">Progress</span>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Status Progress</span>
                            <span className="font-medium">{getProgressPercentage(tagihan.status_tagihan)}%</span>
                          </div>
                          <Progress value={getProgressPercentage(tagihan.status_tagihan)} className="h-2" />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-gray-600">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm font-medium">Catatan</span>
                        </div>
                        <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg min-h-[60px]">
                          {tagihan.catatan || 'Tidak ada catatan'}
                        </p>
                      </div>
                    </div>
                    {(() => {
                      const rawDocs = tagihan.dokumen_tagihan ?? tagihan.dokumenTagihan;
                      const parsedDocs = typeof rawDocs === 'string'
                        ? (() => { try { return JSON.parse(rawDocs); } catch { return []; } })()
                        : rawDocs;
                      const docs = jsonToTagihanDocuments(parsedDocs);
                      const memoUrl = tagihan.dokumen_memo ?? tagihan.dokumenMemo;
                      if (docs.length === 0 && !memoUrl) return null;
                      return (
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center gap-2 text-gray-600 mb-3">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm font-medium">Dokumen Tagihan</span>
                          </div>
                          <div className="space-y-2">
                            {docs.map((doc) => (
                              <div key={doc.id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                                <div className="flex items-center gap-3 min-w-0">
                                  <FileText className="h-4 w-4 text-blue-600 shrink-0" />
                                  <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">{doc.name}</p>
                                    <p className="text-xs text-gray-500">{formatFileSize(doc.size)}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(doc.url, '_blank')}>
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { const a = document.createElement('a'); a.href = doc.url; a.download = doc.name; a.target = '_blank'; a.click(); }}>
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                            {memoUrl && (
                              <div className="flex items-center justify-between p-3 border border-blue-200 rounded-lg bg-blue-50">
                                <div className="flex items-center gap-3 min-w-0">
                                  <Mail className="h-4 w-4 text-blue-600 shrink-0" />
                                  <p className="text-sm font-medium text-gray-800">Dokumen Memo</p>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => window.open(memoUrl, '_blank')}>
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => { const a = document.createElement('a'); a.href = memoUrl; a.download = 'memo'; a.target = '_blank'; a.click(); }}>
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    {tagihan.memo_required && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <div className="flex items-center gap-2 text-yellow-700 mb-2">
                          <Clock className="h-4 w-4" />
                          <span className="text-sm font-medium">Memo Diperlukan</span>
                        </div>
                        <p className="text-sm text-yellow-600">
                          {tagihan.tanggal_pengiriman_memo
                            ? `Memo dikirim: ${new Date(tagihan.tanggal_pengiriman_memo).toLocaleDateString('id-ID')}`
                            : 'Menunggu pengiriman memo'}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FileText className="h-10 w-10 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Belum Ada Tagihan</h3>
                <p className="text-gray-500 mb-6 max-w-md mx-auto">Belum ada tagihan termin yang dibuat untuk kontrak ini.</p>
                <div className="text-sm text-gray-400">Kontrak: {contract.judul_kontrak}</div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </CardContent>
  );
};