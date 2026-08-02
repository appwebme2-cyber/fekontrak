import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import AuthHeader from '@/components/auth/AuthHeader';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import { isVendorRole } from '@/hooks/useRolePermissionsConfig';

const getRedirectPath = (role?: string) =>
  isVendorRole(role) ? '/kontrak-lumpsum' : '/dashboard';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const navigate = useNavigate();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      const role = (user as any)?.role;
      navigate(getRedirectPath(role));
    }
  }, [authLoading, user, navigate]);

const handleSignIn = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  const { error } = await signIn(email, password);
  if (!error) {
    // role ada di localStorage token, baca dari sana
    const token = localStorage.getItem('token');
    const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
    navigate(getRedirectPath(payload?.role));
  }
  setLoading(false);
};

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    if (!error) {
      setRegisterSuccess(true);
      setEmail('');
      setPassword('');
      setFullName('');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'animate-fade-in-scale' : 'opacity-0 translate-y-10'}`}>
        <AuthHeader mounted={mounted} />

        <Card className={`shadow-2xl card-hover transition-all duration-500 ${mounted ? 'animate-slide-in-up' : 'opacity-0 translate-y-10'} bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-white/20`} style={{ animationDelay: '600ms' }}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Autentikasi
            </CardTitle>
            <CardDescription className="animate-fade-in" style={{ animationDelay: '800ms' }}>
              Masuk atau daftar untuk mengakses sistem
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registerSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Registrasi Berhasil!</h3>
                <p className="text-sm text-gray-600">
                  Akun Anda telah dibuat. Silakan tunggu admin mengaktifkan akun Anda sebelum dapat login.
                </p>
                <button onClick={() => setRegisterSuccess(false)} className="text-blue-600 text-sm underline">
                  Kembali ke halaman login
                </button>
              </div>
            ) : (
              <>
                <Tabs defaultValue="signin" className="space-y-4">
                  <TabsList className="grid w-full grid-cols-2 bg-muted/50">
                    <TabsTrigger value="signin" className="transition-all duration-200 hover:bg-background/80">Masuk</TabsTrigger>
                    <TabsTrigger value="signup" className="transition-all duration-200 hover:bg-background/80">Daftar</TabsTrigger>
                  </TabsList>

                  <TabsContent value="signin" className="animate-fade-in">
                    <SignInForm
                      email={email}
                      password={password}
                      loading={loading}
                      onEmailChange={setEmail}
                      onPasswordChange={setPassword}
                      onSubmit={handleSignIn}
                    />
                  </TabsContent>

                  <TabsContent value="signup" className="animate-fade-in">
                    <SignUpForm
                      email={email}
                      password={password}
                      fullName={fullName}
                      loading={loading}
                      onEmailChange={setEmail}
                      onPasswordChange={setPassword}
                      onFullNameChange={setFullName}
                      onSubmit={handleSignUp}
                    />
                  </TabsContent>
                </Tabs>

                <div className={`mt-6 p-4 bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg`} style={{ animationDelay: '1000ms' }}>
                  <p className="text-sm font-medium mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    Info Pendaftaran:
                  </p>
                  <div className="text-xs space-y-1 text-muted-foreground">
                    <p>• Akun baru akan dibuat dengan role 'user'</p>
                    <p>• Status awal akun adalah 'tidak aktif'</p>
                    <p>• Admin akan mengaktifkan akun Anda</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <div className={`text-center mt-8 text-sm text-muted-foreground`} style={{ animationDelay: '1200ms' }}>
          <p>© 2024 Pertamina. All rights reserved.</p>
          <p>Sistem Monitoring Kontrak ME 2</p>
        </div>
      </div>
    </div>
  );
};

export default Auth;