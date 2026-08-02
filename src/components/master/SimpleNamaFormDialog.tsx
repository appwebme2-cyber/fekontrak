import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';

interface SimpleNamaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item?: any | null;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
  title: string;
  editTitle: string;
  label?: string;
  placeholder?: string;
}

export const SimpleNamaFormDialog = ({
  open,
  onOpenChange,
  item,
  onSubmit,
  isLoading = false,
  title,
  editTitle,
  label = 'Nama *',
  placeholder = 'Masukkan nama',
}: SimpleNamaFormDialogProps) => {
  const [formData, setFormData] = useState({ nama: '' });

  useEffect(() => {
    setFormData({ nama: item?.nama || '' });
  }, [item, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{item ? editTitle : title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="nama">{label}</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              placeholder={placeholder}
              required
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : item ? 'Update' : 'Tambah'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
