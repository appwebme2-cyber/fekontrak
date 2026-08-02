import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Search, Coins, ArrowUpDown } from 'lucide-react';
import { useContracts } from '@/hooks/useContracts';
import { useQuery } from '@tanstack/react-query';
//import { supabase } from '@/integrations/supabase/client';
import { usePagination } from '@/hooks/usePagination';
import { ContractsPagination } from '@/components/dashboard/components/ContractsPagination';
import { format } from 'date-fns';
import { id as idLocale } from 'date-fns/locale';

interface AmendmentRow {
  id_amandemen: string;
  id_kontrak: string;
  nomor_urut: number;
  no_amandemen?: string | null;
  tanggal_amandemen?: string | null;
  jenis_amandemen?: string | null;
  nilai_kontrak_baru?: number | null;
  durasi_amandemen?: number | null;
  tanggal_selesai_baru?: string | null;
  alasan_perubahan?: string | null;
  // joined from kontrak
  judul_kontrak?: string;
  no_dokumen_kontrak?: string;
  tipe_kontrak?: string;
  direksi_pekerjaan?: string;
  nilai_awal?: number;
}

const Amandemen = () => {
  const navigate = useNavigate();
  const { contracts, isLoading: isLoadingContracts } = useContracts();
  const [searchQuery, setSearchQuery] = useState('');
  const [direksiFilter, setDireksiFilter] = useState('all');
  const [tipeKontrakFilter, setTipeKontrakFilter] = useState('all');
  const [jenisAmandemenFilter, setJenisAmandemenFilter] = useState('all');




  const API_URL = "https://bekontrak-production.up.railway.app/api";

const { data: allAmendments = [], isLoading: isLoadingAmendments } = useQuery({
  queryKey: ['all_amandemen_kontrak'],
  queryFn: async () => {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/amandemen/all`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    const data = await res.json();

    if (!res.ok) throw new Error("Gagal ambil semua amandemen");

    return data.map((a: any) => ({
  id_amandemen: a.idAmandemen,
  id_kontrak: a.idKontrak,
  nomor_urut: a.nomorUrut,
  no_amandemen: a.noAmandemen,
  tanggal_amandemen: a.tanggalAmandemen,
  jenis_amandemen: a.jenisAmandemen,
  nilai_kontrak_baru: a.nilaiKontrakBaru,
  durasi_amandemen: a.durasiAmandemen,
  tanggal_selesai_baru: a.tanggalSelesaiBaru,
  alasan_perubahan: a.alasanPerubahan,
}));

  },
});

  // Combine amendments with contract data
  const enrichedAmendments = useMemo<AmendmentRow[]>(() => {
    if (!contracts || !allAmendments) return [];
    const contractMap = new Map(contracts.map((c: any) => [c.id_kontrak, c]));
    return allAmendments.map((a: any) => {
      const contract = contractMap.get(a.id_kontrak) as any;
      return {
        ...a,
        judul_kontrak: contract?.judul_kontrak || '',
        no_dokumen_kontrak: contract?.no_dokumen_kontrak || '',
        tipe_kontrak: contract?.tipe_kontrak || '',
        direksi_pekerjaan: contract?.direksi_pekerjaan || '',
        nilai_awal: contract?.nilai_awal || 0,
      };
    });
  }, [contracts, allAmendments]);

  const direksiOptions = useMemo(() => {
    const unique = new Set(enrichedAmendments.map(a => a.direksi_pekerjaan).filter(Boolean));
    return Array.from(unique).sort() as string[];
  }, [enrichedAmendments]);

  const filteredAmendments = useMemo(() => {
    return enrichedAmendments.filter(a => {
      const matchSearch = !searchQuery ||
        a.judul_kontrak?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.no_dokumen_kontrak?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.no_amandemen?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDireksi = direksiFilter === 'all' || a.direksi_pekerjaan === direksiFilter;
      const matchTipe = tipeKontrakFilter === 'all' || a.tipe_kontrak === tipeKontrakFilter;
      const matchJenis = jenisAmandemenFilter === 'all' || a.jenis_amandemen === jenisAmandemenFilter;
      return matchSearch && matchDireksi && matchTipe && matchJenis;
    });
  }, [enrichedAmendments, searchQuery, direksiFilter, tipeKontrakFilter, jenisAmandemenFilter]);

  const { currentPage, pageSize, totalPages, paginatedData, setCurrentPage, setPageSize, canGoToPrevious, canGoToNext } = usePagination({
    data: filteredAmendments,
    initialPageSize: 10,
  });

  const formatCurrency = (value: number | null | undefined) => {
    if (!value) return '-';
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);
  };

  const formatDate = (date: string | null | undefined) => {
    if (!date) return '-';
    try { return format(new Date(date), 'dd MMM yyyy', { locale: idLocale }); } catch { return '-'; }
  };

  const getJenisAmandemenBadge = (jenis: string | null | undefined) => {
    if (!jenis) return <Badge variant="outline">-</Badge>;
    const colorMap: Record<string, string> = {
      'Nilai': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      'Waktu': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      'Nilai dan Waktu': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    };
    return <Badge className={colorMap[jenis] || ''}>{jenis}</Badge>;
  };

  // Unique contracts count
  const uniqueContracts = new Set(filteredAmendments.map(a => a.id_kontrak)).size;
  const totalNilaiBaru = filteredAmendments.reduce((sum, a) => sum + (a.nilai_kontrak_baru || 0), 0);
  const startItem = (currentPage - 1) * pageSize;

  const isLoading = isLoadingContracts || isLoadingAmendments;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-muted animate-pulse rounded-lg" />)}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-lg" />
      </div>
    );
  }

  return (
   <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Amandemen Kontrak</h1>
        <p className="text-muted-foreground">Daftar seluruh amandemen dari semua kontrak</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/90">Total Amandemen</p>
                <p className="text-2xl font-bold">{filteredAmendments.length}</p>
                <p className="text-xs text-white/75">dari {uniqueContracts} kontrak</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <Coins className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/90">Total Nilai Baru</p>
                <p className="text-lg font-bold">{formatCurrency(totalNilaiBaru)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-white/20">
                <ArrowUpDown className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-white/90">Jenis Amandemen</p>
                <div className="flex gap-1 mt-1">
                  <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                    Nilai: {filteredAmendments.filter(a => a.jenis_amandemen === 'Nilai').length}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                    Waktu: {filteredAmendments.filter(a => a.jenis_amandemen === 'Waktu').length}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-white/20 text-white border-white/30">
                    N&W: {filteredAmendments.filter(a => a.jenis_amandemen === 'Nilai dan Waktu').length}
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari judul kontrak, nomor dokumen, atau nomor amandemen..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="pl-10"
              />
            </div>
            <Select value={direksiFilter} onValueChange={(v) => { setDireksiFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Direksi Pekerjaan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Direksi</SelectItem>
                {direksiOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
              </SelectContent>
            </Select>
            <Select value={tipeKontrakFilter} onValueChange={(v) => { setTipeKontrakFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tipe Kontrak" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="Lumpsum">Lumpsum</SelectItem>
                <SelectItem value="Unit Price">Unit Price</SelectItem>
                <SelectItem value="TSA">TSA</SelectItem>
                <SelectItem value="LTSA">LTSA</SelectItem>
                <SelectItem value="TSA/LTSA">TSA/LTSA</SelectItem>
              </SelectContent>
            </Select>
            <Select value={jenisAmandemenFilter} onValueChange={(v) => { setJenisAmandemenFilter(v); setCurrentPage(1); }}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Jenis Amandemen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Jenis</SelectItem>
                <SelectItem value="Nilai">Nilai</SelectItem>
                <SelectItem value="Waktu">Waktu</SelectItem>
                <SelectItem value="Nilai dan Waktu">Nilai dan Waktu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px]">No</TableHead>
                  <TableHead>Judul Kontrak</TableHead>
                  <TableHead>Amandemen Ke</TableHead>
                  <TableHead>No. Amandemen</TableHead>
                  <TableHead>Tipe</TableHead>
                  <TableHead>Jenis</TableHead>
                  <TableHead>Direksi</TableHead>
                  <TableHead>Tgl Amandemen</TableHead>
                  <TableHead className="text-right">Nilai Baru</TableHead>
                  <TableHead>Durasi</TableHead>
                  <TableHead>Alasan</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={11} className="text-center py-10 text-muted-foreground">
                      {enrichedAmendments.length === 0
                        ? 'Belum ada amandemen kontrak'
                        : 'Tidak ada data yang sesuai filter'}
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedData.map((row: any, index: number) => (
                    <TableRow
                      key={row.id_amandemen}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/contracts/${row.id_kontrak}`)}
                    >
                      <TableCell className="text-muted-foreground">{startItem + index + 1}</TableCell>
                      <TableCell className="font-medium max-w-[250px] truncate">{row.judul_kontrak}</TableCell>
                      <TableCell>
                        <Badge variant="outline">#{row.nomor_urut}</Badge>
                      </TableCell>
                      <TableCell>{row.no_amandemen || '-'}</TableCell>
                      <TableCell><Badge variant="outline">{row.tipe_kontrak}</Badge></TableCell>
                      <TableCell>{getJenisAmandemenBadge(row.jenis_amandemen)}</TableCell>
                      <TableCell className="text-sm">{row.direksi_pekerjaan || '-'}</TableCell>
                      <TableCell className="text-sm">{formatDate(row.tanggal_amandemen)}</TableCell>
                      <TableCell className="text-right text-sm font-medium">{formatCurrency(row.nilai_kontrak_baru)}</TableCell>
                      <TableCell className="text-sm">
                        {row.durasi_amandemen ? `${row.durasi_amandemen} hari` : '-'}
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate">{row.alasan_perubahan || '-'}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {filteredAmendments.length > 0 && (
        <ContractsPagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={filteredAmendments.length}
          onPageChange={setCurrentPage}
          onPageSizeChange={(size) => { setPageSize(size); setCurrentPage(1); }}
          canGoToPrevious={canGoToPrevious}
          canGoToNext={canGoToNext}
        />
      )}
    </div>
  );
};

export default Amandemen;
