import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, User, Clock } from 'lucide-react';

interface ConflictResolutionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: Array<{
    recordId: string;
    fieldName: string;
    conflictType: 'concurrent_edit' | 'version_mismatch';
    localValue: any;
    remoteValue: any;
    timestamp: number;
  }>;
  onResolveConflict: (conflictId: string, chosenValue: any) => void;
}

export const ConflictResolutionDialog = ({
  open,
  onOpenChange,
  conflicts,
  onResolveConflict
}: ConflictResolutionDialogProps) => {
  const formatValue = (value: any) => {
    if (value === null || value === undefined) return 'Kosong';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('id-ID');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Resolusi Konflik Data
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {conflicts.map((conflict, index) => (
            <Card key={`${conflict.recordId}-${conflict.fieldName}-${conflict.timestamp}`}>
              <CardHeader>
                <CardTitle className="text-lg flex items-center justify-between">
                  <span>Field: {conflict.fieldName}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant={conflict.conflictType === 'concurrent_edit' ? 'destructive' : 'secondary'}>
                      {conflict.conflictType === 'concurrent_edit' ? 'Edit Bersamaan' : 'Versi Berbeda'}
                    </Badge>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="w-4 h-4" />
                      {formatTimestamp(conflict.timestamp)}
                    </div>
                  </div>
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Local Version */}
                  <Card className="border-blue-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                        <User className="w-4 h-4" />
                        Versi Anda (Lokal)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-blue-50 p-3 rounded border min-h-[60px] mb-3">
                        <code className="text-sm">{formatValue(conflict.localValue)}</code>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-blue-300 text-blue-700 hover:bg-blue-50"
                        onClick={() => onResolveConflict(`${conflict.timestamp}`, conflict.localValue)}
                      >
                        Pilih Versi Ini
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Remote Version */}
                  <Card className="border-green-200">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                        <User className="w-4 h-4" />
                        Versi Server (Remote)
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="bg-green-50 p-3 rounded border min-h-[60px] mb-3">
                        <code className="text-sm">{formatValue(conflict.remoteValue)}</code>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full border-green-300 text-green-700 hover:bg-green-50"
                        onClick={() => onResolveConflict(`${conflict.timestamp}`, conflict.remoteValue)}
                      >
                        Pilih Versi Ini
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Custom Resolution */}
                <div className="mt-4 p-3 bg-gray-50 rounded">
                  <p className="text-sm text-gray-600 mb-2">
                    Atau masukkan nilai custom:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      className="flex-1 px-3 py-2 border rounded text-sm"
                      placeholder="Masukkan nilai custom..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = (e.target as HTMLInputElement).value;
                          onResolveConflict(`${conflict.timestamp}`, value);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={(e) => {
                        const input = e.currentTarget.parentElement?.querySelector('input') as HTMLInputElement;
                        const value = input?.value;
                        if (value) {
                          onResolveConflict(`${conflict.timestamp}`, value);
                        }
                      }}
                    >
                      Gunakan
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};