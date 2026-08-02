import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Upload, Clock } from 'lucide-react';

interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  url?: string;
  error?: string;
}

interface BulkUploadProgressProps {
  uploadProgress: Record<string, UploadProgress>;
  show: boolean;
}

export const BulkUploadProgress = ({ uploadProgress, show }: BulkUploadProgressProps) => {
  if (!show || Object.keys(uploadProgress).length === 0) {
    return null;
  }

  const progressEntries = Object.values(uploadProgress);
  const totalFiles = progressEntries.length;
  const completedFiles = progressEntries.filter(p => p.status === 'completed').length;
  const errorFiles = progressEntries.filter(p => p.status === 'error').length;
  const overallProgress = totalFiles > 0 ? Math.round((completedFiles / totalFiles) * 100) : 0;

  const getStatusIcon = (status: UploadProgress['status']) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'uploading':
        return <Upload className="h-4 w-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getStatusBadge = (status: UploadProgress['status']) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Menunggu</Badge>;
      case 'uploading':
        return <Badge variant="default">Mengunggah</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Selesai</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="bg-card border rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Progress Upload</h4>
        <div className="text-sm text-muted-foreground">
          {completedFiles}/{totalFiles} selesai
          {errorFiles > 0 && ` (${errorFiles} error)`}
        </div>
      </div>

      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span>Total Progress</span>
          <span>{overallProgress}%</span>
        </div>
        <Progress value={overallProgress} className="h-2" />
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto">
        {progressEntries.map((progress) => (
          <div key={progress.fileId} className="flex items-center gap-3 p-2 bg-muted/30 rounded-md">
            <div className="flex-shrink-0">
              {getStatusIcon(progress.status)}
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium truncate" title={progress.fileName}>
                  {progress.fileName}
                </p>
                {getStatusBadge(progress.status)}
              </div>
              
              {progress.status === 'uploading' && (
                <div className="space-y-1">
                  <Progress value={progress.progress} className="h-1" />
                  <p className="text-xs text-muted-foreground">
                    {progress.progress}%
                  </p>
                </div>
              )}
              
              {progress.status === 'error' && progress.error && (
                <p className="text-xs text-red-500 mt-1">{progress.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};