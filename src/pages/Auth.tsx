import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Mail, Lock, Eye, EyeOff, User, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isVendorRole } from '@/hooks/useRolePermissionsConfig';

const getRedirectPath = (role?: string) =>
  isVendorRole(role) ? '/kontrak-lumpsum' : '/dashboard';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);

  const navigate = useNavigate();
  const { signIn, signUp, user, loading: authLoading } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      navigate(getRedirectPath((user as any)?.role));
    }
  }, [authLoading, user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (!error) {
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

  const features = [
    { icon: '📋', label: 'Manajemen Kontrak Terintegrasi' },
    { icon: '📊', label: 'Monitoring Progress Real-time' },
    { icon: '💰', label: 'Kontrol Anggaran & Pembayaran' },
    { icon: '🔧', label: 'Supervisory & Control Tools' },
  ];

  return (
    <div className="h-screen w-screen flex overflow-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ══ LEFT BRAND PANEL ══════════════════════════════════════ */}
      <div
        className="hidden lg:flex lg:w-[55%] h-full flex-col justify-between relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #001B4E 0%, #003375 35%, #0055A5 65%, #003D7A 100%)',
        }}
      >
        {/* Subtle glow layers */}
        <div className="absolute inset-0 pointer-events-none" style={{
          backgroundImage:
            'radial-gradient(ellipse at 15% 50%, rgba(255,255,255,0.04) 0%, transparent 55%),' +
            'radial-gradient(ellipse at 85% 15%, rgba(227,30,36,0.10) 0%, transparent 45%)',
        }} />

        {/* Grid lines */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.04] pointer-events-none" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          {[0,1,2,3,4,5].map(i => (
            <line key={i} x1="0" y1={150*i} x2="600" y2={150*i-60} stroke="white" strokeWidth="1"/>
          ))}
          {[100,250,400,550].map(x => (
            <line key={x} x1={x} y1="0" x2={x} y2="900" stroke="white" strokeWidth="1"/>
          ))}
        </svg>

        {/* Top red accent */}
        <div className="absolute top-0 left-0 right-0 h-[3px]" style={{ background: 'linear-gradient(90deg, #E31E24 0%, #FF5E40 50%, #E31E24 100%)' }} />

        {/* ── Top: Logo ── */}
        <div className="relative z-10 px-10 pt-8">
          <div className={`transition-all duration-600 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}>
            <div className="bg-white rounded-xl p-2 shadow-lg inline-block">
              <img src="/logo.png" alt="Pertamina Patra Niaga" className="h-12 w-auto object-contain" />
            </div>
          </div>
        </div>

        {/* ── Center: App branding ── */}
        <div className={`relative z-10 px-10 transition-all duration-700 delay-150 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <div className="inline-flex items-center bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-4">
            <span className="text-red-300 text-[10px] font-semibold tracking-[0.15em] uppercase">
              Maintenance Management System
            </span>
          </div>

          <h1 className="text-6xl font-black text-white tracking-tighter leading-none mb-2">
            MAESTRO
          </h1>
          <div className="w-12 h-1 bg-red-500 rounded-full mb-4" />
          <p className="text-blue-200 text-base leading-snug">
            Maintenance Contract<br />
            <span className="text-white font-semibold">Supervisory &amp; Control Tools</span>
          </p>

          <div className="mt-6 space-y-2.5">
            {features.map((f, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 transition-all duration-500 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ transitionDelay: `${300 + i * 80}ms` }}
              >
                <div className="w-8 h-8 bg-white/10 border border-white/15 rounded-lg flex items-center justify-center text-sm flex-shrink-0">
                  {f.icon}
                </div>
                <span className="text-blue-100 text-sm">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Bottom: tagline ── */}
        <div className="relative z-10 px-10 pb-6 flex items-end justify-between">
          <p className="text-blue-300/60 text-xs italic">Energizing Indonesia</p>
          <p className="text-blue-300/40 text-xs">© 2025 Pertamina Patra Niaga</p>
        </div>

        {/* Bottom wave deco */}
        <svg className="absolute bottom-0 left-0 w-full opacity-[0.06] pointer-events-none" viewBox="0 0 600 60" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0,30 C120,0 240,60 360,30 C480,0 540,50 600,30 L600,60 L0,60 Z" fill="white"/>
        </svg>
      </div>

      {/* ══ RIGHT FORM PANEL ══════════════════════════════════════ */}
      <div className="w-full lg:w-[45%] h-full flex items-center justify-center bg-white dark:bg-gray-950 overflow-hidden px-6">
        <div className={`w-full max-w-[390px] transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

          {/* Logo compact — visible on mobile too */}
          <div className="flex justify-center mb-5">
            <div className="bg-gray-50 dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-2xl px-4 py-2.5">
              <img src="/logo.png" alt="Pertamina Patra Niaga" className="h-10 w-auto object-contain" />
            </div>
          </div>

          {/* Heading */}
          <div className="text-center mb-5">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Selamat Datang</h2>
            <p className="text-gray-400 text-sm mt-0.5">Masuk ke sistem MAESTRO</p>
          </div>

          {/* ── Form ── */}
          {registerSuccess ? (
            <div className="text-center py-6 space-y-3">
              <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle className="w-7 h-7 text-green-500" />
              </div>
              <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">Registrasi Berhasil!</h3>
              <p className="text-sm text-gray-500 max-w-xs mx-auto">
                Akun dibuat. Tunggu admin mengaktifkan akun sebelum login.
              </p>
              <button
                onClick={() => setRegisterSuccess(false)}
                className="text-red-600 text-sm underline font-medium hover:text-red-700 transition-colors"
              >
                Kembali ke login
              </button>
            </div>
          ) : (
            <>
              <Tabs defaultValue="signin" className="space-y-4">
                <TabsList className="grid w-full grid-cols-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl h-auto">
                  <TabsTrigger
                    value="signin"
                    className="rounded-lg py-1.5 text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 transition-all"
                  >
                    Masuk
                  </TabsTrigger>
                  <TabsTrigger
                    value="signup"
                    className="rounded-lg py-1.5 text-sm font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:shadow-sm data-[state=active]:text-red-600 dark:data-[state=active]:text-red-400 transition-all"
                  >
                    Daftar
                  </TabsTrigger>
                </TabsList>

                {/* ── Masuk ── */}
                <TabsContent value="signin" className="mt-0">
                  <form onSubmit={handleSignIn} className="space-y-3.5">
                    <div className="space-y-1">
                      <Label htmlFor="s-email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-gray-400" /> Email
                      </Label>
                      <Input
                        id="s-email"
                        type="email"
                        placeholder="nama@pertamina.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        disabled={loading}
                        className="h-10 rounded-xl border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/15 text-sm"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="s-pass" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-gray-400" /> Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="s-pass"
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Masukkan password"
                          value={password}
                          onChange={e => setPassword(e.target.value)}
                          required
                          disabled={loading}
                          className="h-10 rounded-xl border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/15 pr-10 text-sm"
                        />
                        <button type="button" tabIndex={-1} onClick={() => setShowPassword(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                          {showPassword ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full h-10 rounded-xl font-semibold text-sm text-white border-0 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                      style={{ background: loading ? '#9ca3af' : '#E31E24' }}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Memproses...
                        </span>
                      ) : 'Masuk'}
                    </Button>
                  </form>
                </TabsContent>

                {/* ── Daftar ── */}
                <TabsContent value="signup" className="mt-0">
                  <form onSubmit={handleSignUp} className="space-y-3.5">
                    <div className="space-y-1">
                      <Label htmlFor="r-name" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5 text-gray-400" /> Nama Lengkap
                      </Label>
                      <Input id="r-name" type="text" placeholder="Nama lengkap Anda" value={fullName}
                        onChange={e => setFullName(e.target.value)} required disabled={loading}
                        className="h-10 rounded-xl border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/15 text-sm" />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="r-email" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Mail className="h-3.5 w-3.5 text-gray-400" /> Email
                      </Label>
                      <Input id="r-email" type="email" placeholder="nama@pertamina.com" value={email}
                        onChange={e => setEmail(e.target.value)} required disabled={loading}
                        className="h-10 rounded-xl border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/15 text-sm" />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="r-pass" className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Lock className="h-3.5 w-3.5 text-gray-400" /> Password
                      </Label>
                      <div className="relative">
                        <Input id="r-pass" type={showSignUpPassword ? 'text' : 'password'} placeholder="Min. 6 karakter"
                          value={password} onChange={e => setPassword(e.target.value)} required disabled={loading} minLength={6}
                          className="h-10 rounded-xl border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/15 pr-10 text-sm" />
                        <button type="button" tabIndex={-1} onClick={() => setShowSignUpPassword(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                          {showSignUpPassword ? <Eye className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    <Button type="submit" disabled={loading} className="w-full h-10 rounded-xl font-semibold text-sm text-white border-0 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                      style={{ background: loading ? '#9ca3af' : '#E31E24' }}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Memproses...
                        </span>
                      ) : 'Daftar'}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Info box */}
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/50">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0 animate-pulse" />
                  <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">
                    <span className="font-semibold">Info:</span> Akun baru memerlukan aktivasi administrator sebelum dapat digunakan.
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Footer */}
          <p className="text-center text-[11px] text-gray-300 dark:text-gray-600 mt-5">
            © 2025 Pertamina Patra Niaga · All rights reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
