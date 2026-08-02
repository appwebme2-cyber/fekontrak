import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { UserProfile, UserFormData } from '../types';
import { resolveConfigurableRole } from '@/hooks/useRolePermissionsConfig';

const API_URL = "https://bekontrak-production.up.railway.app/api";

const getToken = () => localStorage.getItem("token");

const authHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${getToken()}`
});

const mapUser = (u: any): UserProfile => ({
  id: u.id,
  email: u.email,
  full_name: u.fullName ?? u.full_name ?? '',
  role: u.role,
  id_vendor: u.idVendor ?? u.id_vendor ?? undefined,
  is_active: u.isActive ?? u.is_active ?? true,
  created_at: u.createdAt ?? u.created_at,
  updated_at: u.updatedAt ?? u.updated_at,
});

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [formData, setFormData] = useState<UserFormData>({
    email: '', full_name: '', role: 'guest', id_vendor: '',
  });
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; user: UserProfile | null }>({
    open: false, user: null
  });

  const { toast } = useToast();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'admin';

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/profile`, { headers: authHeaders() });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers((data || []).map(mapUser));
    } catch (error) {
      toast({ title: "Error", description: "Gagal memuat data pengguna", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    if (!isAdmin) return;
    if (userId === userProfile?.id) {
      toast({ title: "Aksi Tidak Diperbolehkan", description: "Tidak dapat mengubah status akun sendiri.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/profile/${userId}/status`, { method: 'PATCH', headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message);
      toast({ title: "Berhasil", description: `User berhasil ${!currentStatus ? 'diaktifkan' : 'dinonaktifkan'}` });
      fetchUsers();
    } catch {
      toast({ title: "Error", description: "Gagal mengubah status user.", variant: "destructive" });
    }
  };

  const handleEditUser = (user: UserProfile) => {
    if (user.id === userProfile?.id) {
      toast({ title: "Aksi Tidak Diperbolehkan", description: "Tidak dapat mengedit akun sendiri.", variant: "destructive" });
      return;
    }
    setSelectedUser(user);
    const role = user.role === 'admin' ? 'admin' : resolveConfigurableRole(user.role);
    setFormData({ email: user.email, full_name: user.full_name, role, id_vendor: user.id_vendor || '' });
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser || !isAdmin) return;
    if (selectedUser.id === userProfile?.id) {
      toast({ title: "Aksi Tidak Diperbolehkan", description: "Tidak dapat mengedit akun sendiri.", variant: "destructive" });
      return;
    }
    if (!formData.full_name.trim()) {
      toast({ title: "Validasi Error", description: "Nama tidak boleh kosong.", variant: "destructive" });
      return;
    }
    if (formData.role === 'external' && !formData.id_vendor) {
      toast({ title: "Validasi Error", description: "Pilih vendor untuk role External.", variant: "destructive" });
      return;
    }
    try {
      if (formData.role === 'external' && formData.id_vendor) {
        // Assign vendor → set role=external + id_vendor
        const res = await fetch(`${API_URL}/profile/${selectedUser.id}/assign-vendor`, {
          method: 'PUT', headers: authHeaders(),
          body: JSON.stringify({ idVendor: formData.id_vendor })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message);

        // Update nama juga
        await fetch(`${API_URL}/profile/${selectedUser.id}`, {
          method: 'PUT', headers: authHeaders(),
          body: JSON.stringify({ fullName: formData.full_name.trim(), role: 'external' })
        });
      } else {
        const res = await fetch(`${API_URL}/profile/${selectedUser.id}`, {
          method: 'PUT', headers: authHeaders(),
          body: JSON.stringify({ fullName: formData.full_name.trim(), role: formData.role })
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.message);
      }
      toast({ title: "Berhasil", description: "Data pengguna berhasil diperbarui" });
      setIsEditDialogOpen(false);
      fetchUsers();
    } catch {
      toast({ title: "Error", description: "Gagal memperbarui data pengguna.", variant: "destructive" });
    }
  };

  const handleAddUser = async () => {
    if (!isAdmin) return;
    const cleanEmail = formData.email.trim();
    const cleanName = formData.full_name.trim();
    if (!cleanEmail || !cleanName) {
      toast({ title: "Validasi Error", description: "Email dan nama wajib diisi.", variant: "destructive" });
      return;
    }
    if (formData.role === 'external' && !formData.id_vendor) {
      toast({ title: "Validasi Error", description: "Pilih vendor untuk role External.", variant: "destructive" });
      return;
    }
    try {
      // Pakai admin-register agar role bisa diset apapun
      const res = await fetch(`${API_URL}/auth/admin-register`, {
        method: 'POST', headers: authHeaders(),
        body: JSON.stringify({ email: cleanEmail, fullName: cleanName, role: formData.role, password: 'Password123!' })
      });
      const data = await res.json().catch(() => ({}));
      if (res.status === 400 && data?.message?.toLowerCase().includes('terdaftar')) {
        toast({ title: "User sudah ada", description: "Email sudah terdaftar.", variant: "destructive" });
        return;
      }
      if (!res.ok) throw new Error(data?.message);

      // Assign vendor kalau role external
      if (formData.role === 'external' && formData.id_vendor && data.id) {
        await fetch(`${API_URL}/profile/${data.id}/assign-vendor`, {
          method: 'PUT', headers: authHeaders(),
          body: JSON.stringify({ idVendor: formData.id_vendor })
        });
      }

      toast({ title: "Berhasil", description: "User baru ditambahkan. Password default: Password123!" });
      setIsAddDialogOpen(false);
      setFormData({ email: '', full_name: '', role: 'guest', id_vendor: '' });
      fetchUsers();
    } catch {
      toast({ title: "Error", description: "Gagal menambah user baru.", variant: "destructive" });
    }
  };

  const handleDeleteUser = async (user: UserProfile) => {
    setDeleteConfirm({ open: true, user });
  };

  const confirmDelete = async () => {
    const user = deleteConfirm.user;
    setDeleteConfirm({ open: false, user: null });
    if (!isAdmin || !user) return;
    if (user.id === userProfile?.id) {
      toast({ title: "Aksi Tidak Diperbolehkan", description: "Tidak dapat menghapus akun sendiri.", variant: "destructive" });
      return;
    }
    try {
      const res = await fetch(`${API_URL}/profile/${user.id}`, { method: 'DELETE', headers: authHeaders() });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.message);
      toast({ title: "User Dihapus", description: "User berhasil dihapus." });
      fetchUsers();
    } catch {
      toast({ title: "Error", description: "Gagal menghapus user.", variant: "destructive" });
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  return {
    users, loading,
    isAddDialogOpen, setIsAddDialogOpen,
    isEditDialogOpen, setIsEditDialogOpen,
    formData, setFormData,
    deleteConfirm, setDeleteConfirm,
    isAdmin,
    handleToggleUserStatus,
    handleEditUser, handleUpdateUser,
    handleAddUser, handleDeleteUser, confirmDelete
  };
};