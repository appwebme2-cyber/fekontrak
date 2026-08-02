
import { AlertCircle } from 'lucide-react';

export const DocumentsNotice = () => {
  return (
    <div className="bg-blue-50 p-4 rounded-lg">
      <div className="flex items-start gap-2">
        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
        <div>
          <h4 className="text-sm font-medium text-blue-900">Catatan Penting</h4>
          <ul className="text-xs text-blue-800 mt-1 space-y-1">
            <li>• Dokumen akan disimpan sementara sampai kontrak disimpan</li>
            <li>• Pastikan semua dokumen sudah benar sebelum menyimpan kontrak</li>
            <li>• Maksimal ukuran file per dokumen adalah 10MB</li>
            <li>• Tipe file yang didukung: PDF, DOC, DOCX, JPG, PNG</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
