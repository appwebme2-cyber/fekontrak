
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, ExternalLink, File, FolderOpen } from "lucide-react";

interface ContractDocumentsCardProps {
  contractDocuments: any[];
  amendmentDocuments: any[];
}

const ContractDocumentsCard = ({ contractDocuments = [], amendmentDocuments = [] }: ContractDocumentsCardProps) => {
  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'pdf':
        return <FileText className="h-5 w-5 text-red-500" />;
      case 'doc':
      case 'docx':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'xls':
      case 'xlsx':
        return <FileText className="h-5 w-5 text-green-500" />;
      default:
        return <File className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const downloadFile = (url: string, filename: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderDocumentSection = (documents: any[], title: string, emptyMessage: string) => {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b pb-2">
          <FolderOpen className="h-5 w-5 text-blue-600" />
          <h4 className="text-lg font-semibold text-gray-800">{title}</h4>
          {documents.length > 0 && (
            <div className="text-gray-600 text-sm bg-blue-50 px-3 py-1 rounded-full ml-auto">
              {documents.length} dokumen
            </div>
          )}
        </div>

        {documents.length > 0 ? (
          <div className="grid gap-3">
            {documents.map((doc: any, idx: number) => {
              const filename = doc.name || `Dokumen ${idx + 1}`;
              const fileExtension = filename.split('.').pop()?.toLowerCase() || '';
              const fileSize = doc.size || 0;
              const uploadDate = doc.upload_date ? new Date(doc.upload_date).toLocaleDateString('id-ID') : 'Unknown';
              
              return (
                <div key={doc.id || idx} className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {getFileIcon(filename)}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-800 font-medium truncate">
                          {filename}
                        </p>
                        <div className="flex items-center gap-4 text-gray-600 text-sm mt-1">
                          <span className="uppercase bg-gray-100 px-2 py-1 rounded text-xs">{fileExtension}</span>
                          <span>•</span>
                          <span>{formatFileSize(fileSize)}</span>
                          <span>•</span>
                          <span>{uploadDate}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4 flex-shrink-0">
                      {doc.url && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-blue-600 border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors duration-200 flex items-center gap-1.5"
                            onClick={() => window.open(doc.url, '_blank')}
                            title="Lihat"
                          >
                            <ExternalLink className="h-4 w-4 flex-shrink-0" />
                            <span className="hidden lg:inline">Lihat</span>
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-green-600 border-green-200 hover:bg-green-50 hover:border-green-300 transition-colors duration-200 flex items-center gap-1.5"
                            onClick={() => downloadFile(doc.url, filename)}
                            title="Download"
                          >
                            <Download className="h-4 w-4 flex-shrink-0" />
                            <span className="hidden lg:inline">Download</span>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="bg-gray-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-600 text-sm">{emptyMessage}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <CardContent className="p-6 bg-gray-50 space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-500" />
          Dokumen Kontrak
        </h3>
        <div className="text-gray-600 text-sm bg-blue-50 px-3 py-1 rounded-full">
          Total: {contractDocuments.length + amendmentDocuments.length} dokumen
        </div>
      </div>

      {/* Contract Documents Section */}
      {renderDocumentSection(
        contractDocuments, 
        "Dokumen Kontrak Utama", 
        "Belum ada dokumen kontrak yang diupload"
      )}

      {/* Amendment Documents Section */}
      {renderDocumentSection(
        amendmentDocuments, 
        "Dokumen Amandemen", 
        "Belum ada dokumen amandemen yang diupload"
      )}

      {contractDocuments.length === 0 && amendmentDocuments.length === 0 && (
        <div className="text-center py-16">
          <div className="bg-gray-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <FileText className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Belum Ada Dokumen
          </h3>
          <p className="text-gray-600 max-w-md mx-auto">
            Dokumen kontrak dan amandemen belum diupload untuk kontrak ini. Dokumen dapat ditambahkan melalui fitur edit kontrak.
          </p>
        </div>
      )}
    </CardContent>
  );
};

export default ContractDocumentsCard;
