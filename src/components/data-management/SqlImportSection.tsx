import { useState, useRef, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Database, Upload, FileCode2, X, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

const API_BASE = "https://bekontrak-production.up.railway.app/api";
const MAX_SIZE_BYTES = 100 * 1024 * 1024;

function formatBytes(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Status = "idle" | "loading" | "success" | "error";

export function SqlImportSection() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const validateAndSet = (f: File) => {
    if (!f.name.toLowerCase().endsWith(".sql")) {
      setStatus("error");
      setMessage("Hanya file .sql yang diizinkan");
      return;
    }
    if (f.size > MAX_SIZE_BYTES) {
      setStatus("error");
      setMessage("Ukuran file maksimal 100 MB");
      return;
    }
    setFile(f);
    setStatus("idle");
    setMessage(null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) validateAndSet(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setStatus("loading");
    setMessage(null);
    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch(`${API_BASE}/databaseexport/import`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token ?? ""}` },
        body: formData,
      });
      const result = await res.json().catch(() => ({ message: null }));
      if (res.ok) {
        setStatus("success");
        setMessage(result.message ?? "Import berhasil");
        setFile(null);
        if (inputRef.current) inputRef.current.value = "";
      } else {
        setStatus("error");
        setMessage(result.message ?? `Import gagal (${res.status})`);
      }
    } catch {
      setStatus("error");
      setMessage("Koneksi gagal. Pastikan tidak menutup tab selama proses berlangsung.");
    }
  };

  const reset = () => {
    setFile(null);
    setStatus("idle");
    setMessage(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 p-4 space-y-3">
      <div className="flex items-center gap-2">
        <Database className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Import Database SQL</span>
      </div>
      <p className="text-xs text-muted-foreground">
        Upload file <code>.sql</code> untuk mengimpor seluruh isi database. Proses bisa memakan waktu
        beberapa menit untuk data besar — <strong>jangan tutup tab ini</strong> selama proses berlangsung.
      </p>

      {/* Drop zone */}
      {!file && status !== "success" && status !== "loading" && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed p-6 cursor-pointer transition-colors select-none
            ${isDragging
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/30 hover:border-primary/60 hover:bg-muted/50"
            }`}
        >
          <Upload className="h-7 w-7 text-muted-foreground" />
          <p className="text-sm text-muted-foreground text-center">
            Drag &amp; drop file <code>.sql</code> ke sini, atau klik untuk memilih
          </p>
          <p className="text-xs text-muted-foreground">Maks. 100 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept=".sql"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) validateAndSet(f);
            }}
          />
        </div>
      )}

      {/* File info */}
      {file && status !== "loading" && (
        <div className="flex items-center justify-between rounded-md border bg-background px-3 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <FileCode2 className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="text-sm truncate">{file.name}</span>
            <span className="text-xs text-muted-foreground shrink-0">({formatBytes(file.size)})</span>
          </div>
          <button
            onClick={reset}
            className="ml-2 shrink-0 text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Loading */}
      {status === "loading" && (
        <div className="flex items-center gap-3 rounded-md border bg-background px-3 py-3">
          <Loader2 className="h-4 w-4 animate-spin text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium">Mengimpor database…</p>
            <p className="text-xs text-muted-foreground">
              Jangan tutup tab ini. Proses bisa memakan waktu beberapa menit.
            </p>
          </div>
        </div>
      )}

      {/* Success */}
      {status === "success" && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <Alert variant="destructive" className="py-2">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="text-xs">{message}</AlertDescription>
        </Alert>
      )}

      {/* Action buttons */}
      {file && status !== "loading" && status !== "success" && (
        <div className="flex gap-2">
          <Button size="sm" onClick={handleImport} className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            Import Database
          </Button>
          <Button size="sm" variant="ghost" onClick={reset}>
            Batal
          </Button>
        </div>
      )}

      {status === "success" && (
        <Button size="sm" variant="outline" onClick={reset} className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Import File Lain
        </Button>
      )}
    </div>
  );
}
