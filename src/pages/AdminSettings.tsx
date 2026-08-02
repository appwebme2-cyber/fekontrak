import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Save, 
  RotateCcw, 
  Clock, 
  Target, 
  Bell,
  AlertTriangle,
  Activity,
  Database,
  Shield,
  Palette,
  FileEdit
} from 'lucide-react';
import { useKonfigurasiSistem, useUpdateKonfigurasi } from '@/hooks/useNewDatabase';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

import SLASettings from '@/components/sla/SLASettings';

// di dalam TabsContent


const AdminSettings = () => {
  const { userProfile } = useAuth();
  const { konfigurasi = [], isLoading } = useKonfigurasiSistem();
  const updateKonfigurasi = useUpdateKonfigurasi();
  const { toast } = useToast();
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});

  // Only admin can access admin settings
  if (userProfile?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Akses Ditolak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Anda tidak memiliki akses untuk mengelola pengaturan sistem. Hanya administrator yang dapat mengakses halaman ini.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleValueChange = (id: string, value: string) => {
    setEditingValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSave = async (config: any) => {
    const newValue = editingValues[config.id_setting] || config.nilai_setting;
    
    try {
      await updateKonfigurasi.mutateAsync({
        id: config.id_setting,
        updates: { nilai_setting: newValue }
      });
      
      setEditingValues(prev => {
        const newValues = { ...prev };
        delete newValues[config.id_setting];
        return newValues;
      });
    } catch (error) {
      console.error('Error updating configuration:', error);
    }
  };

  const handleReset = (config: any) => {
    setEditingValues(prev => {
      const newValues = { ...prev };
      delete newValues[config.id_setting];
      return newValues;
    });
  };

  const getConfigsByCategory = () => {
    const categories = {
      sla: konfigurasi.filter(config => config.nama_setting.includes('SLA')),
      notifications: konfigurasi.filter(config => 
        config.nama_setting.includes('Notifikasi') || 
        config.nama_setting.includes('Reminder')
      ),
      monitoring: konfigurasi.filter(config => 
        config.nama_setting.includes('Progress_Billing') || 
        config.nama_setting.includes('Progress_Deviation')
      ),
      system: konfigurasi.filter(config => 
        config.nama_setting.includes('Format') || 
        (config.nama_setting.includes('Threshold') && !config.nama_setting.includes('Notifikasi')) ||
        (!config.nama_setting.includes('SLA') && 
         !config.nama_setting.includes('Notifikasi') && 
         !config.nama_setting.includes('Reminder') &&
         !config.nama_setting.includes('Progress_'))
      )
    };
    return categories;
  };

  const renderConfigInput = (config: any) => {
    const currentValue = editingValues[config.id_setting] || config.nilai_setting;
    const hasChanges = editingValues[config.id_setting] !== undefined;

    if (config.nilai_setting === 'true' || config.nilai_setting === 'false') {
      return (
        <div className="flex items-center space-x-3">
          <Switch
            checked={currentValue === 'true'}
            onCheckedChange={(checked) => handleValueChange(config.id_setting, checked.toString())}
          />
          <span className="text-sm font-medium">
            {currentValue === 'true' ? 'Aktif' : 'Nonaktif'}
          </span>
        </div>
      );
    }

    if (config.nama_setting.includes('Pukul')) {
      return (
        <Input
          type="time"
          value={currentValue}
          onChange={(e) => handleValueChange(config.id_setting, e.target.value)}
          className={hasChanges ? 'border-blue-300 bg-blue-50' : ''}
        />
      );
    }

    if (config.nama_setting.includes('SLA') || 
        config.nama_setting.includes('Threshold') || 
        config.nama_setting.includes('Progress_Billing_Deviation_Threshold') ||
        config.nama_setting.includes('Progress_Deviation')) {
      return (
        <Input
          type="number"
          value={currentValue}
          onChange={(e) => handleValueChange(config.id_setting, e.target.value)}
          className={hasChanges ? 'border-blue-300 bg-blue-50' : ''}
          min="0"
          max={config.nama_setting.includes('Progress_Billing_Deviation_Threshold') ? "100" : undefined}
        />
      );
    }

    return (
      <Input
        type="text"
        value={currentValue}
        onChange={(e) => handleValueChange(config.id_setting, e.target.value)}
        className={hasChanges ? 'border-blue-300 bg-blue-50' : ''}
      />
    );
  };

  const renderConfigCard = (config: any) => {
    const hasChanges = editingValues[config.id_setting] !== undefined;
    
    return (
      <Card key={config.id_setting} className="hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <Label htmlFor={config.id_setting} className="font-semibold text-base">
                  {config.nama_setting.replace(/_/g, ' ')}
                </Label>
                {hasChanges && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                    Modified
                  </Badge>
                )}
              </div>
              {config.deskripsi && (
                <p className="text-sm text-gray-600 mb-3">{config.deskripsi}</p>
              )}
            </div>
            
            <div className="flex items-center gap-2 min-w-[200px]">
              <div className="flex-1">
                {renderConfigInput(config)}
              </div>
              
              {hasChanges && (
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    onClick={() => handleSave(config)}
                    disabled={updateKonfigurasi.isPending}
                    className="h-8 w-8 p-0"
                  >
                    <Save className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleReset(config)}
                    className="h-8 w-8 p-0"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading settings...</p>
        </div>
      </div>
    );
  }

  const categories = getConfigsByCategory();

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Modern Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            System Configuration
          </h1>
          <p className="text-gray-600 mt-2 text-lg">
            Manage system settings and monitoring parameters
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="flex items-center gap-2 px-3 py-2">
            <Database className="h-4 w-4" />
            {konfigurasi.length} Settings
          </Badge>
          <Badge variant="secondary" className="flex items-center gap-2 px-3 py-2">
            <Shield className="h-4 w-4" />
            Admin Panel
          </Badge>
        </div>
      </div>

      {/* Tabbed Interface */}
      <Tabs defaultValue="sla" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="sla" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            SLA Settings
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            System
          </TabsTrigger>

          
        </TabsList>

        <TabsContent value="sla" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-600" />
                Service Level Agreement Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.sla.map(renderConfigCard)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Progress vs Billing Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.monitoring.filter(config => 
                  config.nama_setting.includes('Progress_Billing')
                ).map(renderConfigCard)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-600" />
                  Progress Deviation Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.monitoring.filter(config => 
                  config.nama_setting.includes('Progress_Deviation')
                ).map(renderConfigCard)}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5 text-purple-600" />
                  General Notifications & Reminders
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.notifications.filter(config => 
                  !config.nama_setting.includes('Amandemen')
                ).map(renderConfigCard)}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileEdit className="h-5 w-5 text-orange-600" />
                  Amendment Alert Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {categories.notifications.filter(config => 
                  config.nama_setting.includes('Amandemen')
                ).map(renderConfigCard)}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-gray-600" />
                General System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {categories.system.map(renderConfigCard)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sla">
  <SLASettings />
</TabsContent>

      </Tabs>

      {/* Quick Reference Summary */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Configuration Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-600">{categories.sla.length}</div>
              <div className="text-sm text-gray-600">SLA Settings</div>
            </div>
            
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <Activity className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-600">{categories.monitoring.length}</div>
              <div className="text-sm text-gray-600">Monitoring Rules</div>
            </div>

            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Bell className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-600">{categories.notifications.length}</div>
              <div className="text-sm text-gray-600">Notifications</div>
            </div>

            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Settings className="h-8 w-8 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-600">{categories.system.length}</div>
              <div className="text-sm text-gray-600">System Settings</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
