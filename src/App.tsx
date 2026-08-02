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
import Layout from "@/components/Layout";
import ApprovalDashboard from './pages/ApprovalDashboard';

// Import existing pages
import Login from "@/pages/Login";
import Auth from "@/pages/Auth";
import Users from "@/pages/Users";
import NotFound from "@/pages/NotFound";

// Import dashboard pages
import Dashboard from "@/pages/Dashboard";
import NewContracts from "@/pages/NewContracts";
import InvoiceManagement from "@/pages/InvoiceManagement";
import ContractPerformanceMonitoring from "@/pages/ContractPerformanceMonitoring";
import AdminSettings from "@/pages/AdminSettings";
import RoleSettings from "@/pages/RoleSettings";
import ContractDetail from "@/pages/ContractDetail";
import InvoiceDetail from "@/pages/InvoiceDetail";

// Import kontrak pages
import KontrakLumpsum from "@/pages/KontrakLumpsum";
import KontrakUnitPrice from "@/pages/KontrakUnitPrice";
import KontrakTsaLtsa from "@/pages/KontrakTsaLtsa";
import Amandemen from "@/pages/Amandemen";

// Import vendor pages
import Vendors from "@/pages/Vendors";
import NewVendors from "@/pages/NewVendors";

// Import master data pages
import MasterProgramKerja from "@/pages/MasterProgramKerja";
import MasterPlanner from "@/pages/MasterPlanner";

// Import user purchase page
import UserPurchase from "@/pages/UserPurchase";
import UserPurchaseDetail from "@/pages/UserPurchaseDetail";

// Import data management page
import DataManagement from "@/pages/DataManagement";
import LaporanHarian from "@/pages/LaporanHarian";

const queryClient = new QueryClient();

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
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<ModuleGuard moduleKey="dashboard"><Dashboard /></ModuleGuard>} />
                        <Route path="/kontrak-lumpsum" element={<ModuleGuard moduleKey="kontrak-lumpsum"><KontrakLumpsum /></ModuleGuard>} />
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
                        <Route path="/admin-settings" element={<AdminSettings />} />
                        <Route path="/role-settings" element={<RoleSettings />} />
                        <Route path="/users" element={<Users />} />
                        <Route path="/vendors" element={<NewVendors />} />
                        <Route path="/master/program-kerja" element={<MasterProgramKerja />} />
                        <Route path="/master/planner" element={<MasterPlanner />} />
                        <Route path="/user-purchase" element={<ModuleGuard moduleKey="user-purchase"><UserPurchase /></ModuleGuard>} />
                        <Route path="/user-purchase/:id" element={<ModuleGuard moduleKey="user-purchase"><UserPurchaseDetail /></ModuleGuard>} />
                        <Route path="/data-management" element={<DataManagement />} />
                        <Route path="/laporan-harian" element={<ModuleGuard moduleKey="laporan-harian"><LaporanHarian /></ModuleGuard>} />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
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
