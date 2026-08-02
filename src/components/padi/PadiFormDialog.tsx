import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useVendors } from "@/hooks/useVendors";
import { Padi, PadiFormData } from "@/types/padi";
import { format } from "date-fns";
import { DocumentUpload } from "./DocumentUpload";
import { PurchaseStatusTimeline } from "./PurchaseStatusTimeline";
import { purchaseStatusOptions } from "./constants/purchaseStatusOptions";
import { PadiDocument } from "@/lib/utils/typeUtils";
import { useToast } from "@/hooks/use-toast";

interface PadiFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: PadiFormData) => void;
  editingPadi?: Padi | null;
  isSubmitting?: boolean;
}

export const PadiFormDialog = ({
  open,
  onOpenChange,
  onSubmit,
  editingPadi,
  isSubmitting = false,
}: PadiFormDialogProps) => {
  const { vendors } = useVendors();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<PadiFormData & { dokumen_pendukung?: PadiDocument[] }>({
    no_pembelian: '',
    tanggal: '',
    judul_pembelian: '',
    no_po_pr: '',
    nilai: '',
    id_vendor: '',
    link_pembelian: '',
    bagian: '',
    status_purchase: 'BAST',
    tanggal_bast: '',
    tanggal_sa_gr: '',
    tanggal_invoice: '',
    tanggal_payment_approval: '',
    tanggal_paid: '',
    catatan_status: '',
    dokumen_pendukung: [],
  });

  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    if (editingPadi) {
      setFormData({
        no_pembelian: editingPadi.no_pembelian,
        tanggal: editingPadi.tanggal,
        judul_pembelian: editingPadi.judul_pembelian,
        no_po_pr: editingPadi.no_po_pr || '',
        nilai: editingPadi.nilai.toString(),
        id_vendor: editingPadi.id_vendor || '',
        link_pembelian: editingPadi.link_pembelian || '',
        bagian: editingPadi.bagian || '',
        status_purchase: editingPadi.status_purchase || 'BAST',
        tanggal_bast: editingPadi.tanggal_bast || '',
        tanggal_sa_gr: editingPadi.tanggal_sa_gr || '',
        tanggal_invoice: editingPadi.tanggal_invoice || '',
        tanggal_payment_approval: editingPadi.tanggal_payment_approval || '',
        tanggal_paid: editingPadi.tanggal_paid || '',
        catatan_status: editingPadi.catatan_status || '',
        dokumen_pendukung: editingPadi.dokumen_pendukung || [],
      });
    } else {
      setFormData({
        no_pembelian: '',
        tanggal: format(new Date(), 'yyyy-MM-dd'),
        judul_pembelian: '',
        no_po_pr: '',
        nilai: '',
        id_vendor: '',
        link_pembelian: '',
        bagian: '',
        status_purchase: 'BAST',
        tanggal_bast: '',
        tanggal_sa_gr: '',
        tanggal_invoice: '',
        tanggal_payment_approval: '',
        tanggal_paid: '',
        catatan_status: '',
        dokumen_pendukung: [],
      });
    }
  }, [editingPadi, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validasi manual supaya tidak diam-diam gagal saat tab beda
    if (!formData.no_pembelian?.trim()) {
      toast({ title: "Error", description: "No Pembelian harus diisi", variant: "destructive" });
      return;
    }
    if (!formData.tanggal) {
      toast({ title: "Error", description: "Tanggal harus diisi", variant: "destructive" });
      return;
    }
    if (!formData.judul_pembelian?.trim()) {
      toast({ title: "Error", description: "Judul Pembelian harus diisi", variant: "destructive" });
      return;
    }
    if (!formData.nilai || parseFloat(formData.nilai as string) <= 0) {
      toast({ title: "Error", description: "Nilai Transaksi harus diisi dan lebih dari 0", variant: "destructive" });
      return;
    }
    if (!formData.bagian) {
      toast({ title: "Error", description: "Bagian harus dipilih", variant: "destructive" });
      return;
    }

    onSubmit(formData);
  };

  const updateFormData = (field: keyof PadiFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStatusChange = (currentStatus: string, newStatus: string, updateFn: (field: string, value: any) => void) => {
    updateFn('status_purchase', newStatus);
    
    const statusDateMap = {
      'BAST': 'tanggal_bast',
      'SA/GR': 'tanggal_sa_gr', 
      'INVOICE': 'tanggal_invoice',
      'Payment Approval': 'tanggal_payment_approval',
      'Invoice Paid': 'tanggal_paid'
    } as const;
    
    const dateField = statusDateMap[newStatus as keyof typeof statusDateMap];
    if (dateField && !formData[dateField as keyof PadiFormData]) {
      updateFn(dateField, format(new Date(), 'yyyy-MM-dd'));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingPadi ? 'Edit Pembelian' : 'Tambah Pembelian Baru'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="basic">Data Dasar</TabsTrigger>
              <TabsTrigger value="status">Status & Progress</TabsTrigger>
              <TabsTrigger value="documents">Dokumen</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="no_pembelian">No Pembelian *</Label>
                  <Input
                    id="no_pembelian"
                    value={formData.no_pembelian}
                    onChange={(e) => updateFormData('no_pembelian', e.target.value)}
                    placeholder="PB-2024-001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tanggal">Tanggal *</Label>
                  <Input
                    id="tanggal"
                    type="date"
                    value={formData.tanggal}
                    onChange={(e) => updateFormData('tanggal', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="judul_pembelian">Judul Pembelian *</Label>
                <Input
                  id="judul_pembelian"
                  value={formData.judul_pembelian}
                  onChange={(e) => updateFormData('judul_pembelian', e.target.value)}
                  placeholder="Masukkan judul pembelian"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="no_po_pr">No PO/PR</Label>
                  <Input
                    id="no_po_pr"
                    value={formData.no_po_pr}
                    onChange={(e) => updateFormData('no_po_pr', e.target.value)}
                    placeholder="PO-001/2024"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nilai">Nilai Transaksi *</Label>
                  <Input
                    id="nilai"
                    type="number"
                    value={formData.nilai}
                    onChange={(e) => updateFormData('nilai', e.target.value)}
                    placeholder="15000000"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="id_vendor">Vendor</Label>
                  <Select value={formData.id_vendor} onValueChange={(value) => updateFormData('id_vendor', value)}>
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

                <div className="space-y-2">
                  <Label htmlFor="bagian">Bagian *</Label>
                  <Select value={formData.bagian} onValueChange={(value) => updateFormData('bagian', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih bagian" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MA5">MA5</SelectItem>
                      <SelectItem value="MA6">MA6</SelectItem>
                      <SelectItem value="MA7">MA7</SelectItem>
                      <SelectItem value="Workshop">Workshop</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="link_pembelian">Link Transaksi</Label>
                <Input
                  id="link_pembelian"
                  type="url"
                  value={formData.link_pembelian}
                  onChange={(e) => updateFormData('link_pembelian', e.target.value)}
                  placeholder="https://procurement.company.com/pb-001"
                />
              </div>
            </TabsContent>

            <TabsContent value="status" className="mt-4">
              <PurchaseStatusTimeline
                formData={formData}
                updateFormData={updateFormData}
                handleStatusChange={handleStatusChange}
              />
            </TabsContent>

            <TabsContent value="documents" className="mt-4">
              <DocumentUpload 
                formData={formData}
                updateFormData={(field, value) => setFormData(prev => ({ ...prev, [field]: value }))}
              />
            </TabsContent>
          </Tabs>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Batal
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Menyimpan...' : editingPadi ? 'Update' : 'Simpan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};