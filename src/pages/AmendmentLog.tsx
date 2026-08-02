
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, Edit, Trash2, FileText, Calendar, TrendingUp } from 'lucide-react';

const AmendmentLog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Mock data for amendments
  const amendments = [
    {
      id: '1',
      contract_title: 'Pemeliharaan Server PT ABC',
      amendment_number: 'AMD-001/2024',
      type: 'Add Value',
      value_change: 50000000,
      time_change: null,
      date: '2024-01-15',
      reason: 'Penambahan scope pekerjaan maintenance hardware tambahan',
      status: 'approved'
    },
    {
      id: '2',
      contract_title: 'Instalasi Jaringan PT XYZ',
      amendment_number: 'AMD-002/2024',
      type: 'Extend Time',
      value_change: null,
      time_change: 30,
      date: '2024-01-20',
      reason: 'Keterlambatan pengiriman perangkat dari vendor',
      status: 'pending'
    },
    {
      id: '3',
      contract_title: 'Support System Banking',
      amendment_number: 'AMD-003/2024',
      type: 'Reduce Value',
      value_change: -25000000,
      time_change: null,
      date: '2024-02-01',
      reason: 'Pengurangan scope pekerjaan sesuai permintaan klien',
      status: 'approved'
    }
  ];

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'Add Value':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Tambah Nilai</Badge>;
      case 'Reduce Value':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Kurangi Nilai</Badge>;
      case 'Extend Time':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Perpanjang Waktu</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Disetujui</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Menunggu</Badge>;
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Ditolak</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatCurrency = (amount: number | null) => {
    if (!amount) return '-';
    const isNegative = amount < 0;
    const absoluteAmount = Math.abs(amount);
    const formatted = new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(absoluteAmount);
    
    return isNegative ? `-${formatted}` : `+${formatted}`;
  };

  const filteredAmendments = amendments.filter(amendment => {
    const matchesSearch = amendment.contract_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         amendment.amendment_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || amendment.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const totalAmendments = amendments.length;
  const addValueAmendments = amendments.filter(a => a.type === 'Add Value').length;
  const reduceValueAmendments = amendments.filter(a => a.type === 'Reduce Value').length;
  const extendTimeAmendments = amendments.filter(a => a.type === 'Extend Time').length;

  // Calculate total value impact
  const totalValueImpact = amendments.reduce((sum, amendment) => {
    return sum + (amendment.value_change || 0);
  }, 0);

  return (
    <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Log Amandemen</h1>
          <p className="text-gray-600">Kelola dan pantau semua amandemen kontrak</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg">
          <Plus className="mr-2 h-4 w-4" />
          Tambah Amandemen
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Amandemen</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalAmendments}</div>
            <p className="text-xs text-muted-foreground">Semua amandemen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tambah Nilai</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{addValueAmendments}</div>
            <p className="text-xs text-muted-foreground">Penambahan nilai</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Kurangi Nilai</CardTitle>
            <TrendingUp className="h-4 w-4 text-red-600 transform rotate-180" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{reduceValueAmendments}</div>
            <p className="text-xs text-muted-foreground">Pengurangan nilai</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Perpanjang Waktu</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{extendTimeAmendments}</div>
            <p className="text-xs text-muted-foreground">Perpanjangan waktu</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dampak Nilai</CardTitle>
            <div className={`h-4 w-4 rounded-full ${totalValueImpact >= 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalValueImpact >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(totalValueImpact)}
            </div>
            <p className="text-xs text-muted-foreground">Total dampak nilai</p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Pencarian & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Cari amandemen berdasarkan kontrak atau nomor..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter Tipe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Tipe</SelectItem>
                <SelectItem value="Add Value">Tambah Nilai</SelectItem>
                <SelectItem value="Reduce Value">Kurangi Nilai</SelectItem>
                <SelectItem value="Extend Time">Perpanjang Waktu</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Amendments Grid */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Daftar Amandemen ({filteredAmendments.length})
          </h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {filteredAmendments.length > 0 ? (
            filteredAmendments.map((amendment) => (
              <Card key={amendment.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                {/* Header with Gradient */}
                <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        {getTypeBadge(amendment.type)}
                        {getStatusBadge(amendment.status)}
                      </div>
                      <h3 className="font-bold text-lg mb-1 leading-tight">
                        {amendment.amendment_number}
                      </h3>
                      <p className="text-blue-100 text-sm">
                        {amendment.contract_title}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="text-white hover:bg-red-500/20">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  {/* Value/Time Change */}
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    {amendment.value_change !== null ? (
                      <>
                        <TrendingUp className={`h-5 w-5 ${amendment.value_change >= 0 ? 'text-green-600' : 'text-red-600 transform rotate-180'}`} />
                        <div>
                          <p className="text-sm text-gray-600">Perubahan Nilai</p>
                          <p className={`font-bold text-lg ${amendment.value_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(amendment.value_change)}
                          </p>
                        </div>
                      </>
                    ) : amendment.time_change !== null && (
                      <>
                        <Calendar className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm text-gray-600">Perpanjangan Waktu</p>
                          <p className="font-bold text-lg text-blue-600">
                            +{amendment.time_change} hari
                          </p>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gray-600" />
                    <div>
                      <p className="text-sm text-gray-600">Tanggal Amandemen</p>
                      <p className="font-medium">
                        {new Date(amendment.date).toLocaleDateString('id-ID')}
                      </p>
                    </div>
                  </div>

                  {/* Reason */}
                  <div>
                    <p className="text-sm text-gray-600">Alasan</p>
                    <p className="text-sm text-gray-800 line-clamp-3">
                      {amendment.reason}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full">
              <Card className="text-center py-12">
                <CardContent>
                  <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Tidak ada amandemen ditemukan
                  </h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm 
                      ? `Tidak ada amandemen yang cocok dengan pencarian "${searchTerm}"`
                      : 'Belum ada amandemen tersedia dengan filter yang dipilih'
                    }
                  </p>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm('');
                      setTypeFilter('all');
                    }}
                  >
                    Reset Filter
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AmendmentLog;
