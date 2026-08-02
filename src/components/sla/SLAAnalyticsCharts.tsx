import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface SLAAnalyticsChartsProps {
  slaAnalysis: any;
}

const COLORS = ['#10b981', '#f59e0b', '#ef4444', '#3b82f6', '#8b5cf6'];

export const SLAAnalyticsCharts: React.FC<SLAAnalyticsChartsProps> = ({ slaAnalysis }) => {
  if (!slaAnalysis) return null;

  const { contracts, stats } = slaAnalysis;

  // Vendor SLA Performance
  const vendorPerformance = contracts.reduce((acc: any, contract: any) => {
    const vendorName = contract.vendor?.nama_vendor || 'Unknown';
    if (!acc[vendorName]) {
      acc[vendorName] = { vendor: vendorName, onTime: 0, overdue: 0, total: 0 };
    }
    acc[vendorName].total++;
    if (contract.sla_status === 'on_time' || contract.sla_status === 'completed') {
      acc[vendorName].onTime++;
    } else if (contract.sla_status === 'overdue') {
      acc[vendorName].overdue++;
    }
    return acc;
  }, {});

  const vendorData = Object.values(vendorPerformance)
    .filter((v: any) => v.total >= 2) // Show only vendors with 2+ contracts
    .map((v: any) => ({
      ...v,
      complianceRate: v.total > 0 ? ((v.onTime / v.total) * 100).toFixed(1) : 0
    }))
    .sort((a: any, b: any) => b.complianceRate - a.complianceRate)
    .slice(0, 10);

  // SLA Status Distribution
  const statusDistribution = [
    { name: 'On Time', value: stats.onTime, color: '#10b981' },
    { name: 'Warning', value: stats.warning, color: '#f59e0b' },
    { name: 'Overdue', value: stats.overdue, color: '#ef4444' },
    { name: 'Completed', value: stats.completed, color: '#3b82f6' },
  ].filter(item => item.value > 0);

  // Direksi Pekerjaan Performance
  const direksiPerformance = contracts.reduce((acc: any, contract: any) => {
    const direksi = contract.direksi_pekerjaan || 'Tidak Diketahui';
    if (!acc[direksi]) {
      acc[direksi] = { direksi, onTime: 0, overdue: 0, warning: 0, total: 0 };
    }
    acc[direksi].total++;
    if (contract.sla_status === 'on_time' || contract.sla_status === 'completed') {
      acc[direksi].onTime++;
    } else if (contract.sla_status === 'overdue') {
      acc[direksi].overdue++;
    } else if (contract.sla_status === 'warning') {
      acc[direksi].warning++;
    }
    return acc;
  }, {});

  const direksiData = Object.values(direksiPerformance)
    .filter((d: any) => d.total > 0)
    .sort((a: any, b: any) => b.total - a.total);

  return (
    <div className="grid gap-6">
      {/* SLA Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">On Time</p>
                <p className="text-2xl font-bold text-green-700">{stats.onTime}</p>
                <p className="text-xs text-green-600 mt-1">
                  {stats.total > 0 ? ((stats.onTime / stats.total) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Warning</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.warning}</p>
                <p className="text-xs text-yellow-600 mt-1">
                  {stats.total > 0 ? ((stats.warning / stats.total) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">Overdue</p>
                <p className="text-2xl font-bold text-red-700">{stats.overdue}</p>
                <p className="text-xs text-red-600 mt-1">
                  {stats.total > 0 ? ((stats.overdue / stats.total) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Completed</p>
                <p className="text-2xl font-bold text-blue-700">{stats.completed}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {stats.total > 0 ? ((stats.completed / stats.total) * 100).toFixed(1) : 0}% of total
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* SLA Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Distribusi Status SLA
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Vendor Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Performa Vendor (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={vendorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="vendor" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  interval={0}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="complianceRate" fill="#3b82f6" name="Compliance Rate (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Direksi Pekerjaan Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Performa per Direksi Pekerjaan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={direksiData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="direksi" 
                angle={-45}
                textAnchor="end"
                height={100}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="onTime" stackId="a" fill="#10b981" name="On Time" />
              <Bar dataKey="warning" stackId="a" fill="#f59e0b" name="Warning" />
              <Bar dataKey="overdue" stackId="a" fill="#ef4444" name="Overdue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};