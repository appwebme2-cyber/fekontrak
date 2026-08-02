
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/button';
import { Sun, Moon } from 'lucide-react';

interface AuthHeaderProps {
  mounted: boolean;
}

const AuthHeader = ({ mounted }: AuthHeaderProps) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="text-center mb-8">
      <div className={`flex items-center justify-center gap-4 mb-4 transition-all duration-500 ${mounted ? 'animate-slide-in-up' : 'opacity-0 translate-y-5'}`} style={{ animationDelay: '200ms' }}>
        <div className="relative">
          <img 
            src="/lovable-uploads/9579f42e-8e46-48c1-bcf7-ef6c78ea3346.png" 
            alt="Pertamina Logo" 
            className="h-12 w-auto animate-pulse"
          />
          <div className="absolute -inset-2 bg-primary/10 rounded-lg blur-md animate-pulse"></div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="h-9 w-9 btn-ripple hover:bg-muted/50 transition-all duration-200"
        >
          <div className="relative">
            {theme === 'light' ? (
              <Moon className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
            ) : (
              <Sun className="h-4 w-4 transition-transform duration-300 hover:rotate-12" />
            )}
          </div>
        </Button>
      </div>
      <h1 className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 transition-all duration-500 ${mounted ? 'animate-slide-in-up' : 'opacity-0 translate-y-5'}`} style={{ animationDelay: '300ms' }}>
        Sistem Monitoring Kontrak ME 2
      </h1>
      <p className={`text-muted-foreground transition-all duration-500 ${mounted ? 'animate-slide-in-up' : 'opacity-0 translate-y-5'}`} style={{ animationDelay: '400ms' }}>
        Kilang Pertamina Internasional
      </p>
    </div>
  );
};

export default AuthHeader;
