import { FileText, Receipt } from 'lucide-react';
import { Kontrak } from '@/types/database';
import { formatDate } from '@/lib/utils/formatters';
import { useContractBilling } from '@/hooks/useContractBilling';
import { useDokumenApproval } from '@/hooks/useDokumenApproval';

interface ContractLastUpdateInfoProps {
  contract: Kontrak;
}

const parseUploadDates = (raw: any): string[] => {
  try {
    const docs = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (!Array.isArray(docs)) return [];
    return docs.map((d: any) => d.upload_date || d.updated_at).filter(Boolean);
  } catch {
    return [];
  }
};

const latestDate = (...dateLists: (string | undefined)[][]): string | undefined =>
  dateLists.flat().filter(Boolean).sort().pop() as string | undefined;

export function ContractLastUpdateInfo({ contract }: ContractLastUpdateInfoProps) {
  const { data: billingTerms } = useContractBilling(contract.id_kontrak);
  const { dokumens } = useDokumenApproval(contract.id_kontrak);

  // Dokumen kontrak utama
  const kontrakDocDates = parseUploadDates(contract.contract_documents);

  // Dokumen approval/progress
  const approvalDocDates = dokumens.map((d) => d.updated_at).filter(Boolean) as string[];

  // Dokumen dari setiap tagihan
  const tagihanDocDates = (billingTerms ?? []).flatMap((t) =>
    parseUploadDates(t.dokumen_tagihan)
  );

  const lastDokumenUpdate = latestDate(kontrakDocDates, approvalDocDates, tagihanDocDates);

  // Update tagihan (perubahan status/nilai billing)
  const lastTagihanUpdate = latestDate(
    (billingTerms ?? []).map((t) => t.updated_at).filter(Boolean) as string[]
  );

  return (
    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <FileText className="h-3 w-3 shrink-0" />
        <span>
          Dok: {lastDokumenUpdate ? formatDate(lastDokumenUpdate) : 'Belum ada dokumen'}
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Receipt className="h-3 w-3 shrink-0" />
        <span>
          Tagihan: {lastTagihanUpdate ? formatDate(lastTagihanUpdate) : 'Belum ada tagihan'}
        </span>
      </div>
    </div>
  );
}
