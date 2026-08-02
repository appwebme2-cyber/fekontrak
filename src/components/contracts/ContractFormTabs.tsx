import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ContractBasicInfo } from './ContractBasicInfo';
import { ContractDetails } from './ContractDetails';
import { ContractVendorForm } from './ContractVendorForm';
import { ContractProgress } from './ContractProgress';
import { ContractDocumentsTab } from './ContractDocumentsTab';
import { FileText, Building2, Users, TrendingUp, Upload } from 'lucide-react';

interface ContractFormTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  formData: any;
  setFormData: (data: any) => void;
  isBasicValid: boolean;
  isTechnicalValid: boolean;
  isVendorValid: boolean;
  isProgressValid: boolean;
  contractId?: string;
}

export const ContractFormTabs = ({
  activeTab,
  setActiveTab,
  formData,
  setFormData,
  isBasicValid,
  isTechnicalValid,
  isVendorValid,
  isProgressValid,
  contractId
}: ContractFormTabsProps) => {

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
      <TabsList className="grid w-full grid-cols-5 mb-4 flex-shrink-0">
        <TabsTrigger value="basic" className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4" />
          Informasi Umum
          {isBasicValid && <div className="w-2 h-2 bg-green-500 rounded-full ml-1" />}
        </TabsTrigger>
        <TabsTrigger value="technical" className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4" />
          Detail Teknis
          {isTechnicalValid && <div className="w-2 h-2 bg-green-500 rounded-full ml-1" />}
        </TabsTrigger>
        <TabsTrigger value="vendor" className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          Vendor & PIC
          {isVendorValid && <div className="w-2 h-2 bg-green-500 rounded-full ml-1" />}
        </TabsTrigger>
        <TabsTrigger value="progress" className="flex items-center gap-2 text-sm">
          <TrendingUp className="h-4 w-4" />
          Progress
          {isProgressValid && <div className="w-2 h-2 bg-green-500 rounded-full ml-1" />}
        </TabsTrigger>
        <TabsTrigger value="documents" className="flex items-center gap-2 text-sm">
          <Upload className="h-4 w-4" />
          Dokumen
        </TabsTrigger>
      </TabsList>

      <div className="flex-1 overflow-hidden">
        <TabsContent value="basic" className="mt-0 h-full">
          <ScrollArea className="h-[calc(70vh-120px)]">
            <div className="p-1 pr-4">
              <ContractBasicInfo formData={formData} setFormData={setFormData} />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="technical" className="mt-0 h-full">
          <ScrollArea className="h-[calc(70vh-120px)]">
            <div className="p-1 pr-4 space-y-6">
              <ContractDetails formData={formData} setFormData={setFormData} />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="vendor" className="mt-0 h-full">
          <ScrollArea className="h-[calc(70vh-120px)]">
            <div className="p-1 pr-4 space-y-6">
              <ContractVendorForm formData={formData} setFormData={setFormData} />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="progress" className="mt-0 h-full">
          <ScrollArea className="h-[calc(70vh-120px)]">
            <div className="p-1 pr-4 space-y-6">
              <ContractProgress formData={formData} setFormData={setFormData} />
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="documents" className="mt-0 h-full">
          <ScrollArea className="h-[calc(70vh-120px)]">
            <div className="p-1 pr-4 space-y-6">
              <ContractDocumentsTab formData={formData} setFormData={setFormData} />
            </div>
          </ScrollArea>
        </TabsContent>
      </div>
    </Tabs>
  );
};