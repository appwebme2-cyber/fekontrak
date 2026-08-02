import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PadiDocument } from '@/lib/utils/typeUtils';

const API_URL = "https://bekontrak-production.up.railway.app/api";
const FILE_BASE = "https://bekontrak-production.up.railway.app";

interface UsePadiDocumentUploadProps {
  formData: {
    dokumen_pendukung?: PadiDocument[];
  };
  updateFormData: (field: string, value: any) => void;
}

export const usePadiDocumentUpload = ({ formData, updateFormData }: UsePadiDocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<PadiDocument | null>(null);
  const { toast } = useToast();

  const handleDocumentUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const token = localStorage.getItem("token");
      const newDocuments: PadiDocument[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formDataUpload = new FormData();
        formDataUpload.append('file', file);
        formDataUpload.append('folder', 'padi-documents');

        const res = await fetch(`${API_URL}/FileUpload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formDataUpload
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload gagal');

        newDocuments.push({
          id: `${Date.now()}-${i}`,
          name: data.name,
          url: `${FILE_BASE}${data.url}`,
          type: data.type,
          size: data.size,
          upload_date: new Date().toISOString()
        });
      }

      const current = formData.dokumen_pendukung || [];
      updateFormData('dokumen_pendukung', [...current, ...newDocuments]);

      toast({ title: "Upload Berhasil", description: `${newDocuments.length} dokumen berhasil diunggah` });

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

  const removeDocument = async (documentId: string) => {
    const current = formData.dokumen_pendukung || [];
    const doc = current.find(d => d.id === documentId);

    if (doc) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`${API_URL}/FileUpload?path=${encodeURIComponent(doc.url)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Error deleting file:', error);
      }

      updateFormData('dokumen_pendukung', current.filter(d => d.id !== documentId));
      toast({ title: "Berhasil", description: "Dokumen berhasil dihapus" });
    }
  };

  const previewDoc = (document: PadiDocument) => setPreviewDocument(document);
  const closePreview = () => setPreviewDocument(null);

  return { uploading, handleDocumentUpload, removeDocument, previewDocument, previewDoc, closePreview };
};