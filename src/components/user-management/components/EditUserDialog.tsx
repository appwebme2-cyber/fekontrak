import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserFormData } from '../types';
import { usePermissions } from '@/hooks/usePermissions';

const API_URL = "https://bekontrak-production.up.railway.app/api";

interface EditUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  formData: UserFormData;
  setFormData: (data: UserFormData) => void;
  onSubmit: () => void;
}

export const EditUserDialog = ({ isOpen, onOpenChange, formData, setFormData, onSubmit }: EditUserDialogProps) => {
  const [vendors, setVendors] = useState<{ idVendor: string; namaVendor: string }[]>([]);
  const { roleLabels } = usePermissions();

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const res = await fetch(`${API_URL}/vendors`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (res.ok) setVendors(await res.json());
      } catch (error) {
        console.error('Error fetching vendors:', error);
      }
    };
    if (isOpen) fetchVendors();
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Pengguna</DialogTitle>
          <DialogDescription>Perbarui informasi pengguna dan role akses.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="edit-name">Nama Lengkap</Label>
            <Input
              id="edit-name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-email">Email</Label>
            <Input id="edit-email" value={formData.email} disabled className="bg-muted" />
          </div>
          <div className="grid gap-2">
            <Label>Role</Label>
            <Select
              value={formData.role}
              onValueChange={(value: any) => setFormData({ ...formData, role: value, id_vendor: '' })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">{roleLabels.admin}</SelectItem>
                <SelectItem value="manager">{roleLabels.manager}</SelectItem>
                <SelectItem value="section_head">{roleLabels.section_head}</SelectItem>
                <SelectItem value="supervisor">{roleLabels.supervisor}</SelectItem>
                <SelectItem value="technician">{roleLabels.technician}</SelectItem>
                <SelectItem value="external">{roleLabels.external}</SelectItem>
                <SelectItem value="guest">{roleLabels.guest}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dropdown vendor — hanya muncul kalau role = external */}
          {formData.role === 'external' && (
            <div className="grid gap-2">
              <Label>Perusahaan Vendor <span className="text-red-500">*</span></Label>
              <Select
                value={formData.id_vendor || ''}
                onValueChange={(value) => setFormData({ ...formData, id_vendor: value })}
              >
                <SelectTrigger><SelectValue placeholder="Pilih vendor..." /></SelectTrigger>
                <SelectContent>
                  {vendors.map(v => (
                    <SelectItem key={v.idVendor} value={v.idVendor}>{v.namaVendor}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>Batal</Button>
          <Button onClick={onSubmit}>Simpan Perubahan</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};