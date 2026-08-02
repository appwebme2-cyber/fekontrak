
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface SignInFormProps {
  email: string;
  password: string;
  loading: boolean;
  onEmailChange: (email: string) => void;
  onPasswordChange: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const SignInForm = ({ email, password, loading, onEmailChange, onPasswordChange, onSubmit }: SignInFormProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2 animate-slide-in-up stagger-1">
        <Label htmlFor="signin-email" className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-muted-foreground" />
          Email
        </Label>
        <Input
          id="signin-email"
          type="email"
          placeholder="user@kilang.com"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          required
          disabled={loading}
          className="transition-all duration-200 focus:ring-2 focus:ring-primary/20 focus:border-primary hover:border-primary/50"
        />
      </div>

      <div className="space-y-2 animate-slide-in-up stagger-2">
        <Label htmlFor="signin-password" className="flex items-center gap-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          Password
        </Label>
        <div className="relative">
          <Input
            id="signin-password"
            type={showPassword ? "text" : "password"}
            placeholder="Masukkan password"
            value={password}
            onChange={(e) => onPasswordChange(e.target.value)}
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
            {showPassword ? (
              <EyeOff className="h-4 w-4 text-muted-foreground transition-transform duration-200 hover:scale-110" />
            ) : (
              <Eye className="h-4 w-4 text-muted-foreground transition-transform duration-200 hover:scale-110" />
            )}
          </Button>
        </div>
      </div>

      <Button 
        type="submit" 
        className="w-full btn-ripple bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-300 animate-slide-in-up stagger-3" 
        size="lg"
        disabled={loading}
      >
        <div className="flex items-center gap-2">
          {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>}
          {loading ? 'Memproses...' : 'Masuk'}
        </div>
      </Button>
    </form>
  );
};

export default SignInForm;
