import { Button } from "@/components/ui/button";
import { useTemplateGenerator } from "./hooks/useTemplateGenerator";
import { Download } from "lucide-react";

export function TemplateDownload() {
  const { generateContractTemplate, generateInvoiceTemplate, generateVendorTemplate, isGenerating } = useTemplateGenerator();

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Download template Excel untuk memudahkan import data. Template sudah dilengkapi dengan format yang sesuai dan contoh data.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          variant="outline"
          onClick={generateContractTemplate}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Template Kontrak
        </Button>
        
        <Button 
          variant="outline"
          onClick={generateInvoiceTemplate}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Template Tagihan
        </Button>

        <Button 
          variant="outline"
          onClick={generateVendorTemplate}
          disabled={isGenerating}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Template Vendor
        </Button>
      </div>
    </div>
  );
}