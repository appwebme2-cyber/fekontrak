import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";

interface ImportError {
  row: number;
  field: string;
  message: string;
}

interface ImportPreviewProps {
  data: any[];
  errors: ImportError[];
  type: 'kontrak' | 'tagihan' | 'vendor';
}

export function ImportPreview({ data, errors, type }: ImportPreviewProps) {
  const validRows = data.length - errors.filter(e => e.field === 'general').length;
  const invalidRows = data.length - validRows;

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold">{data.length}</div>
          <div className="text-sm text-muted-foreground">Total Baris</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{validRows}</div>
          <div className="text-sm text-muted-foreground">Valid</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{invalidRows}</div>
          <div className="text-sm text-muted-foreground">Error</div>
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-1">
              <div className="font-medium">Ditemukan {errors.length} error:</div>
              {errors.slice(0, 5).map((error, index) => (
                <div key={index} className="text-sm">
                  Baris {error.row}: {error.field} - {error.message}
                </div>
              ))}
              {errors.length > 5 && (
                <div className="text-sm">Dan {errors.length - 5} error lainnya...</div>
              )}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Success message */}
      {errors.length === 0 && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Semua data valid dan siap untuk diimport!
          </AlertDescription>
        </Alert>
      )}

      {/* Data Preview */}
      <div className="border rounded-lg">
        <div className="p-4 border-b">
          <h4 className="font-medium">Preview Data (10 baris pertama)</h4>
        </div>
        
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Baris</TableHead>
              {type === 'kontrak' ? (
                <>
                  <TableHead>Judul Kontrak</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Nilai</TableHead>
                  <TableHead>Status</TableHead>
                </>
              ) : type === 'tagihan' ? (
                <>
                  <TableHead>Nomor Tagihan</TableHead>
                  <TableHead>Kontrak</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Nilai</TableHead>
                  <TableHead>Status</TableHead>
                </>
              ) : (
                <>
                  <TableHead>Nama Vendor</TableHead>
                  <TableHead>NPWP</TableHead>
                  <TableHead>PIC</TableHead>
                  <TableHead>Kontak</TableHead>
                  <TableHead>Status Vendor</TableHead>
                </>
              )}
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.slice(0, 10).map((row, index) => {
              const rowErrors = errors.filter(e => e.row === index + 1);
              const hasError = rowErrors.length > 0;
              
              return (
                <TableRow key={index}>
                  <TableCell>{index + 1}</TableCell>
                  {type === 'kontrak' ? (
                    <>
                      <TableCell>{row['Judul Kontrak'] || '-'}</TableCell>
                      <TableCell>{row['Tipe Kontrak'] || '-'}</TableCell>
                      <TableCell>{row['Nama Vendor'] || '-'}</TableCell>
                      <TableCell>{row['Nilai Awal'] ? `Rp ${Number(row['Nilai Awal']).toLocaleString('id-ID')}` : '-'}</TableCell>
                      <TableCell>{row['Status Kontrak'] || 'Pre-KOM'}</TableCell>
                    </>
                  ) : type === 'tagihan' ? (
                    <>
                      <TableCell>{row['Nomor Tagihan'] || '-'}</TableCell>
                      <TableCell>{row['Judul Kontrak'] || '-'}</TableCell>
                      <TableCell>{row['Tanggal Tagihan'] || '-'}</TableCell>
                      <TableCell>{row['Nilai Tagihan'] ? `Rp ${Number(row['Nilai Tagihan']).toLocaleString('id-ID')}` : '-'}</TableCell>
                      <TableCell>{row['Status Tagihan'] || 'Punchlist'}</TableCell>
                    </>
                  ) : (
                    <>
                      <TableCell>{row['Nama Vendor'] || '-'}</TableCell>
                      <TableCell>{row['NPWP'] || '-'}</TableCell>
                      <TableCell>{row['Nama PIC'] || '-'}</TableCell>
                      <TableCell>{row['Kontak PIC'] || '-'}</TableCell>
                      <TableCell>{row['Status Vendor'] || '-'}</TableCell>
                    </>
                  )}
                  <TableCell>
                    <Badge variant={hasError ? "destructive" : "default"}>
                      {hasError ? "Error" : "Valid"}
                    </Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}