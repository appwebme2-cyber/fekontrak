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
  Legend,
  ScatterChart,
  Scatter
} from 'recharts';
import { TrendingUp, TrendingDown, Clock, AlertTriangle, CheckCircle, Target, Users, Building2 } from 'lucide-react';

type SLAAnalysis = any;

interface OptimizedSLAAnalyticsChartsProps {
  slaAnalysis: SLAAnalysis;
}

const COLORS = {
  onTime: '#10b981',
  warning: '#f59e0b', 
  overdue: '#ef4444',
  completed: '#3b82f6',
  low: '#10b981',
  medium: '#f59e0b',
  high: '#ef4444'
};

export const OptimizedSLAAnalyticsCharts: React.FC<OptimizedSLAAnalyticsChartsProps> = ({ slaAnalysis }) => {
 
 if (!slaAnalysis) {
  return <div className="p-6">Loading SLA data...</div>;
}
 
  if (!slaAnalysis) return null;



const contracts = slaAnalysis?.contracts || [];

const stats = slaAnalysis?.stats || {
  total: 0,
  onTime: 0,
  warning: 0,
  overdue: 0,
  completed: 0,
  lowRisk: 0,
  mediumRisk: 0,
  highRisk: 0,
  complianceRate: 0
};

const trends = slaAnalysis?.trends || {
  vendorPerformance: [],
  direksiPerformance: []
};

  // Enhanced SLA Status Distribution
  const statusDistribution = [
    { name: 'On Time', value: stats.onTime, color: COLORS.onTime, percentage: (stats.onTime / stats.total * 100).toFixed(1) },
    { name: 'Warning', value: stats.warning, color: COLORS.warning, percentage: (stats.warning / stats.total * 100).toFixed(1) },
    { name: 'Overdue', value: stats.overdue, color: COLORS.overdue, percentage: (stats.overdue / stats.total * 100).toFixed(1) },
    { name: 'Completed', value: stats.completed, color: COLORS.completed, percentage: (stats.completed / stats.total * 100).toFixed(1) },
  ].filter(item => item.value > 0);

  // Risk Distribution
  const riskDistribution = [
    { name: 'Low Risk', value: stats.lowRisk, color: COLORS.low, percentage: (stats.lowRisk / stats.total * 100).toFixed(1) },
    { name: 'Medium Risk', value: stats.mediumRisk, color: COLORS.medium, percentage: (stats.mediumRisk / stats.total * 100).toFixed(1) },
    { name: 'High Risk', value: stats.highRisk, color: COLORS.high, percentage: (stats.highRisk / stats.total * 100).toFixed(1) }
  ].filter(item => item.value > 0);

  // Contract Type Performance
  const typePerformance = contracts.reduce((acc: any, contract) => {
    const type = contract.tipe_kontrak;
    if (!acc[type]) {
      acc[type] = { type, onTime: 0, overdue: 0, warning: 0, total: 0, avgProgress: 0, totalProgress: 0 };
    }
    acc[type].total++;
    acc[type].totalProgress += contract.sla_progress;
    
    if (contract.sla_status === 'on_time' || contract.sla_status === 'completed') {
      acc[type].onTime++;
    } else if (contract.sla_status === 'overdue') {
      acc[type].overdue++;
    } else if (contract.sla_status === 'warning') {
      acc[type].warning++;
    }
    return acc;
  }, {});

  const typeData = Object.values(typePerformance).map((item: any) => ({
    ...item,
    complianceRate: item.total > 0 ? ((item.onTime / item.total) * 100).toFixed(1) : 0,
    avgProgress: item.total > 0 ? (item.totalProgress / item.total).toFixed(1) : 0
  }));

  // Progress vs Risk Scatter Data
const scatterData = (contracts || [])
  .filter(c => c?.sla_status !== 'invalid')
  .map(contract => {
    const title = contract?.judul_kontrak || '';

    return {
      x: contract?.sla_progress || 0,
      y: contract?.days_overdue || 0,
      name: title.length > 20 
        ? title.substring(0, 20) + '...' 
        : title,
      risk: contract?.risk_level || 'low',
      status: contract?.sla_status || ''
    };
  });



  return (


    
    <div className="space-y-6">
      {/* Enhanced KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Contracts</p>
                <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
                <p className="text-xs text-blue-600 mt-1">Under monitoring</p>
              </div>
              <Building2 className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Compliance Rate</p>
                <p className="text-2xl font-bold text-green-700">{stats.complianceRate.toFixed(1)}%</p>
                <p className="text-xs text-green-600 mt-1">On time + Completed</p>
              </div>
              <Target className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-yellow-200 bg-gradient-to-br from-yellow-50 to-yellow-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">At Risk</p>
                <p className="text-2xl font-bold text-yellow-700">{stats.warning + stats.overdue}</p>
                <p className="text-xs text-yellow-600 mt-1">Warning + Overdue</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-red-200 bg-gradient-to-br from-red-50 to-red-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-600 text-sm font-medium">High Risk</p>
                <p className="text-2xl font-bold text-red-700">{stats.highRisk}</p>
                <p className="text-xs text-red-600 mt-1">Needs immediate attention</p>
              </div>
              <AlertTriangle className="h-10 w-10 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Avg Performance</p>
                <p className="text-2xl font-bold text-purple-700">
                  {contracts.length > 0 ? (contracts.reduce((sum, c) => sum + c.sla_progress, 0) / contracts.length).toFixed(0) : 0}%
                </p>
                <p className="text-xs text-purple-600 mt-1">SLA progress</p>
              </div>
              <TrendingUp className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Enhanced SLA Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              SLA Status Distribution
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
                  label={({ name, percentage }) => `${name}\n${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Risk Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Risk Level Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={riskDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}\n${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {riskDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Contract Type Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5" />
            Performance by Contract Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={typeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="type" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="onTime" stackId="a" fill={COLORS.onTime} name="On Time" />
              <Bar dataKey="warning" stackId="a" fill={COLORS.warning} name="Warning" />
              <Bar dataKey="overdue" stackId="a" fill={COLORS.overdue} name="Overdue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Enhanced Vendor Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Top Vendor Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={trends?.vendorPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="vendor" 
                angle={-45}
                textAnchor="end"
                height={120}
                interval={0}
              />
              <YAxis />
              <Tooltip 
                formatter={(value, name) => [
                  name === 'complianceRate' ? `${value}%` : value,
                  name === 'complianceRate' ? 'Compliance Rate' : name
                ]}
              />
              <Bar dataKey="complianceRate" fill="#3b82f6" name="Compliance Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Direksi Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Performance by Direksi Pekerjaan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={trends?.direksiPerformance || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="direksi" 
                angle={-45}
                textAnchor="end"
                height={120}
                interval={0}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="onTime" stackId="a" fill={COLORS.onTime} name="On Time" />
              <Bar dataKey="warning" stackId="a" fill={COLORS.warning} name="Warning" />
              <Bar dataKey="overdue" stackId="a" fill={COLORS.overdue} name="Overdue" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Progress vs Risk Scatter Plot */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            SLA Progress vs Days Overdue Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <ScatterChart data={scatterData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="x" 
                name="SLA Progress (%)" 
                domain={[0, 150]}
                label={{ value: 'SLA Progress (%)', position: 'insideBottom', offset: -10 }}
              />
              <YAxis 
                dataKey="y" 
                name="Days Overdue"
                label={{ value: 'Days Overdue', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                formatter={(value, name) => [value, name]}
                labelFormatter={() => ''}
                content={({ active, payload }) => {
                  if (active && payload && payload[0]) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border rounded shadow-lg">
                        <p className="font-medium">{data.name}</p>
                        <p className="text-sm">Progress: {data.x}%</p>
                        <p className="text-sm">Days Overdue: {data.y}</p>
                        <Badge className={`text-xs mt-1 ${
                          data.risk === 'high' ? 'bg-red-100 text-red-800' :
                          data.risk === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {data.risk} risk
                        </Badge>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter 
                dataKey="y" 
                fill="#8884d8"
                fillOpacity={0.8}
              />
            </ScatterChart>
          </ResponsiveContainer>
          <div className="mt-4 text-sm text-gray-600">
            <p>• Points in the upper-right quadrant (high progress, high overdue) indicate potential data issues</p>
            <p>• Points in the lower-left quadrant show good performance</p>
            <p>• Vertical line at 100% progress indicates completion threshold</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};