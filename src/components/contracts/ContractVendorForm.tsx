import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useVendors } from '@/hooks/useVendors';
import { useEffect } from 'react';

interface ContractVendorFormProps {
  formData: any;
  setFormData: (data: any) => void;
}

export const ContractVendorForm = ({ formData, setFormData }: ContractVendorFormProps) => {
  const { vendors } = useVendors();

  useEffect(() => {
    if (formData.id_vendor && vendors) {
      const selectedVendor = vendors.find((v: any) => v.id === formData.id_vendor);
      if (selectedVendor) {
        setFormData({ ...formData, vendor_score: selectedVendor.score || 0 });
      }
    }
  }, [formData.id_vendor, vendors]);

  // Kontrak lama/hasil import kadang menyimpan id_vendor yang vendornya sudah
  // dihapus/tidak ada lagi. Kalau tidak dideteksi, id yang tidak valid itu ikut
  // terkirim apa adanya saat disimpan dan ditolak database (foreign key error).
  const vendorNotFound = !!formData.id_vendor && !!vendors && !vendors.some((v: any) => v.id === formData.id_vendor);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Informasi Vendor</h3>

      {vendorNotFound && (
        <div className="p-3 rounded-lg border border-orange-300 bg-orange-50 text-orange-700 text-sm">
          Vendor pada kontrak ini sudah tidak ditemukan (kemungkinan sudah dihapus dari Master Data Vendor).
          Silakan pilih ulang vendor yang benar di bawah ini sebelum menyimpan kontrak.
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="id_vendor">Vendor *</Label>
        <Select
          value={vendorNotFound ? '' : (formData.id_vendor || '')}
          onValueChange={(value) => setFormData({ ...formData, id_vendor: value })}
        >
          <SelectTrigger className={vendorNotFound ? 'border-orange-400' : ''}>
            <SelectValue placeholder="Pilih vendor" />
          </SelectTrigger>
          <SelectContent>
            {vendors?.map((vendor: any) => (
              <SelectItem key={vendor.id} value={vendor.id}>
                {vendor.nama_vendor}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {formData.id_vendor && vendors && (() => {
        const selectedVendor = vendors.find((v: any) => v.id === formData.id_vendor);
        if (!selectedVendor) return null;
        return (
          <div className="space-y-2 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium">Informasi Vendor Terpilih</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div><span className="font-medium">Nama:</span> {selectedVendor.nama_vendor}</div>
              <div><span className="font-medium">NPWP:</span> {selectedVendor.npwp || '-'}</div>
              <div className="md:col-span-2"><span className="font-medium">Alamat:</span> {selectedVendor.alamat || '-'}</div>
              <div><span className="font-medium">PIC:</span> {selectedVendor.pic_nama || '-'}</div>
              <div><span className="font-medium">Kontak PIC:</span> {selectedVendor.pic_kontak || '-'}</div>
              <div><span className="font-medium">Score:</span> {selectedVendor.score || 0}</div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};