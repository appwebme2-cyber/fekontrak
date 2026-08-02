
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Coins,
  Building2,
  FileText,
  Calendar,
  Target
} from 'lucide-react';
import { useContracts, useTagihans } from '@/hooks/useNewDatabase';
import { format, parseISO, differenceInDays } from 'date-fns';
import { id } from 'date-fns/locale';

const NewDashboard = () => {
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const { contracts: kontraks = [], isLoading: kontrakLoading } = useContracts();
  const { tagihans = [], isLoading: tagihanLoading } = useTagihans();

  // Calculate total contract value
  const totalContractValue = kontraks.reduce((sum, kontrak) => sum + (kontrak.nilai_awal || 0), 0);

  // Count contracts by type
  const contractTypeCounts = kontraks.reduce((counts, kontrak) => {
    counts[kontrak.tipe_kontrak] = (counts[kontrak.tipe_kontrak] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  // Count contracts by status
  const contractStatusCounts = kontraks.reduce((counts, kontrak) => {
    counts[kontrak.status_kontrak] = (counts[kontrak.status_kontrak] || 0) + 1;
    return counts;
  }, {} as Record<string, number>);

  // Calculate average KOM processing time
  const komProcessedContracts = kontraks.filter(kontrak => kontrak.tanggal_kom && kontrak.tanggal_spb_diterima);
  const totalKomProcessingDays = komProcessedContracts.reduce((sum, kontrak) => {
    const spbDiterima = parseISO(kontrak.tanggal_spb_diterima);
    const tanggalKom = parseISO(kontrak.tanggal_kom);
    return sum + differenceInDays(tanggalKom, spbDiterima);
  }, 0);
  const averageKomProcessingTime = komProcessedContracts.length > 0 ? totalKomProcessingDays / komProcessedContracts.length : 0;

  // Count overdue KOMs
  const overdueKoms = kontraks.filter(kontrak => kontrak.kom_terlambat);

  // Calculate total invoice value
  const totalInvoiceValue = tagihans.reduce((sum, tagihan) => sum + tagihan.nilai_tagihan, 0);

  if (kontrakLoading || tagihanLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Pantau semua metrik penting terkait kontrak</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Pilih Tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="Lumpsum">Lumpsum</SelectItem>
              <SelectItem value="Unit Price">Unit Price</SelectItem>
              <SelectItem value="LTSA">LTSA</SelectItem>
              <SelectItem value="TSA">TSA</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Pilih Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="Pre-KOM">Pre-KOM</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Terminated">Terminated</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Nilai Kontrak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {new Intl.NumberFormat('id-ID', { 
                style: 'currency', 
                currency: 'IDR',
                minimumFractionDigits: 0 
              }).format(totalContractValue)}
            </div>
            <p className="text-sm text-gray-500 mt-1">Total nilai dari semua kontrak</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Jumlah Kontrak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{kontraks.length}</div>
            <p className="text-sm text-gray-500 mt-1">Total kontrak yang terdaftar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Rata-rata Waktu KOM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{averageKomProcessingTime.toFixed(1)} hari</div>
            <p className="text-sm text-gray-500 mt-1">Rata-rata waktu dari SPB hingga KOM</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Nilai Tagihan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">
              {new Intl.NumberFormat('id-ID', { 
                style: 'currency', 
                currency: 'IDR',
                minimumFractionDigits: 0 
              }).format(totalInvoiceValue)}
            </div>
            <p className="text-sm text-gray-500 mt-1">Total nilai dari semua tagihan</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Kontrak Berdasarkan Tipe</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Object.entries(contractTypeCounts).map(([type, count]) => (
                <li key={type} className="flex items-center justify-between">
                  <span>{type}</span>
                  <Badge className="rounded-full px-2 py-0.5">{count as number}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Kontrak Berdasarkan Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {Object.entries(contractStatusCounts).map(([status, count]) => (
                <li key={status} className="flex items-center justify-between">
                  <span>{status}</span>
                  <Badge className="rounded-full px-2 py-0.5">{count as number}</Badge>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default NewDashboard;
