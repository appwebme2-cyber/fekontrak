import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ExportField {
  key: string;
  label: string;
  group: string;
}

const CONTRACT_FIELDS: ExportField[] = [
  // Basic Info
  { key: "judul_kontrak", label: "Judul Kontrak", group: "Informasi Dasar" },
  { key: "tipe_kontrak", label: "Tipe Kontrak", group: "Informasi Dasar" },
  { key: "status_kontrak", label: "Status Kontrak", group: "Informasi Dasar" },
  { key: "direksi_pekerjaan", label: "Direksi Pekerjaan", group: "Informasi Dasar" },
  { key: "disiplin", label: "Disiplin", group: "Informasi Dasar" },
  
  // Financial
  { key: "nilai_awal", label: "Nilai Awal", group: "Keuangan" },
  { key: "nilai_kontrak_baru", label: "Nilai Kontrak Baru", group: "Keuangan" },
  { key: "tkdn_percentage", label: "Persentase TKDN", group: "Keuangan" },
  
  // Timeline
  { key: "tanggal_kom", label: "Tanggal KOM", group: "Waktu" },
  { key: "tanggal_mulai", label: "Tanggal Mulai", group: "Waktu" },
  { key: "tanggal_selesai", label: "Tanggal Selesai", group: "Waktu" },
  { key: "tanggal_lkp", label: "Tanggal LKP", group: "Waktu" },
  
  // Progress
  { key: "progress_plan", label: "Progress Rencana (%)", group: "Progress" },
  { key: "progress_actual", label: "Progress Aktual (%)", group: "Progress" },
  { key: "aktivitas_saat_ini", label: "Aktivitas Saat Ini", group: "Progress" },
  { key: "kendala", label: "Kendala", group: "Progress" },
  
  // Amendment
  { key: "has_amendment", label: "Ada Amandemen", group: "Amandemen" },
  { key: "no_amandemen", label: "No. Amandemen", group: "Amandemen" },
  { key: "tanggal_amandemen", label: "Tanggal Amandemen", group: "Amandemen" },
  { key: "jenis_amandemen", label: "Jenis Amandemen", group: "Amandemen" },
  
  // Documents
  { key: "no_dokumen_kontrak", label: "No. Dokumen Kontrak", group: "Dokumen" },
  { key: "no_po_pr", label: "No. PO/PR", group: "Dokumen" },
  
  // Metadata
  { key: "created_at", label: "Tanggal Dibuat", group: "Metadata" },
  { key: "updated_at", label: "Tanggal Diubah", group: "Metadata" }
];

const INVOICE_FIELDS: ExportField[] = [
  // Basic Info
  { key: "nomor_tagihan", label: "Nomor Tagihan", group: "Informasi Dasar" },
  { key: "tanggal_tagihan", label: "Tanggal Tagihan", group: "Informasi Dasar" },
  { key: "tipe_kontrak", label: "Tipe Kontrak", group: "Informasi Dasar" },
  { key: "kontrak_title", label: "Judul Kontrak", group: "Informasi Dasar" },
  
  // Financial
  { key: "nilai_tagihan", label: "Nilai Tagihan", group: "Keuangan" },
  { key: "termin", label: "Termin", group: "Keuangan" },
  { key: "status_tagihan", label: "Status Tagihan", group: "Keuangan" },
  
  // Memo
  { key: "memo_required", label: "Memo Diperlukan", group: "Memo" },
  { key: "tanggal_pengiriman_memo", label: "Tanggal Kirim Memo", group: "Memo" },
  { key: "dokumen_memo", label: "Dokumen Memo", group: "Memo" },
  
  // Other
  { key: "catatan", label: "Catatan", group: "Lainnya" },
  { key: "created_at", label: "Tanggal Dibuat", group: "Metadata" },
  { key: "updated_at", label: "Tanggal Diubah", group: "Metadata" }
];

const VENDOR_FIELDS: ExportField[] = [
  // Basic Info
  { key: "nama_vendor", label: "Nama Vendor", group: "Informasi Dasar" },
  { key: "status_vendor", label: "Status Vendor", group: "Informasi Dasar" },
  { key: "score", label: "Score", group: "Informasi Dasar" },

  // Legal
  { key: "npwp", label: "NPWP", group: "Legal" },

  // Kontak
  { key: "alamat", label: "Alamat", group: "Kontak" },
  { key: "pic_nama", label: "Nama PIC", group: "Kontak" },
  { key: "pic_kontak", label: "Kontak PIC", group: "Kontak" },

  // Metadata
  { key: "created_at", label: "Tanggal Dibuat", group: "Metadata" },
  { key: "updated_at", label: "Tanggal Diubah", group: "Metadata" }
];

interface ExportFieldSelectorProps {
  type: 'kontrak' | 'tagihan' | 'vendor';
  selectedFields: string[];
  onFieldsChange: (fields: string[]) => void;
}

export function ExportFieldSelector({ type, selectedFields, onFieldsChange }: ExportFieldSelectorProps) {
  const fields =
    type === 'kontrak' ? CONTRACT_FIELDS :
    type === 'tagihan' ? INVOICE_FIELDS :
    VENDOR_FIELDS;
  
  const groupedFields = fields.reduce((acc, field) => {
    if (!acc[field.group]) {
      acc[field.group] = [];
    }
    acc[field.group].push(field);
    return acc;
  }, {} as Record<string, ExportField[]>);

  const handleFieldChange = (fieldKey: string, checked: boolean) => {
    if (checked) {
      onFieldsChange([...selectedFields, fieldKey]);
    } else {
      onFieldsChange(selectedFields.filter(f => f !== fieldKey));
    }
  };

  const selectAllInGroup = (groupFields: ExportField[]) => {
    const groupKeys = groupFields.map(f => f.key);
    const newSelected = [...selectedFields];
    
    groupKeys.forEach(key => {
      if (!newSelected.includes(key)) {
        newSelected.push(key);
      }
    });
    
    onFieldsChange(newSelected);
  };

  const deselectAllInGroup = (groupFields: ExportField[]) => {
    const groupKeys = groupFields.map(f => f.key);
    onFieldsChange(selectedFields.filter(key => !groupKeys.includes(key)));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">Pilih Field untuk Export</h4>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onFieldsChange(fields.map(f => f.key))}
          >
            Pilih Semua
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onFieldsChange([])}
          >
            Hapus Semua
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(groupedFields).map(([groupName, groupFields]) => (
          <Card key={groupName}>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm">{groupName}</CardTitle>
                <div className="space-x-1">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => selectAllInGroup(groupFields)}
                    className="text-xs h-6"
                  >
                    Semua
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => deselectAllInGroup(groupFields)}
                    className="text-xs h-6"
                  >
                    Tidak
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                {groupFields.map((field) => (
                  <div key={field.key} className="flex items-center space-x-2">
                    <Checkbox
                      id={field.key}
                      checked={selectedFields.includes(field.key)}
                      onCheckedChange={(checked) => 
                        handleFieldChange(field.key, checked as boolean)
                      }
                    />
                    <Label 
                      htmlFor={field.key}
                      className="text-sm cursor-pointer"
                    >
                      {field.label}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}