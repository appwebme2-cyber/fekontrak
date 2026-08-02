
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getFileIcon = (type: string | undefined | null): string => {
  if (!type) return '📁';
  if (type.includes('pdf')) return '📄';
  if (type.includes('word') || type.includes('document')) return '📝';
  if (type.includes('image')) return '🖼️';
  return '📁';
};

export const validateFile = (file: File): { isValid: boolean; error?: string } => {
  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    return {
      isValid: false,
      error: `${file.name} melebihi batas 10MB`
    };
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
    return {
      isValid: false,
      error: `${file.name} bukan tipe file yang diizinkan`
    };
  }
  
  return { isValid: true };
};

export const processFileToDocument = async (file: File, index: number): Promise<{
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  upload_date: string;
}> => {
  const fileReader = new FileReader();
  const fileData = await new Promise<string>((resolve, reject) => {
    fileReader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    fileReader.onerror = (e) => {
      reject(new Error('Failed to read file'));
    };
    fileReader.readAsDataURL(file);
  });
  
  return {
    id: `doc_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 9)}`,
    name: file.name,
    size: file.size,
    type: file.type,
    url: fileData,
    upload_date: new Date().toISOString()
  };
};
