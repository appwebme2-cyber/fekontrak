import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { ClipboardList, Filter, RefreshCw, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { useDailyReport } from '@/hooks/useDailyReport';

const DISIPLIN_OPTIONS = ['Electrical', 'Instrument', 'Rotating', 'Stationary', 'Alat Berat', 'Tools'];
const DISIPLIN_GRADIENTS: Record<string, string> = {
  Electrical: 'from-blue-500 to-blue-600',
  Instrument: 'from-green-500 to-green-600',
  Rotating: 'from-purple-500 to-purple-600',
  Stationary: 'from-orange-500 to-orange-600',
  'Alat Berat': 'from-teal-500 to-teal-600',
  Tools: 'from-rose-500 to-rose-600',
};
const KATEGORI_OPTIONS = ['Corrective Maintenance', 'Preventive Maintenance', 'Plant Patrol', 'Progress', 'Challenge Session'];
const STATUS_OPTIONS   = ['Done', 'In Progress', 'Waiting Material', 'Pending'];
const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'done':             return 'bg-green-100 text-green-800 border-green-300';
    case 'in progress':      return 'bg-blue-100 text-blue-800 border-blue-300';
    case 'waiting material': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'pending':          return 'bg-gray-100 text-gray-800 border-gray-300';
    default:                 return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const getKategoriColor = (kategori: string) => {
  switch (kategori) {
    case 'Corrective Maintenance':  return 'bg-red-100 text-red-700';
    case 'Preventive Maintenance':  return 'bg-blue-100 text-blue-700';
    case 'Plant Patrol':            return 'bg-purple-100 text-purple-700';
    case 'Progress':                return 'bg-green-100 text-green-700';
    case 'Challenge Session':       return 'bg-orange-100 text-orange-700';
    default:                        return 'bg-gray-100 text-gray-700';
  }
};

const LaporanHarian = () => {
  const [filters, setFilters] = useState({
    disiplin: '',
    kategori: '',
    direksi: '',
    status: '',
    tanggal_dari: '',
    tanggal_sampai: '',
  });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const activeFilters = {
    disiplin:       filters.disiplin       || undefined,
    kategori:       filters.kategori       || undefined,
    direksi:        filters.direksi        || undefined,
    status:         filters.status         || undefined,
    tanggal_dari:   filters.tanggal_dari   || undefined,
    tanggal_sampai: filters.tanggal_sampai || undefined,
  };

  const { reports, isLoading, refetch } = useDailyReport(activeFilters);

  const filtered = reports.filter(r =>
    !search ||
    r.deskripsi?.toLowerCase().includes(search.toLowerCase()) ||
    r.tagNumber?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const resetFilters = () => {
    setFilters({ disiplin: '', kategori: '', status: '', tanggal_dari: '', tanggal_sampai: '', direksi: '' });
    setSearch('');
    setPage(1);
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(f => ({ ...f, [key]: value === 'all' ? '' : value }));
    setPage(1);
  };

  const formatDate = (val: string) => {
    if (!val) return '-';
    return new Date(val).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
  };

  const summary = reports.reduce((acc, r) => {
    acc[r.disiplin] = (acc[r.disiplin] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ClipboardList className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Laporan Harian</h1>
            <p className="text-sm text-gray-500">Data laporan kegiatan maintenance harian via WhatsApp</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={() => refetch()} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      {Object.keys(summary).length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
          {DISIPLIN_OPTIONS.map(d => (
            <Card key={d}
              className={`cursor-pointer hover:shadow-lg transition-shadow border-0 text-white bg-gradient-to-r ${DISIPLIN_GRADIENTS[d] ?? 'from-gray-500 to-gray-600'} ${filters.disiplin === d ? 'ring-2 ring-offset-2 ring-gray-700' : ''}`}
              onClick={() => handleFilterChange('disiplin', filters.disiplin === d ? 'all' : d)}>
              <CardContent className="p-3 text-center">
                <p className="text-xl font-bold text-white">{summary[d] || 0}</p>
                <p className="text-[11px] text-white/90 mt-0.5 leading-tight">{d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Filter */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <CardTitle className="text-base">Filter</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Cari deskripsi atau tag number..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="pl-9"
              />
            </div>

            <Select value={filters.disiplin} onValueChange={v => handleFilterChange('disiplin', v)}>
              <SelectTrigger><SelectValue placeholder="Semua Disiplin" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Disiplin</SelectItem>
                {DISIPLIN_OPTIONS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.kategori} onValueChange={v => handleFilterChange('kategori', v)}>
              <SelectTrigger><SelectValue placeholder="Semua Kategori" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Kategori</SelectItem>
                {KATEGORI_OPTIONS.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
              </SelectContent>
            </Select>

            <Select value={filters.direksi} onValueChange={v => handleFilterChange('direksi', v)}>
            <SelectTrigger><SelectValue placeholder="Semua Direksi" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Direksi</SelectItem>
              <SelectItem value="MA5">MA5</SelectItem>
              <SelectItem value="MA6">MA6</SelectItem>
              <SelectItem value="MA7">MA7</SelectItem>
              <SelectItem value="Workshop">Workshop</SelectItem>
            </SelectContent>
          </Select>

            <Select value={filters.status} onValueChange={v => handleFilterChange('status', v)}>
              <SelectTrigger><SelectValue placeholder="Semua Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Status</SelectItem>
                {STATUS_OPTIONS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
              </SelectContent>
            </Select>

          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Dari tanggal</label>
              <Input type="date" value={filters.tanggal_dari}
                onChange={e => { setFilters(f => ({ ...f, tanggal_dari: e.target.value })); setPage(1); }} />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-600 mb-1 block">Sampai tanggal</label>
              <Input type="date" value={filters.tanggal_sampai}
                onChange={e => { setFilters(f => ({ ...f, tanggal_sampai: e.target.value })); setPage(1); }} />
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            <p className="text-sm text-gray-500">
              Menampilkan <span className="font-semibold">{filtered.length}</span> dari {reports.length} data
            </p>
            <Button variant="ghost" size="sm" onClick={resetFilters}>Reset Filter</Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Belum ada data laporan</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left p-4 font-medium text-gray-600">Tanggal</th>
                      <th className="text-left p-4 font-medium text-gray-600">Disiplin</th>
                      <th className="text-left p-4 font-medium text-gray-600">Kategori</th>
                      <th className="text-left p-4 font-medium text-gray-600">Direksi</th>
                      <th className="text-left p-4 font-medium text-gray-600">Tag Number</th>
                      <th className="text-left p-4 font-medium text-gray-600">Deskripsi</th>
                      <th className="text-left p-4 font-medium text-gray-600">Status</th>
                      <th className="text-left p-4 font-medium text-gray-600">Catatan</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginated.map((r, i) => (
                      <tr key={r.idReport} className={`border-b hover:bg-gray-50 transition-colors ${i % 2 === 0 ? '' : 'bg-gray-50/30'}`}>
                        <td className="p-4 text-gray-700 whitespace-nowrap">{formatDate(r.tanggalLaporan)}</td>
                        <td className="p-4">
                          <Badge variant="outline" className="text-xs font-medium">{r.disiplin}</Badge>
                        </td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${getKategoriColor(r.kategori)}`}>
                            {r.kategori}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                            {r.direksi || '-'}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded">
                            {r.tagNumber || '-'}
                          </span>
                        </td>
                        <td className="p-4 text-gray-800 max-w-xs">{r.deskripsi}</td>
                        <td className="p-4">
                          <Badge className={`text-xs ${getStatusColor(r.statusPekerjaan)}`}>
                            {r.statusPekerjaan || '-'}
                          </Badge>
                        </td>
                        <td className="p-4 text-gray-500 text-xs max-w-xs">{r.catatan || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-4 py-3 border-t bg-gray-50">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Tampilkan</span>
                  <Select value={String(pageSize)} onValueChange={v => { setPageSize(Number(v)); setPage(1); }}>
                    <SelectTrigger className="w-16 h-8">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PAGE_SIZE_OPTIONS.map(s => <SelectItem key={s} value={String(s)}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <span>per halaman</span>
                </div>

                <div className="flex items-center gap-1">
                  <span className="text-sm text-gray-600 mr-2">
                    {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} dari {filtered.length}
                  </span>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                    onClick={() => setPage(1)} disabled={page === 1}>
                    «
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                    onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm px-3 py-1 bg-white border rounded">
                    {page} / {totalPages}
                  </span>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 w-8 p-0"
                    onClick={() => setPage(totalPages)} disabled={page === totalPages}>
                    »
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LaporanHarian;