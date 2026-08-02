
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { BarChart3, TrendingUp, GitBranch } from 'lucide-react';
import { ContractStatusByDirectionChart } from './ContractStatusByDirectionChart';
import { Kontrak } from '@/types/database';

interface ChartData {
  name: string;
  value: number;
  color: string;
}

interface StatusChartsGridProps {
  statusData: ChartData[];
  progressStatusData: ChartData[];
  amendmentData?: ChartData[];
  contracts: Kontrak[];
  onChartClick: (data: any, chartType?: string) => void;
}

const PieChartCard = ({ title, icon: Icon, data, onChartClick, chartType }: {
  title: string;
  icon: React.ElementType;
  data: ChartData[];
  onChartClick: (data: any, chartType?: string) => void;
  chartType: string;
}) => (
  <Card>
    <CardHeader className="pb-3 sm:pb-6">
      <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        {title}
      </CardTitle>
    </CardHeader>
    <CardContent>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={75}
            fill="#8884d8"
            dataKey="value"
            onClick={(d) => onChartClick(d, chartType)}
            className="cursor-pointer"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mt-3">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs sm:text-sm text-muted-foreground">{item.name}: <strong>{item.value}</strong></span>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const StatusChartsGrid = ({
  statusData,
  progressStatusData,
  amendmentData = [],
  contracts,
  onChartClick
}: StatusChartsGridProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <PieChartCard
          title="Status Kontrak"
          icon={BarChart3}
          data={statusData}
          onChartClick={onChartClick}
          chartType="status"
        />
        <PieChartCard
          title="Status Progress"
          icon={TrendingUp}
          data={progressStatusData}
          onChartClick={onChartClick}
          chartType="progress"
        />
        {amendmentData.length > 0 && (
          <PieChartCard
            title="Status Amandemen"
            icon={GitBranch}
            data={amendmentData}
            onChartClick={onChartClick}
            chartType="amendment"
          />
        )}
      </div>
      
      <ContractStatusByDirectionChart contracts={contracts} />
    </div>
  );
};
