
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';

interface ProgressStatusChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  normalCount: number;
  behindCount: number;
}

export const ProgressStatusChart = ({ data, normalCount, behindCount }: ProgressStatusChartProps) => {
  const total = normalCount + behindCount;
  const normalPercentage = total > 0 ? Math.round((normalCount / total) * 100) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-600">Status Progress</CardTitle>
        <p className="text-xs text-green-600">Normal: {normalPercentage}%</p>
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
          <div className="flex justify-center gap-4">
            <span className="text-green-600">Normal: {normalCount}</span>
            <span className="text-red-600">Behind: {behindCount}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
