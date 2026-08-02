import React from 'react';
import { PadiDocumentUploadArea } from './PadiDocumentUploadArea';
import { PadiDocumentList } from './PadiDocumentList';
import { usePadiDocumentUpload } from './hooks/usePadiDocumentUpload';
import { FilePreviewModal } from '@/components/ui/file-preview-modal';
import { PadiDocument } from '@/lib/utils/typeUtils';

interface DocumentUploadProps {
  formData: {
    dokumen_pendukung?: PadiDocument[];
  };
  updateFormData: (field: string, value: any) => void;
}

export const DocumentUpload: React.FC<DocumentUploadProps> = ({ formData, updateFormData }) => {
  const {
    uploading,
    handleDocumentUpload,
    removeDocument,
    previewDocument,
    previewDoc,
    closePreview
  } = usePadiDocumentUpload({ formData, updateFormData });

  return (
    <div className="space-y-4">
      <PadiDocumentUploadArea
        title="Pilih Dokumen Pendukung"
        onFileSelect={handleDocumentUpload}
        uploading={uploading}
      />
      
      <PadiDocumentList
        documents={formData.dokumen_pendukung || []}
        onRemove={removeDocument}
        onPreview={previewDoc}
      />

      {previewDocument && (
        <FilePreviewModal
          file={previewDocument}
          open={!!previewDocument}
          onOpenChange={(open) => !open && closePreview()}
        />
      )}
    </div>
  );
};