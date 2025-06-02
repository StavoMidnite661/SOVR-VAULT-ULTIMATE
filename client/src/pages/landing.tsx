import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Shield, Zap, TrendingUp, Users, QrCode } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-cosmic-black relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 cosmic-gradient opacity-20"></div>
      <div className="absolute top-0 left-0 w-full h-full">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-neon-purple/10 rounded-full blur-3xl animate-cosmic-float"></div>
        <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-neon-amber/10 rounded-full blur-3xl animate-cosmic-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-1/4 left-1/3 w-56 h-56 bg-neon-indigo/10 rounded-full blur-3xl animate-cosmic-float" style={{ animationDelay: '2s' }}></div>
      </div>
      
      <div className="relative z-10 container mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <Crown className="w-12 h-12 text-neon-amber animate-glow-pulse" />
            <h1 className="text-5xl font-orbitron font-bold text-neon-amber animate-neon-flicker">
              SOVR Empire
            </h1>
          </div>
          <p className="text-xl text-cosmic-light mb-2">
            Sovereign Control of Your Digital Empire
          </p>
          <p className="text-cosmic-muted max-w-2xl mx-auto">
            The ultimate DeFi command center with AI agents, mass payments, QR scanning, 
            and sovereign financial tools. Built for the next generation of digital finance.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card className="bg-cosmic-slate border-cosmic-gray neon-glow-amber hover:scale-105 transition-all duration-300">
            <CardHeader>
              <Shield className="w-10 h-10 text-neon-amber mb-2" />
              <CardTitle className="text-neon-amber">Multi-Wallet Management</CardTitle>
              <CardDescription className="text-cosmic-light">
                Create, import, and manage multiple wallets across EVM networks with sovereign control.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-cosmic-slate border-cosmic-gray neon-glow-indigo hover:scale-105 transition-all duration-300">
            <CardHeader>
              <Zap className="w-10 h-10 text-neon-indigo mb-2" />
              <CardTitle className="text-neon-indigo">AI Wallet Agents</CardTitle>
              <CardDescription className="text-cosmic-light">
                Deploy autonomous AI agents for trading, lending, and DeFi operations with Grok integration.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-cosmic-slate border-cosmic-gray neon-glow-purple hover:scale-105 transition-all duration-300">
            <CardHeader>
              <Users className="w-10 h-10 text-neon-purple mb-2" />
              <CardTitle className="text-neon-purple">Mass Payments</CardTitle>
              <CardDescription className="text-cosmic-light">
                Process bulk payments via CSV upload with GasliteDrop integration and vault management.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-cosmic-slate border-cosmic-gray neon-glow-green hover:scale-105 transition-all duration-300">
            <CardHeader>
              <QrCode className="w-10 h-10 text-neon-green mb-2" />
              <CardTitle className="text-neon-green">QR Scanner & Invoices</CardTitle>
              <CardDescription className="text-cosmic-light">
                Generate invoices with QR codes and scan payments with camera integration.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-cosmic-slate border-cosmic-gray neon-glow-amber hover:scale-105 transition-all duration-300">
            <CardHeader>
              <TrendingUp className="w-10 h-10 text-neon-amber mb-2" />
              <CardTitle className="text-neon-amber">Lending Gateway</CardTitle>
              <CardDescription className="text-cosmic-light">
                Access SOVR-ECHO lending with trust scores and DeFi yield opportunities.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-cosmic-slate border-cosmic-gray neon-glow-indigo hover:scale-105 transition-all duration-300">
            <CardHeader>
              <Shield className="w-10 h-10 text-neon-indigo mb-2" />
              <CardTitle className="text-neon-indigo">Trust Verification</CardTitle>
              <CardDescription className="text-cosmic-light">
                Generate trust QR codes, sign PDFs, and verify documents with cryptographic proof.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-cosmic-slate border-neon-amber neon-glow-amber max-w-2xl mx-auto">
            <CardContent className="pt-8">
              <Crown className="w-16 h-16 text-neon-amber mx-auto mb-4 animate-cosmic-float" />
              <h2 className="text-3xl font-orbitron font-bold text-neon-amber mb-4">
                Enter the Empire
              </h2>
              <p className="text-cosmic-light mb-6">
                Join the sovereign revolution and take control of your digital assets 
                with the most advanced DeFi command center ever built.
              </p>
              <Button 
                size="lg" 
                className="bg-neon-amber text-cosmic-black hover:bg-neon-amber/90 font-orbitron font-bold px-8 py-4 text-lg neon-glow-amber"
                onClick={() => window.location.href = '/api/login'}
              >
                <Crown className="w-5 h-5 mr-2" />
                Access Command Center
              </Button>
              <p className="text-sm text-cosmic-muted mt-4">
                Secure authentication via Replit • No signup required
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-4xl font-orbitron font-bold text-neon-amber mb-2">17M+</div>
            <div className="text-cosmic-light">SOVR Units</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-orbitron font-bold text-neon-indigo mb-2">Multi-Chain</div>
            <div className="text-cosmic-light">EVM Networks</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-orbitron font-bold text-neon-purple mb-2">AI-Powered</div>
            <div className="text-cosmic-light">Automation</div>
          </div>
        </div>
      </div>
    </div>
  );
}
