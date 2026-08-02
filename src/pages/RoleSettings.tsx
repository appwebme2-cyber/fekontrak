import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Save, RotateCcw, Info, Eye, Tag } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import {
  CONFIGURABLE_MENU_ITEMS,
  ConfigurableRole,
  DEFAULT_ROLE_LABELS,
  DEFAULT_ROLE_PERMISSIONS,
  PERMISSION_LABELS,
  RoleLabels,
  RolePermissionMatrix,
  useRolePermissionsConfig,
  useUpdateRolePermissions,
} from '@/hooks/useRolePermissionsConfig';

// Sembunyikan sementara — admin belum perlu ganti nama tampilan role saat ini.
const SHOW_NAMA_JENIS_AKUN = false;

const RoleSettings = () => {
  const { userProfile } = useAuth();
  const { matrix, labels, isLoading, isSyncedRemotely } = useRolePermissionsConfig();
  const { save, isPending } = useUpdateRolePermissions();

  const [draft, setDraft] = useState<RolePermissionMatrix>(matrix);
  const [draftLabels, setDraftLabels] = useState<RoleLabels>(labels);

  useEffect(() => {
    setDraft(matrix);
  }, [matrix]);

  useEffect(() => {
    setDraftLabels(labels);
  }, [labels]);

  if (userProfile?.role !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Akses Ditolak</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Anda tidak memiliki akses untuk mengelola pengaturan role. Hanya administrator yang
              dapat mengakses halaman ini.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const toggle = (role: keyof RolePermissionMatrix, permission: string) => {
    setDraft((prev) => ({
      ...prev,
      [role]: { ...prev[role], [permission]: !prev[role][permission as keyof typeof prev[typeof role]] },
    }));
  };

  const toggleMenu = (role: keyof RolePermissionMatrix, menuKey: string) => {
    setDraft((prev) => {
      const current = prev[role].visibleMenus;
      const next = current.includes(menuKey)
        ? current.filter((key) => key !== menuKey)
        : [...current, menuKey];
      return { ...prev, [role]: { ...prev[role], visibleMenus: next } };
    });
  };

  const setLabel = (role: ConfigurableRole, value: string) => {
    setDraftLabels((prev) => ({ ...prev, [role]: value }));
  };

  const hasChanges =
    JSON.stringify(draft) !== JSON.stringify(matrix) ||
    JSON.stringify(draftLabels) !== JSON.stringify(labels);

  const handleSave = () => save(draft, draftLabels);
  const handleReset = () => {
    setDraft(DEFAULT_ROLE_PERMISSIONS);
    setDraftLabels(DEFAULT_ROLE_LABELS);
  };

  const roles = Object.keys(draft) as Array<keyof RolePermissionMatrix>;
  const permissionKeys = Object.keys(PERMISSION_LABELS) as Array<keyof typeof PERMISSION_LABELS>;

  const menuGroups = CONFIGURABLE_MENU_ITEMS.reduce<Record<string, typeof CONFIGURABLE_MENU_ITEMS>>(
    (acc, item) => {
      acc[item.group] = acc[item.group] ? [...acc[item.group], item] : [item];
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6 p-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="h-7 w-7 text-blue-600" />
            Pengaturan Role
          </h1>
          <p className="text-gray-600 mt-1">
            Atur hak akses untuk role Manager, Section Head, Supervisor, Technician, External, dan
            Guest. Role Admin selalu memiliki akses penuh dan tidak dapat diubah.
          </p>
        </div>
        <Badge variant={isSyncedRemotely ? 'secondary' : 'outline'} className="flex items-center gap-2 px-3 py-2">
          <Info className="h-4 w-4" />
          {isSyncedRemotely ? 'Tersimpan di server' : 'Tersimpan lokal di perangkat ini'}
        </Badge>
      </div>

      {SHOW_NAMA_JENIS_AKUN && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="h-5 w-5" />
              Nama Jenis Akun
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              Ganti nama tampilan role Manager, Section Head, Supervisor, Technician, External, dan
              Guest sesuai jabatan di organisasi Anda. Nama ini akan muncul di seluruh aplikasi
              (badge role, daftar pengguna, dll), tapi hak aksesnya tetap mengikuti pengaturan di
              bawah — mengganti nama tidak mengubah hak akses.
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <div key={role} className="grid gap-2">
                  <Label htmlFor={`label-${role}`}>{DEFAULT_ROLE_LABELS[role]}</Label>
                  <Input
                    id={`label-${role}`}
                    value={draftLabels[role]}
                    onChange={(e) => setLabel(role, e.target.value)}
                    placeholder={DEFAULT_ROLE_LABELS[role]}
                  />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Matriks Hak Akses</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-sm text-gray-500">Memuat pengaturan...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-semibold">Hak Akses</th>
                    {roles.map((role) => (
                      <th key={role} className="text-center py-2 px-4 font-semibold">
                        {draftLabels[role]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {permissionKeys.map((permission) => (
                    <tr key={permission} className="border-b last:border-0">
                      <td className="py-3 pr-4 text-gray-700">{PERMISSION_LABELS[permission]}</td>
                      {roles.map((role) => (
                        <td key={role} className="text-center py-3 px-4">
                          <Switch
                            checked={Boolean(draft[role][permission])}
                            onCheckedChange={() => toggle(role, permission)}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Visibilitas Menu
          </CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            Atur menu mana yang muncul di sidebar untuk masing-masing role. Menu Master Data dan
            Administration selalu khusus Admin dan tidak dapat diubah di sini.
          </p>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-sm text-gray-500">Memuat pengaturan...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-4 font-semibold">Menu</th>
                    {roles.map((role) => (
                      <th key={role} className="text-center py-2 px-4 font-semibold">
                        {draftLabels[role]}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {Object.entries(menuGroups).map(([group, items]) => (
                    <React.Fragment key={group}>
                      <tr className="bg-gray-50">
                        <td colSpan={roles.length + 1} className="py-2 pr-4 text-xs font-semibold uppercase text-gray-500 tracking-wider">
                          {group}
                        </td>
                      </tr>
                      {items.map((item) => (
                        <tr key={item.key} className="border-b last:border-0">
                          <td className="py-3 pr-4 text-gray-700">{item.label}</td>
                          {roles.map((role) => (
                            <td key={role} className="text-center py-3 px-4">
                              <Switch
                                checked={draft[role].visibleMenus.includes(item.key)}
                                onCheckedChange={() => toggleMenu(role, item.key)}
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center gap-2 mt-6">
            <Button onClick={handleSave} disabled={!hasChanges || isPending}>
              <Save className="h-4 w-4 mr-2" />
              Simpan Perubahan
            </Button>
            <Button variant="outline" onClick={handleReset} disabled={isPending}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Kembalikan ke Default
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RoleSettings;
