import { useState, useEffect, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import { Mail, Lock, Eye, EyeOff, User, CheckCircle, Check, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { isVendorRole } from '@/hooks/useRolePermissionsConfig';

const pwRules = [
  { key: 'length', label: 'Min. 8 karakter',  test: (p: string) => p.length >= 8 },
  { key: 'upper',  label: 'Huruf besar (A-Z)', test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lower',  label: 'Huruf kecil (a-z)', test: (p: string) => /[a-z]/.test(p) },
  { key: 'digit',  label: 'Angka (0-9)',        test: (p: string) => /[0-9]/.test(p) },
  { key: 'sym',    label: 'Simbol (!@#$...)',   test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];
const pwStrength = [
  { label: 'Sangat Lemah', bar: 'bg-red-500',    text: 'text-red-500'    },
  { label: 'Lemah',        bar: 'bg-orange-500', text: 'text-orange-500' },
  { label: 'Cukup',        bar: 'bg-yellow-500', text: 'text-yellow-500' },
  { label: 'Kuat',         bar: 'bg-blue-500',   text: 'text-blue-500'   },
  { label: 'Sangat Kuat',  bar: 'bg-green-500',  text: 'text-green-500'  },
];

const getRedirectPath = (role?: string) =>
  isVendorRole(role) ? '/kontrak-lumpsum' : '/dashboard';

const MAX_ATTEMPTS   = 5;
const LOCKOUT_SECS   = 60;
const LS_ATTEMPTS    = 'login_attempts';
const LS_LOCKOUT_TS  = 'login_lockout_until';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [registerSuccess, setRegisterSuccess] = useState(false);
  const [pwTouched, setPwTouched] = useState(false);
  const [signupPassword, setSignupPassword] = useState('');
  const [pwFocused, setPwFocused] = useState(false);
  const [lockoutCountdown, setLockoutCountdown] = useState(0);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const countdownRef = useRef<ReturnType<typeof setInterval>>();

  const pwPassed = useMemo(() => pwRules.map(r => r.test(signupPassword)), [signupPassword]);
  const pwScore = pwPassed.filter(Boolean).length;
  const pwAllOk = pwScore === pwRules.length;
  const pwCfg = signupPassword.length > 0 ? pwStrength[pwScore] : null;

  const navigate = useNavigate();
  const { signIn, signUp, user, loading: authLoading } = useAuth();

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const lockoutUntil = parseInt(localStorage.getItem(LS_LOCKOUT_TS) || '0');
    const remaining = Math.ceil((lockoutUntil - Date.now()) / 1000);
    if (remaining > 0) startCountdown(remaining);
    setLoginAttempts(parseInt(localStorage.getItem(LS_ATTEMPTS) || '0'));
    return () => clearInterval(countdownRef.current);
  }, []);

  const startCountdown = (seconds: number) => {
    setLockoutCountdown(seconds);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => {
      setLockoutCountdown(prev => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          localStorage.removeItem(LS_LOCKOUT_TS);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    if (!authLoading && user) {
      navigate(getRedirectPath((user as any)?.role));
    }
  }, [authLoading, user, navigate]);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutCountdown > 0) return;

    setLoading(true);
    const { error } = await signIn(email, password);

    if (!error) {
      localStorage.removeItem(LS_ATTEMPTS);
      localStorage.removeItem(LS_LOCKOUT_TS);
      setLoginAttempts(0);
      const token = localStorage.getItem('token');
      const payload = token ? JSON.parse(atob(token.split('.')[1])) : {};
      navigate(getRedirectPath(payload?.role));
    } else {
      const nextAttempts = (parseInt(localStorage.getItem(LS_ATTEMPTS) || '0')) + 1;
      if (nextAttempts >= MAX_ATTEMPTS) {
        const lockoutUntil = Date.now() + LOCKOUT_SECS * 1000;
        localStorage.setItem(LS_LOCKOUT_TS, String(lockoutUntil));
        localStorage.setItem(LS_ATTEMPTS, '0');
        setLoginAttempts(0);
        startCountdown(LOCKOUT_SECS);
      } else {
        localStorage.setItem(LS_ATTEMPTS, String(nextAttempts));
        setLoginAttempts(nextAttempts);
      }
    }
    setLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwTouched(true);
    if (!pwAllOk) return;
    setLoading(true);
    const { error } = await signUp(email, signupPassword, fullName);
    if (!error) {
      setRegisterSuccess(true);
      setEmail('');
      setSignupPassword('');
      setFullName('');
      setPwTouched(false);
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
      <div className="hidden lg:flex lg:w-[55%] h-full relative overflow-hidden"
        style={{ background: 'linear-gradient(160deg, #001433 0%, #002D6E 40%, #004FA0 70%, #002D6E 100%)' }}>

        {/* Red orb top-right */}
        <div className="absolute -top-32 -right-24 w-[420px] h-[420px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(227,30,36,0.28) 0%, transparent 65%)' }} />
        {/* Blue orb bottom-left */}
        <div className="absolute -bottom-40 -left-24 w-[380px] h-[380px] rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,130,255,0.22) 0%, transparent 65%)' }} />
        {/* Center glow */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 55%, rgba(255,255,255,0.03) 0%, transparent 60%)' }} />

        {/* Dot grid */}
        <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none">
          <defs>
            <pattern id="dot-grid" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="1.5" cy="1.5" r="1.5" fill="white"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#dot-grid)"/>
        </svg>

        {/* Radar HUD — top right */}
        <svg className="absolute -top-10 -right-10 w-72 h-72 pointer-events-none opacity-[0.18]" viewBox="0 0 240 240" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="120" cy="120" r="108" stroke="white" strokeWidth="0.6" strokeDasharray="5 4"/>
          <circle cx="120" cy="120" r="80"  stroke="white" strokeWidth="0.8"/>
          <circle cx="120" cy="120" r="52"  stroke="white" strokeWidth="0.8"/>
          <circle cx="120" cy="120" r="26"  stroke="white" strokeWidth="1"/>
          <line x1="12" y1="120" x2="228" y2="120" stroke="white" strokeWidth="0.5"/>
          <line x1="120" y1="12" x2="120" y2="228" stroke="white" strokeWidth="0.5"/>
          <line x1="44"  y1="44"  x2="196" y2="196" stroke="white" strokeWidth="0.35"/>
          <line x1="196" y1="44"  x2="44"  y2="196" stroke="white" strokeWidth="0.35"/>
          <circle cx="120" cy="12"  r="2.5" fill="white"/>
          <circle cx="228" cy="120" r="2.5" fill="white"/>
          <circle cx="120" cy="228" r="2.5" fill="white"/>
          <circle cx="12"  cy="120" r="2.5" fill="white"/>
          <circle cx="196" cy="44"  r="2"   fill="white" opacity="0.6"/>
          <circle cx="44"  cy="196" r="2"   fill="white" opacity="0.6"/>
          <circle cx="120" cy="120" r="4"   fill="white" opacity="0.5"/>
          <circle cx="120" cy="40"  r="1.5" fill="white" opacity="0.4"/>
          <circle cx="200" cy="120" r="1.5" fill="white" opacity="0.4"/>
          <circle cx="120" cy="200" r="1.5" fill="white" opacity="0.4"/>
          <circle cx="40"  cy="120" r="1.5" fill="white" opacity="0.4"/>
        </svg>

        {/* Radar HUD — bottom left (smaller, red tint) */}
        <svg className="absolute -bottom-12 -left-12 w-56 h-56 pointer-events-none opacity-[0.14]" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="100" cy="100" r="90"  stroke="#FF6B6B" strokeWidth="0.6" strokeDasharray="4 3"/>
          <circle cx="100" cy="100" r="65"  stroke="white"   strokeWidth="0.7"/>
          <circle cx="100" cy="100" r="40"  stroke="white"   strokeWidth="0.8"/>
          <circle cx="100" cy="100" r="18"  stroke="white"   strokeWidth="1"/>
          <line x1="10" y1="100" x2="190" y2="100" stroke="white" strokeWidth="0.5"/>
          <line x1="100" y1="10" x2="100" y2="190" stroke="white" strokeWidth="0.5"/>
          <line x1="37" y1="37"  x2="163" y2="163" stroke="white" strokeWidth="0.3"/>
          <line x1="163" y1="37" x2="37"  y2="163" stroke="white" strokeWidth="0.3"/>
          <circle cx="100" cy="10"  r="2.5" fill="#FF6B6B"/>
          <circle cx="190" cy="100" r="2.5" fill="white"/>
          <circle cx="100" cy="190" r="2.5" fill="white"/>
          <circle cx="10"  cy="100" r="2.5" fill="white"/>
          <circle cx="100" cy="100" r="3.5" fill="white" opacity="0.6"/>
        </svg>

        {/* Diagonal light slash */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.035]" viewBox="0 0 600 900" preserveAspectRatio="xMidYMid slice">
          <line x1="-50" y1="850" x2="650" y2="50" stroke="white" strokeWidth="90"/>
        </svg>

        {/* ── Main content ── */}
        <div className={`relative z-10 flex flex-col justify-center h-full px-12 py-10 transition-all duration-700 ${mounted ? 'opacity-100' : 'opacity-0'}`}>

          {/* Badge */}
          <div className={`inline-flex items-center self-start rounded-full px-3 py-1 mb-5 transition-all duration-600 ${mounted ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0'}`}
            style={{ background: 'rgba(227,30,36,0.18)', border: '1px solid rgba(227,30,36,0.35)' }}>
            <div className="w-1.5 h-1.5 bg-red-400 rounded-full mr-2 animate-pulse" />
            <span className="text-red-300 text-[10px] font-semibold tracking-[0.15em] uppercase">
              Maintenance Management System
            </span>
          </div>

          {/* Heading */}
          <h1 className={`text-7xl font-black text-white tracking-tighter leading-none mb-2 transition-all duration-700 delay-100 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            MAESTRO
          </h1>
          <div className="w-16 h-1.5 rounded-full mb-4" style={{ background: 'linear-gradient(90deg, #E31E24, #FF7070)' }} />
          <p className={`text-blue-200 text-base leading-snug mb-8 transition-all duration-700 delay-150 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            Maintenance Contract<br />
            <span className="text-white font-semibold text-lg">Supervisory &amp; Control Tools</span>
          </p>

          {/* Features — 2×2 glass cards */}
          <div className="grid grid-cols-2 gap-2.5 mb-5">
            {features.map((f, i) => (
              <div key={i}
                className={`flex items-center gap-3 rounded-xl p-3 transition-all duration-500 ${mounted ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', transitionDelay: `${220 + i * 75}ms` }}>
                <span className="text-xl flex-shrink-0">{f.icon}</span>
                <span className="text-blue-100 text-xs leading-snug">{f.label}</span>
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="w-full h-px mb-5" style={{ background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.18), transparent)' }} />

          {/* Quick-feature pills */}
          <div className="grid grid-cols-3 gap-2.5">
            {[
              { icon: '🔐', label: 'Multi-role\nAccess' },
              { icon: '📡', label: 'Monitoring\nReal-time' },
              { icon: '📊', label: 'Laporan\nOtomatis' },
            ].map((s, i) => (
              <div key={i}
                className={`rounded-xl p-3 text-center transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.09)', transitionDelay: `${460 + i * 80}ms` }}>
                <div className="text-2xl mb-1">{s.icon}</div>
                <div className="text-blue-200 text-[10px] whitespace-pre-line leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="absolute bottom-5 left-12 right-12 flex justify-between z-10">
          <p className="text-blue-300/40 text-xs italic">Energizing Indonesia</p>
          <p className="text-blue-300/30 text-xs">© 2025 Pertamina Patra Niaga</p>
        </div>

        {/* Bottom wave */}
        <svg className="absolute bottom-0 left-0 w-full opacity-[0.05] pointer-events-none" viewBox="0 0 600 60" preserveAspectRatio="none">
          <path d="M0,30 C120,0 240,60 360,30 C480,0 540,50 600,30 L600,60 L0,60 Z" fill="white"/>
        </svg>
      </div>

      {/* ══ RIGHT FORM PANEL ══════════════════════════════════════ */}
      <div className="w-full lg:w-[45%] h-full flex items-center justify-center bg-white dark:bg-gray-950 overflow-hidden px-6">
        <div className={`w-full max-w-[390px] transition-all duration-700 delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>

          {/* Logo */}
          <div className={`flex justify-center mb-5 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
            <img src="/logo.png" alt="Pertamina Patra Niaga" className="h-14 w-auto object-contain" />
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
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Attempt warning */}
                    {loginAttempts > 0 && lockoutCountdown === 0 && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                        style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
                        <span className="text-amber-500">⚠</span>
                        <span className="text-amber-600 dark:text-amber-400">
                          {loginAttempts}/{MAX_ATTEMPTS} percobaan gagal.{' '}
                          {MAX_ATTEMPTS - loginAttempts === 1
                            ? 'Akun akan dikunci pada percobaan berikutnya.'
                            : `Sisa ${MAX_ATTEMPTS - loginAttempts} percobaan.`}
                        </span>
                      </div>
                    )}

                    {/* Lockout banner */}
                    {lockoutCountdown > 0 && (
                      <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs"
                        style={{ background: 'rgba(227,30,36,0.08)', border: '1px solid rgba(227,30,36,0.25)' }}>
                        <div className="relative flex-shrink-0 w-8 h-8 flex items-center justify-center">
                          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 32 32">
                            <circle cx="16" cy="16" r="13" fill="none" stroke="rgba(227,30,36,0.2)" strokeWidth="3"/>
                            <circle cx="16" cy="16" r="13" fill="none" stroke="#E31E24" strokeWidth="3"
                              strokeDasharray={`${2 * Math.PI * 13}`}
                              strokeDashoffset={`${2 * Math.PI * 13 * (1 - lockoutCountdown / LOCKOUT_SECS)}`}
                              strokeLinecap="round"
                              style={{ transition: 'stroke-dashoffset 0.9s linear' }}/>
                          </svg>
                          <span className="text-[10px] font-bold text-red-500">{lockoutCountdown}</span>
                        </div>
                        <span className="text-red-600 dark:text-red-400 leading-snug">
                          Terlalu banyak percobaan. Login diblokir sementara. Coba lagi dalam <strong>{lockoutCountdown}</strong> detik.
                        </span>
                      </div>
                    )}

                    <Button type="submit" disabled={loading || lockoutCountdown > 0}
                      className="w-full h-10 rounded-xl font-semibold text-sm text-white border-0 transition-all duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
                      style={{ background: loading || lockoutCountdown > 0 ? '#9ca3af' : '#E31E24' }}>
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Memproses...
                        </span>
                      ) : lockoutCountdown > 0 ? `Tunggu ${lockoutCountdown}s` : 'Masuk'}
                    </Button>
                  </form>

              {/* hidden signup form - kept for future use */}
              {false && <form onSubmit={handleSignUp} className="space-y-3.5">
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
                        <Input id="r-pass" type={showSignUpPassword ? 'text' : 'password'} placeholder="Buat password yang kuat"
                          value={signupPassword}
                          onChange={e => { setSignupPassword(e.target.value); setPwTouched(true); }}
                          onFocus={() => setPwFocused(true)}
                          onBlur={() => setPwFocused(false)}
                          required disabled={loading}
                          className="h-10 rounded-xl border-gray-200 dark:border-gray-700 focus:border-red-500 focus:ring-2 focus:ring-red-500/15 pr-10 text-sm" />
                        <button type="button" tabIndex={-1} onClick={() => setShowSignUpPassword(p => !p)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                          {showSignUpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>

                        {/* Password tooltip */}
                        {pwFocused && (
                          <div className="absolute left-0 top-[calc(100%+10px)] w-full z-50 rounded-2xl shadow-2xl overflow-visible"
                            style={{ background: 'rgba(10,14,35,0.96)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
                            {/* Arrow */}
                            <div className="absolute -top-[6px] left-5 w-3 h-3 rotate-45"
                              style={{ background: 'rgba(10,14,35,0.96)', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.1)' }} />

                            <div className="p-3.5">
                              {/* Strength bar + label */}
                              <div className="mb-3">
                                <div className="flex gap-1 h-1.5 mb-1.5">
                                  {pwRules.map((_, i) => (
                                    <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${signupPassword.length > 0 && pwCfg && i < pwScore ? pwCfg.bar : 'bg-white/10'}`} />
                                  ))}
                                </div>
                                <p className={`text-[11px] font-semibold ${pwCfg ? pwCfg.text : 'text-gray-500'}`}>
                                  {pwCfg ? pwCfg.label : 'Ketik password untuk melihat kekuatan'}
                                </p>
                              </div>

                              <div className="w-full h-px bg-white/8 mb-2.5" />

                              {/* Rules */}
                              <div className="grid grid-cols-1 gap-1.5">
                                {pwRules.map((rule, i) => {
                                  const ok = pwPassed[i];
                                  const active = signupPassword.length > 0 || pwTouched;
                                  return (
                                    <div key={rule.key} className={`flex items-center gap-2 text-xs transition-all duration-200 ${ok ? 'text-emerald-400' : active ? 'text-red-400' : 'text-gray-500'}`}>
                                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${ok ? 'bg-emerald-500/20' : active ? 'bg-red-500/15' : 'bg-white/8'}`}>
                                        {ok ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                                      </div>
                                      {rule.label}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
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
              }

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
