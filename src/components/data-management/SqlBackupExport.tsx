import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, CheckCircle2, Loader2 } from "lucide-react";
import { fetchWithAuth } from "@/lib/api";

export function SqlBackupExport() {
  const [isLoading, setIsLoading] = useState(false);
  const [exported, setExported] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchWithAuth("/databaseexport/download");
      if (!res.ok) throw new Error(`Gagal export (${res.status})`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_${new Date().toISOString().slice(0, 10)}.sql`;
      a.click();
      URL.revokeObjectURL(url);
      setExported(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal export backup");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Backup Database SQL</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Unduh seluruh isi database dalam format <code>.sql</code>. Gunakan untuk keperluan backup atau migrasi data.
      </p>

      {error && (
        <Alert variant="destructive" className="py-2">
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
      )}

      {exported ? (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4" />
          Backup berhasil diunduh
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Database className="h-4 w-4" />
          )}
          {isLoading ? "Mengunduh…" : "Export Backup SQL"}
        </Button>
      )}
    </div>
  );
}
