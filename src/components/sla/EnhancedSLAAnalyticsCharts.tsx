import React, { useState } from 'react';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog';
import {
  Tooltip, TooltipContent, TooltipProvider, TooltipTrigger
} from '@/components/ui/tooltip';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, Legend
} from 'recharts';
import {
  TrendingUp, TrendingDown, AlertTriangle,
  Target, Users, Building2, Info,
  HelpCircle, FileText, Activity
} from 'lucide-react';

type SLAAnalysis = any;

interface Props {
  slaAnalysis: SLAAnalysis;
}

const COLORS = {
  excellent: '#16a34a',
  good: '#22c55e',
  warning: '#eab308',
  critical: '#dc2626',
  completed: '#3b82f6',
  info: '#6366f1',
  lowRisk: '#10b981',
  mediumRisk: '#f59e0b',
  highRisk: '#ef4444'
};

export const EnhancedSLAAnalyticsCharts: React.FC<Props> = ({ slaAnalysis }) => {

  const [showSLAExplanation, setShowSLAExplanation] = useState(false);

  // ✅ PROTECTION TOTAL
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

  // ✅ SAFE DIVISION
  const safePercent = (val: number) =>
    stats.total > 0 ? ((val / stats.total) * 100).toFixed(1) : '0';

  // ================= STATUS =================
  const statusDistribution = [
    { name: 'Tepat Waktu', value: stats.onTime, color: COLORS.excellent, percentage: safePercent(stats.onTime) },
    { name: 'Perlu Perhatian', value: stats.warning, color: COLORS.warning, percentage: safePercent(stats.warning) },
    { name: 'Terlambat', value: stats.overdue, color: COLORS.critical, percentage: safePercent(stats.overdue) },
    { name: 'Selesai', value: stats.completed, color: COLORS.completed, percentage: safePercent(stats.completed) }
  ].filter(i => i.value > 0);

  // ================= TYPE =================
  const typePerformance = (contracts || []).reduce((acc: any, c: any) => {
    const type = c?.tipe_kontrak || 'Unknown';

    if (!acc[type]) {
      acc[type] = { type, onTime: 0, overdue: 0, warning: 0, completed: 0, total: 0 };
    }

    acc[type].total++;

    if (c?.sla_status === 'on_time') acc[type].onTime++;
    else if (c?.sla_status === 'warning') acc[type].warning++;
    else if (c?.sla_status === 'overdue') acc[type].overdue++;
    else if (c?.sla_status === 'completed') acc[type].completed++;

    return acc;
  }, {});

  const typeData = Object.values(typePerformance);

  // ================= SCATTER =================
  const scatterData = (contracts || []).map((c: any) => ({
    x: c?.sla_progress || 0,
    y: c?.days_overdue || 0,
    name: (c?.judul_kontrak || '').substring(0, 20),
  }));

  return (
    <TooltipProvider>
      <div className="space-y-6">

        {/* KPI */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="border-0 text-white bg-gradient-to-r from-blue-500 to-blue-600"><CardContent className="p-4">
            <p className="text-white/90">Total</p>
            <p className="text-xl font-bold text-white">{stats.total}</p>
          </CardContent></Card>

          <Card className="border-0 text-white bg-gradient-to-r from-green-500 to-green-600"><CardContent className="p-4">
            <p className="text-white/90">Compliance</p>
            <p className="text-xl font-bold text-white">{Number(stats.complianceRate || 0).toFixed(2)}%</p>
          </CardContent></Card>

          <Card className="border-0 text-white bg-gradient-to-r from-amber-500 to-amber-600"><CardContent className="p-4">
            <p className="text-white/90">Warning</p>
            <p className="text-xl font-bold text-white">{stats.warning}</p>
          </CardContent></Card>

          <Card className="border-0 text-white bg-gradient-to-r from-red-500 to-red-600"><CardContent className="p-4">
            <p className="text-white/90">Overdue</p>
            <p className="text-xl font-bold text-white">{stats.overdue}</p>
          </CardContent></Card>
        </div>

        {/* PIE */}
        <Card>
          <CardHeader><CardTitle>Status SLA</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={statusDistribution} dataKey="value">
                  {statusDistribution.map((e, i) => (
                    <Cell key={i} fill={e.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* TYPE */}
        <Card>
          <CardHeader><CardTitle>Tipe Kontrak</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={typeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" />
                <YAxis />
                <Bar dataKey="onTime" fill="#10b981" />
                <Bar dataKey="warning" fill="#f59e0b" />
                <Bar dataKey="overdue" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ✅ FIX UTAMA */}
        <Card>
          <CardHeader><CardTitle>Vendor</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends?.vendorPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="vendor" />
                <YAxis />
                <Bar dataKey="complianceRate" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* ✅ FIX UTAMA */}
        <Card>
          <CardHeader><CardTitle>Direksi</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={trends?.direksiPerformance || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="direksi" />
                <YAxis />
                <Bar dataKey="onTime" fill="#10b981" />
                <Bar dataKey="warning" fill="#f59e0b" />
                <Bar dataKey="overdue" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* SCATTER */}
        <Card>
          <CardHeader><CardTitle>Scatter</CardTitle></CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ScatterChart>
                <CartesianGrid />
                <XAxis dataKey="x" />
                <YAxis dataKey="y" />
                <Scatter data={scatterData} fill="#8884d8" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

      </div>
    </TooltipProvider>
  );
};