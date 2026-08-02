import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { ExportSection } from "@/components/data-management/ExportSection";
import { ImportSection } from "@/components/data-management/ImportSection";
import { Download, Upload } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function DataManagement() {
  const { userProfile } = useAuth();

  if (userProfile?.role !== "admin") {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Akses Ditolak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Anda tidak memiliki akses untuk mengelola data. Hanya administrator yang dapat
              mengakses halaman ini.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Manajemen Data</h1>
        <p className="text-muted-foreground">
          Export dan import data kontrak serta tagihan dalam format Excel
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="export" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="export" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </TabsTrigger>
          <TabsTrigger value="import" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Data ke Excel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExportSection />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="import" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Import Data dari Excel
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ImportSection />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}