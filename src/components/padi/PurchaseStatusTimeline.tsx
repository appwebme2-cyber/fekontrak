import { format } from 'date-fns';
import { CheckCircle, Circle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { purchaseStatusOptions, getStatusColor, statusDateFieldMap } from './constants/purchaseStatusOptions';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';

interface PurchaseStatusTimelineProps {
  formData: any;
  updateFormData: (field: string, value: any) => void;
  statusLoading?: boolean;
  handleStatusChange: (currentStatus: string, statusValue: string, updateFormData: (field: string, value: any) => void) => void;
}

export const PurchaseStatusTimeline = ({
  formData,
  updateFormData,
  statusLoading = false,
  handleStatusChange
}: PurchaseStatusTimelineProps) => {
  const currentStatusIndex = purchaseStatusOptions.indexOf(formData.status_purchase);

  const handleStatusUpdate = (newStatus: string) => {
    handleStatusChange(formData.status_purchase, newStatus, updateFormData);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      return format(new Date(dateString), 'dd/MM/yyyy');
    } catch {
      return dateString;
    }
  };

  const DateField = ({ status, fieldName, label }: { status: string, fieldName: string, label: string }) => {
    const statusIndex = purchaseStatusOptions.indexOf(status);
    const isCompleted = currentStatusIndex >= statusIndex;
    const fieldValue = formData[fieldName];

    return (
      <div className="space-y-2">
        <label className="text-sm font-medium">{label}</label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal",
                !fieldValue && "text-muted-foreground",
                !isCompleted && "opacity-50"
              )}
              disabled={!isCompleted}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {fieldValue ? formatDate(fieldValue) : `Pilih tanggal ${label.toLowerCase()}`}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={fieldValue ? new Date(fieldValue) : undefined}
              onSelect={(date) => {
                if (date) {
                  updateFormData(fieldName, date.toISOString().split('T')[0]);
                }
              }}
              initialFocus
              className="p-3 pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Status Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Status & Progress Timeline</h3>
        
        <div className="space-y-4">
          {purchaseStatusOptions.map((status, index) => {
            const isCompleted = currentStatusIndex >= index;
            const isCurrent = currentStatusIndex === index;
            const dateField = statusDateFieldMap[status as keyof typeof statusDateFieldMap];
            const hasDate = formData[dateField];

            return (
              <div key={status} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {isCompleted ? (
                    <CheckCircle className="h-6 w-6 text-green-600" />
                  ) : isCurrent ? (
                    <Clock className="h-6 w-6 text-blue-600" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-300" />
                  )}
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{status}</span>
                      <Badge 
                        variant={isCurrent ? "default" : isCompleted ? "secondary" : "outline"}
                        className={cn(
                          isCurrent && getStatusColor(status),
                          "text-xs"
                        )}
                      >
                        {isCurrent ? "Current" : isCompleted ? "Completed" : "Pending"}
                      </Badge>
                    </div>
                    
                    {hasDate && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(hasDate)}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  {!isCompleted && index <= currentStatusIndex + 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleStatusUpdate(status)}
                      disabled={statusLoading}
                    >
                      {statusLoading ? 'Updating...' : `Mark as ${status}`}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Date Fields */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tanggal Detail</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DateField 
            status="BAST" 
            fieldName="tanggal_bast" 
            label="Tanggal BAST" 
          />
          <DateField 
            status="SA/GR" 
            fieldName="tanggal_sa_gr" 
            label="Tanggal SA/GR" 
          />
          <DateField 
            status="INVOICE" 
            fieldName="tanggal_invoice" 
            label="Tanggal Invoice" 
          />
          <DateField 
            status="Payment Approval" 
            fieldName="tanggal_payment_approval" 
            label="Tanggal Payment Approval" 
          />
          <DateField 
            status="Invoice Paid" 
            fieldName="tanggal_paid" 
            label="Tanggal Paid" 
          />
        </div>
      </div>

      {/* Catatan Status */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Catatan Status</label>
        <textarea
          className="w-full p-3 border rounded-md resize-none"
          rows={3}
          placeholder="Tambahkan catatan untuk status saat ini..."
          value={formData.catatan_status || ''}
          onChange={(e) => updateFormData('catatan_status', e.target.value)}
        />
      </div>
    </div>
  );
};