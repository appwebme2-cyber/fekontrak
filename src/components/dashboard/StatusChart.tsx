
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface StatusChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  total: number;
}

export const StatusChart = ({ data, total }: StatusChartProps) => {
  const activePercentage = data.find(d => d.name === 'Aktif')?.value || 0;
  const activePercent = total > 0 ? Math.round((activePercentage / total) * 100) : 0;

  // Reorder data to Pre-KOM, Aktif, Selesai
  const reorderedData = [
    data.find(d => d.name === 'Pre-KOM') || { name: 'Pre-KOM', value: 0, color: '#f59e0b' },
    data.find(d => d.name === 'Aktif') || { name: 'Aktif', value: 0, color: '#22c55e' },
    data.find(d => d.name === 'Selesai') || { name: 'Selesai', value: 0, color: '#3b82f6' },
  ].filter(item => item.value > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-600">Status Kontrak</CardTitle>
        <p className="text-xs text-green-600">Aktif: {activePercent}%</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={120}>
          <PieChart>
            <Pie
              data={reorderedData}
              cx="50%"
              cy="50%"
              innerRadius={25}
              outerRadius={50}
              dataKey="value"
            >
              {reorderedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center text-xs text-gray-500 mt-2">
          {reorderedData.map((item, index) => (
            <span key={item.name} className={index > 0 ? 'ml-2' : ''}>
              <span style={{ color: item.color }}>{item.name}: {item.value}</span>
              {index < reorderedData.length - 1 && ' • '}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
