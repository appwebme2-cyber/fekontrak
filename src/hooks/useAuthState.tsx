import { useState, useEffect } from 'react';

const isTokenExpired = (payload: any) => {
  if (!payload?.exp) return false;
  return Date.now() >= payload.exp * 1000;
};

export const useAuthState = () => {
  const [user, setUser] = useState<any>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setSession(null);
  };

  const loadFromToken = () => {
    const token = localStorage.getItem("token");

    if (!token) {
      setUser(null);
      setSession(null);
      return;
    }

    try {
      // Decode JWT payload untuk ambil data user
      const payload = JSON.parse(atob(token.split('.')[1]));

      if (isTokenExpired(payload)) {
        // Token sudah expired (sesi lama tidak dibuka), paksa logout
        logout();
        return;
      }

      setUser({
        id: payload.nameid,
        email: payload.email,
        role: payload.role
      });
      setSession({ token });
    } catch {
      // Kalau decode gagal, hapus token invalid
      logout();
    }
  };

  useEffect(() => {
    loadFromToken();
    setLoading(false);

    // Cek berkala kalau token expired saat tab dibiarkan terbuka lama
    const interval = setInterval(loadFromToken, 60 * 1000);

    // Dipicu oleh api client saat menerima 401 dari server
    const handleExpired = () => logout();
    window.addEventListener('auth:expired', handleExpired);

    return () => {
      clearInterval(interval);
      window.removeEventListener('auth:expired', handleExpired);
    };
  }, []);

  return { user, session, loading, setUser, setSession };
};