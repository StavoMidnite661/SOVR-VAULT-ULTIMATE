import { useState } from "react";
import { useQuery, useMutation, queryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Upload, Users, DollarSign, Clock, CheckCircle, AlertCircle, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useRef } from "react";

export default function MassPayments() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch mass payments
  const { data: massPayments = [], isLoading } = useQuery({
    queryKey: ['/api/mass-payments'],
  });

  // Upload CSV mutation
  const uploadCSVMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('csvFile', file);
      const response = await apiRequest('POST', '/api/mass-payments', formData);
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/mass-payments'] });
      setSelectedFile(null);
      setCsvData([]);
      setShowPreview(false);
      toast({
        title: "CSV Uploaded",
        description: `Mass payment batch created with ${data.totalRecipients} recipients`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Execute mass payment mutation
  const executeMutation = useMutation({
    mutationFn: async (massPaymentId: number) => {
      const response = await apiRequest('PATCH', `/api/mass-payments/${massPaymentId}/execute`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/mass-payments'] });
      toast({
        title: "Execution Started",
        description: "Mass payment processing has begun",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Execution Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      
      // Parse CSV for preview
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());
        const headers = lines[0].split(',').map(h => h.trim());
        
        const data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim());
          return headers.reduce((obj, header, index) => {
            obj[header] = values[index];
            return obj;
          }, {} as any);
        });
        
        setCsvData(data);
        setShowPreview(true);
      };
      reader.readAsText(file);
    }
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadCSVMutation.mutate(selectedFile);
    }
  };

  const downloadTemplate = () => {
    const csvContent = "address,amount,asset,note\n0x742d35Cc6A1234567890123456789012345678a2E4,1000,USDC,Team payment\n0x8f3a45Bb6B1234567890123456789012345678c9B2,2500,USDC,Contractor fee\n0x1a2b34Cc6C1234567890123456789012345678d4F6,500,USDC,Bonus payment";
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mass_payment_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalAmount = csvData.reduce((sum, row) => sum + parseFloat(row.amount || 0), 0);
  const estimatedGas = csvData.length * 0.50; // Mock gas estimation

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-neon-purple">Mass Payments Hub</h1>
          <p className="text-cosmic-light">Process bulk payments via CSV upload with vault integration</p>
        </div>
        <Button 
          onClick={downloadTemplate}
          variant="outline"
          className="border-cosmic-gray text-cosmic-light hover:bg-cosmic-gray"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="space-y-6">
          {/* CSV Upload */}
          <Card className="neon-glow-purple bg-cosmic-slate">
            <CardHeader>
              <CardTitle className="text-neon-purple flex items-center">
                <Upload className="w-5 h-5 mr-2" />
                Upload Recipients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Upload Area */}
                <div 
                  className="border-2 border-dashed border-cosmic-gray rounded-lg p-8 text-center hover:border-neon-purple transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-16 h-16 text-neon-purple mx-auto mb-4" />
                  <p className="text-cosmic-light mb-2">Drop CSV file here or click to upload</p>
                  <p className="text-sm text-cosmic-muted">Required columns: address, amount, asset</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".csv"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
                
                {selectedFile && (
                  <div className="bg-cosmic-gray/50 rounded-lg p-4">
                    <p className="text-cosmic-light text-sm">Selected file:</p>
                    <p className="font-medium text-cosmic-white">{selectedFile.name}</p>
                    <p className="text-xs text-cosmic-muted">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                )}
                
                <Button 
                  onClick={handleUpload}
                  disabled={!selectedFile || uploadCSVMutation.isPending}
                  className="w-full neon-glow-purple bg-neon-purple text-cosmic-black hover:bg-neon-purple/90 font-semibold"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploadCSVMutation.isPending ? 'Processing...' : 'Upload CSV'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Payment Summary */}
          {showPreview && (
            <Card className="neon-glow-amber bg-cosmic-slate">
              <CardHeader>
                <CardTitle className="text-neon-amber">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-cosmic-light">Recipients:</span>
                    <span className="font-orbitron font-semibold text-cosmic-white">{csvData.length}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cosmic-light">Total Amount:</span>
                    <span className="font-orbitron font-semibold text-neon-amber">
                      ${totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-cosmic-light">Est. Gas Fees:</span>
                    <span className="font-orbitron font-semibold text-cosmic-white">
                      ${estimatedGas.toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t border-cosmic-gray pt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-cosmic-white font-semibold">Total Cost:</span>
                      <span className="font-orbitron font-bold text-neon-amber text-lg">
                        ${(totalAmount + estimatedGas).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview & History */}
        <div className="space-y-6">
          {/* CSV Preview */}
          {showPreview && (
            <Card className="neon-glow-indigo bg-cosmic-slate">
              <CardHeader>
                <CardTitle className="text-neon-indigo">CSV Preview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-cosmic-gray">
                        <th className="text-left py-2 text-cosmic-light">Address</th>
                        <th className="text-left py-2 text-cosmic-light">Amount</th>
                        <th className="text-left py-2 text-cosmic-light">Asset</th>
                      </tr>
                    </thead>
                    <tbody>
                      {csvData.slice(0, 10).map((row, index) => (
                        <tr key={index} className="border-b border-cosmic-gray/30">
                          <td className="py-2 font-mono text-cosmic-white truncate" title={row.address}>
                            {row.address?.slice(0, 6)}...{row.address?.slice(-4)}
                          </td>
                          <td className="py-2 text-cosmic-white">{row.amount}</td>
                          <td className="py-2 text-cosmic-white">{row.asset}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {csvData.length > 10 && (
                    <p className="text-center text-cosmic-muted text-xs mt-2">
                      ...and {csvData.length - 10} more recipients
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Batch History */}
          <Card className="neon-glow-green bg-cosmic-slate">
            <CardHeader>
              <CardTitle className="text-neon-green">Batch History</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  <Users className="w-8 h-8 text-cosmic-muted mx-auto mb-2 animate-pulse" />
                  <p className="text-cosmic-light">Loading batches...</p>
                </div>
              ) : massPayments.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-cosmic-muted mx-auto mb-4" />
                  <p className="text-cosmic-light">No mass payments yet</p>
                  <p className="text-sm text-cosmic-muted">Upload a CSV file to get started</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {massPayments.map((batch: any) => (
                    <div key={batch.id} className="bg-cosmic-gray/50 rounded-lg p-4 border border-cosmic-gray">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium text-cosmic-white">{batch.fileName}</p>
                          <p className="text-sm text-cosmic-light">
                            {batch.totalRecipients} recipients • ${parseFloat(batch.totalAmount).toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          {batch.status === 'pending' && (
                            <div className="flex items-center text-neon-amber">
                              <Clock className="w-4 h-4 mr-1" />
                              <span className="text-sm">Pending</span>
                            </div>
                          )}
                          {batch.status === 'processing' && (
                            <div className="flex items-center text-neon-indigo">
                              <div className="w-4 h-4 border-2 border-neon-indigo border-t-transparent rounded-full animate-spin mr-1"></div>
                              <span className="text-sm">Processing</span>
                            </div>
                          )}
                          {batch.status === 'complete' && (
                            <div className="flex items-center text-neon-green">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              <span className="text-sm">Complete</span>
                            </div>
                          )}
                          {batch.status === 'failed' && (
                            <div className="flex items-center text-neon-red">
                              <AlertCircle className="w-4 h-4 mr-1" />
                              <span className="text-sm">Failed</span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {batch.status === 'processing' && (
                        <div className="mb-3">
                          <Progress value={Math.random() * 100} className="h-2" />
                          <p className="text-xs text-cosmic-muted mt-1">
                            Processing payments... {Math.floor(Math.random() * batch.totalRecipients)} of {batch.totalRecipients} complete
                          </p>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-cosmic-light">
                          {new Date(batch.createdAt).toLocaleString()}
                        </span>
                        {batch.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => executeMutation.mutate(batch.id)}
                            disabled={executeMutation.isPending}
                            className="neon-glow-green bg-neon-green text-cosmic-black hover:bg-neon-green/90"
                          >
                            Execute
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
