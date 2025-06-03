import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Upload, Send, RefreshCw, Users, DollarSign, CheckCircle, Clock, XCircle } from "lucide-react";

export default function MassPayments() {
  const [csvData, setCsvData] = useState<any[]>([]);
  const [selectedWallet, setSelectedWallet] = useState("");
  const [token, setToken] = useState("USDC");
  const [network, setNetwork] = useState("ethereum");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wallets } = useQuery({
    queryKey: ["/api/wallets"],
  });

  const { data: massPayments, isLoading } = useQuery({
    queryKey: ["/api/mass-payments"],
  });

  const createMassPaymentMutation = useMutation({
    mutationFn: async (paymentData: {
      walletId: number;
      name: string;
      totalAmount: string;
      recipientCount: number;
      token: string;
      network: string;
      csvData: any[];
    }) => {
      const response = await apiRequest('POST', '/api/mass-payments', {
        ...paymentData,
        status: 'pending',
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/mass-payments"] });
      setCsvData([]);
      setSelectedWallet("");
      toast({
        title: "Mass Payment Created",
        description: "Your mass payment batch has been queued for processing.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create mass payment. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const lines = text.split('\n').filter(line => line.trim());
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      if (!headers.includes('address') || !headers.includes('amount')) {
        toast({
          title: "Invalid CSV Format",
          description: "CSV must contain 'address' and 'amount' columns.",
          variant: "destructive",
        });
        return;
      }

      const data = lines.slice(1).map(line => {
        const values = line.split(',').map(v => v.trim());
        const row: any = {};
        headers.forEach((header, index) => {
          row[header] = values[index];
        });
        return row;
      }).filter(row => row.address && row.amount);

      setCsvData(data);
      toast({
        title: "CSV Uploaded",
        description: `Loaded ${data.length} recipients from CSV file.`,
      });
    };
    reader.readAsText(file);
  };

  const handleCreateMassPayment = () => {
    if (!selectedWallet || csvData.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a wallet and upload a CSV file.",
        variant: "destructive",
      });
      return;
    }

    const totalAmount = csvData.reduce((sum, row) => sum + parseFloat(row.amount || '0'), 0);
    const paymentName = `Mass Payment ${new Date().toLocaleDateString()}`;

    createMassPaymentMutation.mutate({
      walletId: parseInt(selectedWallet),
      name: paymentName,
      totalAmount: totalAmount.toString(),
      recipientCount: csvData.length,
      token,
      network,
      csvData,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'processing':
        return <RefreshCw className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'processing':
        return 'bg-blue-500/20 text-blue-400';
      case 'failed':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-slate-800/50 border-b border-slate-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">Mass Payments</h2>
            <p className="text-slate-400">Process bulk payments efficiently with CSV upload</p>
          </div>
          <div className="flex items-center space-x-2 text-slate-400">
            <Users className="w-5 h-5" />
            <span className="text-sm">
              {csvData.length} recipients ready
            </span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Mass Payment */}
          <Card className="bg-slate-800/50 border-slate-700 neon-glow-amber">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Send className="w-5 h-5" />
                <span>Create Mass Payment</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Wallet Selection */}
              <div>
                <Label htmlFor="wallet-select">Source Wallet</Label>
                <Select value={selectedWallet} onValueChange={setSelectedWallet}>
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

              {/* Token & Network */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="token-select">Token</Label>
                  <Select value={token} onValueChange={setToken}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="network-select">Network</Label>
                  <Select value={network} onValueChange={setNetwork}>
                    <SelectTrigger className="bg-slate-700 border-slate-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ethereum">Ethereum</SelectItem>
                      <SelectItem value="base">Base</SelectItem>
                      <SelectItem value="polygon">Polygon</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* CSV Upload */}
              <div>
                <Label htmlFor="csv-upload">Upload Recipients CSV</Label>
                <div className="mt-2">
                  <input
                    id="csv-upload"
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    onClick={() => document.getElementById('csv-upload')?.click()}
                    variant="outline"
                    className="w-full border-slate-600 hover:border-slate-500"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Choose CSV File
                  </Button>
                </div>
                <p className="text-xs text-slate-400 mt-2">
                  CSV should contain columns: address, amount, name (optional)
                </p>
              </div>

              {/* Preview */}
              {csvData.length > 0 && (
                <div className="p-4 bg-slate-700/50 rounded-lg">
                  <h4 className="font-medium mb-2">Payment Preview</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Recipients</p>
                      <p className="font-semibold">{csvData.length}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Total Amount</p>
                      <p className="font-semibold">
                        {csvData.reduce((sum, row) => sum + parseFloat(row.amount || '0'), 0).toFixed(2)} {token}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-3 max-h-32 overflow-y-auto">
                    <p className="text-xs text-slate-400 mb-1">First 5 recipients:</p>
                    {csvData.slice(0, 5).map((row, index) => (
                      <div key={index} className="text-xs flex justify-between py-1">
                        <span className="font-mono truncate flex-1 mr-2">
                          {row.address?.slice(0, 10)}...{row.address?.slice(-6)}
                        </span>
                        <span>{row.amount} {token}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={handleCreateMassPayment}
                disabled={!selectedWallet || csvData.length === 0 || createMassPaymentMutation.isPending}
                className="w-full neon-glow-amber bg-amber-500 text-black hover:bg-amber-600"
              >
                {createMassPaymentMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Create Mass Payment
              </Button>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="bg-slate-800/50 border-slate-700 neon-glow-indigo">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5" />
                <span>Payment History</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-slate-700 rounded animate-pulse"></div>
                  ))}
                </div>
              ) : massPayments && massPayments.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {massPayments.map((payment: any) => (
                    <div key={payment.id} className="p-4 bg-slate-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(payment.status)}
                          <span className="font-medium text-sm">{payment.name}</span>
                        </div>
                        <Badge className={`text-xs ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-slate-400">
                        <div>
                          <p>Recipients</p>
                          <p className="text-slate-200 font-medium">{payment.recipientCount}</p>
                        </div>
                        <div>
                          <p>Amount</p>
                          <p className="text-slate-200 font-medium">
                            {parseFloat(payment.totalAmount).toFixed(2)} {payment.token}
                          </p>
                        </div>
                        <div>
                          <p>Network</p>
                          <p className="text-slate-200 font-medium capitalize">{payment.network}</p>
                        </div>
                      </div>
                      <p className="text-xs text-slate-500 mt-2">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-slate-400">
                  <Send className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No mass payments found</p>
                  <p className="text-xs">Create your first batch payment to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
