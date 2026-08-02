
import { Button } from '@/components/ui/button';
import { Table, List } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ViewToggleProps {
  viewMode: 'table' | 'list';
  onViewModeChange: (mode: 'table' | 'list') => void;
}

export const ViewToggle = ({ viewMode, onViewModeChange }: ViewToggleProps) => {
  console.log('🔄 ViewToggle rendered:', viewMode);
  
  return (
    <div className="flex items-center bg-background rounded-lg border p-1 shadow-sm">
      <Button
        variant={viewMode === 'table' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('table')}
        className="h-8 px-3 text-sm"
      >
        <Table className="w-4 h-4 mr-2" />
        Table
      </Button>
      <Button
        variant={viewMode === 'list' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('list')}
        className="h-8 px-3 text-sm"
      >
        <List className="w-4 h-4 mr-2" />
        List
      </Button>
    </div>
  );
};
