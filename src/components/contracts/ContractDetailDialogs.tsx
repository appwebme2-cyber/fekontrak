
import { ContractFormDialog } from "./ContractFormDialog";
import { ContractDeleteDialog } from "./ContractDeleteDialog";
import { Kontrak } from "@/types/database";

interface ContractDetailDialogsProps {
  contract: Kontrak | null;
  showEditDialog: boolean;
  showDeleteDialog: boolean;
  onEditDialogChange: (open: boolean) => void;
  onDeleteDialogChange: (open: boolean) => void;
  onSubmitEdit: (data: any) => Promise<void>;
  onConfirmDelete: () => Promise<void>;
  isUpdateLoading: boolean;
}

export const ContractDetailDialogs = ({
  contract,
  showEditDialog,
  showDeleteDialog,
  onEditDialogChange,
  onDeleteDialogChange,
  onSubmitEdit,
  onConfirmDelete,
  isUpdateLoading,
}: ContractDetailDialogsProps) => {
  return (
    <>
      {/* Edit Dialog */}
      {contract && (
        <ContractFormDialog
          open={showEditDialog}
          onOpenChange={onEditDialogChange}
          contract={contract}
          onSubmit={onSubmitEdit}
          isLoading={isUpdateLoading}
        />
      )}

      {/* Delete Dialog */}
      <ContractDeleteDialog
        open={showDeleteDialog}
        onOpenChange={onDeleteDialogChange}
        onDelete={onConfirmDelete}
      />
    </>
  );
};
