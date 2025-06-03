import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Shield, QrCode, FileText, Hash, Upload, CheckCircle, AlertCircle, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { NeonButton } from "@/components/ui/neon-button";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { useRef } from "react";

export default function TrustVerification() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    documentHash: '',
    verificationType: 'pdf_sign',
    metadata: {
      description: '',
      documentName: ''
    }
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Fetch trust verifications
  const { data: verifications = [], isLoading } = useQuery({
    queryKey: ['/api/trust/verifications'],
  });

  // Create trust verification mutation
  const createVerificationMutation = useMutation({
    mutationFn: async (verificationData: any) => {
      const response = await apiRequest('POST', '/api/trust/verify', verificationData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/trust/verifications'] });
      setShowCreateDialog(false);
      setFormData({
        documentHash: '',
        verificationType: 'pdf_sign',
        metadata: { description: '', documentName: '' }
      });
      setSelectedFile(null);
      toast({
        title: "Trust Verification Created",
        description: "Your trust verification has been generated with QR code",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setFormData(prev => ({
        ...prev,
        metadata: { ...prev.metadata, documentName: file.name }
      }));
      
      // Generate mock hash for demo
      const reader = new FileReader();
      reader.onload = () => {
        const hash = `0x${Math.random().toString(16).substring(2, 66).padStart(64, '0')}`;
        setFormData(prev => ({ ...prev, documentHash: hash }));
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleCreateVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.documentHash) {
      toast({
        title: "Validation Error",
        description: "Please upload a document or enter a hash",
        variant: "destructive",
      });
      return;
    }
    createVerificationMutation.mutate(formData);
  };

  const generateHash = () => {
    const hash = `0x${Math.random().toString(16).substring(2, 66).padStart(64, '0')}`;
    setFormData(prev => ({ ...prev, documentHash: hash }));
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: `${label} copied to clipboard`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-orbitron font-bold text-neon-indigo">Trust Verification</h1>
          <p className="text-cosmic-light">Generate trust QR codes, sign PDFs, and verify document integrity</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <NeonButton neonColor="indigo">
              <Shield className="w-4 h-4 mr-2" />
              Create Verification
            </NeonButton>
          </DialogTrigger>
          <DialogContent className="bg-cosmic-slate border-cosmic-gray max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-neon-indigo font-orbitron">Create Trust Verification</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateVerification} className="space-y-4">
              <div>
                <Label htmlFor="verificationType" className="text-cosmic-light">Verification Type</Label>
                <Select 
                  value={formData.verificationType} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, verificationType: value }))}
                >
                  <SelectTrigger className="bg-cosmic-gray border-cosmic-gray text-cosmic-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-cosmic-slate border-cosmic-gray">
                    <SelectItem value="pdf_sign">PDF Document Signing</SelectItem>
                    <SelectItem value="hash_verify">Hash Verification</SelectItem>
                    <SelectItem value="trust_qr">Trust QR Generation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.verificationType === 'pdf_sign' && (
                <div>
                  <Label htmlFor="document" className="text-cosmic-light">Upload Document</Label>
                  <div 
                    className="border-2 border-dashed border-cosmic-gray rounded-lg p-6 text-center hover:border-neon-indigo transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="w-12 h-12 text-neon-indigo mx-auto mb-3" />
                    <p className="text-cosmic-light mb-2">
                      {selectedFile ? selectedFile.name : 'Drop PDF file here or click to upload'}
                    </p>
                    <p className="text-sm text-cosmic-muted">PDF files only</p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="documentHash" className="text-cosmic-light">Document Hash</Label>
                  <Button 
                    type="button" 
                    size="sm" 
                    onClick={generateHash}
                    className="neon-glow-purple bg-cosmic-gray hover:bg-cosmic-slate"
                  >
                    Generate
                  </Button>
                </div>
                <Input
                  id="documentHash"
                  value={formData.documentHash}
                  onChange={(e) => setFormData(prev => ({ ...prev, documentHash: e.target.value }))}
                  placeholder="0x... or upload document to generate"
                  className="bg-cosmic-gray border-cosmic-gray text-cosmic-white font-mono"
                />
              </div>
              
              <div>
                <Label htmlFor="documentName" className="text-cosmic-light">Document Name</Label>
                <Input
                  id="documentName"
                  value={formData.metadata.documentName}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    metadata: { ...prev.metadata, documentName: e.target.value }
                  }))}
                  placeholder="Enter document name"
                  className="bg-cosmic-gray border-cosmic-gray text-cosmic-white"
                />
              </div>
              
              <div>
                <Label htmlFor="description" className="text-cosmic-light">Description</Label>
                <Textarea
                  id="description"
                  value={formData.metadata.description}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    metadata: { ...prev.metadata, description: e.target.value }
                  }))}
                  placeholder="Verification description..."
                  className="bg-cosmic-gray border-cosmic-gray text-cosmic-white placeholder-cosmic-muted"
                  rows={3}
                />
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
                  neonColor="indigo"
                  disabled={createVerificationMutation.isPending}
                  className="flex-1"
                >
                  {createVerificationMutation.isPending ? 'Creating...' : 'Create Verification'}
                </NeonButton>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Trust Status */}
      <CosmicCard neonColor="amber" variant="gradient">
        <CardHeader>
          <CardTitle className="text-neon-amber flex items-center">
            <Shield className="w-5 h-5 mr-2" />
            Trust Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-neon-amber/20 rounded-full flex items-center justify-center mx-auto mb-3 animate-glow-pulse">
                <Shield className="w-8 h-8 text-neon-amber" />
              </div>
              <p className="text-cosmic-light text-sm">Trust Level</p>
              <p className="text-neon-amber font-orbitron font-semibold">Sovereign Emperor</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <CheckCircle className="w-8 h-8 text-neon-green" />
              </div>
              <p className="text-cosmic-light text-sm">Verifications</p>
              <p className="text-neon-green font-orbitron font-semibold">847</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-neon-purple/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <QrCode className="w-8 h-8 text-neon-purple" />
              </div>
              <p className="text-cosmic-light text-sm">QR Codes</p>
              <p className="text-neon-purple font-orbitron font-semibold">42</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-neon-indigo/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <FileText className="w-8 h-8 text-neon-indigo" />
              </div>
              <p className="text-cosmic-light text-sm">Documents</p>
              <p className="text-neon-indigo font-orbitron font-semibold">156</p>
            </div>
          </div>
        </CardContent>
      </CosmicCard>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CosmicCard neonColor="green" variant="default">
          <CardHeader>
            <CardTitle className="text-neon-green flex items-center">
              <QrCode className="w-5 h-5 mr-2" />
              Generate Trust QR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-cosmic-light text-sm mb-4">
              Create a QR code for instant trust verification and document authenticity
            </p>
            <NeonButton
              neonColor="green"
              onClick={() => {
                setFormData(prev => ({ ...prev, verificationType: 'trust_qr' }));
                setShowCreateDialog(true);
              }}
              className="w-full"
            >
              <QrCode className="w-4 h-4 mr-2" />
              Generate QR
            </NeonButton>
          </CardContent>
        </CosmicCard>

        <CosmicCard neonColor="purple" variant="default">
          <CardHeader>
            <CardTitle className="text-neon-purple flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Sign PDF Document
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-cosmic-light text-sm mb-4">
              Cryptographically sign PDF documents with your sovereign signature
            </p>
            <NeonButton
              neonColor="purple"
              onClick={() => {
                setFormData(prev => ({ ...prev, verificationType: 'pdf_sign' }));
                setShowCreateDialog(true);
              }}
              className="w-full"
            >
              <FileText className="w-4 h-4 mr-2" />
              Sign PDF
            </NeonButton>
          </CardContent>
        </CosmicCard>

        <CosmicCard neonColor="indigo" variant="default">
          <CardHeader>
            <CardTitle className="text-neon-indigo flex items-center">
              <Hash className="w-5 h-5 mr-2" />
              Verify Hash
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-cosmic-light text-sm mb-4">
              Verify document integrity using cryptographic hash validation
            </p>
            <NeonButton
              neonColor="indigo"
              onClick={() => {
                setFormData(prev => ({ ...prev, verificationType: 'hash_verify' }));
                setShowCreateDialog(true);
              }}
              className="w-full"
            >
              <Hash className="w-4 h-4 mr-2" />
              Verify Hash
            </NeonButton>
          </CardContent>
        </CosmicCard>
      </div>

      {/* Verification History */}
      <CosmicCard neonColor="amber" variant="default">
        <CardHeader>
          <CardTitle className="text-neon-amber">Verification History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">
              <Shield className="w-12 h-12 text-cosmic-muted mx-auto mb-4 animate-pulse" />
              <p className="text-cosmic-light">Loading verifications...</p>
            </div>
          ) : verifications.length === 0 ? (
            <div className="text-center py-12">
              <Shield className="w-16 h-16 text-cosmic-muted mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-cosmic-light mb-2">No Verifications Yet</h3>
              <p className="text-cosmic-muted mb-6">
                Create your first trust verification to establish document integrity
              </p>
              <NeonButton
                neonColor="indigo"
                onClick={() => setShowCreateDialog(true)}
              >
                <Shield className="w-4 h-4 mr-2" />
                Create First Verification
              </NeonButton>
            </div>
          ) : (
            <div className="space-y-4">
              {verifications.map((verification: any) => (
                <div key={verification.id} className="bg-cosmic-gray/50 rounded-lg p-4 border border-cosmic-gray hover:bg-cosmic-gray/70 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        verification.verificationType === 'pdf_sign' ? 'bg-neon-purple/20' :
                        verification.verificationType === 'hash_verify' ? 'bg-neon-indigo/20' :
                        'bg-neon-green/20'
                      }`}>
                        {verification.verificationType === 'pdf_sign' ? (
                          <FileText className="w-5 h-5 text-neon-purple" />
                        ) : verification.verificationType === 'hash_verify' ? (
                          <Hash className="w-5 h-5 text-neon-indigo" />
                        ) : (
                          <QrCode className="w-5 h-5 text-neon-green" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-cosmic-white">
                          {verification.metadata?.documentName || 'Untitled Document'}
                        </p>
                        <p className="text-sm text-cosmic-light">
                          {verification.metadata?.description || verification.verificationType.replace('_', ' ')}
                        </p>
                        <p className="text-xs text-cosmic-muted font-mono">
                          {verification.documentHash?.slice(0, 16)}...{verification.documentHash?.slice(-16)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-xs text-cosmic-muted">
                        {new Date(verification.createdAt).toLocaleString()}
                      </p>
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          size="sm"
                          onClick={() => copyToClipboard(verification.documentHash, 'Document hash')}
                          className="neon-glow-indigo bg-cosmic-gray hover:bg-cosmic-slate"
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Hash
                        </Button>
                        {verification.qrCode && (
                          <Button
                            size="sm"
                            onClick={() => copyToClipboard(verification.qrCode, 'QR code')}
                            className="neon-glow-green bg-cosmic-gray hover:bg-cosmic-slate"
                          >
                            <QrCode className="w-3 h-3 mr-1" />
                            QR
                          </Button>
                        )}
                        <Button
                          size="sm"
                          className="neon-glow-amber bg-cosmic-gray hover:bg-cosmic-slate"
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Export
                        </Button>
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
