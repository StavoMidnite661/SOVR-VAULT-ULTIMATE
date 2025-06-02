import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, LogOut, Wallet, TrendingUp, Users, Bot, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import WalletManager from "@/components/WalletManager";
import QRScanner from "@/components/QRScanner";
import MassPayments from "@/components/MassPayments";
import InvoiceGenerator from "@/components/InvoiceGenerator";
import AIAgentDashboard from "@/components/AIAgentDashboard";
import LendingGateway from "@/components/LendingGateway";
import TrustVerification from "@/components/TrustVerification";
import { useState } from "react";

export default function Dashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch user wallets
  const { data: wallets = [] } = useQuery({
    queryKey: ['/api/wallets'],
  });

  // Fetch recent transactions
  const { data: transactions = [] } = useQuery({
    queryKey: ['/api/transactions'],
  });

  // Calculate portfolio value (mock calculation for demo)
  const portfolioValue = wallets.reduce((total: number, wallet: any) => {
    return total + (Math.random() * 50000); // Mock balance calculation
  }, 0);

  const totalSOVR = 17000000; // SOVR Empire holdings

  return (
    <div className="min-h-screen bg-cosmic-black">
      {/* Header */}
      <header className="bg-cosmic-slate border-b border-cosmic-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Crown className="text-neon-amber text-2xl animate-glow-pulse" />
                <span className="text-xl font-orbitron font-bold text-neon-amber">SOVR Empire</span>
              </div>
              <div className="hidden md:flex space-x-6">
                <button 
                  onClick={() => setActiveTab('overview')}
                  className={`text-sm transition-colors ${activeTab === 'overview' ? 'text-neon-amber' : 'text-cosmic-light hover:text-neon-amber'}`}
                >
                  Dashboard
                </button>
                <button 
                  onClick={() => setActiveTab('wallets')}
                  className={`text-sm transition-colors ${activeTab === 'wallets' ? 'text-neon-indigo' : 'text-cosmic-light hover:text-neon-indigo'}`}
                >
                  Wallets
                </button>
                <button 
                  onClick={() => setActiveTab('ai')}
                  className={`text-sm transition-colors ${activeTab === 'ai' ? 'text-neon-purple' : 'text-cosmic-light hover:text-neon-purple'}`}
                >
                  AI Agents
                </button>
                <button 
                  onClick={() => setActiveTab('lending')}
                  className={`text-sm transition-colors ${activeTab === 'lending' ? 'text-neon-green' : 'text-cosmic-light hover:text-neon-green'}`}
                >
                  Lending
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setActiveTab('scanner')}
                className="neon-glow-indigo bg-cosmic-gray hover:bg-cosmic-slate"
              >
                <QrCode className="w-4 h-4 mr-2" />
                Scan QR
              </Button>
              <div className="flex items-center space-x-2">
                <img 
                  src={user?.profileImageUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face"} 
                  alt="User profile" 
                  className="w-8 h-8 rounded-full border-2 border-neon-amber"
                />
                <span className="text-sm text-cosmic-light">
                  {user?.firstName || 'Sovereign'} {user?.lastName || 'King'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.location.href = '/api/logout'}
                  className="text-cosmic-light hover:text-neon-red"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'overview' && (
          <>
            {/* Dashboard Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-orbitron font-bold text-neon-amber">Empire Command Center</h1>
                <Button 
                  onClick={() => setActiveTab('wallets')}
                  className="neon-glow-amber bg-cosmic-slate hover:bg-cosmic-gray"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  New Wallet
                </Button>
              </div>

              {/* Total Balance Card */}
              <Card className="cosmic-gradient neon-glow-amber">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cosmic-light text-sm">Total Portfolio Value</p>
                      <p className="text-4xl font-orbitron font-bold text-neon-amber">
                        ${portfolioValue.toLocaleString('en-US', { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-neon-green text-sm mt-1">
                        <TrendingUp className="w-4 h-4 inline mr-1" />
                        +12.3% (24h)
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-cosmic-light text-sm">SOVR Holdings</p>
                      <p className="text-2xl font-orbitron font-bold text-neon-amber">
                        {totalSOVR.toLocaleString()} SOVR
                      </p>
                      <p className="text-cosmic-light text-sm">
                        Sovereign Status: <span className="text-neon-purple font-semibold">Emperor</span>
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="neon-glow-amber bg-cosmic-slate">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cosmic-light text-sm">Active Wallets</p>
                      <p className="text-2xl font-orbitron font-bold text-neon-amber">{wallets.length}</p>
                    </div>
                    <Wallet className="w-8 h-8 text-neon-amber animate-cosmic-float" />
                  </div>
                </CardContent>
              </Card>

              <Card className="neon-glow-indigo bg-cosmic-slate">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cosmic-light text-sm">AI Actions</p>
                      <p className="text-2xl font-orbitron font-bold text-neon-indigo">24</p>
                    </div>
                    <Bot className="w-8 h-8 text-neon-indigo animate-cosmic-float" style={{ animationDelay: '0.5s' }} />
                  </div>
                </CardContent>
              </Card>

              <Card className="neon-glow-purple bg-cosmic-slate">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cosmic-light text-sm">Mass Payments</p>
                      <p className="text-2xl font-orbitron font-bold text-neon-purple">7</p>
                    </div>
                    <Users className="w-8 h-8 text-neon-purple animate-cosmic-float" style={{ animationDelay: '1s' }} />
                  </div>
                </CardContent>
              </Card>

              <Card className="neon-glow-green bg-cosmic-slate">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-cosmic-light text-sm">Lending APY</p>
                      <p className="text-2xl font-orbitron font-bold text-neon-green">12.5%</p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-neon-green animate-cosmic-float" style={{ animationDelay: '1.5s' }} />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Dashboard Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Features */}
              <div className="lg:col-span-2 space-y-6">
                {/* Quick Actions */}
                <Card className="neon-glow-indigo bg-cosmic-slate">
                  <CardHeader>
                    <CardTitle className="text-neon-indigo">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Button 
                        onClick={() => setActiveTab('payments')}
                        className="neon-glow-amber bg-cosmic-gray p-4 h-auto flex-col hover:bg-cosmic-slate group"
                      >
                        <Users className="w-6 h-6 text-neon-amber mb-2 group-hover:animate-pulse" />
                        <span className="text-sm">Mass Pay</span>
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('invoices')}
                        className="neon-glow-green bg-cosmic-gray p-4 h-auto flex-col hover:bg-cosmic-slate group"
                      >
                        <QrCode className="w-6 h-6 text-neon-green mb-2 group-hover:animate-pulse" />
                        <span className="text-sm">Invoice</span>
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('scanner')}
                        className="neon-glow-indigo bg-cosmic-gray p-4 h-auto flex-col hover:bg-cosmic-slate group"
                      >
                        <QrCode className="w-6 h-6 text-neon-indigo mb-2 group-hover:animate-pulse" />
                        <span className="text-sm">Scan QR</span>
                      </Button>
                      <Button 
                        onClick={() => setActiveTab('trust')}
                        className="neon-glow-purple bg-cosmic-gray p-4 h-auto flex-col hover:bg-cosmic-slate group"
                      >
                        <Crown className="w-6 h-6 text-neon-purple mb-2 group-hover:animate-pulse" />
                        <span className="text-sm">Trust</span>
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Transactions */}
                <Card className="neon-glow-amber bg-cosmic-slate">
                  <CardHeader>
                    <CardTitle className="text-neon-amber">Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {transactions.length === 0 ? (
                      <div className="text-center py-8">
                        <TrendingUp className="w-12 h-12 text-cosmic-muted mx-auto mb-4" />
                        <p className="text-cosmic-light">No transactions yet</p>
                        <p className="text-sm text-cosmic-muted">Start by creating a wallet or making a payment</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {transactions.slice(0, 5).map((transaction: any) => (
                          <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg bg-cosmic-gray/50 border border-cosmic-gray">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center">
                                <TrendingUp className="w-5 h-5 text-neon-green" />
                              </div>
                              <div>
                                <p className="font-medium text-cosmic-white">{transaction.type}</p>
                                <p className="text-sm text-cosmic-light">
                                  {new Date(transaction.createdAt).toLocaleString()}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="font-orbitron font-semibold text-neon-green">
                                {transaction.amount} {transaction.asset}
                              </p>
                              <p className="text-sm text-cosmic-light">{transaction.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column - Sidebar */}
              <div className="space-y-6">
                {/* Active Wallets */}
                <Card className="neon-glow-amber bg-cosmic-slate">
                  <CardHeader>
                    <CardTitle className="text-neon-amber">Active Wallets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {wallets.length === 0 ? (
                      <div className="text-center py-4">
                        <Wallet className="w-8 h-8 text-cosmic-muted mx-auto mb-2" />
                        <p className="text-sm text-cosmic-light">No wallets yet</p>
                        <Button 
                          onClick={() => setActiveTab('wallets')}
                          size="sm" 
                          className="mt-2 neon-glow-amber"
                        >
                          Create Wallet
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {wallets.slice(0, 3).map((wallet: any) => (
                          <div key={wallet.id} className="neon-glow-amber bg-cosmic-gray p-3 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-sm text-cosmic-white">{wallet.name}</p>
                                <p className="text-xs text-cosmic-muted">
                                  {wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)}
                                </p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm font-orbitron font-semibold text-neon-amber">
                                  ${(Math.random() * 50000).toFixed(2)}
                                </p>
                                <p className="text-xs text-cosmic-light">{wallet.network}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* AI Agent Status */}
                <Card className="neon-glow-purple bg-cosmic-slate">
                  <CardHeader>
                    <CardTitle className="text-neon-purple">AI Agent Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-neon-purple/20 rounded-full flex items-center justify-center animate-cosmic-float">
                          <Bot className="w-5 h-5 text-neon-purple" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-cosmic-white">Grok Agent</p>
                          <p className="text-xs text-cosmic-light">Autonomous trading active</p>
                        </div>
                        <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse"></div>
                      </div>
                      
                      <div className="bg-cosmic-gray p-3 rounded-lg">
                        <p className="text-xs text-cosmic-light mb-2">Recent Actions:</p>
                        <div className="space-y-1 text-xs">
                          <p><span className="text-neon-green">✓</span> Portfolio rebalanced</p>
                          <p><span className="text-neon-amber">⏳</span> Monitoring opportunities</p>
                          <p><span className="text-neon-indigo">📊</span> Trust verification complete</p>
                        </div>
                      </div>
                      
                      <Button 
                        onClick={() => setActiveTab('ai')}
                        className="w-full neon-glow-purple bg-cosmic-gray hover:bg-cosmic-slate"
                      >
                        Configure AI Strategy
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </>
        )}

        {activeTab === 'wallets' && <WalletManager />}
        {activeTab === 'scanner' && <QRScanner />}
        {activeTab === 'payments' && <MassPayments />}
        {activeTab === 'invoices' && <InvoiceGenerator />}
        {activeTab === 'ai' && <AIAgentDashboard />}
        {activeTab === 'lending' && <LendingGateway />}
        {activeTab === 'trust' && <TrustVerification />}
      </div>
    </div>
  );
}
