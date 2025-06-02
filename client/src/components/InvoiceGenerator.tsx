import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { QrCode, FileText, DollarSign, Copy, ExternalLink, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { NeonButton } from "@/components/ui/neon-button";
import { CosmicCard } from "@/components/ui/cosmic-card";

export default function InvoiceGenerator() {
  const [formData, setFormData] = useState({
    amount: '',
    asset: 'USDC',
    description: ''
  });
  const { toast } = useToast();

  // Fetch user invoices
  const { data: invoices = [], isLoading } = useQuery({
    queryKey: ['/api/invoices'],
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: any) => {
      const response = await apiRequest('POST', '/api/invoices', invoiceData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      setFormData({ amount: '', asset: 'USDC', description: '' });
      toast({
        title: "Invoice Created",
        description: "Your invoice has been generated with QR code",
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

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    createInvoiceMutation.mutate(formData);
  };

  const copyInvoiceLink = (invoiceId: string) => {
    const link = `${window.location.origin}/invoice/${invoiceId}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Copied",
      description: "Invoice link copied to clipboard",
    });
  };

  const copyQRData = (qrData: string) => {
    navigator.clipboard.writeText(qrData);
    toast({
      title: "Copied",
      description: "QR code data copied to clipboard",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-orbitron font-bold text-neon-green">Invoice Generator</h1>
        <p className="text-cosmic-light">Create invoices with QR codes for instant payments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Invoice Form */}
        <CosmicCard neonColor="green" variant="gradient">
          <CardHeader>
            <CardTitle className="text-neon-green flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Create New Invoice
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="amount" className="text-cosmic-light">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={formData.amount}
                    onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    placeholder="0.00"
                    className="bg-cosmic-gray border-cosmic-gray text-cosmic-white placeholder-cosmic-muted focus:ring-neon-green"
                  />
                </div>
                <div>
                  <Label htmlFor="asset" className="text-cosmic-light">Asset</Label>
                  <Select value={formData.asset} onValueChange={(value) => setFormData(prev => ({ ...prev, asset: value }))}>
                    <SelectTrigger className="bg-cosmic-gray border-cosmic-gray text-cosmic-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-cosmic-slate border-cosmic-gray">
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="ETH">ETH</SelectItem>
                      <SelectItem value="SOVR">SOVR</SelectItem>
                      <SelectItem value="USDT">USDT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="description" className="text-cosmic-light">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Payment description..."
                  className="bg-cosmic-gray border-cosmic-gray text-cosmic-white placeholder-cosmic-muted focus:ring-neon-green"
                  rows={3}
                />
              </div>
              
              <NeonButton
                type="submit"
                neonColor="green"
                disabled={createInvoiceMutation.isPending}
                className="w-full"
              >
                <QrCode className="w-4 h-4 mr-2" />
                {createInvoiceMutation.isPending ? 'Generating...' : 'Generate Invoice'}
              </NeonButton>
            </form>
          </CardContent>
        </CosmicCard>

        {/* Quick Invoice Examples */}
        <CosmicCard neonColor="amber" variant="default">
          <CardHeader>
            <CardTitle className="text-neon-amber">Quick Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                onClick={() => setFormData({ amount: '1000', asset: 'USDC', description: 'Monthly subscription payment' })}
                className="w-full neon-glow-amber bg-cosmic-gray hover:bg-cosmic-slate text-left"
              >
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="font-medium">Monthly Subscription</p>
                    <p className="text-sm text-cosmic-light">$1,000 USDC</p>
                  </div>
                  <DollarSign className="w-4 h-4 text-neon-amber" />
                </div>
              </Button>
              
              <Button
                onClick={() => setFormData({ amount: '2500', asset: 'USDC', description: 'Freelance project payment' })}
                className="w-full neon-glow-indigo bg-cosmic-gray hover:bg-cosmic-slate text-left"
              >
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="font-medium">Project Payment</p>
                    <p className="text-sm text-cosmic-light">$2,500 USDC</p>
                  </div>
                  <DollarSign className="w-4 h-4 text-neon-indigo" />
                </div>
              </Button>
              
              <Button
                onClick={() => setFormData({ amount: '0.1', asset: 'ETH', description: 'Service fee payment' })}
                className="w-full neon-glow-purple bg-cosmic-gray hover:bg-cosmic-slate text-left"
              >
                <div className="flex items-center justify-between w-full">
                  <div>
                    <p className="font-medium">Service Fee</p>
                    <p className="text-sm text-cosmic-light">0.1 ETH</p>
                  </div>
                  <DollarSign className="w-4 h-4 text-neon-purple" />
                </div>
              </Button>
            </div>
          </CardContent>
        </CosmicCard>
      </div>

      {/* Invoice History */}
      <CosmicCard neonColor="indigo" variant="default">
        <CardHeader>
          <CardTitle className="text-neon-indigo">Invoice History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-cosmic-muted mx-auto mb-4 animate-pulse" />
              <p className="text-cosmic-light">Loading invoices...</p>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-12">
              <QrCode className="w-16 h-16 text-cosmic-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-cosmic-light mb-2">No Invoices Yet</h3>
              <p className="text-cosmic-muted mb-6">
                Create your first invoice to start accepting payments
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice: any) => (
                <div key={invoice.id} className="bg-cosmic-gray/50 rounded-lg p-4 border border-cosmic-gray hover:bg-cosmic-gray/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          invoice.status === 'paid' ? 'bg-neon-green/20' :
                          invoice.status === 'expired' ? 'bg-neon-red/20' :
                          'bg-neon-amber/20'
                        }`}>
                          {invoice.status === 'paid' ? (
                            <CheckCircle className="w-5 h-5 text-neon-green" />
                          ) : invoice.status === 'expired' ? (
                            <Clock className="w-5 h-5 text-neon-red" />
                          ) : (
                            <Clock className="w-5 h-5 text-neon-amber" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-cosmic-white">
                                {invoice.amount} {invoice.asset}
                              </p>
                              <p className="text-sm text-cosmic-light">
                                {invoice.description || 'No description'}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className={`px-2 py-1 rounded text-xs font-medium ${
                                invoice.status === 'paid' ? 'bg-neon-green/20 text-neon-green' :
                                invoice.status === 'expired' ? 'bg-neon-red/20 text-neon-red' :
                                'bg-neon-amber/20 text-neon-amber'
                              }`}>
                                {invoice.status}
                              </div>
                              <p className="text-xs text-cosmic-muted mt-1">
                                {new Date(invoice.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex items-center space-x-2">
                        <Button
                          size="sm"
                          onClick={() => copyInvoiceLink(invoice.invoiceId)}
                          className="neon-glow-green bg-cosmic-gray hover:bg-cosmic-slate"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy Link
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => copyQRData(invoice.qrCode)}
                          className="neon-glow-indigo bg-cosmic-gray hover:bg-cosmic-slate"
                        >
                          <QrCode className="w-3 h-3 mr-1" />
                          Copy QR
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => window.open(`/invoice/${invoice.invoiceId}`, '_blank')}
                          className="neon-glow-amber bg-cosmic-gray hover:bg-cosmic-slate"
                        >
                          <ExternalLink className="w-3 h-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                    
                    {/* QR Code Preview */}
                    <div className="ml-4">
                      <div className="w-16 h-16 bg-cosmic-black rounded border flex items-center justify-center">
                        {invoice.qrCode ? (
                          <img 
                            src={invoice.qrCode} 
                            alt="QR Code" 
                            className="w-full h-full rounded"
                          />
                        ) : (
                          <QrCode className="w-8 h-8 text-cosmic-muted" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </CosmicCard>
    </div>
  );
}
