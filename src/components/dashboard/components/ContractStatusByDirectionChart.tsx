import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Kontrak } from '@/types/database';

interface ContractStatusByDirectionChartProps {
  contracts: Kontrak[];
}

// Samakan label status di chart (Bahasa Indonesia) dengan nilai status_kontrak
// yang sudah dinormalisasi di halaman Daftar Kontrak (NewContracts.tsx)
const STATUS_PARAM_MAP: Record<string, string> = {
  'Pre-KOM': 'Pre-KOM',
  'Aktif': 'Active',
  'Selesai': 'Completed',
};

export const ContractStatusByDirectionChart = ({
  contracts
}: ContractStatusByDirectionChartProps) => {
  const navigate = useNavigate();

  // Define complete work directions and disciplines from project requirements
  const workDirections = ['MA5', 'MA6', 'MA7', 'Workshop'];
  const disciplines = ['Instrumentasi', 'Electrical', 'Rotating', 'Stationary', 'Alat Berat', 'Tools'];

  // Klik batang "Direksi Pekerjaan" → buka Daftar Kontrak dengan filter status + direksi
  const handleDirectionBarClick = (statusLabel: string) => (data: any) => {
    const direction = data?.direction ?? data?.payload?.direction;
    if (!direction || direction === 'Data Tidak Lengkap') return;
    const status = STATUS_PARAM_MAP[statusLabel] ?? statusLabel;
    navigate(`/contracts?status=${encodeURIComponent(status)}&direksi=${encodeURIComponent(direction)}`);
  };

  // Klik batang "Disiplin" → buka Daftar Kontrak dengan filter status + disiplin
  const handleDisciplineBarClick = (statusLabel: string) => (data: any) => {
    const discipline = data?.discipline ?? data?.payload?.discipline;
    if (!discipline || discipline === 'Data Tidak Lengkap') return;
    const status = STATUS_PARAM_MAP[statusLabel] ?? statusLabel;
    navigate(`/contracts?status=${encodeURIComponent(status)}&disiplin=${encodeURIComponent(discipline)}`);
  };

  // Process data for the work direction chart
  const directionChartData = React.useMemo(() => {
    const dataMap = new Map();
    
    // Initialize all work directions
    workDirections.forEach(direction => {
      dataMap.set(direction, {
        direction,
        'Pre-KOM': 0,
        'Aktif': 0,
        'Selesai': 0
      });
    });

    // Add "Data Tidak Lengkap" for contracts without work direction
    dataMap.set('Data Tidak Lengkap', {
      direction: 'Data Tidak Lengkap',
      'Pre-KOM': 0,
      'Aktif': 0,
      'Selesai': 0
    });
    
    contracts.forEach(contract => {
      const direction = contract.direksi_pekerjaan || 'Data Tidak Lengkap';
      const status = contract.status_kontrak || 'Pre-KOM';
      
      if (dataMap.has(direction)) {
        const entry = dataMap.get(direction);
        entry[status] = (entry[status] || 0) + 1;
      }
    });
    
    return Array.from(dataMap.values()).sort((a, b) => {
      // Sort by total contracts, but put "Data Tidak Lengkap" at the end
      if (a.direction === 'Data Tidak Lengkap') return 1;
      if (b.direction === 'Data Tidak Lengkap') return -1;
      return (b['Pre-KOM'] + b.Aktif + b.Selesai) - 
             (a['Pre-KOM'] + a.Aktif + a.Selesai);
    });
  }, [contracts]);

  // Process data for the discipline chart
  const disciplineChartData = React.useMemo(() => {
    const dataMap = new Map();
    
    // Initialize all disciplines
    disciplines.forEach(discipline => {
      dataMap.set(discipline, {
        discipline,
        'Pre-KOM': 0,
        'Aktif': 0,
        'Selesai': 0
      });
    });

    // Add "Data Tidak Lengkap" for contracts without discipline
    dataMap.set('Data Tidak Lengkap', {
      discipline: 'Data Tidak Lengkap',
      'Pre-KOM': 0,
      'Aktif': 0,
      'Selesai': 0
    });
    
    contracts.forEach(contract => {
      const discipline = contract.disiplin || 'Data Tidak Lengkap';
      const status = contract.status_kontrak || 'Pre-KOM';
      
      if (dataMap.has(discipline)) {
        const entry = dataMap.get(discipline);
        entry[status] = (entry[status] || 0) + 1;
      }
    });
    
    return Array.from(dataMap.values()).sort((a, b) => {
      // Sort by total contracts, but put "Data Tidak Lengkap" at the end
      if (a.discipline === 'Data Tidak Lengkap') return 1;
      if (b.discipline === 'Data Tidak Lengkap') return -1;
      return (b['Pre-KOM'] + b.Aktif + b.Selesai) - 
             (a['Pre-KOM'] + a.Aktif + a.Selesai);
    });
  }, [contracts]);

  return (
    <div className="space-y-6">
      {/* Work Direction Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Status Kontrak berdasarkan Direksi Pekerjaan
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Total {contracts.length} kontrak dari 4 area: MA5, MA6, MA7, dan Workshop
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Klik salah satu bagian batang untuk melihat daftar kontraknya
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={directionChartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="direction"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                  formatter={(value, name) => [value, name]}
                />
                <Legend />
                <Bar
                  dataKey="Pre-KOM"
                  stackId="a"
                  fill="#f59e0b"
                  name="Pre-KOM"
                  onClick={handleDirectionBarClick('Pre-KOM')}
                  style={{ cursor: 'pointer' }}
                />
                <Bar
                  dataKey="Aktif"
                  stackId="a"
                  fill="#22c55e"
                  name="Aktif"
                  onClick={handleDirectionBarClick('Aktif')}
                  style={{ cursor: 'pointer' }}
                />
                <Bar
                  dataKey="Selesai"
                  stackId="a"
                  fill="#3b82f6"
                  name="Selesai"
                  onClick={handleDirectionBarClick('Selesai')}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Discipline Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Status Kontrak berdasarkan Disiplin
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Distribusi kontrak berdasarkan 6 disiplin: Instrumentasi, Electrical, Rotating, Stationary, Alat Berat, dan Tools
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Klik salah satu bagian batang untuk melihat daftar kontraknya
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={disciplineChartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 60,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="discipline"
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip
                  labelStyle={{ color: '#374151' }}
                  contentStyle={{
                    backgroundColor: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px'
                  }}
                  formatter={(value, name) => [value, name]}
                />
                <Legend />
                <Bar
                  dataKey="Pre-KOM"
                  stackId="a"
                  fill="#f59e0b"
                  name="Pre-KOM"
                  onClick={handleDisciplineBarClick('Pre-KOM')}
                  style={{ cursor: 'pointer' }}
                />
                <Bar
                  dataKey="Aktif"
                  stackId="a"
                  fill="#22c55e"
                  name="Aktif"
                  onClick={handleDisciplineBarClick('Aktif')}
                  style={{ cursor: 'pointer' }}
                />
                <Bar
                  dataKey="Selesai"
                  stackId="a"
                  fill="#3b82f6"
                  name="Selesai"
                  onClick={handleDisciplineBarClick('Selesai')}
                  style={{ cursor: 'pointer' }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};