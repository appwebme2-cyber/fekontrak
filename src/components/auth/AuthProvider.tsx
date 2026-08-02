import { ReactNode } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useAuthState } from '@/hooks/useAuthState';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useAuthActions } from '@/hooks/useAuthActions';

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const { user, session, loading, setUser, setSession } = useAuthState();
  const { userProfile, refreshProfile, setUserProfile } = useUserProfile(user);
  const { signIn, signUp, signOut } = useAuthActions(setUser, setSession, setUserProfile);

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    userProfile,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};