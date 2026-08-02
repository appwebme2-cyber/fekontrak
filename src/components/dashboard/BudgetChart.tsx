
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface BudgetChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  usedBudget: number;
  totalBudget: number;
}

export const BudgetChart = ({ data, usedBudget, totalBudget }: BudgetChartProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const usagePercentage = data.find(d => d.name === 'Digunakan')?.value || 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-600">Alokasi Anggaran</CardTitle>
        <p className="text-xs text-blue-600">{usagePercentage}% Terpakai</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={120}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={50}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center text-xs text-gray-500 mt-2">
          <div>{formatCurrency(usedBudget)} / {formatCurrency(totalBudget)}</div>
          <span className="text-green-600">Sisa: {100 - usagePercentage}%</span>
        </div>
      </CardContent>
    </Card>
  );
};
