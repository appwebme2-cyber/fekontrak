import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import "@/styles/responsive.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import ModuleGuard from "@/components/ModuleGuard";
import AdminGuard from "@/components/AdminGuard";
import Layout from "@/components/Layout";
const ApprovalDashboard = lazy(() => import("./pages/ApprovalDashboard"));

// Import existing pages
import Login from "@/pages/Login";
import Auth from "@/pages/Auth";
const Users = lazy(() => import("@/pages/Users"));
import NotFound from "@/pages/NotFound";

// Import dashboard pages
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const NewContracts = lazy(() => import("@/pages/NewContracts"));
const InvoiceManagement = lazy(() => import("@/pages/InvoiceManagement"));
const ContractPerformanceMonitoring = lazy(() => import("@/pages/ContractPerformanceMonitoring"));
const AdminSettings = lazy(() => import("@/pages/AdminSettings"));
const RoleSettings = lazy(() => import("@/pages/RoleSettings"));
const ContractDetail = lazy(() => import("@/pages/ContractDetail"));
const InvoiceDetail = lazy(() => import("@/pages/InvoiceDetail"));

// Import kontrak pages
const KontrakLumpsum = lazy(() => import("@/pages/KontrakLumpsum"));
const KontrakUnitPrice = lazy(() => import("@/pages/KontrakUnitPrice"));
const KontrakTsaLtsa = lazy(() => import("@/pages/KontrakTsaLtsa"));
const Amandemen = lazy(() => import("@/pages/Amandemen"));

// Import vendor pages
const Vendors = lazy(() => import("@/pages/Vendors"));
const NewVendors = lazy(() => import("@/pages/NewVendors"));

// Import master data pages
const MasterProgramKerja = lazy(() => import("@/pages/MasterProgramKerja"));
const MasterPlanner = lazy(() => import("@/pages/MasterPlanner"));

// Import user purchase page
const UserPurchase = lazy(() => import("@/pages/UserPurchase"));
const UserPurchaseDetail = lazy(() => import("@/pages/UserPurchaseDetail"));

// Import data management page
const DataManagement = lazy(() => import("@/pages/DataManagement"));
const LaporanHarian = lazy(() => import("@/pages/LaporanHarian"));
const Profile = lazy(() => import("@/pages/Profile"));
const ReportAkses = lazy(() => import("@/pages/ReportAkses"));
const AiUsage = lazy(() => import("@/pages/AiUsage"));
const RuComparison = lazy(() => import("@/pages/RuComparison"));

const Favorites = lazy(() => import("@/pages/Favorites"));

// Import material requirement pages
const MaterialRequirementList = lazy(() => import("@/pages/MaterialRequirementList"));
const MaterialRequirementDetail = lazy(() => import("@/pages/MaterialRequirementDetail"));

// Setiap halaman dimuat saat dibuka (bukan semuanya di awal), supaya MAESTRO cepat terbuka.
// Chunk lama yang hilang setelah deploy ditangani di main.tsx (reload sekali).
const PageLoader = () => (
  <div className="flex min-h-[50vh] items-center justify-center text-gray-500">
    <Loader2 className="mr-2 h-5 w-5 animate-spin text-blue-600" /> Memuat halaman...
  </div>
);

// Data dianggap segar 1 menit: pindah antar halaman langsung memakai data yang sudah dimuat
// tanpa meminta ulang ke server. Data yang diubah sendiri tetap langsung ter-update (setiap simpan
// memanggil invalidateQueries), dan cache dibuang saat logout (useAuthActions).
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/auth" element={<Auth />} />
              
              <Route
                path="/*"
                element={
                  <ProtectedRoute>
                    <Layout>
                      <Suspense fallback={<PageLoader />}>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<ModuleGuard moduleKey="dashboard"><Dashboard /></ModuleGuard>} />
                        <Route path="/favorites" element={<Favorites />} />
                        <Route path="/kontrak-lumpsum"element={<ModuleGuard moduleKey="kontrak-lumpsum"><KontrakLumpsum /></ModuleGuard>} />
                        <Route path="/kontrak-unit-price" element={<ModuleGuard moduleKey="kontrak-unit-price"><KontrakUnitPrice /></ModuleGuard>} />
                        <Route path="/kontrak-tsa-ltsa" element={<ModuleGuard moduleKey="kontrak-tsa-ltsa"><KontrakTsaLtsa /></ModuleGuard>} />
                        <Route path="/amandemen" element={<ModuleGuard moduleKey="amandemen"><Amandemen /></ModuleGuard>} />
                        <Route path="/approval" element={<ModuleGuard moduleKey="approval"><ApprovalDashboard /></ModuleGuard>} />
                        <Route path="/contracts" element={<NewContracts />} />
                        <Route path="/contracts/:id" element={<ContractDetail />} />
                        <Route path="/invoices" element={<ModuleGuard moduleKey="invoices"><InvoiceManagement /></ModuleGuard>} />
                        <Route path="/invoices/:id" element={<ModuleGuard moduleKey="invoices"><InvoiceDetail /></ModuleGuard>} />
                        <Route path="/invoice-detail/:id" element={<ModuleGuard moduleKey="invoices"><InvoiceDetail /></ModuleGuard>} />
                        <Route path="/sla-monitoring" element={<Navigate to="/contract-performance" replace />} />
                        <Route path="/contract-performance" element={<ModuleGuard moduleKey="contract-performance"><ContractPerformanceMonitoring /></ModuleGuard>} />
                        <Route path="/admin-settings" element={<AdminGuard level="superAdmin"><AdminSettings /></AdminGuard>} />
                        <Route path="/role-settings" element={<AdminGuard level="superAdmin"><RoleSettings /></AdminGuard>} />
                        <Route path="/users" element={<AdminGuard><Users /></AdminGuard>} />
                        <Route path="/vendors" element={<AdminGuard><NewVendors /></AdminGuard>} />
                        <Route path="/master/program-kerja" element={<AdminGuard><MasterProgramKerja /></AdminGuard>} />
                        <Route path="/master/planner" element={<AdminGuard><MasterPlanner /></AdminGuard>} />
                        <Route path="/user-purchase" element={<ModuleGuard moduleKey="user-purchase"><UserPurchase /></ModuleGuard>} />
                        <Route path="/user-purchase/:id" element={<ModuleGuard moduleKey="user-purchase"><UserPurchaseDetail /></ModuleGuard>} />
                        <Route path="/data-management" element={<AdminGuard><DataManagement /></AdminGuard>} />
                        <Route path="/report-akses" element={<AdminGuard><ReportAkses /></AdminGuard>} />
                        <Route path="/ai-usage" element={<AdminGuard level="superAdmin"><AiUsage /></AdminGuard>} />
                        <Route path="/ru-comparison" element={<AdminGuard level="crossRu"><RuComparison /></AdminGuard>} />
                        <Route path="/laporan-harian" element={<ModuleGuard moduleKey="laporan-harian"><LaporanHarian /></ModuleGuard>} />
                        <Route path="/material-requirement" element={<ModuleGuard moduleKey="material-requirement"><MaterialRequirementList /></ModuleGuard>} />
                        <Route path="/material-requirement/:id" element={<ModuleGuard moduleKey="material-requirement"><MaterialRequirementDetail /></ModuleGuard>} />
                        <Route path="/profile" element={<Profile />} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      </Suspense>
                    </Layout>
                  </ProtectedRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
