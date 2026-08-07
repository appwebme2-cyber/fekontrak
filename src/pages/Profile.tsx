import { useState, useMemo } from 'react';
import { User, Mail, Shield, BookOpen, KeyRound, Eye, EyeOff, Download, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/hooks/useAuth';
import { usePermissions } from '@/hooks/usePermissions';
import { useToast } from '@/hooks/use-toast';

const API_URL = "https://bekontrak-production.up.railway.app/api";

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

const Profile = () => {
  const { userProfile } = useAuth();
  const { roleLabel } = usePermissions();
  const { toast } = useToast();

  const [cpOld, setCpOld] = useState('');
  const [cpNew, setCpNew] = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [cpLoading, setCpLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [cpNewFocused, setCpNewFocused] = useState(false);

  const pwPassed = useMemo(() => pwRules.map(r => r.test(cpNew)), [cpNew]);
  const pwScore  = pwPassed.filter(Boolean).length;
  const pwAllOk  = pwScore === pwRules.length;
  const pwCfg    = cpNew.length > 0 ? pwStrength[pwScore] : null;

  const initials = userProfile?.full_name
    ? userProfile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : (userProfile?.email?.[0] ?? 'U').toUpperCase();

  const handleChangePassword = async () => {
    if (!cpOld || !cpNew) {
      toast({ title: 'Error', description: 'Password lama dan baru wajib diisi', variant: 'destructive' });
      return;
    }
    if (cpNew !== cpConfirm) {
      toast({ title: 'Error', description: 'Konfirmasi password tidak cocok', variant: 'destructive' });
      return;
    }
    if (!pwAllOk) {
      toast({ title: 'Error', description: 'Password baru belum memenuhi semua syarat keamanan', variant: 'destructive' });
      return;
    }
    setCpLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_URL}/auth/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ oldPassword: cpOld, newPassword: cpNew }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Gagal', description: data.message || 'Password lama tidak sesuai', variant: 'destructive' });
      } else {
        toast({ title: 'Berhasil', description: 'Password berhasil diubah' });
        setCpOld(''); setCpNew(''); setCpConfirm('');
      }
    } catch {
      toast({ title: 'Error', description: 'Gagal terhubung ke server', variant: 'destructive' });
    } finally {
      setCpLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profil Saya</h1>
        <p className="text-sm text-muted-foreground mt-1">Informasi akun dan pengaturan keamanan</p>
      </div>

      {/* User Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center flex-shrink-0 shadow-lg">
              <span className="text-white font-bold text-2xl">{initials}</span>
            </div>

            {/* Info */}
            <div className="flex-1 space-y-3 text-center sm:text-left">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {userProfile?.full_name || '—'}
                </h2>
                <Badge variant="secondary" className="mt-1">{roleLabel}</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  <span className="truncate">{userProfile?.email || '—'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4 flex-shrink-0" />
                  <span>{roleLabel}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4 flex-shrink-0" />
                  <span>ID: {userProfile?.id?.slice(0, 8) ?? '—'}...</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Download Manual Book */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Manual Book
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Panduan lengkap penggunaan sistem MAESTRO dalam format PDF.
          </p>
          <a href="/docs/Manual_Book_Fekontrak.pdf" download>
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download Manual Book
            </Button>
          </a>
        </CardContent>
      </Card>

      {/* Ganti Password */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" />
            Ganti Password
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cp-old">Password Lama</Label>
            <div className="relative">
              <Input
                id="cp-old"
                type={showOld ? 'text' : 'password'}
                placeholder="Masukkan password lama"
                value={cpOld}
                onChange={e => setCpOld(e.target.value)}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowOld(!showOld)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="cp-new">Password Baru</Label>
            <div className="relative">
              <Input
                id="cp-new"
                type={showNew ? 'text' : 'password'}
                placeholder="Buat password yang kuat"
                value={cpNew}
                onChange={e => setCpNew(e.target.value)}
                onFocus={() => setCpNewFocused(true)}
                onBlur={() => setCpNewFocused(false)}
                className="pr-10"
              />
              <button type="button" onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>

              {/* Password tooltip */}
              {cpNewFocused && (
                <div className="absolute left-0 top-[calc(100%+10px)] w-full z-50 rounded-2xl shadow-2xl"
                  style={{ background: 'rgba(10,14,35,0.96)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(20px)' }}>
                  <div className="absolute -top-[6px] left-5 w-3 h-3 rotate-45"
                    style={{ background: 'rgba(10,14,35,0.96)', borderTop: '1px solid rgba(255,255,255,0.1)', borderLeft: '1px solid rgba(255,255,255,0.1)' }} />
                  <div className="p-3.5">
                    <div className="mb-3">
                      <div className="flex gap-1 h-1.5 mb-1.5">
                        {pwRules.map((_, i) => (
                          <div key={i} className={`flex-1 rounded-full transition-all duration-300 ${cpNew.length > 0 && pwCfg && i < pwScore ? pwCfg.bar : 'bg-white/10'}`} />
                        ))}
                      </div>
                      <p className={`text-[11px] font-semibold ${pwCfg ? pwCfg.text : 'text-gray-500'}`}>
                        {pwCfg ? pwCfg.label : 'Ketik password untuk melihat kekuatan'}
                      </p>
                    </div>
                    <div className="w-full h-px bg-white/8 mb-2.5" />
                    <div className="grid grid-cols-1 gap-1.5">
                      {pwRules.map((rule, i) => {
                        const ok = pwPassed[i];
                        const active = cpNew.length > 0;
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

          <div className="space-y-2">
            <Label htmlFor="cp-confirm">Konfirmasi Password Baru</Label>
            <div className="relative">
              <Input
                id="cp-confirm"
                type={showConfirm ? 'text' : 'password'}
                placeholder="Ulangi password baru"
                value={cpConfirm}
                onChange={e => setCpConfirm(e.target.value)}
                className={`pr-10 ${cpConfirm && cpNew !== cpConfirm ? 'border-red-400 focus:border-red-400' : ''}`}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {cpConfirm && cpNew !== cpConfirm && (
              <p className="text-xs text-red-500">Password tidak cocok</p>
            )}
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={cpLoading || !cpOld || !cpNew || !cpConfirm}
            className="w-full"
          >
            {cpLoading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Menyimpan...
              </span>
            ) : 'Simpan Password Baru'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
