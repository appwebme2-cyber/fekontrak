import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export const useAuthActions = (setUser: any, setSession: any, setUserProfile: any) => {
  const { toast } = useToast();

  // ==================== SIGN IN ====================
  const signIn = async (email: string, password: string) => {
    try {
      setUserProfile(null);

      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast({
          title: "Error",
          description: result.message || "Login gagal",
          variant: "destructive",
        });
        return { error: result.message };
      }

      localStorage.setItem("token", result.token);

      // Set user dengan data dari response backend
      const userData = { id: result.id, email: result.email, role: result.role };
      setUser(userData);
      setSession({ token: result.token });

      toast({ title: "Berhasil", description: "Login berhasil!" });
      return { data: { user: userData }, error: null };

    } catch (error: any) {
      console.error('[DEBUG] Login error:', error);
      return { error: error.message };
    }
  };

  // ==================== SIGN UP ====================
  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password,
          fullName: fullName || email,
          role: "user"
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        toast({
          title: "Registrasi Gagal",
          description: result.message || "Gagal mendaftar",
          variant: "destructive",
        });
        return { error: result.message };
      }

      toast({
        title: "Registrasi Berhasil",
        description: "Akun berhasil dibuat. Tunggu admin mengaktifkan akun Anda.",
      });

      return { data: result, error: null, needsConfirmation: false };

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat registrasi",
        variant: "destructive",
      });
      return { error: error.message };
    }
  };

  // ==================== SIGN OUT ====================
  const signOut = async () => {
    try {
      localStorage.removeItem("token");
      setUser(null);
      setSession(null);
      setUserProfile(null);
      toast({ title: "Berhasil", description: "Logout berhasil!" });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return { signIn, signUp, signOut };
};