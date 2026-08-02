
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UserProfile } from '../types';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  user: UserProfile | null;
  onConfirm: () => void;
}

export const DeleteConfirmDialog = ({ isOpen, onOpenChange, user, onConfirm }: DeleteConfirmDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Hapus User?</DialogTitle>
          <DialogDescription>
            Apakah Anda yakin ingin menghapus user <b>{user?.full_name}</b> dengan email <b>{user?.email}</b>? Aksi ini tidak dapat dibatalkan.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button variant="destructive" onClick={onConfirm}>Hapus</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
