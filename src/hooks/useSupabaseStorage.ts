import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { validateFile as securityValidateFile, createSecureFilename } from '@/utils/security';
import { logSecurityEvent } from '@/utils/auditLogger';

interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

interface UseSupabaseStorageProps {
  bucket: string;
  path?: string;
}

export const useSupabaseStorage = ({ bucket, path = '' }: UseSupabaseStorageProps) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, UploadProgress>>({});
  const { toast } = useToast();

  const validateFile = async (file: File) => {
    try {
      const validation = await securityValidateFile(file);
      
      if (!validation.isValid) {
        // Log security event for blocked file upload
        await logSecurityEvent('FILE_UPLOAD', {
          filename: file.name,
          size: file.size,
          type: file.type,
          blocked: true,
          reason: validation.error
        });
        
        return { isValid: false, error: `File ${file.name}: ${validation.error}` };
      }
      
      return { isValid: true };
    } catch (error) {
      return { isValid: false, error: `File ${file.name}: Validation failed` };
    }
  };

  const uploadFile = async (file: File, customPath?: string): Promise<{ url: string; path: string } | null> => {
    // Validate file security first
    const validation = await validateFile(file);
    if (!validation.isValid) {
      toast({
        title: "File tidak valid",
        description: validation.error,
        variant: "destructive",
      });
      return null;
    }
    
    const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const fileName = file.name;
    const secureFileName = createSecureFilename(fileName);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filePath = customPath || `${path}/${timestamp}-${secureFileName}`;

    // Initialize progress tracking
    setUploadProgress(prev => ({
      ...prev,
      [fileId]: {
        fileId,
        fileName,
        progress: 0,
        status: 'pending'
      }
    }));

    try {
      // Update progress to uploading
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { ...prev[fileId], status: 'uploading', progress: 10 }
      }));

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Update progress to 50% after upload
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: { ...prev[fileId], progress: 50 }
      }));

      // Get public URL
      const { data: urlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(data.path);

      // Update progress to completed
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          progress: 100,
          status: 'completed',
          url: urlData.publicUrl
        }
      }));

      // Log successful upload
      await logSecurityEvent('FILE_UPLOAD', {
        filename: fileName,
        secureFilename: secureFileName,
        size: file.size,
        type: file.type,
        path: data.path,
        success: true
      });

      return {
        url: urlData.publicUrl,
        path: data.path
      };

    } catch (error: any) {
      setUploadProgress(prev => ({
        ...prev,
        [fileId]: {
          ...prev[fileId],
          status: 'error',
          error: error.message
        }
      }));

      toast({
        title: "Upload Error",
        description: `Gagal mengunggah ${fileName}: ${error.message}`,
        variant: "destructive",
      });

      return null;
    }
  };

  const uploadMultipleFiles = async (files: FileList | File[], customPath?: string) => {
    setUploading(true);
    const fileArray = Array.from(files);
    const results: Array<{ url: string; path: string; name: string; size: number; type: string } | null> = [];

    try {
      // Validate all files first with enhanced security
      for (const file of fileArray) {
        const validation = await validateFile(file);
        if (!validation.isValid) {
          toast({
            title: "File tidak valid",
            description: validation.error,
            variant: "destructive",
          });
          return [];
        }
      }

      // Upload files in parallel with progress tracking
      const uploadPromises = fileArray.map(async (file) => {
        const result = await uploadFile(file, customPath);
        if (result) {
          return {
            ...result,
            name: file.name,
            size: file.size,
            type: file.type
          };
        }
        return null;
      });

      const uploadResults = await Promise.all(uploadPromises);
      const successfulUploads = uploadResults.filter(result => result !== null) as Array<{ url: string; path: string; name: string; size: number; type: string }>;

      if (successfulUploads.length > 0) {
        toast({
          title: "Upload Berhasil",
          description: `${successfulUploads.length} file berhasil diunggah`,
        });
      }

      return successfulUploads;

    } catch (error: any) {
      toast({
        title: "Upload Error",
        description: `Gagal mengunggah file: ${error.message}`,
        variant: "destructive",
      });
      return [];
    } finally {
      setUploading(false);
      // Clear progress after 3 seconds
      setTimeout(() => {
        setUploadProgress({});
      }, 3000);
    }
  };

  const deleteFile = async (filePath: string) => {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([filePath]);

      if (error) throw error;

      toast({
        title: "File Dihapus",
        description: "File berhasil dihapus dari storage",
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Delete Error",
        description: `Gagal menghapus file: ${error.message}`,
        variant: "destructive",
      });
      return false;
    }
  };

  const getFileUrl = (filePath: string) => {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  };

  return {
    uploading,
    uploadProgress,
    uploadFile,
    uploadMultipleFiles,
    deleteFile,
    getFileUrl,
    validateFile
  };
};