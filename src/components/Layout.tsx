import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Coins,
  Target,
  Settings,
  Users,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Bell,
  Building2,
  ChevronRight,
  Home,
  TrendingUp,
  ClipboardList,
  Database,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
  ShoppingCart,
  GitBranch,
  BookOpen,
  KeyRound,
  Eye,
  EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RealTimeNotifications } from '@/components/ui/real-time-notifications';
import { usePermissions } from '@/hooks/usePermissions';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const API_URL = "https://bekontrak-production.up.railway.app/api";

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

  // Ganti Password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [cpOld, setCpOld] = useState('');
  const [cpNew, setCpNew] = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [cpLoading, setCpLoading] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();

  const desktopNavScrollRef = useRef<HTMLDivElement>(null);
  const mobileNavScrollRef = useRef<HTMLDivElement>(null);
  const desktopNavScrollPos = useRef(0);
  const mobileNavScrollPos = useRef(0);

  useEffect(() => {
    if (desktopNavScrollRef.current) {
      desktopNavScrollRef.current.scrollTop = desktopNavScrollPos.current;
    }
    if (mobileNavScrollRef.current) {
      mobileNavScrollRef.current.scrollTop = mobileNavScrollPos.current;
    }
  }, [location.pathname]);
  const { signOut, userProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { isAdmin, canViewMenu, roleLabel } = usePermissions();
  const { toast } = useToast();

  const handleChangePassword = async () => {
    if (!cpNew || !cpOld) {
      toast({ title: 'Error', description: 'Password lama dan baru wajib diisi', variant: 'destructive' });
      return;
    }
    if (cpNew !== cpConfirm) {
      toast({ title: 'Error', description: 'Konfirmasi password tidak cocok', variant: 'destructive' });
      return;
    }
    if (cpNew.length < 6) {
      toast({ title: 'Error', description: 'Password baru minimal 6 karakter', variant: 'destructive' });
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
        setShowChangePassword(false);
        setCpOld(''); setCpNew(''); setCpConfirm('');
      }
    } catch {
      toast({ title: 'Error', description: 'Gagal terhubung ke server', variant: 'destructive' });
    } finally {
      setCpLoading(false);
    }
  };

  // useEffect(() => {
  //   localStorage.setItem('sidebar-collapsed', JSON.stringify(sidebarCollapsed));
  // }, [sidebarCollapsed]);

  // Menu visibility untuk Monitoring & Analytics / Contract Management / Operations
  // diatur per role lewat halaman /role-settings (lihat usePermissions().canViewMenu).
  // Master Data & Administration selalu admin-only, tidak configurable.
  const showMasterData  = isAdmin;
  const showAdministration = isAdmin;

  const filterByMenuKey = <T extends { key: string }>(items: T[]) =>
    items.filter((item) => canViewMenu(item.key));

  const navigationGroupsRaw = [
    {
      title: 'Monitoring & Analytics',
      items: filterByMenuKey([
        { key: 'dashboard', name: 'Executive Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { key: 'contract-performance', name: 'Performance Monitoring', href: '/contract-performance', icon: Target },
      ])
    },
    {
      title: 'Contract Management',
      items: filterByMenuKey([
        { key: 'kontrak-lumpsum', name: 'Kontrak Lumpsum', href: '/kontrak-lumpsum', icon: FileText },
        { key: 'kontrak-unit-price', name: 'Kontrak Unit Price', href: '/kontrak-unit-price', icon: ClipboardList },
        { key: 'kontrak-tsa-ltsa', name: 'Kontrak TSA/LTSA', href: '/kontrak-tsa-ltsa', icon: TrendingUp },
        { key: 'amandemen', name: 'Amandemen', href: '/amandemen', icon: GitBranch },
      ])
    },
    {
      title: 'Operations',
      items: filterByMenuKey([
        { key: 'invoices', name: 'Tagihan', href: '/invoices', icon: Coins },
        { key: 'user-purchase', name: 'User Purchase (PADI)', href: '/user-purchase', icon: ShoppingCart },
        { key: 'approval', name: 'Approval Dokumen', href: '/approval', icon: ClipboardList },
        { key: 'laporan-harian', name: 'Laporan Harian', href: '/laporan-harian', icon: ClipboardList },
      ])
    },
    {
      title: 'Master Data',
      show: showMasterData,
      items: [
        { name: 'Vendor', href: '/vendors', icon: Building2 },
        { name: 'Pengguna', href: '/users', icon: Users },
      ]
    },
    {
      title: 'Administration',
      show: showAdministration,
      items: [
        { name: 'Manajemen Data', href: '/data-management', icon: Database },
        { name: 'Pengaturan Admin', href: '/admin-settings', icon: Settings },
        { name: 'Pengaturan Role', href: '/role-settings', icon: Shield },
      ]
    }
  ];

  const navigationGroups = navigationGroupsRaw.map((group) => ({
    ...group,
    show: group.show ?? group.items.length > 0,
  }));

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const isActivePath = (path: string) => location.pathname === path;

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  const getBreadcrumbs = () => {
    const currentItem = navigationGroups
      .flatMap(group => group.items)
      .find(item => isActivePath(item.href));

    if (currentItem) {
      return [
        { name: 'Home', href: '/dashboard' },
        { name: currentItem.name, href: currentItem.href }
      ];
    }

    if (location.pathname === '/contract-performance') {
      return [
        { name: 'Home', href: '/dashboard' },
        { name: 'Performance Monitoring', href: '/contract-performance' }
      ];
    }

    return [{ name: 'Executive Dashboard', href: '/dashboard' }];
  };

  const SidebarContent = ({ isMobile = false }) => (
    <TooltipProvider>
      <div className="flex flex-col h-full">
        {/* Logo/Brand */}
        <div className={`relative overflow-hidden flex items-center border-b border-blue-950
          bg-gradient-to-br from-[#002060] via-[#003B8E] to-[#0055B3]
          ${sidebarCollapsed && !isMobile ? 'justify-center p-3' : 'justify-between p-4'}`}
        >
          {/* Dekorasi lingkaran blur */}
          <div className="pointer-events-none absolute -top-6 -right-6 w-24 h-24 rounded-full bg-white/10 blur-xl" />
          <div className="pointer-events-none absolute -bottom-6 -left-4 w-20 h-20 rounded-full bg-[#E4002B]/20 blur-xl" />
          {/* Stripe merah kiri */}
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#E4002B]" />

          {(!sidebarCollapsed || isMobile) ? (
            <div className="relative z-10 ml-1 flex flex-col leading-none">
              <span className="text-white font-black text-2xl tracking-widest drop-shadow-md">MAESTRO</span>
              <span className="text-white/60 text-[9px] tracking-wider font-medium uppercase">Contract Management</span>
            </div>
          ) : (
            <div className="relative z-10 flex items-center justify-center">
              <span className="text-white font-black text-xs tracking-widest drop-shadow-md">M</span>
            </div>
          )}

          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="relative z-10 p-2 text-white/80 hover:text-white hover:bg-white/15 flex-shrink-0"
            >
              {sidebarCollapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
            </Button>
          )}
        </div>

        {/* Navigation */}
        <div
          ref={isMobile ? mobileNavScrollRef : desktopNavScrollRef}
          onScroll={(e) => {
            const pos = e.currentTarget.scrollTop;
            if (isMobile) {
              mobileNavScrollPos.current = pos;
            } else {
              desktopNavScrollPos.current = pos;
            }
          }}
          className="flex-1 py-4 overflow-y-auto overflow-x-hidden"
        >
          {navigationGroups
            .filter(group => group.show && group.items.length > 0)
            .map((group, groupIndex, filteredGroups) => (
              <div key={group.title} className="mb-6">
                {(!sidebarCollapsed || isMobile) && (
                  <div className="px-4 mb-2">
                    <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {group.title}
                    </h3>
                  </div>
                )}

                <nav className="space-y-1 px-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = isActivePath(item.href);

                    const linkContent = (
                      <Link
                        to={item.href}
                        className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                          isActive
                            ? 'bg-primary text-primary-foreground shadow-sm'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                        } ${sidebarCollapsed && !isMobile ? 'justify-center' : ''}`}
                        onClick={() => isMobile && setSidebarOpen(false)}
                      >
                        <Icon className={`flex-shrink-0 h-5 w-5 ${sidebarCollapsed && !isMobile ? '' : 'mr-3'}`} />
                        {(!sidebarCollapsed || isMobile) && (
                          <span className="truncate">{item.name}</span>
                        )}
                        {isActive && (!sidebarCollapsed || isMobile) && (
                          <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0" />
                        )}
                      </Link>
                    );

                    if (sidebarCollapsed && !isMobile) {
                      return (
                        <Tooltip key={item.name}>
                          <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                          <TooltipContent side="right"><p>{item.name}</p></TooltipContent>
                        </Tooltip>
                      );
                    }

                    return <div key={item.name}>{linkContent}</div>;
                  })}
                </nav>

                {groupIndex < filteredGroups.length - 1 && (!sidebarCollapsed || isMobile) && (
                  <Separator className="my-4 mx-4" />
                )}
              </div>
            ))}
        </div>

        {/* Manual Book Download */}
        <div className="border-t border-gray-200 dark:border-gray-700 px-2 py-2 flex-shrink-0">
          {sidebarCollapsed && !isMobile ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="/docs/Manual_Book_Fekontrak.pdf"
                  download
                  className="flex items-center justify-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200"
                >
                  <BookOpen className="h-5 w-5 flex-shrink-0" />
                </a>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Manual Book</p></TooltipContent>
            </Tooltip>
          ) : (
            <a
              href="/docs/Manual_Book_Fekontrak.pdf"
              download
              className="flex items-center px-3 py-2.5 text-sm font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white transition-all duration-200 w-full"
            >
              <BookOpen className="h-5 w-5 flex-shrink-0 mr-3" />
              <span className="truncate">Manual Book</span>
            </a>
          )}
        </div>

        {/* User Profile */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <div className={`flex items-center ${sidebarCollapsed && !isMobile ? 'justify-center' : 'space-x-3'}`}>
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarFallback>
                {userProfile?.full_name?.charAt(0) || userProfile?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            {(!sidebarCollapsed || isMobile) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {userProfile?.full_name || userProfile?.email}
                </p>
                <Badge variant="secondary" className="text-xs">
                  {roleLabel}
                </Badge>
              </div>
            )}
          </div>
          {/* Ganti Password button */}
          {(!sidebarCollapsed || isMobile) ? (
            <button
              onClick={() => setShowChangePassword(true)}
              className="mt-3 w-full flex items-center gap-2 px-3 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
            >
              <KeyRound className="h-3.5 w-3.5" />
              Ganti Password
            </button>
          ) : (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => setShowChangePassword(true)}
                  className="mt-2 w-full flex items-center justify-center p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all"
                >
                  <KeyRound className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent side="right"><p>Ganti Password</p></TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-50 md:hidden ${sidebarOpen ? 'flex' : 'hidden'}`}>
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
        <div className="relative flex flex-col max-w-xs w-full bg-white dark:bg-gray-800 shadow-xl overflow-hidden">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <Button
              variant="ghost"
              size="sm"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
          {SidebarContent({ isMobile: true })}
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className={`hidden md:flex md:flex-shrink-0 fixed left-0 top-0 h-full z-40 transition-all duration-300 ${
        sidebarCollapsed ? 'w-16' : 'w-64'
      }`}>
        <div className="flex flex-col w-full bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          {SidebarContent({})}
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
        sidebarCollapsed ? 'md:ml-16' : 'md:ml-64'
      }`}>
        <header className="sticky top-0 z-30 flex h-16 bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between w-full px-4">
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setSidebarOpen(true)}>
              <Menu className="h-6 w-6" />
            </Button>

            <nav className="hidden md:flex items-center space-x-2 text-sm">
              {getBreadcrumbs().map((crumb, index) => (
                <div key={crumb.href} className="flex items-center">
                  {index > 0 && <ChevronRight className="h-4 w-4 text-gray-400 mx-1" />}
                  <Link
                    to={crumb.href}
                    className={`${
                      index === getBreadcrumbs().length - 1
                        ? 'text-gray-900 dark:text-white font-medium'
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                    } transition-colors`}
                  >
                    {crumb.name}
                  </Link>
                </div>
              ))}
            </nav>

            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" onClick={toggleTheme} className="p-2">
                {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>
              <RealTimeNotifications showConnectionStatus={false} />
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="flex items-center space-x-2 p-2">
                <LogOut className="h-5 w-5" />
                <span className="hidden md:block">Keluar</span>
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="p-6">{children}</div>
        </main>
      </div>

      {/* Dialog Ganti Password */}
      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <KeyRound className="h-5 w-5 text-primary" />
              Ganti Password
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
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
                <button type="button" onClick={() => setShowOld(!showOld)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showOld ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cp-new">Password Baru</Label>
              <div className="relative">
                <Input
                  id="cp-new"
                  type={showNew ? 'text' : 'password'}
                  placeholder="Minimal 6 karakter"
                  value={cpNew}
                  onChange={e => setCpNew(e.target.value)}
                  className="pr-10"
                />
                <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
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
                  className="pr-10"
                  onKeyDown={e => e.key === 'Enter' && handleChangePassword()}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {cpConfirm && cpNew !== cpConfirm && (
                <p className="text-xs text-red-500">Password tidak cocok</p>
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => { setShowChangePassword(false); setCpOld(''); setCpNew(''); setCpConfirm(''); }}>
              Batal
            </Button>
            <Button onClick={handleChangePassword} disabled={cpLoading}>
              {cpLoading ? 'Menyimpan...' : 'Simpan Password'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Layout;