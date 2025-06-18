import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/dashboard";
import Wallets from "@/pages/wallets";
// import AiAgents from "@/pages/ai-agents";
import MassPayments from "@/pages/mass-payments";
import Invoices from "@/pages/invoices";
import Lending from "@/pages/lending";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/wallets" component={Wallets} />
          {/* <Route path="/ai-agents" component={AiAgents} /> */}
          <Route path="/mass-payments" component={MassPayments} />
          <Route path="/invoices" component={Invoices} />
          <Route path="/lending" component={Lending} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen bg-cosmic-black text-cosmic-white">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
