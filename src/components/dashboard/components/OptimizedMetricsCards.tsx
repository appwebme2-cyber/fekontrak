import React, { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart3, Clock, TrendingUp, Target, Percent, AlertTriangle } from 'lucide-react';
import { DashboardMetrics } from '@/hooks/useOptimizedDashboardData';

interface OptimizedMetricsCardsProps {
  metrics: DashboardMetrics;
  onCardClick: (type: string) => void;
}

export const OptimizedMetricsCards = memo(({
  metrics,
  onCardClick
}: OptimizedMetricsCardsProps) => {
  const getUtilizationColor = (rate: number) => {
    if (rate >= 80) return 'text-red-600 bg-red-100';
    if (rate >= 60) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getPerformanceColor = (index: number) => {
    if (index >= 100) return 'text-green-600 bg-green-100';
    if (index >= 80) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const cards = [
    {
      title: 'Total Kontrak',
      value: metrics.totalContracts.toString(),
      icon: BarChart3,
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      onClick: () => onCardClick('total'),
    },
    {
      title: 'Pre-KOM',
      value: metrics.preKomContracts.toString(),
      icon: Clock,
      color: 'yellow',
      gradient: 'from-amber-500 to-amber-600',
      onClick: () => onCardClick('pre-kom'),
    },
    {
      title: 'Aktif',
      value: metrics.activeContracts.toString(),
      icon: TrendingUp,
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      onClick: () => onCardClick('active'),
    },
    {
      title: 'Selesai',
      value: metrics.completedContracts.toString(),
      icon: BarChart3,
      color: 'blue',
      gradient: 'from-indigo-500 to-indigo-600',
      onClick: () => onCardClick('completed'),
    },
    {
      title: 'Budget Utilization',
      value: `${metrics.budgetUtilizationRate.toFixed(1)}%`,
      icon: Target,
      color: 'dynamic',
      gradient: 'from-purple-500 to-purple-600',
      colorClass: getUtilizationColor(metrics.budgetUtilizationRate),
      progress: Math.min(metrics.budgetUtilizationRate, 100),
      progressColor: metrics.budgetUtilizationRate >= 80 ? 'bg-red-500' : metrics.budgetUtilizationRate >= 60 ? 'bg-yellow-500' : 'bg-green-500',
      onClick: () => onCardClick('budget-utilization'),
    },
    {
      title: 'Performance Index',
      value: `${metrics.avgPerformanceIndex.toFixed(1)}%`,
      icon: Percent,
      color: 'dynamic',
      gradient: 'from-pink-500 to-pink-600',
      colorClass: getPerformanceColor(metrics.avgPerformanceIndex),
      progress: Math.min(metrics.avgPerformanceIndex, 100),
      progressColor: metrics.avgPerformanceIndex >= 100 ? 'bg-green-500' : metrics.avgPerformanceIndex >= 80 ? 'bg-yellow-500' : 'bg-red-500',
      onClick: () => onCardClick('performance-index'),
    },
  ];

  // Add contracts nearing end if any
  if (metrics.contractsNearingEnd > 0) {
    cards.push({
      title: 'Hampir Berakhir',
      value: metrics.contractsNearingEnd.toString(),
      icon: AlertTriangle,
      color: 'red',
      gradient: 'from-red-500 to-red-600',
      onClick: () => onCardClick('nearing-end'),
    });
  }

  const getColorClasses = (color: string, colorClass?: string) => {
    if (color === 'dynamic' && colorClass) {
      return colorClass;
    }
    
    const colorMap = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      yellow: 'text-yellow-600 bg-yellow-100',
      red: 'text-red-600 bg-red-100',
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="space-y-6">
      {/* Status Kontrak */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          Status Kontrak
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {cards.slice(0, 4).map((card, index) => {
            const IconComponent = card.icon;

            return (
              <Card
                key={index}
                className={`cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-0 text-white bg-gradient-to-r ${card.gradient ?? 'from-gray-500 to-gray-600'}`}
                onClick={card.onClick}
              >
                <CardContent className="p-4">
                  <div className="flex flex-col space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 rounded-lg bg-white/20">
                        <IconComponent className="h-5 w-5 text-white" />
                      </div>
                      <p className="text-2xl font-bold text-white">
                        {card.value}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white/90">{card.title}</p>
                      <p className="text-xs text-white/75">Jumlah kontrak</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Indikator Kinerja */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          Indikator Kinerja
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {cards.slice(4).map((card, index) => {
            const IconComponent = card.icon;
            const colorClasses = getColorClasses(card.color, card.colorClass);
            const [textColor, bgColor] = colorClasses.split(' ');

            return (
              <Card 
                key={index + 4}
                className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border border-border/50" 
                onClick={card.onClick}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`p-2 rounded-lg ${bgColor}`}>
                          <IconComponent className={`h-5 w-5 ${textColor}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                          <p className={`text-xl font-bold ${textColor}`}>
                            {card.value}
                          </p>
                        </div>
                      </div>
                      {card.progress !== undefined && (
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-muted-foreground mb-1">
                            <span>Progress</span>
                            <span>{card.progress.toFixed(1)}%</span>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${card.progressColor}`}
                              style={{ width: `${Math.min(card.progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
});

OptimizedMetricsCards.displayName = 'OptimizedMetricsCards';