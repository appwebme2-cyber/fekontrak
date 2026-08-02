import React, { useRef } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Upload, File } from 'lucide-react';

interface InvoiceDocumentUploadAreaProps {
  title: string;
  onFileSelect: (files: FileList | null) => void;
  uploading: boolean;
  multiple?: boolean;
  accept?: string;
}

export const InvoiceDocumentUploadArea = ({
  title,
  onFileSelect,
  uploading,
  multiple = false,
  accept = ".pdf,.doc,.docx,.jpg,.jpeg,.png"
}: InvoiceDocumentUploadAreaProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFileSelect(e.target.files);
    // Reset input to allow selecting same file again
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files) {
      onFileSelect(files);
    }
  };

  return (
    <div className="space-y-2">
      <Label>{title}</Label>
      <div
        className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
          multiple={multiple}
          accept={accept}
          disabled={uploading}
        />
        
        <div className="flex flex-col items-center space-y-3">
          {uploading ? (
            <>
              <File className="h-8 w-8 text-muted-foreground animate-pulse" />
              <div className="text-sm text-muted-foreground">
                Mengunggah dokumen...
              </div>
            </>
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div className="text-sm text-muted-foreground">
                Klik untuk memilih file atau drag & drop di sini
              </div>
              <div className="text-xs text-muted-foreground">
                Format: PDF, DOC, DOCX, JPG, PNG (Max 10MB)
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};