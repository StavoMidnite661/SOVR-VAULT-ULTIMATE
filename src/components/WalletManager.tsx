import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Wallet, Plus, Eye, EyeOff, Copy, Trash2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function WalletManager() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPrivateKeys, setShowPrivateKeys] = useState<Record<number, boolean>>({});
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'main',
    network: 'ethereum',
    address: '',
    privateKey: ''
  });

  // Fetch user wallets
  const { data: wallets = [], isLoading } = useQuery({
    queryKey: ['/api/wallets'],
  });

  // Create wallet mutation
  const createWalletMutation = useMutation({
    mutationFn: async (walletData: any) => {
      const response = await apiRequest('POST', '/api/wallets', walletData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/wallets'] });
      setShowCreateDialog(false);
      setFormData({ name: '', type: 'main', network: 'ethereum', address: '', privateKey: '' });
      toast({
        title: "Wallet Created",
        description: "Your new wallet has been successfully created.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateWallet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    createWalletMutation.mutate(formData);
  };

  const togglePrivateKey = (walletId: number) => {
    setShowPrivateKeys(prev => ({
      ...prev,
      [walletId]: !prev[walletId]
    }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  const generateRandomWallet = () => {
    // Generate mock wallet address for demo
    const randomAddress = `0x${Math.random().toString(16).substring(2, 42).padStart(40, '0')}`;
    const randomPrivateKey = `0x${Math.random().toString(16).substring(2, 66).padStart(64, '0')}`;
    
    setFormData(prev => ({
      ...prev,
      address: randomAddress,
      privateKey: randomPrivateKey
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Wallet className="w-12 h-12 text-neon-amber mx-auto mb-4 animate-pulse" />
          <p className="text-cosmic-light">Loading wallets...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-neon-amber">Wallet Manager</h1>
          <p className="text-cosmic-light">Create, import, and manage your wallets</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button className="neon-glow-amber bg-cosmic-slate hover:bg-cosmic-gray">
              <Plus className="w-4 h-4 mr-2" />
              New Wallet
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-cosmic-slate border-cosmic-gray">
            <DialogHeader>
              <DialogTitle className="text-neon-amber font-orbitron">Create New Wallet</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateWallet} className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-cosmic-light">Wallet Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter wallet name"
                  className="bg-cosmic-gray border-cosmic-gray text-cosmic-white"
                />
              </div>
              
              <div>
                <Label htmlFor="type" className="text-cosmic-light">Wallet Type</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger className="bg-cosmic-gray border-cosmic-gray text-cosmic-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-cosmic-slate border-cosmic-gray">
                    <SelectItem value="main">Main Wallet</SelectItem>
                    <SelectItem value="ai_agent">AI Agent</SelectItem>
                    <SelectItem value="vault">Vault</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="network" className="text-cosmic-light">Network</Label>
                <Select value={formData.network} onValueChange={(value) => setFormData(prev => ({ ...prev, network: value }))}>
                  <SelectTrigger className="bg-cosmic-gray border-cosmic-gray text-cosmic-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-cosmic-slate border-cosmic-gray">
                    <SelectItem value="ethereum">Ethereum</SelectItem>
                    <SelectItem value="base">Base</SelectItem>
                    <SelectItem value="polygon">Polygon</SelectItem>
                    <SelectItem value="arbitrum">Arbitrum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="address" className="text-cosmic-light">Wallet Address</Label>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={generateRandomWallet}
                    className="neon-glow-indigo bg-cosmic-gray hover:bg-cosmic-slate"
                  >
                    Generate
                  </Button>
                </div>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="0x... or generate new wallet"
                  className="bg-cosmic-gray border-cosmic-gray text-cosmic-white font-mono"
                />
              </div>
              
              {formData.privateKey && (
                <div>
                  <Label htmlFor="privateKey" className="text-cosmic-light">Private Key (Optional)</Label>
                  <Input
                    id="privateKey"
                    type={showPrivateKeys[-1] ? "text" : "password"}
                    value={formData.privateKey}
                    onChange={(e) => setFormData(prev => ({ ...prev, privateKey: e.target.value }))}
                    placeholder="Private key for import"
                    className="bg-cosmic-gray border-cosmic-gray text-cosmic-white font-mono"
                  />
                  <p className="text-xs text-cosmic-muted mt-1">
                    Private keys are encrypted before storage
                  </p>
                </div>
              )}
              
              <div className="flex space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateDialog(false)}
                  className="flex-1 border-cosmic-gray text-cosmic-light hover:bg-cosmic-gray"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={createWalletMutation.isPending}
                  className="flex-1 neon-glow-amber bg-neon-amber text-cosmic-black hover:bg-neon-amber/90"
                >
                  {createWalletMutation.isPending ? 'Creating...' : 'Create Wallet'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Wallets Grid */}
      {wallets.length === 0 ? (
        <Card className="neon-glow-amber bg-cosmic-slate">
          <CardContent className="py-12">
            <div className="text-center">
              <Wallet className="w-16 h-16 text-cosmic-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-cosmic-light mb-2">No Wallets Yet</h3>
              <p className="text-cosmic-muted mb-6">
                Create your first wallet to start managing your digital assets
              </p>
              <Button 
                onClick={() => setShowCreateDialog(true)}
                className="neon-glow-amber bg-neon-amber text-cosmic-black hover:bg-neon-amber/90"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wallets.map((wallet: any) => (
            <Card key={wallet.id} className={`bg-cosmic-slate ${
              wallet.type === 'main' ? 'neon-glow-amber' :
              wallet.type === 'ai_agent' ? 'neon-glow-indigo' :
              'neon-glow-purple'
            }`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg ${
                    wallet.type === 'main' ? 'text-neon-amber' :
                    wallet.type === 'ai_agent' ? 'text-neon-indigo' :
                    'text-neon-purple'
                  }`}>
                    {wallet.name}
                  </CardTitle>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    wallet.type === 'main' ? 'bg-neon-amber/20 text-neon-amber' :
                    wallet.type === 'ai_agent' ? 'bg-neon-indigo/20 text-neon-indigo' :
                    'bg-neon-purple/20 text-neon-purple'
                  }`}>
                    {wallet.type.replace('_', ' ')}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Network */}
                  <div>
                    <p className="text-sm text-cosmic-light">Network</p>
                    <p className="text-cosmic-white font-medium capitalize">{wallet.network}</p>
                  </div>
                  
                  {/* Address */}
                  <div>
                    <p className="text-sm text-cosmic-light">Address</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-cosmic-white font-mono text-sm truncate">
                        {wallet.address}
                      </p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(wallet.address, 'Address')}
                        className="p-1 h-auto text-cosmic-light hover:text-neon-amber"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Balance (Mock) */}
                  <div>
                    <p className="text-sm text-cosmic-light">Balance</p>
                    <p className="text-cosmic-white font-orbitron font-semibold">
                      ${(Math.random() * 50000).toFixed(2)}
                    </p>
                  </div>
                  
                  {/* Private Key (if exists) */}
                  {wallet.privateKey && (
                    <div>
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-cosmic-light">Private Key</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => togglePrivateKey(wallet.id)}
                          className="p-1 h-auto text-cosmic-light hover:text-neon-amber"
                        >
                          {showPrivateKeys[wallet.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        </Button>
                      </div>
                      <div className="flex items-center space-x-2">
                        <p className="text-cosmic-white font-mono text-sm truncate">
                          {showPrivateKeys[wallet.id] ? wallet.privateKey : '•'.repeat(32)}
                        </p>
                        {showPrivateKeys[wallet.id] && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(wallet.privateKey, 'Private Key')}
                            className="p-1 h-auto text-cosmic-light hover:text-neon-amber"
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => window.open(`https://etherscan.io/address/${wallet.address}`, '_blank')}
                      className="flex-1 neon-glow-green bg-cosmic-gray hover:bg-cosmic-slate"
                    >
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Explorer
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-neon-red text-neon-red hover:bg-neon-red/10"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
