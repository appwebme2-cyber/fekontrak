import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Kontrak } from '@/types/database';

interface ContractStatusByDirectionChartProps {
  contracts: Kontrak[];
}

export const ContractStatusByDirectionChart = ({
  contracts
}: ContractStatusByDirectionChartProps) => {
  // Define complete work directions and disciplines from project requirements
  const workDirections = ['MA5', 'MA6', 'MA7', 'Workshop'];
  const disciplines = ['Instrumentasi', 'Electrical', 'Rotating', 'Stationary', 'Alat Berat', 'Tools'];

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
                />
                <Bar 
                  dataKey="Aktif" 
                  stackId="a" 
                  fill="#22c55e" 
                  name="Aktif"
                />
                <Bar 
                  dataKey="Selesai" 
                  stackId="a" 
                  fill="#3b82f6" 
                  name="Selesai"
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
                />
                <Bar 
                  dataKey="Aktif" 
                  stackId="a" 
                  fill="#22c55e" 
                  name="Aktif"
                />
                <Bar 
                  dataKey="Selesai" 
                  stackId="a" 
                  fill="#3b82f6" 
                  name="Selesai"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};