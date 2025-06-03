import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  DollarSign, 
  Plus, 
  RefreshCw, 
  TrendingUp, 
  Clock,
  CheckCircle,
  ArrowRight,
  Banknote,
  PiggyBank
} from "lucide-react";

export default function Lending() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wallets } = useQuery({
    queryKey: ["/api/wallets"],
  });

  const { data: lendingPools, isLoading } = useQuery({
    queryKey: ["/api/lending-pools"],
  });

  const createLendingPoolMutation = useMutation({
    mutationFn: async (poolData: {
      walletId: number;
      poolName: string;
      amount: string;
      token: string;
      network: string;
      apy: string;
      type: string;
      maturityDate?: string;
    }) => {
      const response = await apiRequest('POST', '/api/lending-pools', {
        ...poolData,
        status: 'active',
        nextPayoutDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/lending-pools"] });
      setIsCreateModalOpen(false);
      toast({
        title: "Lending Pool Created",
        description: "Your funds have been deployed to the lending pool.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create lending pool. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreatePool = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    createLendingPoolMutation.mutate({
      walletId: parseInt(formData.get('walletId') as string),
      poolName: formData.get('poolName') as string,
      amount: formData.get('amount') as string,
      token: formData.get('token') as string,
      network: formData.get('network') as string,
      apy: formData.get('apy') as string,
      type: formData.get('type') as string,
      maturityDate: formData.get('maturityDate') as string || undefined,
    });
  };

  const getPoolTypeColor = (type: string) => {
    switch (type) {
      case 'sovr-echo':
        return 'bg-amber-500/20 text-amber-400';
      case 'defi':
        return 'bg-blue-500/20 text-blue-400';
      case 'trust-backed':
        return 'bg-purple-500/20 text-purple-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'matured':
        return <Clock className="w-4 h-4 text-blue-400" />;
      case 'withdrawn':
        return <ArrowRight className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const totalLent = lendingPools?.reduce((sum: number, pool: any) => sum + parseFloat(pool.amount), 0) || 0;
  const avgAPY = lendingPools?.length ? 
    lendingPools.reduce((sum: number, pool: any) => sum + parseFloat(pool.apy), 0) / lendingPools.length : 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Lending Gateway</h2>
            <p className="text-slate-400">Access SOVR-ECHO trust pools and DeFi lending opportunities</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="neon-glow-amber bg-amber-500/10 text-amber-400 hover:bg-amber-500/20">
                <Plus className="w-4 h-4 mr-2" />
                Lend USDC
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle>Create Lending Position</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreatePool} className="space-y-4">
                <div>
                  <Label htmlFor="walletId">Source Wallet</Label>
                  <Select name="walletId" required>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Select wallet" />
                    </SelectTrigger>
                    <SelectContent>
                      {wallets?.map((wallet: any) => (
                        <SelectItem key={wallet.id} value={wallet.id.toString()}>
                          {wallet.name} ({wallet.network})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="poolName">Pool Name</Label>
                  <Input
                    id="poolName"
                    name="poolName"
                    placeholder="My Lending Position"
                    required
                    className="bg-slate-700 border-slate-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input
                      id="amount"
                      name="amount"
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      required
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="token">Token</Label>
                    <Select name="token" required>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                        <SelectItem value="DAI">DAI</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="network">Network</Label>
                    <Select name="network" required>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select network" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ethereum">Ethereum</SelectItem>
                        <SelectItem value="base">Base</SelectItem>
                        <SelectItem value="polygon">Polygon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="apy">Expected APY (%)</Label>
                    <Input
                      id="apy"
                      name="apy"
                      type="number"
                      step="0.01"
                      placeholder="8.50"
                      required
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="type">Pool Type</Label>
                  <Select name="type" required>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Select pool type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sovr-echo">SOVR-ECHO Trust Pool</SelectItem>
                      <SelectItem value="defi">DeFi Protocol</SelectItem>
                      <SelectItem value="trust-backed">Trust-Backed Lending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="maturityDate">Maturity Date (Optional)</Label>
                  <Input
                    id="maturityDate"
                    name="maturityDate"
                    type="date"
                    className="bg-slate-700 border-slate-600"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={createLendingPoolMutation.isPending}
                  className="w-full neon-glow-amber bg-amber-500 hover:bg-amber-600 text-black"
                >
                  {createLendingPoolMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <DollarSign className="w-4 h-4 mr-2" />
                  )}
                  Create Lending Position
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 neon-glow-amber">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <PiggyBank className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Lent</p>
                  <p className="text-2xl font-bold text-amber-400">
                    ${totalLent.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 neon-glow-indigo">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Average APY</p>
                  <p className="text-2xl font-bold text-green-400">
                    {avgAPY.toFixed(2)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 neon-glow-purple">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Active Positions</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {lendingPools?.filter((pool: any) => pool.status === 'active').length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lending Positions */}
        <Card className="bg-slate-800/50 border-slate-700 neon-glow-indigo">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5" />
              <span>Active Lending Positions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-slate-700 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : lendingPools && lendingPools.length > 0 ? (
              <div className="space-y-4">
                {lendingPools.map((pool: any) => (
                  <div key={pool.id} className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold">{pool.poolName}</h3>
                          <div className="flex items-center space-x-2">
                            <Badge className={`text-xs ${getPoolTypeColor(pool.type)}`}>
                              {pool.type.replace('-', ' ').toUpperCase()}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {getStatusIcon(pool.status)}
                              <span className="text-xs text-slate-400 capitalize">{pool.status}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-amber-400">
                          {parseFloat(pool.amount).toLocaleString('en-US', { 
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2 
                          })} {pool.token}
                        </p>
                        <p className="text-sm text-green-400 font-semibold">
                          {parseFloat(pool.apy).toFixed(2)}% APY
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-400">Network</p>
                        <p className="font-medium capitalize">{pool.network}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Next Payout</p>
                        <p className="font-medium">
                          {pool.nextPayoutDate ? 
                            new Date(pool.nextPayoutDate).toLocaleDateString() : 
                            'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Created</p>
                        <p className="font-medium">
                          {new Date(pool.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    {pool.maturityDate && (
                      <div className="mt-3 p-2 bg-slate-800/50 rounded text-xs">
                        <span className="text-slate-400">Maturity Date: </span>
                        <span className="font-medium">
                          {new Date(pool.maturityDate).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <DollarSign className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                <h3 className="text-xl font-semibold text-slate-300 mb-2">No Lending Positions</h3>
                <p className="text-slate-400 mb-6">Start earning yield by creating your first lending position</p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="neon-glow-amber bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Position
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Opportunities */}
        <Card className="bg-slate-800/50 border-slate-700 neon-glow-purple">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5" />
              <span>Available Opportunities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-amber-400">SOVR-ECHO Trust Pool</h4>
                  <Badge className="bg-amber-500/20 text-amber-400">Featured</Badge>
                </div>
                <p className="text-2xl font-bold text-green-400 mb-1">8.5% APY</p>
                <p className="text-sm text-slate-400 mb-3">Trust-verified lending with monthly payouts</p>
                <Button 
                  size="sm" 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full neon-glow-amber bg-amber-500/20 text-amber-400 hover:bg-amber-500/30"
                >
                  Lend Now
                </Button>
              </div>

              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-blue-400">Aave V3 USDC</h4>
                  <Badge className="bg-blue-500/20 text-blue-400">DeFi</Badge>
                </div>
                <p className="text-2xl font-bold text-green-400 mb-1">6.2% APY</p>
                <p className="text-sm text-slate-400 mb-3">Decentralized lending protocol</p>
                <Button 
                  size="sm" 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full neon-glow-indigo bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                >
                  Lend Now
                </Button>
              </div>

              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-purple-400">Compound USDC</h4>
                  <Badge className="bg-purple-500/20 text-purple-400">DeFi</Badge>
                </div>
                <p className="text-2xl font-bold text-green-400 mb-1">5.8% APY</p>
                <p className="text-sm text-slate-400 mb-3">Battle-tested lending protocol</p>
                <Button 
                  size="sm" 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="w-full neon-glow-purple bg-purple-500/20 text-purple-400 hover:bg-purple-500/30"
                >
                  Lend Now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
