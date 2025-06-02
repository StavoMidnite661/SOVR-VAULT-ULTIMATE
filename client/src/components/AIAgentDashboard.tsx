import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Bot, Zap, TrendingUp, Shield, Settings, Play, Pause, Activity, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { NeonButton } from "@/components/ui/neon-button";
import { CosmicCard } from "@/components/ui/cosmic-card";

export default function AIAgentDashboard() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    actionType: 'trade',
    parameters: {
      strategy: 'conservative',
      maxAmount: '1000',
      asset: 'USDC'
    },
    agentWalletId: ''
  });
  const { toast } = useToast();

  // Fetch AI agent actions
  const { data: actions = [], isLoading: actionsLoading } = useQuery({
    queryKey: ['/api/ai-agent/actions'],
  });

  // Fetch user wallets for agent selection
  const { data: wallets = [] } = useQuery({
    queryKey: ['/api/wallets'],
  });

  // Create AI agent action mutation
  const createActionMutation = useMutation({
    mutationFn: async (actionData: any) => {
      const response = await apiRequest('POST', '/api/ai-agent/actions', actionData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ai-agent/actions'] });
      setShowCreateDialog(false);
      setFormData({
        actionType: 'trade',
        parameters: { strategy: 'conservative', maxAmount: '1000', asset: 'USDC' },
        agentWalletId: ''
      });
      toast({
        title: "AI Action Deployed",
        description: "Your AI agent is now executing the specified action",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Deployment Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.agentWalletId) {
      toast({
        title: "Validation Error",
        description: "Please select an AI agent wallet",
        variant: "destructive",
      });
      return;
    }
    createActionMutation.mutate(formData);
  };

  const aiAgentWallets = wallets.filter((wallet: any) => wallet.type === 'ai_agent');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-neon-purple">AI Agent Dashboard</h1>
          <p className="text-cosmic-light">Deploy and manage autonomous AI wallet agents</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <NeonButton neonColor="purple">
              <Bot className="w-4 h-4 mr-2" />
              Deploy Agent
            </NeonButton>
          </DialogTrigger>
          <DialogContent className="bg-cosmic-slate border-cosmic-gray">
            <DialogHeader>
              <DialogTitle className="text-neon-purple font-orbitron">Deploy AI Agent</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateAction} className="space-y-4">
              <div>
                <Label htmlFor="agentWallet" className="text-cosmic-light">AI Agent Wallet</Label>
                <Select 
                  value={formData.agentWalletId} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, agentWalletId: value }))}
                >
                  <SelectTrigger className="bg-cosmic-gray border-cosmic-gray text-cosmic-white">
                    <SelectValue placeholder="Select AI agent wallet" />
                  </SelectTrigger>
                  <SelectContent className="bg-cosmic-slate border-cosmic-gray">
                    {aiAgentWallets.map((wallet: any) => (
                      <SelectItem key={wallet.id} value={wallet.id.toString()}>
                        {wallet.name} ({wallet.address?.slice(0, 6)}...{wallet.address?.slice(-4)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="actionType" className="text-cosmic-light">Action Type</Label>
                <Select 
                  value={formData.actionType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, actionType: value }))}
                >
                  <SelectTrigger className="bg-cosmic-gray border-cosmic-gray text-cosmic-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-cosmic-slate border-cosmic-gray">
                    <SelectItem value="trade">Autonomous Trading</SelectItem>
                    <SelectItem value="lend">DeFi Lending</SelectItem>
                    <SelectItem value="verify_trust">Trust Verification</SelectItem>
                    <SelectItem value="rebalance">Portfolio Rebalancing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="strategy" className="text-cosmic-light">Strategy</Label>
                  <Select 
                    value={formData.parameters.strategy} 
                    onValueChange={(value) => setFormData(prev => ({ 
                      ...prev, 
                      parameters: { ...prev.parameters, strategy: value }
                    }))}
                  >
                    <SelectTrigger className="bg-cosmic-gray border-cosmic-gray text-cosmic-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-cosmic-slate border-cosmic-gray">
                      <SelectItem value="conservative">Conservative</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="aggressive">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="maxAmount" className="text-cosmic-light">Max Amount</Label>
                  <Input
                    id="maxAmount"
                    type="number"
                    value={formData.parameters.maxAmount}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      parameters: { ...prev.parameters, maxAmount: e.target.value }
                    }))}
                    placeholder="1000"
                    className="bg-cosmic-gray border-cosmic-gray text-cosmic-white"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="asset" className="text-cosmic-light">Primary Asset</Label>
                <Select 
                  value={formData.parameters.asset} 
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    parameters: { ...prev.parameters, asset: value }
                  }))}
                >
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
              
              <div className="flex space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 border-cosmic-gray text-cosmic-light hover:bg-cosmic-gray"
                >
                  Cancel
                </Button>
                <NeonButton
                  type="submit"
                  neonColor="purple"
                  disabled={createActionMutation.isPending}
                  className="flex-1"
                >
                  {createActionMutation.isPending ? 'Deploying...' : 'Deploy Agent'}
                </NeonButton>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Agent Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Grok Agent Status */}
        <CosmicCard neonColor="purple" variant="gradient">
          <CardHeader>
            <CardTitle className="text-neon-purple flex items-center">
              <Bot className="w-5 h-5 mr-2 animate-cosmic-float" />
              Grok Agent
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-cosmic-light">Status:</span>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-neon-green rounded-full animate-pulse"></div>
                  <span className="text-neon-green font-medium">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cosmic-light">Strategy:</span>
                <span className="text-cosmic-white">Autonomous Trading</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cosmic-light">Performance:</span>
                <span className="text-neon-green font-orbitron">+12.4%</span>
              </div>
              <div className="pt-2">
                <Button className="w-full neon-glow-purple bg-cosmic-gray hover:bg-cosmic-slate">
                  <Settings className="w-4 h-4 mr-2" />
                  Configure
                </Button>
              </div>
            </div>
          </CardContent>
        </CosmicCard>

        {/* Performance Metrics */}
        <CosmicCard neonColor="green" variant="default">
          <CardHeader>
            <CardTitle className="text-neon-green flex items-center">
              <TrendingUp className="w-5 h-5 mr-2" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-cosmic-light">Total Trades:</span>
                <span className="text-cosmic-white font-orbitron">247</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cosmic-light">Success Rate:</span>
                <span className="text-neon-green font-orbitron">87.2%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cosmic-light">Total Profit:</span>
                <span className="text-neon-green font-orbitron">$12,450</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cosmic-light">Last Action:</span>
                <span className="text-cosmic-white text-sm">2 min ago</span>
              </div>
            </div>
          </CardContent>
        </CosmicCard>

        {/* Security Status */}
        <CosmicCard neonColor="amber" variant="default">
          <CardHeader>
            <CardTitle className="text-neon-amber flex items-center">
              <Shield className="w-5 h-5 mr-2" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-cosmic-light">Trust Score:</span>
                <span className="text-neon-amber font-orbitron">95.8%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cosmic-light">Verifications:</span>
                <span className="text-cosmic-white">847</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-cosmic-light">Risk Level:</span>
                <span className="text-neon-green">Low</span>
              </div>
              <div className="pt-2">
                <Button className="w-full neon-glow-amber bg-cosmic-gray hover:bg-cosmic-slate">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Settings
                </Button>
              </div>
            </div>
          </CardContent>
        </CosmicCard>
      </div>

      {/* Recent Actions */}
      <CosmicCard neonColor="indigo" variant="default">
        <CardHeader>
          <CardTitle className="text-neon-indigo flex items-center">
            <Activity className="w-5 h-5 mr-2" />
            AI Agent Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          {actionsLoading ? (
            <div className="text-center py-8">
              <Bot className="w-12 h-12 text-cosmic-muted mx-auto mb-4 animate-pulse" />
              <p className="text-cosmic-light">Loading AI actions...</p>
            </div>
          ) : actions.length === 0 ? (
            <div className="text-center py-12">
              <Bot className="w-16 h-16 text-cosmic-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-cosmic-light mb-2">No AI Actions Yet</h3>
              <p className="text-cosmic-muted mb-6">
                Deploy your first AI agent to start autonomous operations
              </p>
              <NeonButton
                neonColor="purple"
                onClick={() => setShowCreateDialog(true)}
              >
                <Bot className="w-4 h-4 mr-2" />
                Deploy First Agent
              </NeonButton>
            </div>
          ) : (
            <div className="space-y-4">
              {actions.map((action: any) => (
                <div key={action.id} className="bg-cosmic-gray/50 rounded-lg p-4 border border-cosmic-gray hover:bg-cosmic-gray/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        action.status === 'success' ? 'bg-neon-green/20' :
                        action.status === 'failed' ? 'bg-neon-red/20' :
                        'bg-neon-amber/20'
                      }`}>
                        {action.status === 'success' ? (
                          <CheckCircle className="w-5 h-5 text-neon-green" />
                        ) : action.status === 'failed' ? (
                          <AlertCircle className="w-5 h-5 text-neon-red" />
                        ) : (
                          <div className="w-4 h-4 border-2 border-neon-amber border-t-transparent rounded-full animate-spin"></div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-cosmic-white capitalize">
                          {action.actionType.replace('_', ' ')}
                        </p>
                        <p className="text-sm text-cosmic-light">
                          {action.parameters?.strategy} strategy • {action.parameters?.asset}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        action.status === 'success' ? 'bg-neon-green/20 text-neon-green' :
                        action.status === 'failed' ? 'bg-neon-red/20 text-neon-red' :
                        'bg-neon-amber/20 text-neon-amber'
                      }`}>
                        {action.status}
                      </div>
                      <p className="text-xs text-cosmic-muted mt-1">
                        {new Date(action.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  {action.result && (
                    <div className="mt-3 pt-3 border-t border-cosmic-gray/30">
                      <p className="text-sm text-cosmic-light">
                        {action.result.message || 'Action completed successfully'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </CosmicCard>
    </div>
  );
}
