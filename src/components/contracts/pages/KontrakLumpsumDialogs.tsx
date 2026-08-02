
import { ContractFormDialog } from '../ContractFormDialog';
import { ContractDeleteDialog } from '../ContractDeleteDialog';
import { Kontrak } from '@/types/database';

interface KontrakLumpsumDialogsProps {
  isFormDialogOpen: boolean;
  setIsFormDialogOpen: (open: boolean) => void;
  editingContract: Kontrak | null;
  onFormSubmit: (data: any) => Promise<void>;
  isFormLoading: boolean;
  deleteContract: Kontrak | null;
  setDeleteContract: (contract: Kontrak | null) => void;
  onConfirmDelete: () => void;
}

export function KontrakLumpsumDialogs({
  isFormDialogOpen,
  setIsFormDialogOpen,
  editingContract,
  onFormSubmit,
  isFormLoading,
  deleteContract,
  setDeleteContract,
  onConfirmDelete,
}: KontrakLumpsumDialogsProps) {
  return (
    <>
      {/* Form Dialog */}
      <ContractFormDialog
        open={isFormDialogOpen}
        onOpenChange={setIsFormDialogOpen}
        contract={editingContract}
        onSubmit={onFormSubmit}
        isLoading={isFormLoading}
      />

      {/* Delete Confirmation Dialog */}
      <ContractDeleteDialog
        open={!!deleteContract}
        onOpenChange={() => setDeleteContract(null)}
        onDelete={onConfirmDelete}
      />
    </>
  );
}
