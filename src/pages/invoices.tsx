import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generateQRCode } from "@/lib/qr-utils";
import { 
  FileText, 
  Plus, 
  RefreshCw, 
  QrCode, 
  Copy, 
  ExternalLink,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign
} from "lucide-react";

export default function Invoices() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: wallets } = useQuery({
    queryKey: ["/api/wallets"],
  });

  const { data: invoices, isLoading } = useQuery({
    queryKey: ["/api/invoices"],
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: {
      walletId: number;
      amount: string;
      token: string;
      network: string;
      description?: string;
      clientName?: string;
      clientEmail?: string;
      dueDate?: string;
    }) => {
      // Generate QR code for the invoice
      const qrData = JSON.stringify({
        type: 'invoice',
        amount: invoiceData.amount,
        token: invoiceData.token,
        network: invoiceData.network,
        invoiceNumber: `INV-${Date.now()}`,
      });
      
      const qrCode = await generateQRCode(qrData);
      
      const response = await apiRequest('POST', '/api/invoices', {
        ...invoiceData,
        invoiceNumber: `INV-${Date.now()}`,
        status: 'pending',
        qrCode,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      setIsCreateModalOpen(false);
      toast({
        title: "Invoice Created",
        description: "Your invoice has been generated with QR code.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleCreateInvoice = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    createInvoiceMutation.mutate({
      walletId: parseInt(formData.get('walletId') as string),
      amount: formData.get('amount') as string,
      token: formData.get('token') as string,
      network: formData.get('network') as string,
      description: formData.get('description') as string || undefined,
      clientName: formData.get('clientName') as string || undefined,
      clientEmail: formData.get('clientEmail') as string || undefined,
      dueDate: formData.get('dueDate') as string || undefined,
    });
  };

  const copyInvoiceLink = (invoiceNumber: string) => {
    const link = `${window.location.origin}/invoice/${invoiceNumber}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Invoice link copied to clipboard.",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'expired':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-500/20 text-green-400';
      case 'expired':
        return 'bg-red-500/20 text-red-400';
      case 'cancelled':
        return 'bg-gray-500/20 text-gray-400';
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
            <h2 className="text-2xl font-bold mb-1">Invoice Management</h2>
            <p className="text-slate-400">Generate and manage crypto invoices with QR codes</p>
          </div>
          <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
            <DialogTrigger asChild>
              <Button className="neon-glow-amber bg-amber-500/10 text-amber-400 hover:bg-amber-500/20">
                <Plus className="w-4 h-4 mr-2" />
                Create Invoice
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Invoice</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateInvoice} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="walletId">Receiving Wallet</Label>
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
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="token">Token</Label>
                    <Select name="token" required>
                      <SelectTrigger className="bg-slate-700 border-slate-600">
                        <SelectValue placeholder="Select token" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="USDC">USDC</SelectItem>
                        <SelectItem value="ETH">ETH</SelectItem>
                        <SelectItem value="USDT">USDT</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Invoice description..."
                    className="bg-slate-700 border-slate-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Client Name</Label>
                    <Input
                      id="clientName"
                      name="clientName"
                      placeholder="Client name"
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                  <div>
                    <Label htmlFor="clientEmail">Client Email</Label>
                    <Input
                      id="clientEmail"
                      name="clientEmail"
                      type="email"
                      placeholder="client@example.com"
                      className="bg-slate-700 border-slate-600"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input
                    id="dueDate"
                    name="dueDate"
                    type="date"
                    className="bg-slate-700 border-slate-600"
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={createInvoiceMutation.isPending}
                  className="w-full neon-glow-amber bg-amber-500 hover:bg-amber-600 text-black"
                >
                  {createInvoiceMutation.isPending ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  Create Invoice
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      {/* Invoices List */}
      <main className="flex-1 overflow-y-auto p-6">
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-700 rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : invoices && invoices.length > 0 ? (
          <div className="space-y-4">
            {invoices.map((invoice: any) => (
              <Card key={invoice.id} className="bg-slate-800/50 border-slate-700 neon-glow-indigo hover:neon-glow-amber transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-semibold">{invoice.invoiceNumber}</h3>
                        <Badge className={`text-xs ${getStatusColor(invoice.status)}`}>
                          {getStatusIcon(invoice.status)}
                          <span className="ml-1 capitalize">{invoice.status}</span>
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-slate-400">Amount</p>
                          <p className="font-semibold">
                            {parseFloat(invoice.amount).toFixed(2)} {invoice.token}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Network</p>
                          <p className="font-medium capitalize">{invoice.network}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Client</p>
                          <p className="font-medium">{invoice.clientName || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-400">Created</p>
                          <p className="font-medium">
                            {new Date(invoice.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {invoice.description && (
                        <p className="text-sm text-slate-300 mb-4">{invoice.description}</p>
                      )}

                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => copyInvoiceLink(invoice.invoiceNumber)}
                          className="neon-glow-indigo bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy Link
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => setSelectedInvoice(invoice)}
                          className="neon-glow-purple bg-purple-500/10 text-purple-400 hover:bg-purple-500/20"
                        >
                          <QrCode className="w-3 h-3 mr-1" />
                          QR Code
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-600 hover:border-slate-500"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-2xl font-bold text-amber-400">
                        ${parseFloat(invoice.amount).toLocaleString('en-US', { 
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2 
                        })}
                      </p>
                      {invoice.dueDate && (
                        <p className="text-xs text-slate-400">
                          Due: {new Date(invoice.dueDate).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <FileText className="w-16 h-16 mx-auto mb-4 text-slate-500" />
            <h3 className="text-xl font-semibold text-slate-300 mb-2">No Invoices Found</h3>
            <p className="text-slate-400 mb-6">Create your first invoice to start receiving payments</p>
            <Button 
              onClick={() => setIsCreateModalOpen(true)}
              className="neon-glow-amber bg-amber-500/10 text-amber-400 hover:bg-amber-500/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Invoice
            </Button>
          </div>
        )}
      </main>

      {/* QR Code Modal */}
      {selectedInvoice && (
        <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle>Invoice QR Code</DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4">
              <div className="bg-white p-4 rounded-lg inline-block">
                {selectedInvoice.qrCode ? (
                  <img 
                    src={selectedInvoice.qrCode} 
                    alt="Invoice QR Code"
                    className="w-48 h-48"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-slate-100">
                    <QrCode className="w-16 h-16 text-slate-400" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-semibold">{selectedInvoice.invoiceNumber}</p>
                <p className="text-amber-400 text-xl font-bold">
                  {parseFloat(selectedInvoice.amount).toFixed(2)} {selectedInvoice.token}
                </p>
                <p className="text-slate-400 text-sm">Scan to pay invoice</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
