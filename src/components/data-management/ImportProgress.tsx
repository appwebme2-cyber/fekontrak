import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface ImportProgressProps {
  current: number;
  total: number;
  status: string;
}

export function ImportProgress({ current, total, status }: ImportProgressProps) {
  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Loader2 className="h-5 w-5 animate-spin" />
        <h4 className="font-medium">Memproses Import</h4>
      </div>
      
      <div>
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>{status}</span>
          <span>{current} / {total}</span>
        </div>
        <Progress value={percentage} className="w-full" />
      </div>
      
      <p className="text-sm text-center text-muted-foreground">
        {percentage}% selesai
      </p>
    </div>
  );
}