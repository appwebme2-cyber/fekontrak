import React, { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';

interface PadiDocumentUploadAreaProps {
  title: string;
  onFileSelect: (files: FileList | null) => void;
  uploading: boolean;
  multiple?: boolean;
  accept?: string;
}

export const PadiDocumentUploadArea: React.FC<PadiDocumentUploadAreaProps> = ({
  title,
  onFileSelect,
  uploading,
  multiple = true,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
    // Reset the input value so the same file can be selected again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    onFileSelect(files);
  };

  return (
    <Label className="cursor-pointer">
      <div
        className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={uploading}
        >
          {uploading ? 'Mengunggah...' : title}
        </Button>
        <p className="text-sm text-muted-foreground mt-2">
          Atau drag & drop file di sini
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Format: PDF, DOC, DOCX, JPG, PNG (Maks. 10MB)
        </p>
      </div>
      <Input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={handleFileChange}
        multiple={multiple}
        accept={accept}
      />
    </Label>
  );
};