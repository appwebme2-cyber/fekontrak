import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Eye, X, Image as ImageIcon } from 'lucide-react';
import { formatFileSize } from '@/lib/utils/formatters';

interface FilePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  file: {
    id: string;
    name: string;
    size: number;
    type: string;
    url: string;
    upload_date: string;
  } | null;
}

export const FilePreviewModal = ({ open, onOpenChange, file }: FilePreviewModalProps) => {
  const [imageError, setImageError] = useState(false);

  if (!file) return null;

  const isImage = file.type.startsWith('image/');
  const isPDF = file.type === 'application/pdf';
  const isDocument = file.type.includes('word') || file.type.includes('document');

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = file.url;
    link.download = file.name;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderPreview = () => {
    if (isImage && !imageError) {
      return (
        <div className="flex justify-center items-center bg-muted/10 rounded-lg p-4">
          <img
            src={file.url}
            alt={file.name}
            className="max-w-full max-h-96 object-contain rounded-lg shadow-sm"
            onError={() => setImageError(true)}
          />
        </div>
      );
    }

    if (isPDF) {
      return (
        <div className="bg-muted/10 rounded-lg p-8 text-center space-y-4">
          <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
          <div>
            <p className="text-sm text-muted-foreground mb-2">PDF Document</p>
            <Button 
              variant="outline" 
              onClick={() => window.open(file.url, '_blank')}
              className="gap-2"
            >
              <Eye className="h-4 w-4" />
              Buka di Tab Baru
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-muted/10 rounded-lg p-8 text-center space-y-4">
        {isDocument ? (
          <FileText className="h-16 w-16 text-muted-foreground mx-auto" />
        ) : (
          <ImageIcon className="h-16 w-16 text-muted-foreground mx-auto" />
        )}
        <div>
          <p className="text-sm text-muted-foreground mb-2">
            {isDocument ? 'Dokumen' : 'File'} - Preview tidak tersedia
          </p>
          <p className="text-xs text-muted-foreground">
            Gunakan tombol download untuk membuka file
          </p>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="space-y-1 flex-1 mr-4">
              <DialogTitle className="text-lg font-semibold truncate">
                {file.name}
              </DialogTitle>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {file.type.split('/')[1]?.toUpperCase() || 'FILE'}
                </Badge>
                <span>{formatFileSize(file.size)}</span>
                <span>•</span>
                <span>{new Date(file.upload_date).toLocaleDateString('id-ID')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <DialogClose asChild>
                <Button variant="ghost" size="sm">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
          </div>
        </DialogHeader>
        
        <div className="flex-1 overflow-auto">
          {renderPreview()}
        </div>
      </DialogContent>
    </Dialog>
  );
};