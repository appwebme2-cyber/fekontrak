
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useUserManagement } from './user-management/hooks/useUserManagement';
import { UserRoleSummaryCards } from './user-management/components/UserRoleSummaryCards';
import { UserSearch } from './user-management/components/UserSearch';
import { UserTableRow } from './user-management/components/UserTableRow';
import { AddUserDialog } from './user-management/components/AddUserDialog';
import { EditUserDialog } from './user-management/components/EditUserDialog';
import { DeleteConfirmDialog } from './user-management/components/DeleteConfirmDialog';
import { Button } from '@/components/ui/button';

const UserManagement = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { userProfile } = useAuth();
  const { roleLabel } = usePermissions();

  const {
    users,
    loading,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    formData,
    setFormData,
    deleteConfirm,
    setDeleteConfirm,
    isAdmin,
    handleToggleUserStatus,
    handleEditUser,
    handleUpdateUser,
    handleAddUser,
    handleDeleteUser,
    confirmDelete
  } = useUserManagement();

  const filteredUsers = users.filter(user =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex items-center justify-between animate-fade-in-scale">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
              Manajemen Pengguna
            </h1>
            <p className="text-muted-foreground">
              Kelola akun pengguna dan kontrol akses berbasis role
            </p>
          </div>
        </div>
        
        {/* Add User Button - only for admin */}
        {isAdmin && (
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Tambah Pengguna
          </Button>
        )}
      </div>

      {/* User Info */}
      <div className="mb-4 animate-fade-in-scale" style={{ animationDelay: '0.1s' }}>
        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-800">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 text-sm">
              <span className="text-muted-foreground">Login sebagai:</span>
              <span className="font-semibold text-blue-700 dark:text-blue-300">
                {userProfile?.full_name}
              </span>
              <span className="text-muted-foreground">({roleLabel})</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role Summary Cards */}
      <div className="animate-fade-in-scale" style={{ animationDelay: '0.2s' }}>
        <UserRoleSummaryCards users={users} />
      </div>

      {/* Search Section */}
      <Card className="animate-fade-in-scale" style={{ animationDelay: '0.3s' }}>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Pencarian Pengguna</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Cari berdasarkan nama, email, atau role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-background"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card className="card-hover animate-fade-in-scale" style={{ animationDelay: '0.4s' }}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="w-5 h-5" />
            <span>Daftar Pengguna</span>
          </CardTitle>
          <CardDescription>
            Kelola status aktif dan data pengguna sistem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-semibold">Nama</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Perusahaan</TableHead>
                  {isAdmin && <TableHead className="font-semibold">Aktif</TableHead>}
                  {isAdmin && <TableHead className="font-semibold">Aksi</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={isAdmin ? 7 : 5} className="text-center py-8">
                      <div className="flex flex-col items-center space-y-2">
                        <Users className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {searchTerm ? 'Tidak ada pengguna yang sesuai dengan pencarian' : 'Tidak ada data pengguna'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user, index) => (
                    <UserTableRow
                      key={user.id}
                      user={user}
                      index={index}
                      isAdmin={isAdmin}
                      currentUserId={userProfile?.id}
                      onToggleStatus={handleToggleUserStatus}
                      onEdit={handleEditUser}
                      onDelete={handleDeleteUser}
                    />
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialogs */}
      <AddUserDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleAddUser}
      />

      <EditUserDialog
        isOpen={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleUpdateUser}
      />

      <DeleteConfirmDialog
        isOpen={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ open, user: deleteConfirm.user })}
        user={deleteConfirm.user}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default UserManagement;
