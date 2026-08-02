
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Mail, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface EmailConfirmationProps {
  email: string;
  onBack: () => void;
}

const EmailConfirmation = ({ email, onBack }: EmailConfirmationProps) => {
  const [mounted, setMounted] = useState(false);
  const [resending, setResending] = useState(false);
  const { toast } = useToast();

  useState(() => {
    const timer = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(timer);
  });

  const handleResendConfirmation = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      });

      if (error) {
        toast({
          title: "Error",
          description: "Gagal mengirim ulang email konfirmasi. " + error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email Terkirim",
          description: "Email konfirmasi berhasil dikirim ulang. Silakan cek email Anda.",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Terjadi kesalahan saat mengirim ulang email konfirmasi.",
        variant: "destructive",
      });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className={`w-full max-w-md relative z-10 transition-all duration-700 ${mounted ? 'animate-fade-in-scale' : 'opacity-0 translate-y-10'}`}>
        {/* Header */}
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
          </div>
          <h1 className={`text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 transition-all duration-500 ${mounted ? 'animate-slide-in-up' : 'opacity-0 translate-y-5'}`} style={{ animationDelay: '300ms' }}>
            Konfirmasi Email
          </h1>
          <p className={`text-muted-foreground transition-all duration-500 ${mounted ? 'animate-slide-in-up' : 'opacity-0 translate-y-5'}`} style={{ animationDelay: '400ms' }}>
            Sistem Monitoring Kontrak ME 2
          </p>
        </div>

        {/* Confirmation Card */}
        <Card className={`shadow-2xl card-hover transition-all duration-500 ${mounted ? 'animate-slide-in-up' : 'opacity-0 translate-y-10'} bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-white/20`} style={{ animationDelay: '600ms' }}>
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Pendaftaran Berhasil!
            </CardTitle>
            <CardDescription>
              <span>
                Akun Anda berhasil dibuat dengan <strong>status tidak aktif</strong>.
              </span>
              <br />
              <span>
                <strong>Cek email Anda</strong> dan lakukan konfirmasi untuk mengaktifkan akun sebelum login pertama kali.
              </span>
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="space-y-2">
                  <h3 className="font-medium text-blue-900 dark:text-blue-100">
                    Email konfirmasi dikirim ke:
                  </h3>
                  <p className="text-sm font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded border text-blue-900 dark:text-blue-100">
                    {email}
                  </p>
                  <ul className="text-sm text-blue-700 dark:text-blue-200 mt-2 list-disc list-inside space-y-1">
                    <li>Buka email dan klik link konfirmasi.</li>
                    <li>Cek folder <b>Spam</b> atau <b>Junk</b> bila tidak ditemukan.</li>
                    <li>
                      Setelah konfirmasi, tunggu admin mengaktifkan akun Anda sebelum bisa login.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-red-900 dark:text-red-100 mb-2">
                    Tidak Menerima Email?
                  </h3>
                  <ul className="text-sm text-red-700 dark:text-red-200 list-disc list-inside space-y-1">
                    <li>Pastikan email address sudah benar saat mendaftar.</li>
                    <li>Tunggu beberapa menit (email kadang terlambat).</li>
                    <li>Cek folder spam/junk di email Anda.</li>
                    <li>Atau klik tombol "Kirim Ulang" di bawah ini.</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="text-center space-y-3">
              <Button 
                onClick={handleResendConfirmation}
                disabled={resending}
                className="w-full mb-2"
                variant="outline"
              >
                {resending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Mengirim Ulang...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Kirim Ulang Email Konfirmasi
                  </>
                )}
              </Button>

              <Button 
                variant="outline" 
                onClick={onBack}
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Kembali ke Halaman Login
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className={`text-center mt-8 text-sm text-muted-foreground transition-all duration-500 ${mounted ? 'animate-fade-in' : 'opacity-0'}`} style={{ animationDelay: '1000ms' }}>
          <p>© 2024 Pertamina. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default EmailConfirmation;
