import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { formatCurrency } from '@/lib/utils/formatters';
import { 
  Plus, 
  Search, 
  Filter, 
  Calendar as CalendarIcon,
  Edit,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Building2
} from 'lucide-react';
import { useContracts, useVendors, useCreateKontrak, useUpdateKontrak } from '@/hooks/useNewDatabase';
import { useAuth } from '@/hooks/useAuth';
import { isStaffOrAdminRole } from '@/hooks/useRolePermissionsConfig';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Kontrak, Vendor } from '@/types/database';

const NewContracts = () => {
  const [searchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDireksi, setFilterDireksi] = useState<string>('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedKontrak, setSelectedKontrak] = useState<Kontrak | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    const status = searchParams.get('status');
    if (status) setFilterStatus(status);
    const direksi = searchParams.get('direksi');
    if (direksi) setFilterDireksi(direksi);
  }, [searchParams]);

  const { contracts: kontraks = [], isLoading } = useContracts();
  const { vendors } = useVendors();
  const { userProfile } = useAuth();
  const createKontrak = useCreateKontrak();
  const updateKontrak = useUpdateKontrak();

  const isAdminOrPIC = isStaffOrAdminRole(userProfile?.role);

  // Normalisasi nilai status yang campuran Inggris/Indonesia di database
  const normalizeStatus = (s: string | null | undefined): string => {
    switch (s) {
      case 'Aktif':   return 'Active';
      case 'Selesai': return 'Completed';
      default:        return s ?? '';
    }
  };

  // Filter contracts
  const filteredKontraks = kontraks.filter(kontrak => {
    const matchesSearch = !searchTerm ||
      (kontrak.judul_kontrak || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (kontrak.vendor?.nama_vendor || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || kontrak.tipe_kontrak === filterType;
    const matchesStatus = filterStatus === 'all' || normalizeStatus(kontrak.status_kontrak) === filterStatus;
    const matchesDireksi = filterDireksi === 'all' || kontrak.direksi_pekerjaan === filterDireksi;

    return matchesSearch && matchesType && matchesStatus && matchesDireksi;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pre-KOM': return 'bg-yellow-100 text-yellow-800';
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-blue-100 text-blue-800';
      case 'Terminated': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Lumpsum': return 'bg-purple-100 text-purple-800';
      case 'Unit Price': return 'bg-indigo-100 text-indigo-800';
      case 'LTSA': return 'bg-orange-100 text-orange-800';
      case 'TSA': return 'bg-teal-100 text-teal-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const KontrakForm = ({ kontrak, onClose }: { kontrak?: Kontrak | null; onClose: () => void }) => {
    const [formData, setFormData] = useState({
      judul_kontrak: kontrak?.judul_kontrak || '',
      id_vendor: kontrak?.id_vendor || '',
      tipe_kontrak: kontrak?.tipe_kontrak || 'Lumpsum' as const,
      status_kontrak: kontrak?.status_kontrak || 'Pre-KOM' as const,
      tanggal_spb_diterima: kontrak?.tanggal_spb_diterima || format(new Date(), 'yyyy-MM-dd'),
      sla_kom_hari: kontrak?.sla_kom_hari || 14,
      tanggal_kom: kontrak?.tanggal_kom || '',
      nilai_awal: kontrak?.nilai_awal || undefined,
      estimasi_tanggal_kom: kontrak?.estimasi_tanggal_kom || '',
      kom_terlambat: kontrak?.kom_terlambat || false
    });

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      try {
        const submitData = {
          ...formData,
          nilai_awal: formData.nilai_awal ? Number(formData.nilai_awal) : null,
          estimasi_tanggal_kom: formData.estimasi_tanggal_kom || null,
          kom_terlambat: formData.kom_terlambat || false
        };

        if (kontrak) {
          await updateKontrak.mutateAsync({
            id_kontrak: kontrak.id_kontrak,
            ...submitData
          });
        } else {
          await createKontrak.mutateAsync(submitData);
        }
        
        onClose();
      } catch (error) {
        console.error('Error saving contract:', error);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="judul_kontrak">Judul Kontrak *</Label>
            <Input
              id="judul_kontrak"
              value={formData.judul_kontrak}
              onChange={(e) => setFormData({...formData, judul_kontrak: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="id_vendor">Vendor *</Label>
            <Select value={formData.id_vendor} onValueChange={(value) => setFormData({...formData, id_vendor: value})}>
              <SelectTrigger>
                <SelectValue placeholder="Pilih Vendor" />
              </SelectTrigger>
              <SelectContent>
                {vendors.map((vendor) => (
                  <SelectItem key={vendor.id_vendor} value={vendor.id_vendor}>
                    {vendor.nama_vendor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tipe_kontrak">Tipe Kontrak *</Label>
            <Select value={formData.tipe_kontrak} onValueChange={(value: any) => setFormData({...formData, tipe_kontrak: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Lumpsum">Lumpsum</SelectItem>
                <SelectItem value="Unit Price">Unit Price</SelectItem>
                <SelectItem value="LTSA">LTSA</SelectItem>
                <SelectItem value="TSA">TSA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status_kontrak">Status Kontrak *</Label>
            <Select value={formData.status_kontrak} onValueChange={(value: any) => setFormData({...formData, status_kontrak: value})}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pre-KOM">Pre-KOM</SelectItem>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Terminated">Terminated</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="tanggal_spb_diterima">Tanggal SPB Diterima *</Label>
            <Input
              id="tanggal_spb_diterima"
              type="date"
              value={formData.tanggal_spb_diterima}
              onChange={(e) => setFormData({...formData, tanggal_spb_diterima: e.target.value})}
              required
            />
          </div>

          <div>
            <Label htmlFor="sla_kom_hari">SLA KOM (Hari) *</Label>
            <Input
              id="sla_kom_hari"
              type="number"
              value={formData.sla_kom_hari}
              onChange={(e) => setFormData({...formData, sla_kom_hari: Number(e.target.value)})}
              required
            />
          </div>

          {formData.status_kontrak !== 'Pre-KOM' && (
            <>
              <div>
                <Label htmlFor="tanggal_kom">Tanggal KOM</Label>
                <Input
                  id="tanggal_kom"
                  type="date"
                  value={formData.tanggal_kom}
                  onChange={(e) => setFormData({...formData, tanggal_kom: e.target.value})}
                />
              </div>

              <div>
                <Label htmlFor="nilai_awal">Nilai Awal (IDR)</Label>
                <Input
                  id="nilai_awal"
                  type="number"
                  value={formData.nilai_awal || ''}
                  onChange={(e) => setFormData({...formData, nilai_awal: e.target.value ? Number(e.target.value) : undefined})}
                  placeholder="0"
                />
              </div>
            </>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button type="submit" disabled={createKontrak.isPending || updateKontrak.isPending}>
            {kontrak ? 'Update' : 'Simpan'} Kontrak
          </Button>
        </div>
      </form>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading contracts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Daftar Kontrak</h1>
          <p className="text-gray-600 mt-1">Kelola semua kontrak dan monitoring statusnya</p>
        </div>
        
        {isAdminOrPIC && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Tambah Kontrak
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Tambah Kontrak Baru</DialogTitle>
              </DialogHeader>
              <KontrakForm onClose={() => setIsCreateDialogOpen(false)} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Cari judul kontrak atau vendor..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
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
        </CardContent>
      </Card>

      {/* Contracts List */}
      <div className="space-y-4">
        {filteredKontraks.map((kontrak) => (
          <Card key={kontrak.id_kontrak} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="flex-1 space-y-3">
                  <div className="flex items-start gap-3">
                    <Building2 className="h-6 w-6 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{kontrak.judul_kontrak}</h3>
                      <p className="text-gray-600">{kontrak.vendor?.nama_vendor}</p>
                      {kontrak.nilai_awal && (
                        <p className="text-sm font-medium text-green-600">
                          {formatCurrency(kontrak.nilai_awal)}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">SPB Diterima:</span>
                      <p className="font-medium">
                        {kontrak.tanggal_spb_diterima ? format(parseISO(kontrak.tanggal_spb_diterima), 'dd MMM yyyy', { locale: id }) : '-'}
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Estimasi KOM:</span>
                      <p className="font-medium">
                        {kontrak.estimasi_tanggal_kom ? format(parseISO(kontrak.estimasi_tanggal_kom), 'dd MMM yyyy', { locale: id }) : '-'}
                      </p>
                    </div>
                    {kontrak.tanggal_kom && (
                      <div>
                        <span className="text-gray-500">Tanggal KOM:</span>
                        <p className="font-medium">{format(parseISO(kontrak.tanggal_kom), 'dd MMM yyyy', { locale: id })}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge className={getTypeColor(kontrak.tipe_kontrak)}>
                      {kontrak.tipe_kontrak}
                    </Badge>
                    <Badge className={getStatusColor(kontrak.status_kontrak)}>
                      {kontrak.status_kontrak}
                    </Badge>
                    {kontrak.kom_terlambat && (
                      <Badge className="bg-red-100 text-red-800 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        KOM Terlambat
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {isAdminOrPIC && (
                      <Dialog open={isEditDialogOpen && selectedKontrak?.id_kontrak === kontrak.id_kontrak} 
                              onOpenChange={(open) => {
                                setIsEditDialogOpen(open);
                                if (!open) setSelectedKontrak(null);
                              }}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setSelectedKontrak(kontrak)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Edit Kontrak</DialogTitle>
                          </DialogHeader>
                          <KontrakForm 
                            kontrak={selectedKontrak} 
                            onClose={() => {
                              setIsEditDialogOpen(false);
                              setSelectedKontrak(null);
                            }} 
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredKontraks.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Building2 className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">Tidak ada kontrak yang sesuai dengan filter</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default NewContracts;
