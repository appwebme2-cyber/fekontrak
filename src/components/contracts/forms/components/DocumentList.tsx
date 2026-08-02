
import { Label } from '@/components/ui/label';
import { AlertCircle } from 'lucide-react';
import { DocumentItem } from './DocumentItem';

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  upload_date: string;
}

interface DocumentListProps {
  documents: Document[];
  onRemoveDocument: (documentId: string) => void;
  onPreviewDocument?: (document: Document) => void;
  disabled?: boolean;
}

export const DocumentList = ({ documents, onRemoveDocument, onPreviewDocument, disabled = false }: DocumentListProps) => {
  if (documents.length === 0) {
    return (
      <div className="text-center py-4">
        <AlertCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
        <p className="text-sm text-gray-500">Belum ada dokumen yang ditambahkan</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Dokumen yang ditambahkan:</Label>
      <div className="max-h-60 overflow-y-auto space-y-2">
        {documents.map((doc) => (
          <DocumentItem
            key={doc.id}
            document={doc}
            onRemove={onRemoveDocument}
            onPreview={onPreviewDocument}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};
