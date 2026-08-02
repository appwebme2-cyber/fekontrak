import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import { getUniqueWorkDirections } from '@/utils/filterUtils';
import { InvoiceViewToggle } from './InvoiceViewToggle';

interface InvoiceFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  filterTipe: string;
  setFilterTipe: (value: string) => void;
  filterDireksiPekerjaan: string;
  setFilterDireksiPekerjaan: (value: string) => void;
  kontraks: any[];
  direksiPekerjaanOptions?: string[];
  onResetFilters: () => void;
  viewMode: 'card' | 'table';
  onViewModeChange: (mode: 'card' | 'table') => void;
}

export const InvoiceFilters = ({
  searchTerm,
  setSearchTerm,
  filterTipe,
  setFilterTipe,
  filterDireksiPekerjaan,
  setFilterDireksiPekerjaan,
  kontraks = [],
  onResetFilters,
  viewMode,
  onViewModeChange
}: InvoiceFiltersProps) => {
  
  // Memastikan kontraks adalah array agar tidak error .length
  const safeKontraks = Array.isArray(kontraks) ? kontraks : [];
  
  // Mendapatkan opsi Direksi Pekerjaan yang unik
  const normalizedDireksiOptions = getUniqueWorkDirections(safeKontraks);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
          <InvoiceViewToggle
            viewMode={viewMode}
            onViewModeChange={onViewModeChange}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Pencarian */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Cari judul kontrak..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          {/* Filter Tipe Kontrak */}
          <Select value={filterTipe} onValueChange={setFilterTipe}>
            <SelectTrigger>
              <SelectValue placeholder="Tipe Kontrak" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Tipe</SelectItem>
              <SelectItem value="Lumpsum">Lumpsum</SelectItem>
              <SelectItem value="Unit Price">Unit Price</SelectItem>
              <SelectItem value="TSA">TSA</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Filter Direksi Pekerjaan - DENGAN PROTEKSI VALUE KOSONG */}
          <Select value={filterDireksiPekerjaan} onValueChange={setFilterDireksiPekerjaan}>
            <SelectTrigger>
              <SelectValue placeholder="Direksi Pekerjaan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Direksi</SelectItem>
              {normalizedDireksiOptions
                .filter(direksi => direksi && direksi.trim() !== "") // Buang yang kosong
                .map((direksi) => (
                  <SelectItem key={direksi} value={direksi}>
                    {direksi}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="mt-4 flex justify-end">
          <Button variant="outline" onClick={onResetFilters}>
            Reset Filter
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};