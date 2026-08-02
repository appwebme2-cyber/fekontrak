import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Download, FileText, Table, BarChart3, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { SLAAnalysis } from '@/hooks/useOptimizedSLAMonitoring';

interface EnhancedSLAExportProps {
  slaAnalysis: SLAAnalysis;
  filteredContracts: any[];
}

const EXPORT_FORMATS = [
  { value: 'excel', label: 'Excel Spreadsheet (.xlsx)', icon: Table },
  { value: 'pdf', label: 'PDF Report (.pdf)', icon: FileText },
  { value: 'csv', label: 'CSV Data (.csv)', icon: BarChart3 }
];

const EXPORT_FIELDS = [
  { key: 'basic', label: 'Basic Info', fields: ['judul_kontrak', 'status_kontrak', 'tipe_kontrak'] },
  { key: 'vendor', label: 'Vendor Info', fields: ['vendor.nama_vendor', 'vendor.pic_nama', 'vendor.pic_kontak'] },
  { key: 'dates', label: 'Important Dates', fields: ['tanggal_terima_dokumen', 'estimasi_tanggal_kom', 'tanggal_kom'] },
  { key: 'sla', label: 'SLA Metrics', fields: ['sla_status', 'days_overdue', 'sla_progress', 'risk_level'] },
  { key: 'financial', label: 'Financial Info', fields: ['nilai_awal', 'nilai_kontrak_baru'] },
  { key: 'management', label: 'Management Info', fields: ['direksi_pekerjaan', 'disiplin'] }
];

export const EnhancedSLAExport: React.FC<EnhancedSLAExportProps> = ({
  slaAnalysis,
  filteredContracts
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('excel');
  const [includeCharts, setIncludeCharts] = useState(true);
  const [includeSummary, setIncludeSummary] = useState(true);
  const [selectedFields, setSelectedFields] = useState(EXPORT_FIELDS.map(f => f.key));
  const [dateRange, setDateRange] = useState('all');
  const { toast } = useToast();

  const handleFieldToggle = (fieldKey: string) => {
    setSelectedFields(prev => 
      prev.includes(fieldKey) 
        ? prev.filter(k => k !== fieldKey)
        : [...prev, fieldKey]
    );
  };

  const generateExportData = () => {
    const selectedFieldsList = EXPORT_FIELDS
      .filter(group => selectedFields.includes(group.key))
      .flatMap(group => group.fields);

    return filteredContracts.map(contract => {
      const exportRow: any = {};
      
      selectedFieldsList.forEach(field => {
        const fieldParts = field.split('.');
        let value = contract;
        
        for (const part of fieldParts) {
          value = value?.[part];
        }
        
        // Format the value based on field type
        if (field.includes('tanggal') && value) {
          value = new Date(value).toLocaleDateString('id-ID');
        } else if (field.includes('nilai') && value) {
          value = new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR'
          }).format(value);
        } else if (field === 'sla_progress' && value) {
          value = `${value.toFixed(1)}%`;
        }
        
        exportRow[field] = value || '-';
      });
      
      return exportRow;
    });
  };

  const handleExport = async () => {
    try {
      const exportData = generateExportData();
      
      // Create export package
      const exportPackage = {
        metadata: {
          exportDate: new Date().toISOString(),
          totalContracts: filteredContracts.length,
          format: exportFormat,
          fields: selectedFields
        },
        summary: includeSummary ? {
          complianceRate: slaAnalysis.stats.complianceRate,
          totalContracts: slaAnalysis.stats.total,
          onTime: slaAnalysis.stats.onTime,
          overdue: slaAnalysis.stats.overdue,
          warning: slaAnalysis.stats.warning,
          highRisk: slaAnalysis.stats.highRisk,
          mediumRisk: slaAnalysis.stats.mediumRisk,
          lowRisk: slaAnalysis.stats.lowRisk
        } : null,
        contracts: exportData,
        charts: includeCharts ? {
          statusDistribution: [
            { name: 'On Time', value: slaAnalysis.stats.onTime },
            { name: 'Warning', value: slaAnalysis.stats.warning },
            { name: 'Overdue', value: slaAnalysis.stats.overdue },
            { name: 'Completed', value: slaAnalysis.stats.completed }
          ],
          riskDistribution: [
            { name: 'Low Risk', value: slaAnalysis.stats.lowRisk },
            { name: 'Medium Risk', value: slaAnalysis.stats.mediumRisk },
            { name: 'High Risk', value: slaAnalysis.stats.highRisk }
          ],
          vendorPerformance: slaAnalysis.trends.vendorPerformance
        } : null
      };

      // Simulate export process
      if (exportFormat === 'excel') {
        await exportToExcel(exportPackage);
      } else if (exportFormat === 'pdf') {
        await exportToPDF(exportPackage);
      } else {
        await exportToCSV(exportPackage);
      }

      setIsOpen(false);
      toast({
        title: "Export Successful",
        description: `SLA report exported as ${exportFormat.toUpperCase()}`,
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting the report",
        variant: "destructive"
      });
    }
  };

  const exportToExcel = async (data: any) => {
    // Simulate Excel export
    console.log('Exporting to Excel:', data);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const exportToPDF = async (data: any) => {
    // Simulate PDF export
    console.log('Exporting to PDF:', data);
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const exportToCSV = async (data: any) => {
    // Simulate CSV export
    const csvContent = convertToCSV(data.contracts);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sla-report-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: any[]) => {
    if (!data.length) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header];
          return typeof value === 'string' && value.includes(',') 
            ? `"${value}"` 
            : value;
        }).join(',')
      )
    ];
    
    return csvRows.join('\n');
  };

  const SelectedFormatIcon = EXPORT_FORMATS.find(f => f.value === exportFormat)?.icon || Download;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export SLA Report
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Export Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Export Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Contracts:</span>
                <Badge variant="outline">{filteredContracts.length}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>Compliance Rate:</span>
                <Badge variant={slaAnalysis.stats.complianceRate > 80 ? "default" : "destructive"}>
                  {slaAnalysis.stats.complianceRate.toFixed(1)}%
                </Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span>High Risk Contracts:</span>
                <Badge variant="destructive">{slaAnalysis.stats.highRisk}</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Export Format */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Format</Label>
            <Select value={exportFormat} onValueChange={setExportFormat}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EXPORT_FORMATS.map(format => {
                  const Icon = format.icon;
                  return (
                    <SelectItem key={format.value} value={format.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        {format.label}
                      </div>
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Data Fields Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Include Data Fields</Label>
            <div className="grid grid-cols-2 gap-3">
              {EXPORT_FIELDS.map(fieldGroup => (
                <div key={fieldGroup.key} className="flex items-center space-x-2">
                  <Checkbox
                    id={fieldGroup.key}
                    checked={selectedFields.includes(fieldGroup.key)}
                    onCheckedChange={() => handleFieldToggle(fieldGroup.key)}
                  />
                  <Label htmlFor={fieldGroup.key} className="text-sm">
                    {fieldGroup.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Additional Options</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-summary"
                    checked={includeSummary}
                    onCheckedChange={(checked) => setIncludeSummary(checked === true)}
                  />
                  <Label htmlFor="include-summary" className="text-sm">
                    Include executive summary
                  </Label>
                </div>
                
                {exportFormat !== 'csv' && (
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="include-charts"
                      checked={includeCharts}
                      onCheckedChange={(checked) => setIncludeCharts(checked === true)}
                    />
                  <Label htmlFor="include-charts" className="text-sm">
                    Include charts and analytics
                  </Label>
                </div>
              )}
            </div>
          </div>

          {/* Export Actions */}
          <div className="flex justify-between items-center pt-4 border-t">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <SelectedFormatIcon className="h-4 w-4" />
              <span>Exporting {filteredContracts.length} contracts</span>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleExport} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};