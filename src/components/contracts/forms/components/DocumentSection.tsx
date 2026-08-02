import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DocumentUploadArea } from './DocumentUploadArea';
import { DocumentList } from './DocumentList';

interface Document {
  id: string;
  name: string;
  size: number;
  type: string;
  upload_date: string;
  url?: string;
}

interface DocumentSectionProps {
  title: string;
  sectionKey: string;
  description: string;
  documents: Document[];
  onFileUpload: (files: FileList | null, section: string) => void;
  onRemoveDocument: (documentId: string) => void;
  onPreviewDocument?: (document: Document) => void;
  uploading: boolean;
}

export const DocumentSection = ({ 
  title, 
  sectionKey, 
  description, 
  documents, 
  onFileUpload, 
  onRemoveDocument, 
  onPreviewDocument,
  uploading 
}: DocumentSectionProps) => {
  console.log(`📊 Rendering section ${sectionKey}:`, {
    title,
    documentsCount: documents.length,
    documents: documents.map(doc => ({ id: doc.id, name: doc.name }))
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-md flex items-center gap-2">
          {title}
          <span className="text-sm text-gray-500">
            ({documents.length} dokumen)
          </span>
        </CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <DocumentUploadArea
          sectionKey={sectionKey}
          onFileUpload={onFileUpload}
          uploading={uploading}
        />

      <DocumentList
        documents={documents}
        onRemoveDocument={onRemoveDocument}
        onPreviewDocument={onPreviewDocument}
        disabled={uploading}
      />
      </CardContent>
    </Card>
  );
};