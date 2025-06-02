import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import WalletCard from "@/components/wallet-card";
import { Plus, Wallet as WalletIcon, Import, RefreshCw } from "lucide-react";

export default function Wallets() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wallets, isLoading } = useQuery({
    queryKey: ["/api/wallets"],
  });

  const createWalletMutation = useMutation({
    mutationFn: async (walletData: {
      name: string;
      network: string;
      type: string;
    }) => {
      const response = await apiRequest('POST', '/api/wallets', walletData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      setIsCreateModalOpen(false);
      toast({
        title: "Wallet Created",
        description: "Your new wallet has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create wallet. Please try again.",
        variant: "destructive",
      });
    },
  });

  const importWalletMutation = useMutation({
    mutationFn: async (walletData: {
      name: string;
      network: string;
      type: string;
      privateKey?: string;
      mnemonic?: string;
      address: string;
    }) => {
      const response = await apiRequest('POST', '/api/wallets', walletData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wallets"] });
      setIsImportModalOpen(false);
      toast({
        title: "Wallet Imported",
        description: "Your wallet has been imported successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to import wallet. Please check your credentials.",
        variant: "destructive",
      });
    },
  });

  const handleCreateWallet = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    createWalletMutation.mutate({
      name: formData.get('name') as string,
      network: formData.get('network') as string,
      type: 'created',
    });
  };

  const handleImportWallet = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    importWalletMutation.mutate({
      name: formData.get('name') as string,
      network: formData.get('network') as string,
      type: 'imported',
      privateKey: formData.get('privateKey') as string || undefined,
      mnemonic: formData.get('mnemonic') as string || undefined,
      address: formData.get('address') as string,
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-700 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Wallet Management</h2>
            <p className="text-slate-400">Create, import, and manage your crypto wallets</p>
          </div>
          <div className="flex items-center space-x-4">
            <Dialog open={isImportModalOpen} onOpenChange={setIsImportModalOpen}>
              <DialogTrigger asChild>
                <Button className="neon-glow-indigo bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20">
                  <Import className="w-4 h-4 mr-2" />
                  Import Wallet
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle>Import Existing Wallet</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleImportWallet} className="space-y-4">
                  <div>
                    <Label htmlFor="import-name">Wallet Name</Label>
                    <Input
                      id="import-name"
                      name="name"
                      placeholder="My Imported Wallet"
                      required
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="import-network">Network</Label>
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
                    <Label htmlFor="address">Wallet Address</Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="0x..."
                      required
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="privateKey">Private Key (Optional)</Label>
                    <Input
                      id="privateKey"
                      name="privateKey"
                      type="password"
                      placeholder="Private key for transactions"
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mnemonic">Seed Phrase (Optional)</Label>
                    <Input
                      id="mnemonic"
                      name="mnemonic"
                      placeholder="12 or 24 word seed phrase"
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <Button 
                    type="submit" 
                    disabled={importWalletMutation.isPending}
                    className="w-full neon-glow-indigo bg-indigo-500 hover:bg-indigo-600"
                  >
                    {importWalletMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Import className="w-4 h-4 mr-2" />
                    )}
                    Import Wallet
                  </Button>
                </form>
              </DialogContent>
            </Dialog>

            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
              <DialogTrigger asChild>
                <Button className="neon-glow-amber bg-amber-500/10 text-amber-400 hover:bg-amber-500/20">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Wallet
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700">
                <DialogHeader>
                  <DialogTitle>Create New Wallet</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateWallet} className="space-y-4">
                  <div>
                    <Label htmlFor="create-name">Wallet Name</Label>
                    <Input
                      id="create-name"
                      name="name"
                      placeholder="My New Wallet"
                      required
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="create-network">Network</Label>
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
                  <Button 
                    type="submit" 
                    disabled={createWalletMutation.isPending}
                    className="w-full neon-glow-amber bg-amber-500 hover:bg-amber-600 text-black"
                  >
                    {createWalletMutation.isPending ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Create Wallet
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </header>

      {/* Wallets Grid */}
      <main className="flex-1 overflow-y-auto p-6">
        {wallets && wallets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wallets.map((wallet: any) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-96 text-center">
            <WalletIcon className="w-16 h-16 text-slate-500 mb-4" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Wallets Found</h3>
            <p className="text-slate-400 mb-6">Create or import your first wallet to get started</p>
            <div className="flex space-x-4">
              <Button 
                onClick={() => setIsCreateModalOpen(true)}
                className="neon-glow-amber bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Wallet
              </Button>
              <Button 
                onClick={() => setIsImportModalOpen(true)}
                className="neon-glow-indigo bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
              >
                <Import className="w-4 h-4 mr-2" />
                Import Wallet
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
