import React, { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Lazy load chart components for better performance
const BudgetChart = React.lazy(() => import('@/components/dashboard/BudgetChart').then(module => ({ default: module.BudgetChart })));
const ProgressStatusChart = React.lazy(() => import('@/components/dashboard/ProgressStatusChart').then(module => ({ default: module.ProgressStatusChart })));
const StatusChart = React.lazy(() => import('@/components/dashboard/StatusChart').then(module => ({ default: module.StatusChart })));
const RealizationChart = React.lazy(() => import('@/components/dashboard/RealizationChart').then(module => ({ default: module.RealizationChart })));
const PotentialAddendumChart = React.lazy(() => import('@/components/dashboard/PotentialAddendumChart').then(module => ({ default: module.PotentialAddendumChart })));
const ContractStatusByDirectionChart = React.lazy(() => import('@/components/dashboard/components/ContractStatusByDirectionChart').then(module => ({ default: module.ContractStatusByDirectionChart })));
const EnhancedTimeSeriesChart = React.lazy(() => import('@/components/dashboard/components/EnhancedTimeSeriesChart').then(module => ({ default: module.EnhancedTimeSeriesChart })));
const AppleBudgetChart = React.lazy(() => import('@/components/dashboard/components/AppleBudgetChart').then(module => ({ default: module.AppleBudgetChart })));

// Chart loading skeleton
const ChartSkeleton = () => (
  <Card>
    <CardHeader>
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-3 w-24" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-32 w-full" />
      <div className="mt-2 text-center">
        <Skeleton className="h-3 w-40 mx-auto" />
      </div>
    </CardContent>
  </Card>
);

// Wrapper components with Suspense
export const LazyBudgetChart = (props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <BudgetChart {...props} />
  </Suspense>
);

export const LazyProgressStatusChart = (props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <ProgressStatusChart {...props} />
  </Suspense>
);

export const LazyStatusChart = (props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <StatusChart {...props} />
  </Suspense>
);

export const LazyRealizationChart = (props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <RealizationChart {...props} />
  </Suspense>
);

export const LazyPotentialAddendumChart = (props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <PotentialAddendumChart {...props} />
  </Suspense>
);

export const LazyContractStatusByDirectionChart = (props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <ContractStatusByDirectionChart {...props} />
  </Suspense>
);

export const LazyEnhancedTimeSeriesChart = (props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <EnhancedTimeSeriesChart {...props} />
  </Suspense>
);

export const LazyAppleBudgetChart = (props: any) => (
  <Suspense fallback={<ChartSkeleton />}>
    <AppleBudgetChart {...props} />
  </Suspense>
);

// Chart loader with error boundary
export const ChartLoader = ({ 
  children, 
  fallback = <ChartSkeleton /> 
}: { 
  children: React.ReactNode; 
  fallback?: React.ReactNode;
}) => (
  <Suspense fallback={fallback}>
    {children}
  </Suspense>
);