
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { FileText, Calendar, Upload, CheckCircle, Clock } from 'lucide-react';

interface InvoiceFormTabsProps {
  formData: any;
  setFormData: (data: any) => void;
  contracts: any[];
}

export const InvoiceFormTabs = ({ formData, setFormData, contracts }: InvoiceFormTabsProps) => {
  const statusOptions = [
    'Punchlist',
    'BAST/BAPP',
    'Pengajuan',
    'BAST I Vendor',
    'SA',
    'PA',
    'Verification',
    'Payment/Selesai'
  ];

  const getStatusProgress = (status: string) => {
    const statusIndex = statusOptions.indexOf(status);
    return statusIndex >= 0 ? ((statusIndex + 1) / statusOptions.length) * 100 : 0;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'Punchlist': 'bg-red-100 text-red-800',
      'BAST/BAPP': 'bg-orange-100 text-orange-800',
      'Pengajuan': 'bg-yellow-100 text-yellow-800',
      'BAST I Vendor': 'bg-blue-100 text-blue-800',
      'SA': 'bg-indigo-100 text-indigo-800',
      'PA': 'bg-purple-100 text-purple-800',
      'Verification': 'bg-pink-100 text-pink-800',
      'Payment/Selesai': 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>, type: 'memo' | 'dokumen') => {
    const file = event.target.files?.[0];
    if (file) {
      // Simulate file upload - in real app, upload to storage
      const fileUrl = URL.createObjectURL(file);
      if (type === 'memo') {
        setFormData({ ...formData, dokumen_memo: fileUrl });
      } else {
        const currentDocs = formData.dokumen_tagihan || [];
        setFormData({ 
          ...formData, 
          dokumen_tagihan: [...currentDocs, { name: file.name, url: fileUrl }] 
        });
      }
    }
  };

  return (
    <Tabs defaultValue="basic" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="basic">Informasi Dasar</TabsTrigger>
        <TabsTrigger value="memo">Memo</TabsTrigger>
        <TabsTrigger value="dokumen">Dokumen Tagihan</TabsTrigger>
      </TabsList>

      <TabsContent value="basic" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Informasi Tagihan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomor_tagihan">Nomor Tagihan *</Label>
                <Input
                  id="nomor_tagihan"
                  value={formData.nomor_tagihan || ''}
                  onChange={(e) => setFormData({ ...formData, nomor_tagihan: e.target.value })}
                  placeholder="Masukkan nomor tagihan"
                  required
                />
              </div>

              <div>
                <Label htmlFor="tanggal_tagihan">Tanggal Tagihan *</Label>
                <Input
                  id="tanggal_tagihan"
                  type="date"
                  value={formData.tanggal_tagihan || ''}
                  onChange={(e) => setFormData({ ...formData, tanggal_tagihan: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label htmlFor="tipe_kontrak">Tipe Kontrak *</Label>
                <Select
                  value={formData.tipe_kontrak || ''}
                  onValueChange={(value) => setFormData({ ...formData, tipe_kontrak: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe kontrak" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lumpsum">Lumpsum</SelectItem>
                    <SelectItem value="Unit Price">Unit Price</SelectItem>
                    <SelectItem value="TSA">TSA</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="id_kontrak">Kontrak *</Label>
                <Select
                  value={formData.id_kontrak || ''}
                  onValueChange={(value) => setFormData({ ...formData, id_kontrak: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih kontrak" />
                  </SelectTrigger>
                  <SelectContent>
                    {contracts.map((contract) => (
                      <SelectItem key={contract.id_kontrak} value={contract.id_kontrak}>
                        {contract.judul_kontrak}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="termin">Termin</Label>
                <Input
                  id="termin"
                  value={formData.termin || ''}
                  onChange={(e) => setFormData({ ...formData, termin: e.target.value })}
                  placeholder="Termin 1, Termin 2, dll"
                />
              </div>

              <div>
                <Label htmlFor="nilai_tagihan">Nilai Tagihan (IDR) *</Label>
                <Input
                  id="nilai_tagihan"
                  type="number"
                  value={formData.nilai_tagihan || ''}
                  onChange={(e) => setFormData({ ...formData, nilai_tagihan: Number(e.target.value) })}
                  placeholder="0"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status_tagihan">Status Tagihan *</Label>
              <Select
                value={formData.status_tagihan || 'Punchlist'}
                onValueChange={(value) => setFormData({ ...formData, status_tagihan: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((status) => (
                    <SelectItem key={status} value={status}>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(status)}>
                          {status}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {formData.status_tagihan && (
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress Status</span>
                    <span>{Math.round(getStatusProgress(formData.status_tagihan))}%</span>
                  </div>
                  <Progress value={getStatusProgress(formData.status_tagihan)} className="h-2" />
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="catatan">Catatan</Label>
              <Textarea
                id="catatan"
                value={formData.catatan || ''}
                onChange={(e) => setFormData({ ...formData, catatan: e.target.value })}
                placeholder="Masukkan catatan tambahan..."
                rows={4}
              />
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="memo" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Pengaturan Memo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="memo_required" className="text-base font-medium">
                  Memo Diperlukan
                </Label>
                <p className="text-sm text-gray-500">
                  Aktifkan jika tagihan ini memerlukan memo pengiriman
                </p>
              </div>
              <Switch
                id="memo_required"
                checked={formData.memo_required || false}
                onCheckedChange={(checked) => setFormData({ ...formData, memo_required: checked })}
              />
            </div>

            {formData.memo_required && (
              <div className="space-y-4 p-4 border rounded-lg bg-blue-50">
                <div>
                  <Label htmlFor="tanggal_pengiriman_memo">Tanggal Pengiriman Memo</Label>
                  <Input
                    id="tanggal_pengiriman_memo"
                    type="date"
                    value={formData.tanggal_pengiriman_memo || ''}
                    onChange={(e) => setFormData({ ...formData, tanggal_pengiriman_memo: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="dokumen_memo">Upload Memo</Label>
                  <div className="mt-2">
                    <Input
                      id="dokumen_memo"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => handleFileUpload(e, 'memo')}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                  </div>
                  {formData.dokumen_memo && (
                    <div className="mt-2 p-2 bg-green-50 rounded flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">Memo berhasil diunggah</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="dokumen" className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Dokumen Tagihan
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dokumen_tagihan">Upload Dokumen Tagihan</Label>
              <p className="text-sm text-gray-500 mb-2">
                Upload semua dokumen yang diperlukan untuk tagihan ini
              </p>
              <Input
                id="dokumen_tagihan"
                type="file"
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={(e) => handleFileUpload(e, 'dokumen')}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            {formData.dokumen_tagihan && formData.dokumen_tagihan.length > 0 && (
              <div className="space-y-2">
                <Label>Dokumen yang Diunggah:</Label>
                <div className="space-y-2">
                  {formData.dokumen_tagihan.map((doc: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <span className="text-sm">{doc.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const newDocs = formData.dokumen_tagihan.filter((_: any, i: number) => i !== index);
                          setFormData({ ...formData, dokumen_tagihan: newDocs });
                        }}
                        className="ml-auto text-red-600 hover:text-red-800"
                      >
                        Hapus
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
