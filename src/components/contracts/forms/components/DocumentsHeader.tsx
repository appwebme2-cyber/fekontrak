
interface DocumentsHeaderProps {
  uploading: boolean;
}

export const DocumentsHeader = ({ uploading }: DocumentsHeaderProps) => {
  return (
    <div className="flex items-center gap-2 mb-4">
      <h3 className="text-lg font-semibold">Dokumen Kontrak</h3>
      {uploading && (
        <div className="flex items-center gap-2 text-sm text-blue-600">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          Mengunggah...
        </div>
      )}
    </div>
  );
};
