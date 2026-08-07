
import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, User, Eye, EyeOff, Check, X } from 'lucide-react';

interface SignUpFormProps {
  email: string;
  password: string;
  fullName: string;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onFullNameChange: (fullName: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const rules = [
  { key: 'length',  label: 'Min. 8 karakter',     test: (p: string) => p.length >= 8 },
  { key: 'upper',   label: 'Huruf besar (A-Z)',    test: (p: string) => /[A-Z]/.test(p) },
  { key: 'lower',   label: 'Huruf kecil (a-z)',    test: (p: string) => /[a-z]/.test(p) },
  { key: 'number',  label: 'Angka (0-9)',           test: (p: string) => /[0-9]/.test(p) },
  { key: 'symbol',  label: 'Simbol (!@#$...)',      test: (p: string) => /[^A-Za-z0-9]/.test(p) },
];

const strengthConfig = [
  { label: 'Sangat Lemah', color: 'bg-red-500',    textColor: 'text-red-500'    },
  { label: 'Lemah',        color: 'bg-orange-500', textColor: 'text-orange-500' },
  { label: 'Cukup',        color: 'bg-yellow-500', textColor: 'text-yellow-500' },
  { label: 'Kuat',         color: 'bg-blue-500',   textColor: 'text-blue-500'   },
  { label: 'Sangat Kuat',  color: 'bg-green-500',  textColor: 'text-green-500'  },
];

const SignUpForm = ({ email, password, fullName, loading, onEmailChange, onPasswordChange, onFullNameChange, onSubmit }: SignUpFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);

  const passed = useMemo(() => rules.map(r => r.test(password)), [password]);
  const score = passed.filter(Boolean).length;
  const allPassed = score === rules.length;
  const cfg = password.length > 0 ? strengthConfig[score] : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allPassed) {
      setTouched(true);
      return;
    }
    onSubmit(e);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2 animate-slide-in-up stagger-1">
        <Label htmlFor="signup-name" className="flex items-center gap-2">
          <User className="h-4 w-4 text-muted-foreground" />
          Nama Lengkap
        </Label>
        <Input
          id="signup-name"
          type="text"
          placeholder="Nama lengkap Anda"
          value={fullName}
          onChange={(e) => onFullNameChange(e.target.value)}
          required
          disabled={loading}
          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
        />
      </div>

      <div className="space-y-2 animate-slide-in-up stagger-2">
        <Label htmlFor="signup-email" className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          Email
        </Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="nama@pertamina.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          disabled={loading}
          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
        />
      </div>

      <div className="space-y-2 animate-slide-in-up stagger-3">
        <Label htmlFor="signup-password" className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          Password
        </Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Buat password yang kuat"
            value={password}
            onChange={(e) => { onPasswordChange(e.target.value); setTouched(true); }}
            required
            disabled={loading}
            className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50 pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword
              ? <EyeOff className="h-4 w-4 text-muted-foreground" />
              : <Eye className="h-4 w-4 text-muted-foreground" />
            }
          </Button>
        </div>

        {/* Strength bar — hanya muncul jika sudah ada input */}
        {password.length > 0 && cfg && (
          <div className="space-y-1.5 pt-1">
            {/* Bar */}
            <div className="flex gap-1 h-1.5">
              {rules.map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-all duration-300 ${i < score ? cfg.color : 'bg-muted'}`}
                />
              ))}
            </div>
            {/* Label kekuatan */}
            <p className={`text-xs font-semibold ${cfg.textColor}`}>{cfg.label}</p>

            {/* Checklist syarat */}
            <ul className="space-y-0.5 pt-0.5">
              {rules.map((rule, i) => (
                <li key={rule.key} className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${passed[i] ? 'text-green-600 dark:text-green-400' : (touched ? 'text-red-500' : 'text-muted-foreground')}`}>
                  {passed[i]
                    ? <Check className="w-3 h-3 shrink-0" />
                    : <X className="w-3 h-3 shrink-0" />
                  }
                  {rule.label}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Peringatan jika submit tapi belum memenuhi syarat */}
        {touched && !allPassed && password.length === 0 && (
          <p className="text-xs text-red-500">Password wajib diisi dan memenuhi semua syarat di atas.</p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full btn-ripple bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 animate-slide-in-up stagger-4"
        size="lg"
        disabled={loading}
      >
        <div className="flex items-center gap-2">
          {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
          {loading ? 'Memproses...' : 'Daftar'}
        </div>
      </Button>
    </form>
  );
};

export default SignUpForm;
