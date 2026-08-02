import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Trash2, FileText } from 'lucide-react';
import { PadiDocument } from '@/lib/utils/typeUtils';

interface PadiDocumentListProps {
  documents: PadiDocument[];
  onRemove: (documentId: string) => void;
  onPreview: (document: PadiDocument) => void;
}

export const PadiDocumentList: React.FC<PadiDocumentListProps> = ({
  documents,
  onRemove,
  onPreview
}) => {
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (documents.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        Belum ada dokumen yang diunggah
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((document) => (
        <Card key={document.id} className="p-3">
          <CardContent className="p-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{document.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(document.size)}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-2 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onPreview(document)}
                >
                  <Eye className="h-3 w-3" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRemove(document.id)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};