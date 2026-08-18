import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ShieldCheck, Check, X, Search, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useUserManagement } from '@/components/user-management/hooks/useUserManagement';
import {
  useRolePermissionsConfig,
  resolveConfigurableRole,
  CONFIGURABLE_MENU_ITEMS,
  PERMISSION_LABELS,
  type RolePermissionFlags,
} from '@/hooks/useRolePermissionsConfig';

const ADMIN_FLAGS: RolePermissionFlags = {
  canCreate: true,
  canEdit: true,
  canDelete: true,
  canManageUsers: true,
  canManageVendors: true,
  canUploadDokumen: true,
  canApprovalDokumen: true,
  visibleMenus: CONFIGURABLE_MENU_ITEMS.map((m) => m.key),
};

const PERMISSION_KEYS = Object.keys(PERMISSION_LABELS) as (keyof typeof PERMISSION_LABELS)[];

const ROLE_BADGE_COLOR: Record<string, string> = {
  admin: 'bg-red-100 text-red-800 border-red-200',
  manager: 'bg-blue-100 text-blue-800 border-blue-200',
  section_head: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  supervisor: 'bg-violet-100 text-violet-800 border-violet-200',
  technician: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  external: 'bg-orange-100 text-orange-800 border-orange-200',
  guest: 'bg-gray-100 text-gray-700 border-gray-200',
};

const Tick = ({ ok }: { ok: boolean }) =>
  ok ? (
    <Check className="h-4 w-4 text-green-600 mx-auto" />
  ) : (
    <X className="h-4 w-4 text-muted-foreground/40 mx-auto" />
  );

const MENU_PREVIEW = 3;

const MenuList = ({ labels }: { labels: string[] }) => {
  const [expanded, setExpanded] = useState(false);
  const shown = expanded ? labels : labels.slice(0, MENU_PREVIEW);
  const remaining = labels.length - MENU_PREVIEW;
  return (
    <div className="flex flex-wrap gap-1">
      {shown.map((label) => (
        <span key={label} className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground whitespace-nowrap">
          {label}
        </span>
      ))}
      {!expanded && remaining > 0 && (
        <button
          onClick={() => setExpanded(true)}
          className="text-xs px-1.5 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 whitespace-nowrap cursor-pointer"
        >
          +{remaining} selengkapnya
        </button>
      )}
      {expanded && remaining > 0 && (
        <button
          onClick={() => setExpanded(false)}
          className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground hover:bg-muted/80 whitespace-nowrap cursor-pointer"
        >
          Sembunyikan
        </button>
      )}
    </div>
  );
};

const ReportAkses: React.FC = () => {
  const [search, setSearch] = useState('');
  const { users, loading } = useUserManagement();
  const { matrix, labels, isLoading: matrixLoading } = useRolePermissionsConfig();

  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      !q ||
      u.full_name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const getFlags = (role: string): RolePermissionFlags => {
    if (role === 'admin') return ADMIN_FLAGS;
    return matrix[resolveConfigurableRole(role)] ?? matrix.guest;
  };

  const getRoleLabel = (role: string): string => {
    if (role === 'admin') return 'Admin';
    const resolved = resolveConfigurableRole(role);
    return labels[resolved] ?? resolved;
  };

  const isLoading = loading || matrixLoading;

  const exportCsv = () => {
    const headers = [
      'Nama Akun', 'Email', 'Role', 'Status',
      ...PERMISSION_KEYS.map((k) => PERMISSION_LABELS[k]),
      'Menu yang Dapat Diakses',
    ];
    const rows = filtered.map((user) => {
      const flags = getFlags(user.role);
      const menuLabels =
        user.role === 'admin'
          ? [...CONFIGURABLE_MENU_ITEMS.map((m) => m.label), '(semua menu admin)']
          : CONFIGURABLE_MENU_ITEMS.filter((m) => flags.visibleMenus.includes(m.key)).map((m) => m.label);
      return [
        user.full_name || '',
        user.email,
        getRoleLabel(user.role),
        user.is_active ? 'Aktif' : 'Nonaktif',
        ...PERMISSION_KEYS.map((k) => (flags[k] ? 'Ya' : 'Tidak')),
        menuLabels.join(', '),
      ];
    });

    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((r) => r.map(escape).join(',')).join('\n');
    const bom = '﻿';
    const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-akses-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold">Report Akses</h1>
          <p className="text-sm text-muted-foreground">
            Matriks hak akses per akun pengguna berdasarkan role yang dikonfigurasi
          </p>
        </div>
      </div>

      {/* Ringkasan menu per role */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Referensi Hak Akses per Role</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-36">Role</TableHead>
                  {PERMISSION_KEYS.map((k) => (
                    <TableHead key={k} className="text-center text-xs whitespace-nowrap">
                      {PERMISSION_LABELS[k]}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Admin selalu semua bisa */}
                <TableRow className="bg-red-50/40">
                  <TableCell>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${ROLE_BADGE_COLOR.admin}`}>
                      Admin
                    </span>
                  </TableCell>
                  {PERMISSION_KEYS.map((k) => (
                    <TableCell key={k} className="text-center"><Tick ok /></TableCell>
                  ))}
                </TableRow>
                {(Object.entries(matrix) as [string, RolePermissionFlags][]).map(([role, flags]) => (
                  <TableRow key={role}>
                    <TableCell>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${ROLE_BADGE_COLOR[role] ?? ROLE_BADGE_COLOR.guest}`}>
                        {labels[role as keyof typeof labels] ?? role}
                      </span>
                    </TableCell>
                    {PERMISSION_KEYS.map((k) => (
                      <TableCell key={k} className="text-center">
                        <Tick ok={flags[k] as boolean} />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Tabel per akun */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <CardTitle className="text-base">
              {isLoading ? 'Memuat...' : `${filtered.length} akun pengguna`}
            </CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Cari nama / email / role..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 w-64"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={exportCsv}
                disabled={isLoading || !filtered.length}
                className="flex items-center gap-1.5 whitespace-nowrap"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-40">Nama Akun</TableHead>
                  <TableHead className="min-w-48">Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  {PERMISSION_KEYS.map((k) => (
                    <TableHead key={k} className="text-center text-xs whitespace-nowrap">
                      {PERMISSION_LABELS[k]}
                    </TableHead>
                  ))}
                  <TableHead className="min-w-56">Menu yang Dapat Diakses</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={4 + PERMISSION_KEYS.length + 1} className="text-center py-8 text-muted-foreground">
                      Memuat data...
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && !filtered.length && (
                  <TableRow>
                    <TableCell colSpan={4 + PERMISSION_KEYS.length + 1} className="text-center py-8 text-muted-foreground">
                      Tidak ada akun ditemukan
                    </TableCell>
                  </TableRow>
                )}
                {filtered.map((user) => {
                  const flags = getFlags(user.role);
                  const menuLabels =
                    user.role === 'admin'
                      ? CONFIGURABLE_MENU_ITEMS.map((m) => m.label)
                      : CONFIGURABLE_MENU_ITEMS.filter((m) => flags.visibleMenus.includes(m.key)).map((m) => m.label);

                  return (
                    <TableRow key={user.id} className={!user.is_active ? 'opacity-50' : ''}>
                      <TableCell className="font-medium whitespace-nowrap">{user.full_name || '—'}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{user.email}</TableCell>
                      <TableCell>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${ROLE_BADGE_COLOR[user.role] ?? ROLE_BADGE_COLOR.guest}`}>
                          {getRoleLabel(user.role)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? 'default' : 'secondary'} className="text-xs">
                          {user.is_active ? 'Aktif' : 'Nonaktif'}
                        </Badge>
                      </TableCell>
                      {PERMISSION_KEYS.map((k) => (
                        <TableCell key={k} className="text-center">
                          <Tick ok={flags[k] as boolean} />
                        </TableCell>
                      ))}
                      <TableCell>
                        <MenuList labels={user.role === 'admin' ? [...menuLabels, '+ semua menu admin'] : menuLabels} />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportAkses;
