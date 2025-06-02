import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Crown, Shield, Zap, Users, TrendingUp, Coins } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 cosmic-gradient"></div>
        <div className="relative z-10 px-6 py-16 mx-auto max-w-7xl">
          <div className="text-center">
            <div className="flex items-center justify-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-500 to-purple-600 rounded-xl flex items-center justify-center neon-glow-amber animate-pulse-glow">
                <Crown className="w-10 h-10 text-[#0F172A]" />
              </div>
            </div>
            
            <h1 className="text-6xl font-bold mb-6">
              <span className="neon-text-amber">SOVR Empire</span>
              <br />
              <span className="text-slate-200">Wallet Command Center</span>
            </h1>
            
            <p className="text-xl text-slate-400 mb-8 max-w-3xl mx-auto">
              The ultimate DeFi command center with AI-powered wallet management, 
              mass payments, QR scanning, and sovereign financial tools. 
              Built for the future of decentralized finance.
            </p>
            
            <Button 
              onClick={handleLogin}
              className="px-8 py-4 text-lg font-semibold bg-amber-500 hover:bg-amber-600 text-[#0F172A] neon-glow-amber animate-neon-pulse"
            >
              Enter the Empire
            </Button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-6 py-16 mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Sovereign Financial Tools</h2>
          <p className="text-slate-400 text-lg">Everything you need to manage your crypto empire</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="bg-slate-800/50 border-slate-700 neon-glow-indigo hover:neon-glow-amber transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Multi-Wallet Management</h3>
              <p className="text-slate-400">Create, import, and manage multiple wallets across different networks with enterprise-grade security.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 neon-glow-indigo hover:neon-glow-amber transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Mass Payments</h3>
              <p className="text-slate-400">Process bulk payments efficiently with CSV upload support and real-time transaction tracking.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 neon-glow-indigo hover:neon-glow-amber transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Wallet Agents</h3>
              <p className="text-slate-400">Deploy autonomous AI agents to manage trust operations, payments, and DeFi interactions.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 neon-glow-indigo hover:neon-glow-amber transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Lending Gateway</h3>
              <p className="text-slate-400">Access SOVR-ECHO trust pools and DeFi lending opportunities with competitive yields.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 neon-glow-indigo hover:neon-glow-amber transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                <Coins className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Invoice & QR Payments</h3>
              <p className="text-slate-400">Generate invoices with QR codes and scan payments directly through your camera.</p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 neon-glow-indigo hover:neon-glow-amber transition-all duration-300">
            <CardContent className="p-6">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Trust Verification</h3>
              <p className="text-slate-400">Verify PDF hashes, manage multisig wallets, and ensure cryptographic trust in all operations.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-6 py-16 mx-auto max-w-7xl">
        <div className="text-center bg-gradient-to-r from-slate-800/50 to-slate-700/50 rounded-2xl p-12 neon-glow-purple">
          <h2 className="text-3xl font-bold mb-4">Ready to Rule Your Financial Empire?</h2>
          <p className="text-slate-400 mb-8 text-lg">
            Join the SOVR Empire and take control of your decentralized finance operations
          </p>
          <Button 
            onClick={handleLogin}
            className="px-8 py-4 text-lg font-semibold bg-purple-600 hover:bg-purple-700 neon-glow-purple"
          >
            Start Your Reign
          </Button>
        </div>
      </div>
    </div>
  );
}
