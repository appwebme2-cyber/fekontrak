
import { DocumentsHeader } from './components/DocumentsHeader';
import { DocumentSection } from './components/DocumentSection';
import { DocumentsNotice } from './components/DocumentsNotice';
import { DocumentsDebugInfo } from './components/DocumentsDebugInfo';
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
  console.log('🔧 DocumentsForm rendered with formData:', {
    contract_documents: formData.contract_documents?.length || 0,
    amendment_documents: formData.amendment_documents?.length || 0
  });

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

  const contractDocuments = Array.isArray(formData.contract_documents) ? formData.contract_documents : [];
  const amendmentDocuments = Array.isArray(formData.amendment_documents) ? formData.amendment_documents : [];

  return (
    <div className="space-y-6">
      <DocumentsHeader uploading={uploading} />
      
      {/* Bulk upload progress */}
      <BulkUploadProgress 
        uploadProgress={uploadProgress} 
        show={uploading || Object.keys(uploadProgress).length > 0} 
      />
      
      <DocumentSection
        title="Dokumen Kontrak"
        sectionKey="contract_documents"
        description="Upload dokumen kontrak utama, addendum, dan dokumen terkait lainnya"
        documents={contractDocuments}
        onFileUpload={handleFileUpload}
        onRemoveDocument={(documentId) => removeDocument('contract_documents', documentId)}
        onPreviewDocument={previewDocument}
        uploading={uploading}
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
      
      <DocumentsDebugInfo
        contractDocsCount={contractDocuments.length}
        amendmentDocsCount={amendmentDocuments.length}
        uploading={uploading}
      />

      {/* File preview modal */}
      <FilePreviewModal
        open={!!previewFile}
        onOpenChange={(open) => !open && closePreview()}
        file={previewFile}
      />
    </div>
  );
};
