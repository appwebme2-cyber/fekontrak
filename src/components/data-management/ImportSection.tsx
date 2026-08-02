import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { TemplateDownload } from "./TemplateDownload";
import { ImportProgress } from "./ImportProgress";
import { ImportPreview } from "./ImportPreview";
import { useImportData } from "./hooks/useImportData";
import { Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ImportType = 'kontrak' | 'tagihan' | 'vendor';

export function ImportSection() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importType, setImportType] = useState<ImportType | null>(null);
  
  const {
    previewData,
    errors,
    isProcessing,
    progress,
    processFile,
    executeImport,
    resetImport
  } = useImportData();

  const handleFileSelect = async (file: File, type: ImportType) => {
    setSelectedFile(file);
    setImportType(type);
    await processFile(file, type);
  };

  const handleImport = async () => {
    if (!selectedFile || !importType) return;
    await executeImport();
  };

  const resetState = () => {
    setSelectedFile(null);
    setImportType(null);
    resetImport();
  };

  const fileInputClass = "block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90";

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Pastikan format file sesuai dengan template yang disediakan. Data yang tidak valid akan diabaikan.
        </AlertDescription>
      </Alert>

      {/* Template Download */}
      <Card>
        <CardHeader>
          <CardTitle>Download Template</CardTitle>
        </CardHeader>
        <CardContent>
          <TemplateDownload />
        </CardContent>
      </Card>

      <Separator />

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload File</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Import Kontrak</h4>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file, 'kontrak');
                }}
                className={fileInputClass}
              />
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Import Tagihan</h4>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file, 'tagihan');
                }}
                className={fileInputClass}
              />
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Import Vendor</h4>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileSelect(file, 'vendor');
                }}
                className={fileInputClass}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview and Import */}
      {previewData && (
        <Card>
          <CardHeader>
            <CardTitle>Preview Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ImportPreview data={previewData} errors={errors} type={importType!} />
            
            <div className="flex gap-2">
              <Button 
                onClick={handleImport}
                disabled={isProcessing || errors.length > 0}
                className="flex items-center gap-2"
              >
                <Upload className="h-4 w-4" />
                Import Data
              </Button>
              <Button 
                variant="outline"
                onClick={resetState}
                disabled={isProcessing}
              >
                Reset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Import Progress */}
      {isProcessing && progress.total > 0 && (
        <Card>
          <CardContent className="p-6">
            <ImportProgress 
              current={progress.current}
              total={progress.total}
              status={progress.status}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}