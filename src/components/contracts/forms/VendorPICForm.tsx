
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVendors } from '@/hooks/useNewDatabase';
import { useEffect } from 'react';

interface VendorPICFormProps {
  formData: {
    id_vendor: string;
    vendor_nama?: string;
    vendor_alamat?: string;
    vendor_npwp?: string;
    pic_nama?: string;
    pic_kontak?: string;
  };
  setFormData: (data: any) => void;
}

export const VendorPICForm = ({ formData, setFormData }: VendorPICFormProps) => {
  const { vendors } = useVendors();

  useEffect(() => {
    if (formData.id_vendor) {
      const selectedVendor = vendors.find(v => v.id_vendor === formData.id_vendor);
      if (selectedVendor) {
        setFormData({
          ...formData,
          vendor_nama: selectedVendor.nama_vendor,
          vendor_alamat: selectedVendor.alamat,
          vendor_npwp: selectedVendor.npwp,
          pic_nama: selectedVendor.pic_nama,
          pic_kontak: selectedVendor.pic_kontak
        });
      }
    }
  }, [formData.id_vendor, vendors]);

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Informasi Vendor</h3>
        
        <div>
          <Label htmlFor="id_vendor">Vendor *</Label>
          <Select
            value={formData.id_vendor}
            onValueChange={(value) => setFormData({ ...formData, id_vendor: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Pilih vendor" />
            </SelectTrigger>
            <SelectContent>
              {vendors.map((vendor) => (
                <SelectItem key={vendor.id_vendor} value={vendor.id_vendor}>
                  {vendor.nama_vendor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.id_vendor && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="vendor_nama">Nama Vendor</Label>
              <Input
                id="vendor_nama"
                value={formData.vendor_nama || ''}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="vendor_alamat">Alamat Vendor</Label>
              <Input
                id="vendor_alamat"
                value={formData.vendor_alamat || ''}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="vendor_npwp">NPWP Vendor</Label>
              <Input
                id="vendor_npwp"
                value={formData.vendor_npwp || ''}
                readOnly
                className="bg-gray-100"
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Person in Charge (PIC)</h3>
        
        {formData.id_vendor && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="pic_nama">Nama PIC</Label>
              <Input
                id="pic_nama"
                value={formData.pic_nama || ''}
                readOnly
                className="bg-gray-100"
              />
            </div>
            <div>
              <Label htmlFor="pic_kontak">Kontak PIC</Label>
              <Input
                id="pic_kontak"
                value={formData.pic_kontak || ''}
                readOnly
                className="bg-gray-100"
              />
            </div>
          </div>
        )}

        {!formData.id_vendor && (
          <p className="text-sm text-gray-500">Pilih vendor terlebih dahulu untuk melihat informasi PIC</p>
        )}
      </div>
    </div>
  );
};
