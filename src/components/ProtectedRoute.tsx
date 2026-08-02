
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string[];
}

const ProtectedRoute = ({ children, requireRole }: ProtectedRouteProps) => {
  const { user, loading, userProfile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      console.log('No user found, redirecting to auth');
      navigate('/auth');
      return;
    }

    // Check if user is active
    // if (user && userProfile && !userProfile.is_active) {
    //   navigate('/auth');
    //   return;
    // }

    if (requireRole && userProfile && !requireRole.includes(userProfile.role)) {
      navigate('/dashboard');
      return;
    }
  }, [user, loading, userProfile, navigate, requireRole]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Check if user is inactive
  // if (userProfile && !userProfile.is_active) {
  //   return (
  //     <div className="min-h-screen flex items-center justify-center">
  //       <div className="text-center">
  //         <h1 className="text-2xl font-bold mb-2">Akun Tidak Aktif</h1>
  //         <p className="text-muted-foreground">Akun Anda belum diaktifkan oleh admin. Silakan hubungi administrator.</p>
  //       </div>
  //     </div>
  //   );
  // }

  if (requireRole && userProfile && !requireRole.includes(userProfile.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Akses Ditolak</h1>
          <p className="text-muted-foreground">Anda tidak memiliki akses ke halaman ini.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
