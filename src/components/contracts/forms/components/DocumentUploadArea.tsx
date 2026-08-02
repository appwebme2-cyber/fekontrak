
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload } from 'lucide-react';

interface DocumentUploadAreaProps {
  sectionKey: string;
  onFileUpload: (files: FileList | null, section: string) => void;
  uploading: boolean;
}

export const DocumentUploadArea = ({ sectionKey, onFileUpload, uploading }: DocumentUploadAreaProps) => {
  return (
    <div className="border-2 border-dashed rounded-lg p-6 text-center transition-colors border-gray-300 hover:border-gray-400">
      <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
      <p className="text-sm text-gray-600 mb-2">
        Drag & drop files here atau klik untuk pilih
      </p>
      <Label htmlFor={`file-${sectionKey}`}>
        <Button 
          type="button"
          variant="outline" 
          className="cursor-pointer" 
          disabled={uploading}
          onClick={(e) => {
            console.log('🎯 Button clicked for section:', sectionKey);
            e.preventDefault();
            e.stopPropagation();
            const fileInput = document.getElementById(`file-${sectionKey}`) as HTMLInputElement;
            if (fileInput) {
              console.log('📂 Triggering file input click');
              fileInput.click();
            } else {
              console.error('❌ File input not found:', `file-${sectionKey}`);
            }
          }}
        >
          {uploading ? 'Mengunggah...' : 'Pilih File'}
        </Button>
      </Label>
      <Input
        id={`file-${sectionKey}`}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => {
          console.log(`🎯 File input changed for section ${sectionKey}:`, {
            filesCount: e.target.files?.length || 0
          });
          onFileUpload(e.target.files, sectionKey);
        }}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        disabled={uploading}
      />
      <p className="text-xs text-gray-500 mt-2">
        Mendukung: PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)
      </p>
    </div>
  );
};
