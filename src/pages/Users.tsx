
import { useAuth } from '@/hooks/useAuth';
import UserManagement from '@/components/UserManagement';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const Users = () => {
  const { userProfile } = useAuth();

  // Only admin can access user management
  if (userProfile?.role !== 'admin') {
    return (
      <div className="container mx-auto px-6 py-8">
        <Card className="max-w-2xl mx-auto animate-fade-in-scale">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-destructive">Akses Ditolak</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
              <p className="text-muted-foreground text-center">
                Anda tidak memiliki akses untuk mengelola pengguna. Hanya administrator yang dapat mengakses halaman ini.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-8">
      <UserManagement />
    </div>
  );
};

export default Users;
