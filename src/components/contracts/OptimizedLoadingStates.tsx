import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function OptimizedContractCardSkeleton() {
  return (
    <Card className="overflow-hidden border-0 shadow-md p-4 md:p-6">
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16" />
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
        <div className="bg-gray-50 rounded-lg p-3">
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-6 w-1/2" />
        </div>
      </div>
    </Card>
  );
}

export function OptimizedContractListSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-2">
      {Array.from({ length: count }, (_, i) => (
        <OptimizedContractCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function OptimizedTableSkeleton() {
  return (
    <div className="border rounded-lg">
      <div className="p-4 border-b">
        <Skeleton className="h-6 w-full" />
      </div>
      {Array.from({ length: 10 }, (_, i) => (
        <div key={i} className="p-4 border-b last:border-b-0 flex justify-between">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-6" />
          </div>
        </div>
      ))}
    </div>
  );
}