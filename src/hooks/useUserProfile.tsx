import { useState, useEffect } from 'react';

const API_URL = "https://bekontrak-production.up.railway.app/api";

export const useUserProfile = (user: any) => {
  const [userProfile, setUserProfile] = useState<any>(null);

  const refreshProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUserProfile(null);
      return;
    }

    try {
      const res = await fetch(`${API_URL}/Profile/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!res.ok) {
        setUserProfile(null);
        return;
      }

      const data = await res.json();

      // Map camelCase → snake_case untuk konsistensi frontend
      setUserProfile({
        id: data.id,
        email: data.email,
        full_name: data.fullName,
        role: data.role,
        id_vendor: data.idVendor || null,
        created_at: data.createdAt,
      });

    } catch (error) {
      console.error('[Auth] Error fetching profile:', error);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    if (user && !userProfile) {
      refreshProfile();
    }
  }, [user]);

  useEffect(() => {
    if (!user) setUserProfile(null);
  }, [user]);

  return { userProfile, refreshProfile, setUserProfile };
};