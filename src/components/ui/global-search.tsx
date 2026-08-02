import { useState, useEffect, useRef } from 'react';
import { Search, Clock, Bookmark, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Separator } from '@/components/ui/separator';

interface SearchFilter {
  id: string;
  label: string;
  value: string;
  type: 'text' | 'select' | 'date' | 'number';
  options?: { label: string; value: string }[];
}

interface SearchHistoryItem {
  id: string;
  query: string;
  filters: SearchFilter[];
  timestamp: string;
}

interface SavedFilter {
  id: string;
  name: string;
  filters: SearchFilter[];
  timestamp: string;
}

interface GlobalSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  availableFilters?: SearchFilter[];
  activeFilters?: SearchFilter[];
  onFiltersChange?: (filters: SearchFilter[]) => void;
  showHistory?: boolean;
  showSavedFilters?: boolean;
  onSearch?: (query: string, filters: SearchFilter[]) => void;
}

export const GlobalSearch = ({
  value,
  onChange,
  placeholder = "Cari kontrak, vendor, atau dokumen...",
  availableFilters = [],
  activeFilters = [],
  onFiltersChange,
  showHistory = true,
  showSavedFilters = true,
  onSearch
}: GlobalSearchProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [showFilterPopover, setShowFilterPopover] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load search history and saved filters from localStorage
  useEffect(() => {
    const history = localStorage.getItem('search-history');
    const saved = localStorage.getItem('saved-filters');
    
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
    if (saved) {
      setSavedFilters(JSON.parse(saved));
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    localStorage.setItem('search-history', JSON.stringify(searchHistory));
  }, [searchHistory]);

  useEffect(() => {
    localStorage.setItem('saved-filters', JSON.stringify(savedFilters));
  }, [savedFilters]);

  const handleSearch = () => {
    if (value.trim() || activeFilters.length > 0) {
      // Add to search history
      const historyItem: SearchHistoryItem = {
        id: Date.now().toString(),
        query: value,
        filters: activeFilters,
        timestamp: new Date().toISOString()
      };

      setSearchHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep only 10 items
      
      if (onSearch) {
        onSearch(value, activeFilters);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
      setIsOpen(false);
    }
  };

  const selectHistoryItem = (item: SearchHistoryItem) => {
    onChange(item.query);
    if (onFiltersChange) {
      onFiltersChange(item.filters);
    }
    setIsOpen(false);
  };

  const applySavedFilter = (savedFilter: SavedFilter) => {
    if (onFiltersChange) {
      onFiltersChange(savedFilter.filters);
    }
    setShowFilterPopover(false);
  };

  const saveCurrentFilters = () => {
    if (activeFilters.length === 0) return;

    const name = prompt('Nama untuk filter yang disimpan:');
    if (!name) return;

    const savedFilter: SavedFilter = {
      id: Date.now().toString(),
      name,
      filters: activeFilters,
      timestamp: new Date().toISOString()
    };

    setSavedFilters(prev => [savedFilter, ...prev]);
    setShowFilterPopover(false);
  };

  const clearHistory = () => {
    setSearchHistory([]);
  };

  const removeFilter = (filterId: string) => {
    if (onFiltersChange) {
      onFiltersChange(activeFilters.filter(f => f.id !== filterId));
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          ref={inputRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyPress={handleKeyPress}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="pl-10 pr-20"
        />
        
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {availableFilters.length > 0 && (
            <Popover open={showFilterPopover} onOpenChange={setShowFilterPopover}>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                  <Filter className="h-3 w-3" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-0" align="end">
                <Command>
                  <CommandInput placeholder="Cari filter..." />
                  <CommandList>
                    <CommandEmpty>Filter tidak ditemukan.</CommandEmpty>
                    
                    {showSavedFilters && savedFilters.length > 0 && (
                      <CommandGroup heading="Filter Tersimpan">
                        {savedFilters.map((savedFilter) => (
                          <CommandItem
                            key={savedFilter.id}
                            onSelect={() => applySavedFilter(savedFilter)}
                            className="cursor-pointer"
                          >
                            <Bookmark className="mr-2 h-4 w-4" />
                            {savedFilter.name}
                            <span className="ml-auto text-xs text-muted-foreground">
                              {savedFilter.filters.length} filter
                            </span>
                          </CommandItem>
                        ))}
                        <Separator />
                      </CommandGroup>
                    )}

                    <CommandGroup heading="Filter Tersedia">
                      {availableFilters.map((filter) => (
                        <CommandItem
                          key={filter.id}
                          onSelect={() => {
                            if (onFiltersChange && !activeFilters.find(f => f.id === filter.id)) {
                              onFiltersChange([...activeFilters, filter]);
                            }
                          }}
                          className="cursor-pointer"
                        >
                          {filter.label}
                        </CommandItem>
                      ))}
                    </CommandGroup>

                    {activeFilters.length > 0 && (
                      <>
                        <Separator />
                        <div className="p-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={saveCurrentFilters}
                            className="w-full"
                          >
                            <Bookmark className="mr-2 h-4 w-4" />
                            Simpan Filter
                          </Button>
                        </div>
                      </>
                    )}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          )}
          
          <Button variant="ghost" size="sm" onClick={handleSearch} className="h-6 px-2">
            <Search className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Active filters */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {activeFilters.map((filter) => (
            <Badge key={filter.id} variant="secondary" className="text-xs">
              {filter.label}: {filter.value}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeFilter(filter.id)}
                className="ml-1 h-3 w-3 p-0"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search suggestions dropdown */}
      {isOpen && (showHistory && searchHistory.length > 0) && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-popover border border-border rounded-md shadow-md">
          <div className="p-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground">Pencarian Terakhir</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearHistory}
                className="h-6 text-xs"
              >
                Hapus
              </Button>
            </div>
            
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {searchHistory.map((item) => (
                <div
                  key={item.id}
                  onClick={() => selectHistoryItem(item)}
                  className="flex items-center gap-2 p-2 text-sm hover:bg-accent rounded-sm cursor-pointer"
                >
                  <Clock className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="truncate">{item.query || 'Pencarian dengan filter'}</div>
                    {item.filters.length > 0 && (
                      <div className="text-xs text-muted-foreground">
                        {item.filters.length} filter aktif
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(item.timestamp).toLocaleDateString('id-ID')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};