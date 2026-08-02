
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface RealizationChartProps {
  data: Array<{ month: string; realisasi: number; target: number }>;
}

export const RealizationChart = ({ data }: RealizationChartProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm font-medium text-gray-600">Realisasi vs Target</CardTitle>
        <p className="text-xs text-gray-500">6 Bulan Terakhir</p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={120}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} />
            <Tooltip />
            <Bar dataKey="realisasi" fill="#3b82f6" />
            <Bar dataKey="target" fill="#e5e7eb" />
          </BarChart>
        </ResponsiveContainer>
        <div className="text-center text-xs text-gray-500 mt-2">
          Target: 90% | Realisasi Rata-rata: 85%
        </div>
      </CardContent>
    </Card>
  );
};
