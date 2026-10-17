import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface GradientStatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  /** Kelas warna Tailwind, mis. "from-blue-500 to-blue-600" */
  gradient: string;
  sub?: string;
  /** 0–100: bar tipis di bawah angka (opsional) */
  persen?: number;
}

/** Kartu ringkasan bergradien, sama dengan kartu statistik di Approval Dashboard. */
export const GradientStatCard = ({ label, value, icon: Icon, gradient, sub, persen }: GradientStatCardProps) => (
  <Card className={`bg-gradient-to-r ${gradient} border-0 text-white shadow-sm`}>
    <CardContent className="flex h-full flex-col p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-white/90">{label}</p>
          <p className="mt-1 truncate text-2xl font-bold" title={value}>{value}</p>
        </div>
        <div className="shrink-0 rounded-lg bg-white/20 p-2">
          <Icon className="h-5 w-5 text-white" />
        </div>
      </div>
      {persen != null && (
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/25">
          <div className="h-full rounded-full bg-white" style={{ width: `${Math.min(100, Math.max(0, persen))}%` }} />
        </div>
      )}
      {sub && <p className="mt-2 text-xs text-white/85">{sub}</p>}
    </CardContent>
  </Card>
);
