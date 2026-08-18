import React, { useState, useEffect, useRef, useCallback } from 'react';
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
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RealTimeNotifications } from '@/components/ui/real-time-notifications';
import { usePermissions } from '@/hooks/usePermissions';
import { useIdleTimeout } from '@/hooks/useIdleTimeout';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showIdleWarning, setShowIdleWarning] = useState(false);
  const [idleCountdown, setIdleCountdown] = useState(120);
  const countdownRef = useRef<ReturnType<typeof setInterval>>();

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
  const { isAdmin, canViewMenu } = usePermissions();

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
        { name: 'Report Akses', href: '/report-akses', icon: ClipboardList },
      ]
    }
  ];

  const navigationGroups = navigationGroupsRaw.map((group) => ({
    ...group,
    show: group.show ?? group.items.length > 0,
  }));

  const handleSignOut = async () => {
    setShowLogoutModal(false);
    setShowIdleWarning(false);
    clearInterval(countdownRef.current);
    await signOut();
    navigate('/login');
  };

  const onIdleWarn = useCallback(() => {
    setIdleCountdown(120);
    setShowIdleWarning(true);
    countdownRef.current = setInterval(() => {
      setIdleCountdown(prev => {
        if (prev <= 1) { clearInterval(countdownRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  }, []);

  const onIdleActive = useCallback(() => {
    setShowIdleWarning(false);
    clearInterval(countdownRef.current);
  }, []);

  useIdleTimeout(handleSignOut, onIdleWarn, onIdleActive);

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

        {/* User Profile */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex-shrink-0">
          <Link
            to="/profile"
            onClick={() => isMobile && setSidebarOpen(false)}
            className={`flex items-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all p-1 -m-1 ${sidebarCollapsed && !isMobile ? 'justify-center' : 'space-x-3'}`}
          >
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
              </div>
            )}
          </Link>
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
              <Button variant="ghost" size="sm" onClick={() => setShowLogoutModal(true)} className="flex items-center space-x-2 p-2">
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

      {/* Idle Session Warning Modal */}
      {showIdleWarning && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.18s ease' }}>
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
          <div className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #0f1629 0%, #1a2340 100%)', border: '1px solid rgba(255,255,255,0.1)', animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}>
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24, #f59e0b)' }} />
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
            <div className="p-7">
              {/* Countdown ring */}
              <div className="flex justify-center mb-5">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 80 80">
                    <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"/>
                    <circle cx="40" cy="40" r="34" fill="none" stroke="#f59e0b" strokeWidth="6"
                      strokeDasharray={`${2 * Math.PI * 34}`}
                      strokeDashoffset={`${2 * Math.PI * 34 * (1 - idleCountdown / 120)}`}
                      strokeLinecap="round"
                      style={{ transition: 'stroke-dashoffset 0.9s linear' }}/>
                  </svg>
                  <div className="text-center">
                    <div className="text-2xl font-black text-amber-400 leading-none">
                      {String(Math.floor(idleCountdown / 60)).padStart(1,'0')}:{String(idleCountdown % 60).padStart(2,'0')}
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-white mb-1.5">Sesi Akan Berakhir</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Tidak ada aktivitas terdeteksi. Anda akan otomatis keluar dalam waktu di atas.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleSignOut}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.7)' }}
                >
                  Keluar Sekarang
                </button>
                <button
                  onClick={onIdleActive}
                  className="flex-1 h-10 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', boxShadow: '0 4px 15px rgba(245,158,11,0.35)' }}
                >
                  Lanjutkan Sesi
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4" style={{ animation: 'fadeIn 0.18s ease' }}>
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />

          {/* Modal card */}
          <div
            className="relative w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden"
            style={{ background: 'linear-gradient(145deg, #0f1629 0%, #1a2340 100%)', border: '1px solid rgba(255,255,255,0.1)', animation: 'scaleIn 0.2s cubic-bezier(0.34,1.56,0.64,1)' }}
          >
            {/* Top accent bar */}
            <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, #E31E24, #ff6b6b, #E31E24)' }} />

            {/* Decorative orb */}
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(227,30,36,0.15) 0%, transparent 70%)' }} />

            <div className="p-7">
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className="relative">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center"
                    style={{ background: 'rgba(227,30,36,0.12)', border: '1px solid rgba(227,30,36,0.25)' }}>
                    <LogOut className="w-7 h-7 text-red-400" />
                  </div>
                  <div className="absolute inset-0 rounded-full animate-ping"
                    style={{ background: 'rgba(227,30,36,0.08)', animationDuration: '2s' }} />
                </div>
              </div>

              {/* Text */}
              <div className="text-center mb-6">
                <h3 className="text-lg font-bold text-white mb-1.5">Keluar dari Sistem?</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Sesi aktif Anda akan diakhiri. Pastikan semua pekerjaan telah tersimpan sebelum keluar.
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 h-10 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.8)' }}
                >
                  Batal
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex-1 h-10 rounded-xl text-sm font-bold text-white transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg"
                  style={{ background: 'linear-gradient(135deg, #E31E24 0%, #c0151a 100%)', boxShadow: '0 4px 15px rgba(227,30,36,0.35)' }}
                >
                  <LogOut className="w-4 h-4" />
                  Ya, Keluar
                </button>
              </div>
            </div>
          </div>

          <style>{`
            @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
            @keyframes scaleIn { from { opacity: 0; transform: scale(0.88) translateY(12px) } to { opacity: 1; transform: scale(1) translateY(0) } }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default Layout;