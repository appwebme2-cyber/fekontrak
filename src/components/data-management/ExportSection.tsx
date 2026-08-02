import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ExportFieldSelector } from "./ExportFieldSelector";
import { useExportData } from "./hooks/useExportData";
import { FileDown, FileSpreadsheet } from "lucide-react";

export function ExportSection() {
  const [selectedContractFields, setSelectedContractFields] = useState<string[]>([
    "judul_kontrak",
    "tipe_kontrak", 
    "status_kontrak",
    "nilai_awal"
  ]);
  
  const [selectedInvoiceFields, setSelectedInvoiceFields] = useState<string[]>([
    "nomor_tagihan",
    "tanggal_tagihan",
    "tipe_kontrak",
    "nilai_tagihan"
  ]);

  const [selectedVendorFields, setSelectedVendorFields] = useState<string[]>([
    "nama_vendor",
    "status_vendor",
    "pic_nama",
    "pic_kontak"
  ]);

  const { exportContracts, exportInvoices, exportVendors, isExporting } = useExportData();

  const handleExportContracts = async (format: 'excel' | 'csv') => {
    await exportContracts(selectedContractFields, format);
  };

  const handleExportInvoices = async (format: 'excel' | 'csv') => {
    await exportInvoices(selectedInvoiceFields, format);
  };

  const handleExportVendors = async (format: 'excel' | 'csv') => {
    await exportVendors(selectedVendorFields, format);
  };

  return (
    <div className="space-y-6">
      {/* Export Kontrak */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data Kontrak</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExportFieldSelector
            type="kontrak"
            selectedFields={selectedContractFields}
            onFieldsChange={setSelectedContractFields}
          />
          
          <Separator />
          
          <div className="flex gap-2">
            <Button 
              onClick={() => handleExportContracts('excel')}
              disabled={isExporting || selectedContractFields.length === 0}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export ke Excel
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleExportContracts('csv')}
              disabled={isExporting || selectedContractFields.length === 0}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Export ke CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Tagihan */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data Tagihan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExportFieldSelector
            type="tagihan"
            selectedFields={selectedInvoiceFields}
            onFieldsChange={setSelectedInvoiceFields}
          />
          
          <Separator />
          
          <div className="flex gap-2">
            <Button 
              onClick={() => handleExportInvoices('excel')}
              disabled={isExporting || selectedInvoiceFields.length === 0}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export ke Excel
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleExportInvoices('csv')}
              disabled={isExporting || selectedInvoiceFields.length === 0}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Export ke CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Vendor */}
      <Card>
        <CardHeader>
          <CardTitle>Export Data Vendor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ExportFieldSelector
            type="vendor"
            selectedFields={selectedVendorFields}
            onFieldsChange={setSelectedVendorFields}
          />
          
          <Separator />
          
          <div className="flex gap-2">
            <Button 
              onClick={() => handleExportVendors('excel')}
              disabled={isExporting || selectedVendorFields.length === 0}
              className="flex items-center gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Export ke Excel
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleExportVendors('csv')}
              disabled={isExporting || selectedVendorFields.length === 0}
              className="flex items-center gap-2"
            >
              <FileDown className="h-4 w-4" />
              Export ke CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}