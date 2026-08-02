
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { Vendor } from '@/types/database';

interface VendorFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor?: Vendor | null;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const VendorFormDialog = ({
  open,
  onOpenChange,
  vendor,
  onSubmit,
  isLoading = false
}: VendorFormDialogProps) => {
  const [formData, setFormData] = useState({
    nama_vendor: '',
    npwp: '',
    alamat: '',
    pic_nama: '',
    pic_kontak: '',
    status_vendor: 'Active',
    score: 0
  });

  useEffect(() => {
    if (vendor) {
      setFormData({
        nama_vendor: vendor.nama_vendor || '',
        npwp: vendor.npwp || '',
        alamat: vendor.alamat || '',
        pic_nama: vendor.pic_nama || '',
        pic_kontak: vendor.pic_kontak || '',
        status_vendor: vendor.status_vendor || 'Active',
        score: vendor.score || 0
      });
    } else {
      setFormData({
        nama_vendor: '',
        npwp: '',
        alamat: '',
        pic_nama: '',
        pic_kontak: '',
        status_vendor: 'Active',
        score: 0
      });
    }
  }, [vendor, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting vendor form:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {vendor ? 'Edit Vendor' : 'Tambah Vendor Baru'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="nama_vendor">Nama Vendor *</Label>
              <Input
                id="nama_vendor"
                value={formData.nama_vendor}
                onChange={(e) => setFormData({ ...formData, nama_vendor: e.target.value })}
                placeholder="Masukkan nama vendor"
                required
              />
            </div>

            <div>
              <Label htmlFor="npwp">NPWP</Label>
              <Input
                id="npwp"
                value={formData.npwp}
                onChange={(e) => setFormData({ ...formData, npwp: e.target.value })}
                placeholder="Masukkan NPWP"
              />
            </div>

            <div>
              <Label htmlFor="status_vendor">Status Vendor *</Label>
              <Select
                value={formData.status_vendor}
                onValueChange={(value) => setFormData({ ...formData, status_vendor: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Blacklist">Blacklist</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="md:col-span-2">
              <Label htmlFor="alamat">Alamat</Label>
              <Textarea
                id="alamat"
                value={formData.alamat}
                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                placeholder="Masukkan alamat lengkap"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="pic_nama">Nama PIC</Label>
              <Input
                id="pic_nama"
                value={formData.pic_nama}
                onChange={(e) => setFormData({ ...formData, pic_nama: e.target.value })}
                placeholder="Masukkan nama PIC"
              />
            </div>

            <div>
              <Label htmlFor="pic_kontak">Kontak PIC</Label>
              <Input
                id="pic_kontak"
                value={formData.pic_kontak}
                onChange={(e) => setFormData({ ...formData, pic_kontak: e.target.value })}
                placeholder="Masukkan kontak PIC"
              />
            </div>

            <div>
              <Label htmlFor="score">Score Vendor</Label>
              <Input
                id="score"
                type="number"
                min="0"
                max="100"
                value={formData.score}
                onChange={(e) => setFormData({ ...formData, score: parseInt(e.target.value) || 0 })}
                placeholder="0-100"
              />
              <p className="text-xs text-gray-500 mt-1">Score penilaian vendor (0-100)</p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Menyimpan...' : vendor ? 'Update' : 'Tambah'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
