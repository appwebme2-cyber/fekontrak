import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";
const FILE_BASE = "https://bekontrak-production.up.railway.app";

interface DocumentItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  path: string;
  upload_date: string;
}

interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

interface UseEnhancedDocumentsProps {
  formData: {
    contract_documents?: DocumentItem[];
    amendment_documents?: DocumentItem[];
  };
  setFormData: (data: any) => void;
}

export const useEnhancedDocuments = ({ formData, setFormData }: UseEnhancedDocumentsProps) => {
  const [previewFile, setPreviewFile] = useState<DocumentItem | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const { toast } = useToast();

  const handleFileUpload = async (
    files: FileList | null,
    section: 'contract_documents' | 'amendment_documents'
  ) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const token = localStorage.getItem("token");
    const folder = section === 'contract_documents' ? 'contracts' : 'amendments';
    const newDocuments: DocumentItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const fileId = `${Date.now()}-${i}`;

      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { fileId, fileName: file.name, progress: 0, status: 'uploading' }
      }));

      try {
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

        newDocuments.push({
          id: fileId,
          name: data.name,
          size: data.size,
          type: data.type,
          url: `${FILE_BASE}${data.url}`,
          path: data.path,
          upload_date: new Date().toISOString()
        });

        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { fileId, fileName: file.name, progress: 100, status: 'completed', url: data.url }
        }));

      } catch (error: any) {
        setUploadProgress(prev => ({
          ...prev,
          [fileId]: { fileId, fileName: file.name, progress: 0, status: 'error', error: error.message }
        }));
        toast({
          title: "Upload Error",
          description: `Gagal mengunggah ${file.name}: ${error.message}`,
          variant: "destructive",
        });
      }
    }

    if (newDocuments.length > 0) {
      const existing = Array.isArray(formData[section]) ? formData[section] : [];
      setFormData({ ...formData, [section]: [...existing, ...newDocuments] });
      toast({
        title: "Upload Berhasil",
        description: `${newDocuments.length} dokumen berhasil diunggah`,
      });
    }

    setUploading(false);
    setTimeout(() => setUploadProgress({}), 3000);
  };

  const removeDocument = async (
    section: 'contract_documents' | 'amendment_documents',
    documentId: string
  ) => {
    const documents = Array.isArray(formData[section]) ? formData[section] : [];
    const doc = documents.find((d: DocumentItem) => d.id === documentId);

    if (doc?.path) {
      try {
        const token = localStorage.getItem("token");
        await fetch(`${API_URL}/FileUpload?path=${encodeURIComponent(doc.path)}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error('Error deleting file:', error);
      }
    }

    setFormData({
      ...formData,
      [section]: documents.filter((d: DocumentItem) => d.id !== documentId)
    });

    toast({ title: "Berhasil", description: "Dokumen berhasil dihapus" });
  };

  const previewDocument = (document: DocumentItem) => setPreviewFile(document);
  const closePreview = () => setPreviewFile(null);

  return {
    uploading,
    uploadProgress,
    handleFileUpload,
    removeDocument,
    previewDocument,
    previewFile,
    closePreview
  };
};