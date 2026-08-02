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
  GitBranch
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

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
  //   const saved = localStorage.getItem('sidebar-collapsed');
  //   return saved ? JSON.parse(saved) : true; // default to collapsed on desktop
  // });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);

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
        <div className={`flex items-center p-4 border-b border-gray-200 dark:border-gray-700 ${sidebarCollapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
          {(!sidebarCollapsed || isMobile) && (
            <h1 className="text-xl font-bold text-gray-900 dark:text-white truncate">
              Monitor Kontrak
            </h1>
          )}
          {!isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 flex-shrink-0"
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
    </div>
  );
};

export default Layout;