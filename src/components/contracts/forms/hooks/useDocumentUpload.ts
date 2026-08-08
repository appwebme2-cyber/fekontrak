import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { validateFile } from '../utils/documentUtils';

const API_URL  = "https://bekontrak-production.up.railway.app/api";
const FILE_BASE = "https://bekontrak-production.up.railway.app";

interface DocumentItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  upload_date: string;
}

interface UseDocumentUploadProps {
  formData: {
    contract_documents?: any[];
    amendment_documents?: any[];
  };
  setFormData: (data: any) => void;
}

export const useDocumentUpload = ({ formData, setFormData }: UseDocumentUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (files: FileList | null, section: 'contract_documents' | 'amendment_documents') => {
    if (!files || files.length === 0) return;

    setUploading(true);

    try {
      const token    = localStorage.getItem("token");
      const folder   = section === 'contract_documents' ? 'contract-documents' : 'amendment-documents';
      const newDocs: DocumentItem[] = [];

      for (const file of Array.from(files)) {
        const validation = validateFile(file);
        if (!validation.isValid) {
          toast({ title: "File tidak valid", description: validation.error, variant: "destructive" });
          continue;
        }

        const body = new FormData();
        body.append('file', file);
        body.append('folder', folder);

        const res  = await fetch(`${API_URL}/FileUpload`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body,
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Upload gagal');

        newDocs.push({
          id:          `doc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          name:        data.name,
          size:        data.size,
          type:        data.type,
          url:         `${FILE_BASE}${data.url}`,
          upload_date: new Date().toISOString(),
        });
      }

      if (newDocs.length > 0) {
        const existing = Array.isArray(formData[section]) ? formData[section] : [];
        setFormData({ ...formData, [section]: [...existing, ...newDocs] });
        toast({ title: "Berhasil", description: `${newDocs.length} dokumen berhasil diunggah` });
      }
    } catch (error: any) {
      toast({ title: "Upload Error", description: error.message || "Gagal mengunggah dokumen", variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const removeDocument = (section: 'contract_documents' | 'amendment_documents', documentId: string) => {
    const documents = Array.isArray(formData[section]) ? formData[section] : [];
    setFormData({ ...formData, [section]: documents.filter((doc: DocumentItem) => doc.id !== documentId) });
    toast({ title: "Berhasil", description: "Dokumen berhasil dihapus" });
  };

  return { uploading, handleFileUpload, removeDocument };
};
