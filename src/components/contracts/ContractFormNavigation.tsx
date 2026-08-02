
import { Button } from '@/components/ui/button';

interface ContractFormNavigationProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  isEditing?: boolean;
}

export const ContractFormNavigation = ({
  activeTab,
  setActiveTab,
  onCancel,
  isLoading = false,
  isEditing = false
}: ContractFormNavigationProps) => {
  const tabs = ['basic', 'technical', 'vendor', 'progress', 'amendments', 'documents'];
  const currentIndex = tabs.indexOf(activeTab);
  
  const handleNext = () => {
    if (currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  const isLastTab = currentIndex === tabs.length - 1;
  const isFirstTab = currentIndex === 0;

  return (
    <div className="flex justify-between items-center pt-4 border-t bg-white px-6 py-4">
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Batal
        </Button>
        
        {!isFirstTab && (
          <Button
            type="button"
            variant="outline"
            onClick={handlePrevious}
            disabled={isLoading}
          >
            Sebelumnya
          </Button>
        )}
      </div>

      <div className="flex gap-2">
        {!isLastTab ? (
          <Button
            type="button"
            onClick={handleNext}
            disabled={isLoading}
          >
            Selanjutnya
          </Button>
        ) : (
          <Button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? 'Menyimpan...' : (isEditing ? 'Update Kontrak' : 'Simpan Kontrak')}
          </Button>
        )}
      </div>
    </div>
  );
};
