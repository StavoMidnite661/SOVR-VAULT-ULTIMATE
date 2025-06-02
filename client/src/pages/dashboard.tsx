import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import WalletCard from "@/components/wallet-card";
import TransactionItem from "@/components/transaction-item";
import QRScannerModal from "@/components/qr-scanner-modal";
import { 
  Plus, 
  Send, 
  FileText, 
  QrCode, 
  Bot, 
  TrendingUp, 
  ArrowRight,
  DollarSign,
  Wallet as WalletIcon,
  Activity
} from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

export default function Dashboard() {
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-64 bg-slate-700 rounded-xl"></div>
            <div className="h-64 bg-slate-700 rounded-xl"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalBalance = stats?.totalBalance ? parseFloat(stats.totalBalance) : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Wallet Command Center</h2>
            <p className="text-slate-400">Manage your SOVR Empire assets and operations</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={() => setQrScannerOpen(true)}
              className="p-3 neon-glow-indigo bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
            >
              <QrCode className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center">
              <span className="text-xs font-bold">SU</span>
            </div>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Portfolio Overview */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Total Portfolio Value */}
          <div className="lg:col-span-2 balance-card p-6 rounded-xl neon-glow-amber">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Total Portfolio Value</h3>
              <div className="flex items-center space-x-2 text-green-400">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm">+12.5%</span>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-3xl font-bold neon-text-amber">
                  ${totalBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
                <p className="text-slate-400">Across {stats?.activeWallets || 0} wallets</p>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-400">{stats?.activeWallets || 0}</p>
                  <p className="text-xs text-slate-400">Active Wallets</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-purple-400">{stats?.activeAiAgents || 0}</p>
                  <p className="text-xs text-slate-400">AI Agents</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-400">
                    ${parseFloat(stats?.totalLent || '0').toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">Total Lent</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-4">
            <Link href="/wallets">
              <Button className="w-full p-4 neon-glow-amber bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 font-medium">
                <Plus className="w-4 h-4 mr-2" />
                New Wallet
              </Button>
            </Link>
            <Link href="/mass-payments">
              <Button className="w-full p-4 neon-glow-indigo bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 font-medium">
                <Send className="w-4 h-4 mr-2" />
                Mass Payment
              </Button>
            </Link>
            <Link href="/invoices">
              <Button className="w-full p-4 neon-glow-purple bg-purple-500/10 text-purple-400 hover:bg-purple-500/20 font-medium">
                <FileText className="w-4 h-4 mr-2" />
                Generate Invoice
              </Button>
            </Link>
          </div>
        </section>

        {/* Active Wallets & Recent Transactions */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* Active Wallets */}
          <Card className="bg-slate-800/50 border-slate-700 neon-glow-indigo">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <WalletIcon className="w-5 h-5" />
                  <span>Active Wallets</span>
                </CardTitle>
                <Link href="/wallets">
                  <Button variant="ghost" size="sm" className="text-indigo-400 hover:text-amber-400">
                    View All <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats?.wallets?.length ? (
                stats.wallets.map((wallet: any) => (
                  <WalletCard key={wallet.id} wallet={wallet} />
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <WalletIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No wallets found</p>
                  <Link href="/wallets">
                    <Button size="sm" className="mt-2 neon-glow-amber">
                      Create Your First Wallet
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Transactions */}
          <Card className="bg-slate-800/50 border-slate-700 neon-glow-purple">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="w-5 h-5" />
                  <span>Recent Activity</span>
                </CardTitle>
                <Button variant="ghost" size="sm" className="text-purple-400 hover:text-amber-400">
                  View All <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {stats?.recentTransactions?.length ? (
                stats.recentTransactions.map((transaction: any) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No recent transactions</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* AI Agent Status & Quick Tools */}
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* AI Agent Dashboard */}
          <Card className="bg-slate-800/50 border-slate-700 neon-glow-purple">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Bot className="w-5 h-5 animate-pulse-glow" />
                  <span>AI Wallet Agent</span>
                </CardTitle>
                <Badge className="bg-green-500/20 text-green-400">ACTIVE</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Operations Today</p>
                  <p className="text-2xl font-bold text-purple-400">12</p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-sm text-slate-400 mb-1">Value Managed</p>
                  <p className="text-2xl font-bold text-purple-400">$24.5K</p>
                </div>
              </div>
              
              <Link href="/ai-agents">
                <Button className="w-full neon-glow-purple bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">
                  <Bot className="w-4 h-4 mr-2" />
                  Configure AI Agent
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Lending Overview */}
          <Card className="bg-slate-800/50 border-slate-700 neon-glow-amber">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <DollarSign className="w-5 h-5" />
                  <span>Lending Gateway</span>
                </CardTitle>
                <Link href="/lending">
                  <Button variant="ghost" size="sm" className="text-amber-400 hover:text-indigo-400">
                    Manage <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Total Lent</p>
                  <p className="text-xl font-bold text-amber-400">
                    ${parseFloat(stats?.totalLent || '0').toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <p className="text-xs text-slate-400 mb-1">Active APY</p>
                  <p className="text-xl font-bold text-green-400">8.5%</p>
                </div>
              </div>
              
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-medium">SOVR-ECHO Trust Pool</p>
                  <Badge className="bg-green-500/20 text-green-400 text-xs">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-slate-400">Next payout in 2 days</p>
                  <p className="text-sm font-semibold text-amber-400">$1,247.83</p>
                </div>
              </div>

              <Link href="/lending">
                <Button className="w-full neon-glow-amber bg-amber-500/10 text-amber-400 hover:bg-amber-500/20">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Lend USDC
                </Button>
              </Link>
            </CardContent>
          </Card>
        </section>
      </main>

      <QRScannerModal 
        isOpen={qrScannerOpen} 
        onClose={() => setQrScannerOpen(false)} 
      />
    </div>
  );
}
