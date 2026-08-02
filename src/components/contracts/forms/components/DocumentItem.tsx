
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye } from 'lucide-react';
import { formatFileSize, getFileIcon } from '../utils/documentUtils';

interface DocumentItemProps {
  document: {
    id: string;
    name: string;
    size: number;
    type: string;
    upload_date: string;
    url?: string;
  };
  onRemove: (documentId: string) => void;
  onPreview?: (document: any) => void;
  disabled?: boolean;
}

export const DocumentItem = ({ document, onRemove, onPreview, disabled = false }: DocumentItemProps) => {
  return (
    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
      <div className="flex items-center space-x-3 flex-1">
        <span className="text-lg">{getFileIcon(document.type)}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-sm font-medium truncate">{document.name}</p>
            <Badge variant="secondary" className="text-xs">
              {document.type.split('/')[1]?.toUpperCase() || 'FILE'}
            </Badge>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{formatFileSize(document.size)}</span>
            <span>• {new Date(document.upload_date).toLocaleDateString('id-ID')}</span>
            {document.url && <span className="text-green-600">• Tersimpan</span>}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {onPreview && document.url && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onPreview(document)}
            disabled={disabled}
            className="h-7 w-7 p-0"
            title="Preview file"
          >
            <Eye className="h-3 w-3" />
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onRemove(document.id)}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7 w-7 p-0"
          disabled={disabled}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
