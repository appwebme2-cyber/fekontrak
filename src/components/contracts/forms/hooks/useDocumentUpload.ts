
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { validateFile, processFileToDocument } from '../utils/documentUtils';

interface DocumentItem {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
  upload_date: string;
}

interface UseDocumentUploadProps {
  formData: {
    contract_documents?: any[];
    amendment_documents?: any[];
  };
  setFormData: (data: any) => void;
}

export const useDocumentUpload = ({ formData, setFormData }: UseDocumentUploadProps) => {
  const [uploading, setUploading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleFileUpload = async (files: FileList | null, section: 'contract_documents' | 'amendment_documents') => {
    console.log('🚀 handleFileUpload called with:', {
      filesCount: files?.length || 0,
      section: section,
      files: files ? Array.from(files).map(f => ({ name: f.name, size: f.size, type: f.type })) : null
    });

    if (!files || files.length === 0) {
      console.log('❌ No files selected');
      return;
    }
    
    setUploading(true);
    console.log('⏳ Upload started, setting uploading to true');
    
    try {
      const newDocuments: DocumentItem[] = [];
      
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        console.log(`📄 Processing file ${i + 1}/${files.length}:`, {
          name: file.name,
          size: file.size,
          type: file.type
        });
        
        const validation = validateFile(file);
        if (!validation.isValid) {
          console.log('❌ File validation failed:', validation.error);
          toast({
            title: "File tidak valid",
            description: validation.error,
            variant: "destructive",
          });
          continue;
        }
        
        console.log('✅ File validation passed for:', file.name);
        
        try {
          console.log('📖 Reading file as data URL:', file.name);
          const documentItem = await processFileToDocument(file, i);
          
          console.log('📁 Created document item:', {
            id: documentItem.id,
            name: documentItem.name,
            size: documentItem.size,
            hasUrl: !!documentItem.url
          });
          newDocuments.push(documentItem);
        } catch (fileError) {
          console.error('❌ Error processing file:', file.name, fileError);
          toast({
            title: "Error",
            description: `Gagal memproses file ${file.name}`,
            variant: "destructive",
          });
        }
      }
      
      console.log('📋 Processing completed. Valid documents:', newDocuments.length);
      
      if (newDocuments.length > 0) {
        const existingDocuments = Array.isArray(formData[section]) ? formData[section] : [];
        const updatedDocuments = [...existingDocuments, ...newDocuments];
        
        console.log('📁 Updating form data:', {
          section: section,
          existingCount: existingDocuments.length,
          newCount: newDocuments.length,
          totalCount: updatedDocuments.length
        });
        
        const updatedFormData = {
          ...formData,
          [section]: updatedDocuments
        };
        
        console.log('📝 Calling setFormData with:', updatedFormData);
        setFormData(updatedFormData);
        
        toast({
          title: "Berhasil",
          description: `${newDocuments.length} dokumen berhasil ditambahkan`,
        });
        console.log('✅ Upload process completed successfully');
      } else {
        console.log('⚠️ No valid documents to add');
      }
    } catch (error) {
      console.error('❌ Error in handleFileUpload:', error);
      toast({
        title: "Error",
        description: "Gagal mengunggah dokumen",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      console.log('🔄 Upload completed, setting uploading to false');
    }
  };

  const removeDocument = (section: 'contract_documents' | 'amendment_documents', documentId: string) => {
    console.log('🗑️ Removing document:', { section, documentId });
    
    const documents = Array.isArray(formData[section]) ? formData[section] : [];
    const updatedDocuments = documents.filter((doc: DocumentItem) => doc.id !== documentId);
    
    console.log('📝 Document removal:', {
      originalCount: documents.length,
      newCount: updatedDocuments.length
    });
    
    setFormData({
      ...formData,
      [section]: updatedDocuments
    });
    
    toast({
      title: "Berhasil",
      description: "Dokumen berhasil dihapus",
    });
  };

  return {
    uploading,
    handleFileUpload,
    removeDocument
  };
};
