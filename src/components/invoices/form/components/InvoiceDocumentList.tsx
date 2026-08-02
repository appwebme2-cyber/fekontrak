import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FilePreviewModal } from '@/components/ui/file-preview-modal';
import { TagihanDocument } from '@/lib/utils/typeUtils';
import { formatFileSize, getFileIcon } from '@/components/contracts/forms/utils/documentUtils';
import { Eye, Trash2, Download, ExternalLink } from 'lucide-react';

interface InvoiceDocumentListProps {
  documents: TagihanDocument[];
  onRemove: (documentId: string) => void;
  title: string;
}

export const InvoiceDocumentList = ({ documents, onRemove, title }: InvoiceDocumentListProps) => {
  const [previewDocument, setPreviewDocument] = useState<TagihanDocument | null>(null);

  if (!documents || documents.length === 0) {
    return null;
  }

  const handlePreview = (document: TagihanDocument) => {
    setPreviewDocument(document);
  };

  const handleDownload = (doc: TagihanDocument) => {
    const link = window.document.createElement('a');
    link.href = doc.url;
    link.download = doc.name;
    link.target = '_blank';
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
  };

  const handleOpenInNewTab = (doc: TagihanDocument) => {
    window.open(doc.url, '_blank');
  };

  return (
    <>
      <div className="space-y-3">
        <h4 className="font-medium text-sm text-foreground">{title}</h4>
        <div className="space-y-2">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center justify-between p-3 border border-border rounded-lg bg-card hover:bg-accent/50 transition-colors"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <span className="text-lg" role="img" aria-label="file">
                  {getFileIcon(doc.type || '')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {doc.name || 'Unknown File'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(doc.size || 0)} • {new Date(doc.upload_date || new Date()).toLocaleDateString('id-ID')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePreview(doc)}
                  className="h-8 w-8 p-0"
                  title="Preview dokumen"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleOpenInNewTab(doc)}
                  className="h-8 w-8 p-0"
                  title="Buka di tab baru"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(doc)}
                  className="h-8 w-8 p-0"
                  title="Download dokumen"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(doc.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                  title="Hapus dokumen"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {previewDocument && (
        <FilePreviewModal
          open={!!previewDocument}
          onOpenChange={(open) => !open && setPreviewDocument(null)}
          file={{
            id: previewDocument.id,
            name: previewDocument.name,
            url: previewDocument.url,
            type: previewDocument.type,
            size: previewDocument.size,
            upload_date: previewDocument.upload_date
          }}
        />
      )}
    </>
  );
};