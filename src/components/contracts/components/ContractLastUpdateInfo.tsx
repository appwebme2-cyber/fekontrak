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

type DocSource = 'kontrak' | 'progress' | 'tagihan';

const latestWithSource = (
  groups: { dates: string[]; source: DocSource }[]
): { date: string; source: DocSource } | undefined => {
  let best: { date: string; source: DocSource } | undefined;
  for (const { dates, source } of groups) {
    const top = [...dates].filter(Boolean).sort().pop();
    if (top && (!best || top > best.date)) {
      best = { date: top, source };
    }
  }
  return best;
};

const SOURCE_LABEL: Record<DocSource, string> = {
  kontrak: 'kontrak',
  progress: 'progress',
  tagihan: 'tagihan',
};

export function ContractLastUpdateInfo({ contract }: ContractLastUpdateInfoProps) {
  const { data: billingTerms } = useContractBilling(contract.id_kontrak);
  const { dokumens } = useDokumenApproval(contract.id_kontrak);

  const kontrakDocDates = parseUploadDates(contract.contract_documents);
  const approvalDocDates = dokumens.map((d) => d.updated_at).filter(Boolean) as string[];
  const tagihanDocDates = (billingTerms ?? []).flatMap((t) =>
    parseUploadDates(t.dokumen_tagihan)
  );

  const latestDok = latestWithSource([
    { dates: kontrakDocDates, source: 'kontrak' },
    { dates: approvalDocDates, source: 'progress' },
    { dates: tagihanDocDates, source: 'tagihan' },
  ]);

  const lastTagihanUpdate = [...((billingTerms ?? []).map((t) => t.updated_at).filter(Boolean) as string[])]
    .sort()
    .pop();

  return (
    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
      <div className="flex items-center gap-2">
        <FileText className="h-3 w-3 shrink-0" />
        <span>
          {latestDok
            ? `Dok: ${formatDate(latestDok.date)} (${SOURCE_LABEL[latestDok.source]})`
            : 'Dok: Belum ada dokumen'}
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
