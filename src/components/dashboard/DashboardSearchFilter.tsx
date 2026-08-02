
import React from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';

interface DashboardSearchFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  contractWorkDirectionFilter: string;
  setContractWorkDirectionFilter: (filter: string) => void;
  contractDisciplineFilter: string;
  setContractDisciplineFilter: (filter: string) => void;
  workDirections: string[];
  disciplines: string[];
  metrics: {
    totalContracts: number;
    activeContracts: number;
    completedContracts: number;
    pendingContracts: number;
  };
}

export const DashboardSearchFilter = ({
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  contractWorkDirectionFilter,
  setContractWorkDirectionFilter,
  contractDisciplineFilter,
  setContractDisciplineFilter,
  workDirections,
  disciplines,
  metrics
}: DashboardSearchFilterProps) => {
  // Add "Alat Berat" and "Tools" to disciplines if not already present
  const enhancedDisciplines = [...new Set([...disciplines, 'Alat Berat', 'Tools'])];

  // Handle filter click with proper status mapping
  const handleFilterClick = (filterValue: string) => {
    console.log('Filter clicked:', filterValue);
    setActiveFilter(filterValue);
  };

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    console.log('Search query changed:', value);
    setSearchQuery(value);
  };

  // Handle work direction filter change
  const handleWorkDirectionChange = (value: string) => {
    console.log('Work direction filter changed:', value);
    setContractWorkDirectionFilter(value);
  };

  // Handle discipline filter change
  const handleDisciplineChange = (value: string) => {
    console.log('Discipline filter changed:', value);
    setContractDisciplineFilter(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg animate-fade-in-scale border-0" style={{ animationDelay: '0.2s' }}>
      <div className="flex flex-col space-y-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
          <Input 
            placeholder="Cari kontrak berdasarkan nama, judul, atau nomor..." 
            className="pl-12 h-14 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 text-lg focus:border-blue-500 focus:ring-blue-500 transition-all duration-200"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Status Filter Badges - Fixed order and functionality */}
        <div className="flex flex-wrap gap-3">
          <Badge 
            variant={activeFilter === 'all' ? 'default' : 'outline'} 
            className={`cursor-pointer transition-all duration-200 hover:scale-105 px-4 py-2 text-sm font-semibold rounded-full ${
              activeFilter === 'all' 
                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0' 
                : 'bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 border-2'
            }`}
            onClick={() => handleFilterClick('all')}
          >
            Semua <span className="ml-2 bg-white/20 px-2 py-1 rounded-full text-xs">{metrics.totalContracts}</span>
          </Badge>
          <Badge 
            variant={activeFilter === 'pre-kom' ? 'default' : 'outline'}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 px-4 py-2 text-sm font-semibold rounded-full ${
              activeFilter === 'pre-kom' 
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0' 
                : 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-900/30 border-2 border-yellow-200 dark:border-yellow-700'
            }`}
            onClick={() => handleFilterClick('pre-kom')}
          >
            Pre-KOM <span className="ml-2 bg-yellow-200 dark:bg-yellow-700 px-2 py-1 rounded-full text-xs">{metrics.pendingContracts}</span>
          </Badge>
          <Badge 
            variant={activeFilter === 'active' ? 'default' : 'outline'}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 px-4 py-2 text-sm font-semibold rounded-full ${
              activeFilter === 'active' 
                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white border-0' 
                : 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/30 border-2 border-green-200 dark:border-green-700'
            }`}
            onClick={() => handleFilterClick('active')}
          >
            Aktif <span className="ml-2 bg-green-200 dark:bg-green-700 px-2 py-1 rounded-full text-xs">{metrics.activeContracts}</span>
          </Badge>
          <Badge 
            variant={activeFilter === 'completed' ? 'default' : 'outline'}
            className={`cursor-pointer transition-all duration-200 hover:scale-105 px-4 py-2 text-sm font-semibold rounded-full ${
              activeFilter === 'completed' 
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-0' 
                : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-2 border-blue-200 dark:border-blue-700'
            }`}
            onClick={() => handleFilterClick('completed')}
          >
            Selesai <span className="ml-2 bg-blue-200 dark:bg-blue-700 px-2 py-1 rounded-full text-xs">{metrics.completedContracts}</span>
          </Badge>
        </div>

        {/* Contract Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Filter Direksi Pekerjaan</label>
            <Select value={contractWorkDirectionFilter} onValueChange={handleWorkDirectionChange}>
              <SelectTrigger className="border-2 border-gray-200 dark:border-gray-600 rounded-xl h-12 bg-gray-50 dark:bg-gray-700">
                <SelectValue placeholder="Pilih Direksi Pekerjaan" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50">
                <SelectItem value="all">Semua Direksi</SelectItem>
                {workDirections.map((direction) => (
                  <SelectItem key={direction} value={direction}>{direction}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Filter Disiplin</label>
            <Select value={contractDisciplineFilter} onValueChange={handleDisciplineChange}>
              <SelectTrigger className="border-2 border-gray-200 dark:border-gray-600 rounded-xl h-12 bg-gray-50 dark:bg-gray-700">
                <SelectValue placeholder="Pilih Disiplin" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50">
                <SelectItem value="all">Semua Disiplin</SelectItem>
                {enhancedDisciplines.map((discipline) => (
                  <SelectItem key={discipline} value={discipline}>{discipline}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
};
