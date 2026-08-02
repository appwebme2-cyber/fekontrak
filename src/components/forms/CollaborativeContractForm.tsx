import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CollaborativeField } from '@/components/ui/collaborative-field';
import { ConflictResolutionDialog } from '@/components/ui/conflict-resolution-dialog';
import { useCollaborativeEditing } from '@/hooks/useCollaborativeEditing';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Wifi, WifiOff } from 'lucide-react';

interface CollaborativeContractFormProps {
  contract: any;
  onUpdate: (field: string, value: any) => void;
  onSave: () => void;
  className?: string;
}

export const CollaborativeContractForm = ({
  contract,
  onUpdate,
  onSave,
  className
}: CollaborativeContractFormProps) => {
  const [showConflicts, setShowConflicts] = useState(false);
  
  const {
    conflicts,
    isConnected,
    activeEditors,
    resolveConflict
  } = useCollaborativeEditing('contract', contract.id_kontrak);

  const handleResolveConflict = (conflictId: string, chosenValue: any) => {
    resolveConflict(conflictId, chosenValue);
    // Also update the form with the chosen value
    const conflict = conflicts.find(c => c.timestamp.toString() === conflictId);
    if (conflict) {
      onUpdate(conflict.fieldName, chosenValue);
    }
  };

  const uniqueEditors = activeEditors.filter((editor, index, self) => 
    index === self.findIndex(e => e.userId === editor.userId)
  );

  return (
    <div className={className}>
      {/* Connection Status & Active Editors */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2">
          {isConnected ? (
            <div className="flex items-center gap-2 text-green-600">
              <Wifi className="w-4 h-4" />
              <span className="text-sm">Connected</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-red-600">
              <WifiOff className="w-4 h-4" />
              <span className="text-sm">Disconnected</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {uniqueEditors.length > 0 && (
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-600">
                {uniqueEditors.length} user{uniqueEditors.length > 1 ? 's' : ''} editing
              </span>
              {uniqueEditors.map((editor, index) => (
                <Badge key={editor.userId} variant="secondary" className="text-xs">
                  {editor.userName.split(' ')[0]}
                </Badge>
              ))}
            </div>
          )}

          {conflicts.length > 0 && (
            <Button
              size="sm"
              variant="destructive"
              onClick={() => setShowConflicts(true)}
            >
              {conflicts.length} Conflict{conflicts.length > 1 ? 's' : ''}
            </Button>
          )}
        </div>
      </div>

      {/* Form Fields */}
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Dasar Kontrak</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Judul Kontrak</label>
              <CollaborativeField
                recordType="contract"
                recordId={contract.id_kontrak}
                fieldName="judul_kontrak"
                value={contract.judul_kontrak || ''}
                onChange={(value) => onUpdate('judul_kontrak', value)}
                placeholder="Masukkan judul kontrak..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Nomor Kontrak</label>
                <CollaborativeField
                  recordType="contract"
                  recordId={contract.id_kontrak}
                  fieldName="nomor_kontrak"
                  value={contract.nomor_kontrak || ''}
                  onChange={(value) => onUpdate('nomor_kontrak', value)}
                  placeholder="Nomor kontrak..."
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Nilai Kontrak</label>
                <CollaborativeField
                  recordType="contract"
                  recordId={contract.id_kontrak}
                  fieldName="nilai_awal"
                  type="number"
                  value={contract.nilai_awal || 0}
                  onChange={(value) => onUpdate('nilai_awal', parseFloat(value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Deskripsi Pekerjaan</label>
              <CollaborativeField
                recordType="contract"
                recordId={contract.id_kontrak}
                fieldName="deskripsi_pekerjaan"
                type="textarea"
                value={contract.deskripsi_pekerjaan || ''}
                onChange={(value) => onUpdate('deskripsi_pekerjaan', value)}
                placeholder="Deskripsi detail pekerjaan..."
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Progress Aktual (%)</label>
                <CollaborativeField
                  recordType="contract"
                  recordId={contract.id_kontrak}
                  fieldName="progress_actual"
                  type="number"
                  value={contract.progress_actual || 0}
                  onChange={(value) => onUpdate('progress_actual', parseFloat(value) || 0)}
                  placeholder="0"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Progress Plan (%)</label>
                <CollaborativeField
                  recordType="contract"
                  recordId={contract.id_kontrak}
                  fieldName="progress_plan"
                  type="number"
                  value={contract.progress_plan || 0}
                  onChange={(value) => onUpdate('progress_plan', parseFloat(value) || 0)}
                  placeholder="0"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="flex justify-end">
          <Button onClick={onSave} className="px-6">
            Simpan Perubahan
          </Button>
        </div>
      </div>

      {/* Conflict Resolution Dialog */}
      <ConflictResolutionDialog
        open={showConflicts}
        onOpenChange={setShowConflicts}
        conflicts={conflicts}
        onResolveConflict={handleResolveConflict}
      />
    </div>
  );
};