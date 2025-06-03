import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, DollarSign, Shield, Clock, AlertTriangle, CheckCircle, Percent } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { NeonButton } from "@/components/ui/neon-button";
import { CosmicCard } from "@/components/ui/cosmic-card";

export default function LendingGateway() {
  const [lendAmount, setLendAmount] = useState('');
  const [selectedAsset, setSelectedAsset] = useState('USDC');
  const [borrowAmount, setBorrowAmount] = useState('');
  const { toast } = useToast();

  // Mock data for lending pools
  const lendingPools = [
    {
      asset: 'USDC',
      apy: 12.5,
      totalSupplied: 2500000,
      utilization: 75,
      mySupply: 50000,
      trustRequired: 85
    },
    {
      asset: 'ETH',
      apy: 8.2,
      totalSupplied: 1200,
      utilization: 68,
      mySupply: 2.5,
      trustRequired: 90
    },
    {
      asset: 'SOVR',
      apy: 15.8,
      totalSupplied: 5000000,
      utilization: 82,
      mySupply: 100000,
      trustRequired: 80
    }
  ];

  const handleLend = () => {
    if (!lendAmount || parseFloat(lendAmount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid lending amount",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Lending Initiated",
      description: `Successfully initiated lending of ${lendAmount} ${selectedAsset}`,
    });
    setLendAmount('');
  };

  const handleBorrow = () => {
    if (!borrowAmount || parseFloat(borrowAmount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid borrowing amount",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Borrow Request",
      description: `Borrow request for ${borrowAmount} ${selectedAsset} submitted for review`,
    });
    setBorrowAmount('');
  };

  const trustScore = 87.5; // Mock trust score

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-orbitron font-bold text-neon-green">Lending Gateway</h1>
        <p className="text-cosmic-light">Access SOVR-ECHO lending with trust-based DeFi opportunities</p>
      </div>

      {/* Trust Score & Status */}
      <CosmicCard neonColor="amber" variant="gradient">
        <CardHeader>
          <CardTitle className="text-neon-amber flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Trust & Eligibility Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <div className="absolute inset-0 rounded-full border-4 border-cosmic-gray"></div>
                <div 
                  className="absolute inset-0 rounded-full border-4 border-neon-amber"
                  style={{
                    clipPath: `polygon(0 0, ${trustScore}% 0, ${trustScore}% 100%, 0 100%)`
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-orbitron font-bold text-neon-amber">
                    {trustScore}%
                  </span>
                </div>
              </div>
              <p className="text-cosmic-light text-sm">Trust Score</p>
              <p className="text-neon-amber font-semibold">Sovereign Emperor</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-neon-green" />
              </div>
              <p className="text-cosmic-light text-sm">Lending Status</p>
              <p className="text-neon-green font-semibold">Qualified</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-neon-purple/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-8 h-8 text-neon-purple" />
              </div>
              <p className="text-cosmic-light text-sm">Credit Limit</p>
              <p className="text-neon-purple font-orbitron font-semibold">$500K</p>
            </div>
          </div>
        </CardContent>
      </CosmicCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Lending Interface */}
        <CosmicCard neonColor="green" variant="default">
          <CardHeader>
            <CardTitle className="text-neon-green flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Lend Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="lendAsset" className="text-cosmic-light">Asset</Label>
                <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                  <SelectTrigger className="bg-cosmic-gray border-cosmic-gray text-cosmic-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-cosmic-slate border-cosmic-gray">
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="SOVR">SOVR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="lendAmount" className="text-cosmic-light">Amount</Label>
                <Input
                  id="lendAmount"
                  type="number"
                  value={lendAmount}
                  onChange={(e) => setLendAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-cosmic-gray border-cosmic-gray text-cosmic-white placeholder-cosmic-muted"
                />
              </div>
              
              <div className="bg-cosmic-gray/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-cosmic-light text-sm">Current APY</span>
                  <span className="text-neon-green font-orbitron font-semibold">
                    {lendingPools.find(p => p.asset === selectedAsset)?.apy}%
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-cosmic-light text-sm">Estimated Daily Earnings</span>
                  <span className="text-cosmic-white">
                    ${lendAmount ? (parseFloat(lendAmount) * (lendingPools.find(p => p.asset === selectedAsset)?.apy || 0) / 365 / 100).toFixed(2) : '0.00'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cosmic-light text-sm">Your Balance</span>
                  <span className="text-cosmic-white">
                    {Math.random() * 100000 | 0} {selectedAsset}
                  </span>
                </div>
              </div>
              
              <NeonButton
                neonColor="green"
                onClick={handleLend}
                className="w-full"
              >
                <TrendingUp className="w-4 h-4 mr-2" />
                Lend {selectedAsset}
              </NeonButton>
            </div>
          </CardContent>
        </CosmicCard>

        {/* Borrowing Interface */}
        <CosmicCard neonColor="indigo" variant="default">
          <CardHeader>
            <CardTitle className="text-neon-indigo flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Borrow Assets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="borrowAsset" className="text-cosmic-light">Asset</Label>
                <Select value={selectedAsset} onValueChange={setSelectedAsset}>
                  <SelectTrigger className="bg-cosmic-gray border-cosmic-gray text-cosmic-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-cosmic-slate border-cosmic-gray">
                    <SelectItem value="USDC">USDC</SelectItem>
                    <SelectItem value="ETH">ETH</SelectItem>
                    <SelectItem value="SOVR">SOVR</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="borrowAmount" className="text-cosmic-light">Amount</Label>
                <Input
                  id="borrowAmount"
                  type="number"
                  value={borrowAmount}
                  onChange={(e) => setBorrowAmount(e.target.value)}
                  placeholder="0.00"
                  className="bg-cosmic-gray border-cosmic-gray text-cosmic-white placeholder-cosmic-muted"
                />
              </div>
              
              <div className="bg-cosmic-gray/50 rounded-lg p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-cosmic-light text-sm">Borrow APR</span>
                  <span className="text-neon-red font-orbitron font-semibold">
                    {((lendingPools.find(p => p.asset === selectedAsset)?.apy || 0) + 3).toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-cosmic-light text-sm">Available Credit</span>
                  <span className="text-cosmic-white">$500,000</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cosmic-light text-sm">Collateral Required</span>
                  <span className="text-cosmic-white">
                    {borrowAmount ? (parseFloat(borrowAmount) * 1.5).toFixed(2) : '0.00'} {selectedAsset}
                  </span>
                </div>
              </div>
              
              <NeonButton
                neonColor="indigo"
                onClick={handleBorrow}
                className="w-full"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Borrow {selectedAsset}
              </NeonButton>
            </div>
          </CardContent>
        </CosmicCard>
      </div>

      {/* Lending Pools Overview */}
      <CosmicCard neonColor="purple" variant="default">
        <CardHeader>
          <CardTitle className="text-neon-purple">SOVR-ECHO Lending Pools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {lendingPools.map((pool) => (
              <div key={pool.asset} className="bg-cosmic-gray/50 rounded-lg p-4 border border-cosmic-gray">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-cosmic-white">{pool.asset}</h3>
                  <div className="text-right">
                    <p className="text-2xl font-orbitron font-bold text-neon-green">
                      {pool.apy}%
                    </p>
                    <p className="text-xs text-cosmic-light">APY</p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-cosmic-light text-sm">Total Supplied</span>
                    <span className="text-cosmic-white text-sm">
                      {pool.totalSupplied.toLocaleString()} {pool.asset}
                    </span>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-cosmic-light text-sm">Utilization</span>
                      <span className="text-cosmic-white text-sm">{pool.utilization}%</span>
                    </div>
                    <Progress value={pool.utilization} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-cosmic-light text-sm">Your Supply</span>
                    <span className="text-neon-amber text-sm font-medium">
                      {pool.mySupply.toLocaleString()} {pool.asset}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-cosmic-light text-sm">Trust Required</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-cosmic-white text-sm">{pool.trustRequired}%</span>
                      {trustScore >= pool.trustRequired ? (
                        <CheckCircle className="w-4 h-4 text-neon-green" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-neon-red" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </CosmicCard>

      {/* Active Positions */}
      <CosmicCard neonColor="amber" variant="default">
        <CardHeader>
          <CardTitle className="text-neon-amber">Your Active Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Lending Positions */}
            <div>
              <h4 className="text-lg font-semibold text-cosmic-white mb-3">Lending Positions</h4>
              <div className="space-y-3">
                <div className="bg-cosmic-gray/50 rounded-lg p-4 border border-cosmic-gray">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-cosmic-white">50,000 USDC</p>
                      <p className="text-sm text-cosmic-light">Earning 12.5% APY</p>
                    </div>
                    <div className="text-right">
                      <p className="text-neon-green font-orbitron font-semibold">+$17.12</p>
                      <p className="text-xs text-cosmic-light">Daily earnings</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-cosmic-gray/50 rounded-lg p-4 border border-cosmic-gray">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-cosmic-white">100,000 SOVR</p>
                      <p className="text-sm text-cosmic-light">Earning 15.8% APY</p>
                    </div>
                    <div className="text-right">
                      <p className="text-neon-green font-orbitron font-semibold">+43.29 SOVR</p>
                      <p className="text-xs text-cosmic-light">Daily earnings</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Borrowing Positions */}
            <div>
              <h4 className="text-lg font-semibold text-cosmic-white mb-3">Borrowing Positions</h4>
              <div className="text-center py-8">
                <Clock className="w-12 h-12 text-cosmic-muted mx-auto mb-4" />
                <p className="text-cosmic-light">No active borrowing positions</p>
                <p className="text-sm text-cosmic-muted">Use your trust score to access credit</p>
              </div>
            </div>
          </div>
        </CardContent>
      </CosmicCard>
    </div>
  );
}
