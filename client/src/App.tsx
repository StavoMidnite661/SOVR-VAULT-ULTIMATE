import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Wallets from "@/pages/wallets";
import MassPayments from "@/pages/mass-payments";
import Invoices from "@/pages/invoices";
import Lending from "@/pages/lending";
import AiAgents from "@/pages/ai-agents";
import TrustVault from "@/pages/trust-vault";
import QRScanner from "@/pages/qr-scanner";
import Sidebar from "@/components/sidebar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0F172A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400">Loading SOVR Empire...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#0F172A]">
      <Sidebar />
      <div className="flex-1">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/wallets" component={Wallets} />
          <Route path="/mass-payments" component={MassPayments} />
          <Route path="/invoices" component={Invoices} />
          <Route path="/lending" component={Lending} />
          <Route path="/ai-agents" component={AiAgents} />
          <Route path="/trust-vault" component={TrustVault} />
          <Route path="/qr-scanner" component={QRScanner} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
