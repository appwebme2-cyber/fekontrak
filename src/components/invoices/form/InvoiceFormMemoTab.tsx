
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { useInvoiceDocumentUpload } from './hooks/useInvoiceDocumentUpload';
import { InvoiceDocumentUploadArea } from './components/InvoiceDocumentUploadArea';
import { InvoiceDocumentList } from './components/InvoiceDocumentList';
import { TagihanDocument } from '@/lib/utils/typeUtils';
import { Eye, Trash2 } from 'lucide-react';

interface InvoiceFormMemoTabProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
}

export const InvoiceFormMemoTab = ({
  formData,
  updateFormData
}: InvoiceFormMemoTabProps) => {
  
  const { uploading, handleDocumentUpload, removeDocument } = useInvoiceDocumentUpload({
    formData,
    updateFormData
  });

  const handleMemoFileUpload = (files: FileList | null) => {
    if (files) {
      handleDocumentUpload(files, 'dokumen_memo');
    }
  };

  const handleTagihanFileUpload = (files: FileList | null) => {
    if (files) {
      handleDocumentUpload(files, 'dokumen_tagihan');
    }
  };

  const handleRemoveMemo = () => {
    removeDocument('', 'dokumen_memo');
  };

  const handleRemoveTagihan = (documentId: string) => {
    removeDocument(documentId, 'dokumen_tagihan');
  };
  
  return (
    <div className="space-y-4 mt-6">
      <div className="flex items-center space-x-2">
        <Switch
          id="memo_required"
          checked={formData.memo_required}
          onCheckedChange={(checked) => updateFormData('memo_required', checked)}
        />
        <Label htmlFor="memo_required">Memo Diperlukan</Label>
      </div>

      {formData.memo_required && (
        <div className="space-y-4 p-4 border rounded-lg bg-accent/20">
          <div>
            <Label htmlFor="tanggal_pengiriman_memo">Tanggal Pengiriman Memo</Label>
            <Input
              id="tanggal_pengiriman_memo"
              type="date"
              value={formData.tanggal_pengiriman_memo}
              onChange={(e) => updateFormData('tanggal_pengiriman_memo', e.target.value)}
            />
          </div>
          
          <InvoiceDocumentUploadArea
            title="Upload Memo"
            onFileSelect={handleMemoFileUpload}
            uploading={uploading}
            multiple={false}
          />
          
          {formData.dokumen_memo && (
            <div className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
              <div className="flex items-center space-x-2">
                <span>📄</span>
                <span className="text-sm font-medium">Dokumen Memo</span>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(formData.dokumen_memo, '_blank')}
                  className="h-8 w-8 p-0"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveMemo}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      <InvoiceDocumentUploadArea
        title="Dokumen Tagihan"
        onFileSelect={handleTagihanFileUpload}
        uploading={uploading}
        multiple={true}
      />

      {formData.dokumen_tagihan && Array.isArray(formData.dokumen_tagihan) && formData.dokumen_tagihan.length > 0 && (
        <InvoiceDocumentList
          documents={formData.dokumen_tagihan as TagihanDocument[]}
          onRemove={handleRemoveTagihan}
          title="Dokumen yang Diunggah"
        />
      )}
    </div>
  );
};
