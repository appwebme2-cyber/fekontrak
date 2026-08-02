
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Upload, File, X, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ContractDocumentsProps {
  formData: {
    contract_documents: string[];
  };
  setFormData: (data: any) => void;
}

export const ContractDocuments = ({ formData, setFormData }: ContractDocumentsProps) => {
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    console.log('📤 Starting file upload, files count:', files.length);
    setUploading(true);
    const uploadedFiles: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        console.log('📤 Processing file:', file.name, 'size:', file.size);
        
        // Validate file size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
          console.warn('❌ File too large:', file.name);
          toast({
            title: "File terlalu besar",
            description: `File ${file.name} melebihi batas 10MB`,
            variant: "destructive",
          });
          continue;
        }

        // Validate file type
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'image/jpeg',
          'image/png',
          'image/jpg'
        ];
        
        if (!allowedTypes.includes(file.type)) {
          console.warn('❌ Invalid file type:', file.type);
          toast({
            title: "Format file tidak didukung",
            description: `File ${file.name} memiliki format yang tidak didukung`,
            variant: "destructive",
          });
          continue;
        }

        const fileName = `${Date.now()}-${file.name}`;
        const filePath = `contracts/${fileName}`;

        console.log('📤 Uploading file:', file.name, 'to path:', filePath);

        // Try to create bucket if it doesn't exist
        try {
          const { data: buckets, error: listError } = await supabase.storage.listBuckets();
          console.log('📦 Available buckets:', buckets?.map(b => b.name));
          
          const bucketExists = buckets?.some(bucket => bucket.name === 'contract-documents');
          
          if (!bucketExists) {
            console.log('📦 Creating contract-documents bucket...');
            const { error: createError } = await supabase.storage.createBucket('contract-documents', {
              public: true,
              allowedMimeTypes: allowedTypes,
              fileSizeLimit: 10485760 // 10MB
            });
            
            if (createError) {
              console.error('❌ Error creating bucket:', createError);
              throw new Error(`Gagal membuat bucket: ${createError.message}`);
            }
            console.log('✅ Bucket created successfully');
          }
        } catch (bucketError) {
          console.error('❌ Bucket error:', bucketError);
          // Continue with upload even if bucket check fails
        }

        const { data, error: uploadError } = await supabase.storage
          .from('contract-documents')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
          console.error('❌ Upload error:', uploadError);
          toast({
            title: "Error",
            description: `Gagal upload file ${file.name}: ${uploadError.message}`,
            variant: "destructive",
          });
          continue;
        }

        console.log('✅ File uploaded successfully:', data);
        uploadedFiles.push(filePath);
      }

      if (uploadedFiles.length > 0) {
        console.log('✅ All files uploaded:', uploadedFiles);
        setFormData({
          ...formData,
          contract_documents: [...(formData.contract_documents || []), ...uploadedFiles]
        });

        toast({
          title: "Berhasil",
          description: `${uploadedFiles.length} file berhasil diupload`,
        });
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat upload file",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      // Reset input
      event.target.value = '';
    }
  };

  const handleRemoveFile = async (filePath: string) => {
    try {
      console.log('🗑️ Removing file:', filePath);
      
      // Remove from storage only if it was uploaded
      if (filePath.startsWith('contracts/')) {
        const { error } = await supabase.storage
          .from('contract-documents')
          .remove([filePath]);

        if (error) {
          console.error('❌ Delete error:', error);
          // Don't show error toast for delete, just log it
          console.warn('Could not delete file from storage, but removing from form');
        }
      }

      // Remove from form data
      const updatedDocuments = (formData.contract_documents || []).filter(doc => doc !== filePath);
      setFormData({
        ...formData,
        contract_documents: updatedDocuments
      });

      console.log('✅ File removed from form');
      toast({
        title: "Berhasil",
        description: "File berhasil dihapus",
      });
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat menghapus file",
        variant: "destructive",
      });
    }
  };

  const handleDownloadFile = async (filePath: string) => {
    try {
      console.log('📥 Downloading file:', filePath);
      
      const { data, error } = await supabase.storage
        .from('contract-documents')
        .download(filePath);

      if (error) {
        console.error('❌ Download error:', error);
        toast({
          title: "Error",
          description: `Gagal download file: ${error.message}`,
          variant: "destructive",
        });
        return;
      }

      // Create download link
      const url = URL.createObjectURL(data);
      const link = document.createElement('a');
      link.href = url;
      link.download = getFileName(filePath);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ File downloaded successfully');
    } catch (error) {
      console.error('❌ Download error:', error);
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat download file",
        variant: "destructive",
      });
    }
  };

  const getFileName = (filePath: string) => {
    return filePath.split('/').pop()?.replace(/^\d+-/, '') || filePath;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Dokumen Kontrak</h3>
      
      {/* Upload Area */}
      <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="p-6">
          <div className="text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <Label htmlFor="file-upload" className="cursor-pointer">
              <span className="text-lg font-medium text-gray-900">
                {uploading ? 'Mengupload...' : 'Pilih file untuk diupload'}
              </span>
              <p className="text-sm text-gray-500 mt-1">
                atau drag and drop file di sini
              </p>
            </Label>
            <input
              id="file-upload"
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            <p className="text-xs text-gray-400 mt-2">
              Format yang didukung: PDF, DOC, DOCX, JPG, PNG (Max 10MB per file)
            </p>
            {uploading && (
              <div className="mt-3">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                <p className="text-sm text-blue-600">Mengupload file...</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {formData.contract_documents && formData.contract_documents.length > 0 && (
        <div className="space-y-2">
          <Label className="text-sm font-medium">File yang telah diupload ({formData.contract_documents.length}):</Label>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {formData.contract_documents.map((filePath, index) => (
              <Card key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <File className="h-5 w-5 text-blue-500 flex-shrink-0" />
                    <span className="text-sm font-medium truncate" title={getFileName(filePath)}>
                      {getFileName(filePath)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadFile(filePath)}
                      className="h-8 w-8 p-0"
                      title="Download file"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveFile(filePath)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      title="Hapus file"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
