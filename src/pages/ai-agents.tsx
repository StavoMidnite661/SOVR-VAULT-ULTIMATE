import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bot, 
  Plus, 
  RefreshCw, 
  Play, 
  Pause, 
  OctagonMinus,
  Settings,
  Activity,
  DollarSign,
  TrendingUp,
  Zap
} from "lucide-react";

export default function AiAgents() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wallets } = useQuery({
    queryKey: ["/api/wallets"],
  });

  const { data: aiAgents, isLoading } = useQuery({
    queryKey: ["/api/ai-agents"],
  });

  const createAgentMutation = useMutation({
    mutationFn: async (agentData: {
      walletId: number;
      name: string;
      type: string;
      configuration: any;
    }) => {
      const response = await apiRequest('POST', '/api/ai-agents', {
        ...agentData,
        status: 'active',
        totalOperations: 0,
        totalValueManaged: '0',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-agents"] });
      setIsCreateModalOpen(false);
      toast({
        title: "AI Agent Created",
        description: "Your AI agent has been deployed and is ready to work.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create AI agent. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateAgent = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    const configuration = {
      maxTransactionAmount: formData.get('maxTransactionAmount'),
      operatingHours: {
        enabled: formData.get('scheduleEnabled') === 'on',
        start: formData.get('startTime'),
        end: formData.get('endTime'),
      },
      strategies: {
        riskLevel: formData.get('riskLevel'),
        autoRebalance: formData.get('autoRebalance') === 'on',
      },
      notifications: {
        email: formData.get('emailNotifications') === 'on',
        threshold: formData.get('notificationThreshold'),
      }
    };

    createAgentMutation.mutate({
      walletId: parseInt(formData.get('walletId') as string),
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      configuration,
    });
  };

  const getAgentTypeIcon = (type: string) => {
    switch (type) {
      case 'trading':
        return 'from-green-500 to-emerald-600';
      case 'payments':
        return 'from-blue-500 to-indigo-600';
      case 'lending':
        return 'from-amber-500 to-orange-600';
      case 'trust':
        return 'from-purple-500 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/20 text-green-400';
      case 'paused':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'stopped':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-slate-500/20 text-slate-400';
    }
  };

  const totalOperations = aiAgents?.reduce((sum: number, agent: any) => sum + (agent.totalOperations || 0), 0) || 0;
  const totalValueManaged = aiAgents?.reduce((sum: number, agent: any) => sum + parseFloat(agent.totalValueManaged || '0'), 0) || 0;
  const activeAgents = aiAgents?.filter((agent: any) => agent.status === 'active').length || 0;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">AI Wallet Agents</h2>
            <p className="text-slate-400">Deploy autonomous agents for trust operations and DeFi management</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="neon-glow-purple bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">
                <Plus className="w-4 h-4 mr-2" />
                Deploy Agent
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle>Deploy New AI Agent</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateAgent} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Agent Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="My Trading Agent"
                      required
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="walletId">Controlled Wallet</Label>
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
                </div>

                <div>
                  <Label htmlFor="type">Agent Type</Label>
                  <Select name="type" required>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue placeholder="Select agent type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="trading">Trading Agent</SelectItem>
                      <SelectItem value="payments">Payment Processor</SelectItem>
                      <SelectItem value="lending">Yield Optimizer</SelectItem>
                      <SelectItem value="trust">Trust Operator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4 border-t border-slate-700 pt-4">
                  <h3 className="font-semibold text-purple-400">Configuration</h3>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="maxTransactionAmount">Max Transaction Amount</Label>
                      <Input
                        id="maxTransactionAmount"
                        name="maxTransactionAmount"
                        type="number"
                        step="0.01"
                        placeholder="1000.00"
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                    <div>
                      <Label htmlFor="riskLevel">Risk Level</Label>
                      <Select name="riskLevel">
                        <SelectTrigger className="bg-slate-700 border-slate-600">
                          <SelectValue placeholder="Select risk level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="conservative">Conservative</SelectItem>
                          <SelectItem value="moderate">Moderate</SelectItem>
                          <SelectItem value="aggressive">Aggressive</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="scheduleEnabled">Operating Schedule</Label>
                      <Switch name="scheduleEnabled" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="startTime">Start Time</Label>
                        <Input
                          id="startTime"
                          name="startTime"
                          type="time"
                          defaultValue="09:00"
                          className="bg-slate-700 border-slate-600"
                        />
                      </div>
                      <div>
                        <Label htmlFor="endTime">End Time</Label>
                        <Input
                          id="endTime"
                          name="endTime"
                          type="time"
                          defaultValue="17:00"
                          className="bg-slate-700 border-slate-600"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="autoRebalance">Auto Rebalancing</Label>
                      <Switch name="autoRebalance" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Label htmlFor="emailNotifications">Email Notifications</Label>
                      <Switch name="emailNotifications" />
                    </div>

                    <div>
                      <Label htmlFor="notificationThreshold">Notification Threshold ($)</Label>
                      <Input
                        id="notificationThreshold"
                        name="notificationThreshold"
                        type="number"
                        step="0.01"
                        placeholder="100.00"
                        className="bg-slate-700 border-slate-600"
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={createAgentMutation.isPending}
                  className="w-full neon-glow-purple bg-purple-500 hover:bg-purple-600"
                >
                  {createAgentMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Bot className="w-4 h-4 mr-2" />
                  )}
                  Deploy AI Agent
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-slate-800/50 border-slate-700 neon-glow-purple">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Bot className="w-6 h-6 text-purple-400 animate-pulse-glow" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Active Agents</p>
                  <p className="text-2xl font-bold text-purple-400">{activeAgents}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 neon-glow-amber">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-amber-500/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-6 h-6 text-amber-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Total Operations</p>
                  <p className="text-2xl font-bold text-amber-400">{totalOperations.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 neon-glow-indigo">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-indigo-500/20 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <p className="text-sm text-slate-400">Value Managed</p>
                  <p className="text-2xl font-bold text-indigo-400">
                    ${totalValueManaged.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* AI Agents List */}
        <Card className="bg-slate-800/50 border-slate-700 neon-glow-purple">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bot className="w-5 h-5" />
              <span>Deployed AI Agents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-slate-700 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : aiAgents && aiAgents.length > 0 ? (
              <div className="space-y-4">
                {aiAgents.map((agent: any) => (
                  <div key={agent.id} className="p-4 bg-slate-700/50 rounded-lg hover:bg-slate-700/70 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-12 h-12 bg-gradient-to-br ${getAgentTypeIcon(agent.type)} rounded-lg flex items-center justify-center`}>
                          <Bot className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold">{agent.name}</h3>
                            <Badge className={`text-xs ${getStatusColor(agent.status)}`}>
                              {agent.status.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-slate-400 capitalize">{agent.type} Agent</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-400">
                          {agent.totalOperations || 0} ops
                        </p>
                        <p className="text-sm text-slate-400">
                          ${parseFloat(agent.totalValueManaged || '0').toLocaleString('en-US', { 
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2 
                          })} managed
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4 text-sm">
                      <div>
                        <p className="text-slate-400">Last Action</p>
                        <p className="font-medium">
                          {agent.lastActionAt ? 
                            new Date(agent.lastActionAt).toLocaleDateString() : 
                            'Never'
                          }
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Risk Level</p>
                        <p className="font-medium capitalize">
                          {agent.configuration?.strategies?.riskLevel || 'Not Set'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Max Transaction</p>
                        <p className="font-medium">
                          ${agent.configuration?.maxTransactionAmount || 'Unlimited'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Created</p>
                        <p className="font-medium">
                          {new Date(agent.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {agent.status === 'active' ? (
                        <Button size="sm" variant="outline" className="border-yellow-500 text-yellow-400 hover:bg-yellow-500/10">
                          <Pause className="w-3 h-3 mr-1" />
                          Pause
                        </Button>
                      ) : (
                        <Button size="sm" className="neon-glow-purple bg-purple-500/20 text-purple-400 hover:bg-purple-500/30">
                          <Play className="w-3 h-3 mr-1" />
                          Start
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="border-slate-600 hover:border-slate-500"
                        onClick={() => setSelectedAgent(agent)}
                      >
                        <Settings className="w-3 h-3 mr-1" />
                        Configure
                      </Button>
                      <Button size="sm" variant="outline" className="border-red-500 text-red-400 hover:bg-red-500/10">
                        <OctagonMinus className="w-3 h-3 mr-1" />
                        OctagonMinus
                      </Button>
                    </div>

                    {agent.configuration?.operatingHours?.enabled && (
                      <div className="mt-3 p-2 bg-slate-800/50 rounded text-xs">
                        <span className="text-slate-400">Operating Hours: </span>
                        <span className="font-medium">
                          {agent.configuration.operatingHours.start} - {agent.configuration.operatingHours.end}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Bot className="w-16 h-16 mx-auto mb-4 text-slate-500" />
                <h3 className="text-xl font-semibold text-slate-300 mb-2">No AI Agents Deployed</h3>
                <p className="text-slate-400 mb-6">Deploy your first AI agent to automate wallet operations</p>
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="neon-glow-purple bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Deploy Agent
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Agent Types */}
        <Card className="bg-slate-800/50 border-slate-700 neon-glow-amber">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="w-5 h-5" />
              <span>Agent Capabilities</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/30">
                <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center mb-3">
                  <TrendingUp className="w-5 h-5 text-green-400" />
                </div>
                <h4 className="font-semibold text-green-400 mb-2">Trading Agent</h4>
                <p className="text-sm text-slate-400">Automated DeFi trading, arbitrage, and yield farming strategies</p>
              </div>

              <div className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/30">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Activity className="w-5 h-5 text-blue-400" />
                </div>
                <h4 className="font-semibold text-blue-400 mb-2">Payment Processor</h4>
                <p className="text-sm text-slate-400">Automated mass payments, invoicing, and recurring transactions</p>
              </div>

              <div className="p-4 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center mb-3">
                  <DollarSign className="w-5 h-5 text-amber-400" />
                </div>
                <h4 className="font-semibold text-amber-400 mb-2">Yield Optimizer</h4>
                <p className="text-sm text-slate-400">Automated lending, staking, and yield optimization across protocols</p>
              </div>

              <div className="p-4 bg-purple-500/10 rounded-lg border border-purple-500/30">
                <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Bot className="w-5 h-5 text-purple-400" />
                </div>
                <h4 className="font-semibold text-purple-400 mb-2">Trust Operator</h4>
                <p className="text-sm text-slate-400">Automated trust verification, multisig operations, and compliance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Agent Configuration Modal */}
      {selectedAgent && (
        <Dialog open={!!selectedAgent} onOpenChange={() => setSelectedAgent(null)}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle>Configure {selectedAgent.name}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="p-4 bg-slate-700/50 rounded-lg">
                <h4 className="font-semibold mb-2">Current Configuration</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Type:</span>
                    <span className="capitalize">{selectedAgent.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <Badge className={`text-xs ${getStatusColor(selectedAgent.status)}`}>
                      {selectedAgent.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Operations:</span>
                    <span>{selectedAgent.totalOperations || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Value Managed:</span>
                    <span>${parseFloat(selectedAgent.totalValueManaged || '0').toLocaleString()}</span>
                  </div>
                </div>
              </div>
              <Button className="w-full neon-glow-purple bg-purple-500/10 text-purple-400 hover:bg-purple-500/20">
                <Settings className="w-4 h-4 mr-2" />
                Advanced Configuration
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
