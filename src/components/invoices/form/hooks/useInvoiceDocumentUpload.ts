import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { TagihanDocument } from '@/lib/utils/typeUtils';

const API_URL = "https://bekontrak-production.up.railway.app/api";
const FILE_BASE = "https://bekontrak-production.up.railway.app";

interface UseInvoiceDocumentUploadProps {
  formData: {
    dokumen_tagihan?: TagihanDocument[];
    dokumen_memo?: string;
  };
  updateFormData: (field: string, value: any) => void;
}

export const useInvoiceDocumentUpload = ({ formData, updateFormData }: UseInvoiceDocumentUploadProps) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const { toast } = useToast();

  const uploadFile = async (file: File, folder: string): Promise<any> => {
    const token = localStorage.getItem("token");
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    formDataUpload.append('folder', folder);

    const res = await fetch(`${API_URL}/FileUpload`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formDataUpload
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Upload gagal');
    return data;
  };

  const handleDocumentUpload = async (files: FileList | null, documentType: 'dokumen_tagihan' | 'dokumen_memo') => {
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const folder = documentType === 'dokumen_memo' ? 'tagihan-memo' : 'tagihan-documents';
      const results = [];

      for (const file of Array.from(files)) {
        const data = await uploadFile(file, folder);
        results.push({
          name: data.name,
          url: `${FILE_BASE}${data.url}`,
          path: data.path,
          type: data.type,
          size: data.size,
        });
      }

      if (results.length > 0) {
        if (documentType === 'dokumen_tagihan') {
          const existing = Array.isArray(formData.dokumen_tagihan) ? formData.dokumen_tagihan : [];
          const newDocs: TagihanDocument[] = results.map((r, i) => ({
            id: `doc_${Date.now()}_${i}`,
            name: r.name,
            url: r.url,
            type: r.type || r.name?.split('.').pop() || 'unknown',
            size: r.size || 0,
            upload_date: new Date().toISOString()
          }));
          updateFormData('dokumen_tagihan', [...existing, ...newDocs]);
        } else {
          updateFormData('dokumen_memo', results[0].url);
        }

        toast({ title: "Upload Berhasil", description: `${results.length} dokumen berhasil diunggah` });
      }
    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: `Gagal mengunggah: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = async (documentId: string, documentType: 'dokumen_tagihan' | 'dokumen_memo') => {
    try {
      const token = localStorage.getItem("token");

      if (documentType === 'dokumen_tagihan') {
        const documents = Array.isArray(formData.dokumen_tagihan) ? formData.dokumen_tagihan : [];
        const doc = documents.find(d => d.id === documentId);

        if (doc) {
          try {
            await fetch(`${API_URL}/FileUpload?path=${encodeURIComponent(doc.url)}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch {}

          updateFormData('dokumen_tagihan', documents.filter(d => d.id !== documentId));
          toast({ title: "Berhasil", description: "Dokumen berhasil dihapus" });
        }
      } else {
        if (formData.dokumen_memo) {
          try {
            await fetch(`${API_URL}/FileUpload?path=${encodeURIComponent(formData.dokumen_memo)}`, {
              method: 'DELETE',
              headers: { Authorization: `Bearer ${token}` }
            });
          } catch {}
        }
        updateFormData('dokumen_memo', '');
        toast({ title: "Berhasil", description: "Memo berhasil dihapus" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: `Gagal menghapus: ${error.message}`, variant: "destructive" });
    }
  };

  return { uploading, handleDocumentUpload, removeDocument };
};