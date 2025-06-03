import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { 
  Crown, 
  LayoutDashboard, 
  Wallet, 
  Send, 
  FileText, 
  DollarSign, 
  Bot, 
  Shield, 
  QrCode, 
  LogOut 
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Wallets", href: "/wallets", icon: Wallet },
  { name: "Mass Payments", href: "/mass-payments", icon: Send },
  { name: "Invoices", href: "/invoices", icon: FileText },
  { name: "Lending", href: "/lending", icon: DollarSign },
  { name: "AI Agents", href: "/ai-agents", icon: Bot },
  { name: "Trust Vault", href: "/trust-vault", icon: Shield },
  { name: "QR Scanner", href: "/qr-scanner", icon: QrCode },
];

export default function Sidebar() {
  const [location] = useLocation();

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <div className="w-64 bg-slate-800/50 border-r border-slate-700 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-purple-600 rounded-lg flex items-center justify-center neon-glow-amber">
            <Crown className="w-5 h-5 text-[#0F172A]" />
          </div>
          <div>
            <h1 className="text-xl font-bold neon-text-amber">SOVR Empire</h1>
            <p className="text-xs text-slate-400">Wallet Command Center</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.name} href={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start text-left font-medium transition-all duration-200",
                  isActive
                    ? "neon-glow-amber bg-amber-500/10 text-amber-400"
                    : "text-slate-300 hover:neon-glow-indigo hover:bg-indigo-500/10 hover:text-indigo-400"
                )}
              >
                <Icon className="w-5 h-5 mr-3" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-slate-700">
        <div className="flex items-center space-x-3 p-3 rounded-lg bg-slate-800/50 mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">SU</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Sovereign User</p>
            <p className="text-xs text-slate-400 truncate">Empire Member</p>
          </div>
        </div>
        
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
}
