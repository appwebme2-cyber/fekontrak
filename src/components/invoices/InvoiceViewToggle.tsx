import { LayoutGrid, Table } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InvoiceViewToggleProps {
  viewMode: 'card' | 'table';
  onViewModeChange: (mode: 'card' | 'table') => void;
}

export function InvoiceViewToggle({ viewMode, onViewModeChange }: InvoiceViewToggleProps) {
  return (
    <div className="flex items-center space-x-1 bg-muted p-1 rounded-lg">
      <Button
        variant={viewMode === 'card' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('card')}
        className="px-3 py-1.5"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Card</span>
      </Button>
      <Button
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('table')}
        className="px-3 py-1.5"
      >
        <Table className="h-4 w-4" />
        <span className="ml-2 hidden sm:inline">Table</span>
      </Button>
    </div>
  );
}