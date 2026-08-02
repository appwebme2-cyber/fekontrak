
interface DocumentsDebugInfoProps {
  contractDocsCount: number;
  amendmentDocsCount: number;
  uploading: boolean;
}

export const DocumentsDebugInfo = ({ 
  contractDocsCount, 
  amendmentDocsCount, 
  uploading 
}: DocumentsDebugInfoProps) => {
  return (
    <div className="bg-gray-50 p-3 rounded text-xs text-gray-600">
      <strong>Debug Info:</strong>
      <div>Contract docs: {contractDocsCount}</div>
      <div>Amendment docs: {amendmentDocsCount}</div>
      <div>Uploading: {uploading ? 'Yes' : 'No'}</div>
    </div>
  );
};
