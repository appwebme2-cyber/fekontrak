
import { DocumentSection } from './components/DocumentSection';
import { DocumentsNotice } from './components/DocumentsNotice';
import { GuidedDocumentSection, GuidedDocument } from './components/GuidedDocumentSection';
import { useEnhancedDocuments } from './hooks/useEnhancedDocuments';
import { FilePreviewModal } from '@/components/ui/file-preview-modal';
import { BulkUploadProgress } from '@/components/ui/bulk-upload-progress';

interface DocumentsFormProps {
  formData: {
    contract_documents?: any[];
    amendment_documents?: any[];
  };
  setFormData: (data: any) => void;
}

export const DocumentsForm = ({ formData, setFormData }: DocumentsFormProps) => {
  const {
    uploading,
    uploadProgress,
    handleFileUpload,
    removeDocument,
    previewDocument,
    previewFile,
    closePreview
  } = useEnhancedDocuments({
    formData,
    setFormData
  });

  const contractDocuments: GuidedDocument[] = Array.isArray(formData.contract_documents) ? formData.contract_documents : [];
  const amendmentDocuments = Array.isArray(formData.amendment_documents) ? formData.amendment_documents : [];

  return (
    <div className="space-y-6">
      {/* Bulk upload progress */}
      <BulkUploadProgress
        uploadProgress={uploadProgress}
        show={uploading || Object.keys(uploadProgress).length > 0}
      />

      {/* Dokumen Kontrak — tampilan tabel terpandu dengan type dokumen */}
      <GuidedDocumentSection
        documents={contractDocuments}
        onDocumentsChange={(docs) => setFormData({ ...formData, contract_documents: docs })}
        onPreview={previewDocument}
      />

      <DocumentSection
        title="Dokumen Amandemen"
        sectionKey="amendment_documents"
        description="Upload dokumen amandemen kontrak dan perubahan lainnya"
        documents={amendmentDocuments}
        onFileUpload={handleFileUpload}
        onRemoveDocument={(documentId) => removeDocument('amendment_documents', documentId)}
        onPreviewDocument={previewDocument}
        uploading={uploading}
      />

      <DocumentsNotice />

      {/* File preview modal */}
      <FilePreviewModal
        open={!!previewFile}
        onOpenChange={(open) => !open && closePreview()}
        file={previewFile}
      />
    </div>
  );
};
