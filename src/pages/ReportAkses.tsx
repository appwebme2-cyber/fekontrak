import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ClipboardList, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { useLogAkses, LogAksesFilter } from '@/hooks/useLogAkses';
import { formatDate } from '@/lib/utils/formatters';

const MENU_OPTIONS = [
  'Kontrak', 'Tagihan', 'Vendor', 'User Purchase (PADI)',
  'Approval Dokumen', 'Amandemen', 'Progress Lumpsum',
  'Progress Unit Price', 'Monitoring LTSA', 'Laporan Harian',
  'Konfigurasi Sistem', 'SLA Setting', 'Auth',
];

const ACTIVITY_OPTIONS = ['Login', 'Logout', 'Lihat', 'Tambah', 'Ubah', 'Hapus'];

const ACTIVITY_COLOR: Record<string, string> = {
  Login:  'bg-green-100 text-green-800',
  Logout: 'bg-gray-100 text-gray-700',
  Lihat:  'bg-blue-100 text-blue-800',
  Tambah: 'bg-emerald-100 text-emerald-800',
  Ubah:   'bg-amber-100 text-amber-800',
  Hapus:  'bg-red-100 text-red-800',
};

const PAGE_SIZE = 50;

const ReportAkses: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<Omit<LogAksesFilter, 'page' | 'pageSize'>>({});
  const [draft, setDraft] = useState<typeof filter>({});

  const { data, isLoading } = useLogAkses({ ...filter, page, pageSize: PAGE_SIZE });

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 1;

  const applyFilter = () => {
    setFilter(draft);
    setPage(1);
  };

  const resetFilter = () => {
    setDraft({});
    setFilter({});
    setPage(1);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ClipboardList className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Report Akses</h1>
          <p className="text-sm text-muted-foreground">
            Riwayat aktivitas pengguna berdasarkan menu dan tipe aksi
          </p>
        </div>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <Input
              placeholder="Nama user..."
              value={draft.userId ?? ''}
              onChange={(e) => setDraft((p) => ({ ...p, userId: e.target.value || undefined }))}
            />

            <Select
              value={draft.menu ?? 'all'}
              onValueChange={(v) => setDraft((p) => ({ ...p, menu: v === 'all' ? undefined : v }))}
            >
              <SelectTrigger><SelectValue placeholder="Semua menu" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua menu</SelectItem>
                {MENU_OPTIONS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select
              value={draft.activity ?? 'all'}
              onValueChange={(v) => setDraft((p) => ({ ...p, activity: v === 'all' ? undefined : v }))}
            >
              <SelectTrigger><SelectValue placeholder="Semua aktivitas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua aktivitas</SelectItem>
                {ACTIVITY_OPTIONS.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
              </SelectContent>
            </Select>

            <Input
              type="date"
              value={draft.dari ?? ''}
              onChange={(e) => setDraft((p) => ({ ...p, dari: e.target.value || undefined }))}
            />
            <Input
              type="date"
              value={draft.sampai ?? ''}
              onChange={(e) => setDraft((p) => ({ ...p, sampai: e.target.value || undefined }))}
            />
          </div>
          <div className="flex gap-2 mt-3">
            <Button onClick={applyFilter} size="sm">Terapkan</Button>
            <Button onClick={resetFilter} size="sm" variant="outline" className="flex items-center gap-1">
              <RotateCcw className="h-3 w-3" /> Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabel */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">
              {isLoading ? 'Memuat...' : `${data?.total ?? 0} entri`}
            </CardTitle>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Button
                size="sm" variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span>Hal {page} / {totalPages}</span>
              <Button
                size="sm" variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Waktu</TableHead>
                  <TableHead>Nama User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Menu</TableHead>
                  <TableHead>Aktivitas</TableHead>
                  <TableHead className="hidden md:table-cell">Detail</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && !data?.items.length && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data log
                    </TableCell>
                  </TableRow>
                )}
                {data?.items.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric',
                        hour: '2-digit', minute: '2-digit',
                      })}
                    </TableCell>
                    <TableCell className="font-medium">{log.namaUser}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs capitalize">{log.role}</Badge>
                    </TableCell>
                    <TableCell className="text-sm">{log.menu}</TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${ACTIVITY_COLOR[log.activity] ?? 'bg-gray-100 text-gray-700'}`}>
                        {log.activity}
                      </span>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground">
                      {log.detail}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportAkses;
