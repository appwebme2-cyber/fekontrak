import { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, Upload, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";
const FILE_BASE = "https://bekontrak-production.up.railway.app";

export const DOC_TYPES = [
  'SP3MK',
  'Screenshot Penerimaan SPB dari PRISMA',
  'SPB',
  'Notulen Kick off Meeting (KOM)',
  'HSSE Plan',
  'JSA',
  'Dokumen Pengurusan ID Badge',
  'BA Joint Inspection',
  'BA Commissioning',
  'BA Pemeriksaan / Penerimaan Material',
  'LKP (tiap termin tagihan)',
  'BASTP',
  'BAKP / BAPP',
  'Laporan Pelaksanaan Pekerjaan',
  'Others',
];

export interface GuidedDocument {
  id: string;
  doc_type: string;
  doc_label: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
  upload_date: string;
}

interface GuidedDocumentSectionProps {
  documents: GuidedDocument[];
  onDocumentsChange: (docs: GuidedDocument[]) => void;
  onPreview?: (doc: GuidedDocument) => void;
  uploading?: boolean;
}

export const GuidedDocumentSection = ({
  documents,
  onDocumentsChange,
  onPreview,
}: GuidedDocumentSectionProps) => {
  const [docType, setDocType] = useState('');
  const [docLabel, setDocLabel] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !docType) return;

    setUploading(true);
    const token = localStorage.getItem('token');

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'contracts');

      const res = await fetch(`${API_URL}/FileUpload`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Upload gagal');

      const newDoc: GuidedDocument = {
        id: `${Date.now()}`,
        doc_type: docType,
        doc_label: docLabel.trim() || file.name,
        name: data.name,
        size: data.size,
        type: data.type,
        url: `${FILE_BASE}${data.url}`,
        path: data.path,
        upload_date: new Date().toISOString(),
      };

      onDocumentsChange([...documents, newDoc]);
      setDocType('');
      setDocLabel('');
      if (fileRef.current) fileRef.current.value = '';

      toast({ title: 'Berhasil', description: 'Dokumen berhasil diunggah' });
    } catch (err: any) {
      toast({ title: 'Upload Gagal', description: err.message, variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = async (doc: GuidedDocument) => {
    if (doc.path) {
      try {
        const token = localStorage.getItem('token');
        await fetch(`${API_URL}/FileUpload?path=${encodeURIComponent(doc.path)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch { /* ignore */ }
    }
    onDocumentsChange(documents.filter(d => d.id !== doc.id));
    toast({ title: 'Berhasil', description: 'Dokumen berhasil dihapus' });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-md flex items-center gap-2">
          Dokumen Kontrak
          <span className="text-sm font-normal text-gray-500">({documents.length} dokumen)</span>
        </CardTitle>
        <p className="text-sm text-gray-600">Upload dokumen kontrak sesuai jenis dokumen</p>
      </CardHeader>
      <CardContent className="space-y-5">

        {/* Form tambah dokumen */}
        <div className="p-4 bg-gray-50 rounded-lg border space-y-3">
          <p className="text-sm font-medium text-gray-700">Tambah Dokumen</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <Label className="text-xs mb-1 block">Type Dokumen *</Label>
              <Select value={docType} onValueChange={setDocType}>
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis dokumen" />
                </SelectTrigger>
                <SelectContent>
                  {DOC_TYPES.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs mb-1 block">Nama Dokumen</Label>
              <Input
                value={docLabel}
                onChange={e => setDocLabel(e.target.value)}
                placeholder="Misal: SPB No. 001/2024"
              />
            </div>
            <div className="flex flex-col justify-end">
              <input
                ref={fileRef}
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleUpload}
                disabled={!docType || uploading}
              />
              <Button
                type="button"
                disabled={!docType || uploading}
                onClick={() => fileRef.current?.click()}
                className="gap-2 w-full"
              >
                <Upload className="h-4 w-4" />
                {uploading ? 'Mengupload...' : 'Pilih & Upload File'}
              </Button>
              {!docType && (
                <p className="text-xs text-orange-500 mt-1">Pilih type dokumen dulu</p>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-400">Mendukung: PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)</p>
        </div>

        {/* Tabel dokumen */}
        {documents.length === 0 ? (
          <div className="text-center py-8 text-gray-400">
            <FileText className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Belum ada dokumen. Tambahkan menggunakan form di atas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-center p-3 font-medium text-gray-600 w-10">No</th>
                  <th className="text-left p-3 font-medium text-gray-600 min-w-[180px]">Type Dokumen</th>
                  <th className="text-left p-3 font-medium text-gray-600 min-w-[160px]">Nama Dokumen</th>
                  <th className="text-center p-3 font-medium text-gray-600 min-w-[120px]">Dokumen</th>
                  <th className="text-center p-3 font-medium text-gray-600 w-16">Hapus</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((doc, idx) => (
                  <tr key={doc.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 text-center text-gray-500 text-xs font-bold">{idx + 1}</td>
                    <td className="p-3">
                      <Badge variant="secondary" className="text-xs whitespace-normal text-left">
                        {doc.doc_type || '-'}
                      </Badge>
                    </td>
                    <td className="p-3 text-gray-700 text-sm">{doc.doc_label || doc.name}</td>
                    <td className="p-3 text-center">
                      {doc.url ? (
                        <div className="flex items-center justify-center gap-1">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs underline"
                          >
                            <FileText className="h-3 w-3" />
                            Buka
                          </a>
                          {onPreview && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => onPreview(doc)}
                              className="h-6 w-6 p-0 ml-1"
                              title="Preview"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemove(doc)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
