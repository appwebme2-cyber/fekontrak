import React, { useState, useMemo } from 'react';
import { Search, Filter, Building2, FileText, Calendar } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useQuery } from '@tanstack/react-query';

const API_URL = "https://bekontrak-production.up.railway.app/api";

interface Contract {
  id_kontrak: string;
  judul_kontrak: string;
  no_dokumen_kontrak: string;
  tipe_kontrak: string;
  direksi_pekerjaan: string;
  status_kontrak: string;
  tanggal_mulai: string;
  tanggal_selesai: string;
  kbo_bagian?: string;
  vendor: {
    nama_vendor: string;
  };
}

interface ContractSearchDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectContract: (contract: Contract) => void;
  selectedContractId?: string;
}

export const ContractSearchDialog = ({
  open,
  onOpenChange,
  onSelectContract,
  selectedContractId
}: ContractSearchDialogProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [direksiFilter, setDireksiFilter] = useState<string>('');

  // Fetch all active contracts dari backend
  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['all-contracts-search'],
    queryFn: async () => {
      const token = localStorage.getItem("token");

      const res = await fetch(`${API_URL}/contracts`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await res.json();

      if (!res.ok) throw new Error("Gagal ambil kontrak");

      // mapping camelCase → snake_case
      return data.map((c: any) => ({
        id_kontrak: c.idKontrak,
        judul_kontrak: c.judulKontrak,
        no_dokumen_kontrak: c.noDokumenKontrak,
        tipe_kontrak: c.tipeKontrak,
        direksi_pekerjaan: c.direksiPekerjaan,
        status_kontrak: c.statusKontrak,
        tanggal_mulai: c.tanggalMulai,
        tanggal_selesai: c.tanggalSelesai,
        kbo_bagian: c.kboBagian,
        vendor: c.vendor
          ? { nama_vendor: c.vendor.namaVendor }
          : null,
      })) as Contract[];
    },
    enabled: open,
    staleTime: 5 * 60 * 1000
  });

  // Get unique direksi options from contracts
  const direksiOptions = useMemo(() => {
    const unique = Array.from(
      new Set(contracts.map(c => c.direksi_pekerjaan).filter(Boolean))
    ).sort();
    return unique;
  }, [contracts]);

  // Filter contracts based on search and filter
  const filteredContracts = useMemo(() => {
    let filtered = contracts;

    if (direksiFilter && direksiFilter !== 'semua') {
      filtered = filtered.filter(c => c.direksi_pekerjaan === direksiFilter);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(c =>
        c.judul_kontrak?.toLowerCase().includes(term) ||
        c.no_dokumen_kontrak?.toLowerCase().includes(term) ||
        c.vendor?.nama_vendor?.toLowerCase().includes(term)
      );
    }

    return filtered;
  }, [contracts, searchTerm, direksiFilter]);

  const handleSelectContract = (contract: Contract) => {
    onSelectContract(contract);
    onOpenChange(false);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Pilih Kontrak
            {!isLoading && contracts.length > 0 && (
              <span className="text-sm font-normal text-muted-foreground ml-2">
                ({contracts.length} kontrak aktif tersedia)
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and Filter Controls */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Cari berdasarkan judul kontrak, nomor dokumen, atau vendor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="w-48">
              <Select value={direksiFilter} onValueChange={setDireksiFilter}>
                <SelectTrigger>
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter Direksi" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="semua">Semua Direksi</SelectItem>
                  {direksiOptions.map((direksi) => (
                    <SelectItem key={direksi} value={direksi}>
                      {direksi}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Results */}
          <div className="text-sm text-muted-foreground">
            Menampilkan {filteredContracts.length} dari {contracts.length} kontrak
          </div>

          {/* Contract List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {isLoading ? (
                <div className="text-center py-8 text-muted-foreground">
                  Memuat kontrak...
                </div>
              ) : filteredContracts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || direksiFilter
                    ? 'Tidak ada kontrak yang sesuai dengan pencarian'
                    : 'Tidak ada kontrak aktif'}
                </div>
              ) : (
                filteredContracts.map((contract) => (
                  <Card
                    key={contract.id_kontrak}
                    className={`cursor-pointer transition-all hover:shadow-md border-2 ${
                      selectedContractId === contract.id_kontrak
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-muted-foreground'
                    }`}
                    onClick={() => handleSelectContract(contract)}
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <h4 className="font-medium text-foreground line-clamp-2">
                          {contract.judul_kontrak}
                        </h4>
                        <Badge variant="outline" className="ml-2 whitespace-nowrap">
                          {contract.tipe_kontrak}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{contract.no_dokumen_kontrak || 'No. Dokumen: -'}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-4 w-4" />
                            <span className="truncate">{contract.vendor?.nama_vendor}</span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(contract.tanggal_mulai)} - {formatDate(contract.tanggal_selesai)}</span>
                          </div>
                          <div className="text-xs">
                            <Badge variant="secondary" className="text-xs">
                              {contract.direksi_pekerjaan}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </ScrollArea>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};