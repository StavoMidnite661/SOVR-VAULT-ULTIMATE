import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Camera, Upload, QrCode, CheckCircle, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function QRScanner() {
  const [showScanModal, setShowScanModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Scan QR mutation
  const scanQRMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('qrImage', file);
      const response = await apiRequest('POST', '/api/qr/scan', formData);
      return response.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setScannedData(data.data);
        setShowScanModal(false);
        setShowPaymentModal(true);
      }
    },
    onError: (error: Error) => {
      toast({
        title: "Scan Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      scanQRMutation.mutate(file);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setCameraActive(true);
      
      // Mock camera scanning - in real implementation you'd use a QR scanning library
      setTimeout(() => {
        // Simulate successful QR scan
        const mockPaymentData = {
          type: 'payment_request',
          amount: '250.00',
          asset: 'USDC',
          recipient: '0x742d35Cc6A1234567890123456789012345678a2E4',
          description: 'Payment for services'
        };
        
        setScannedData(mockPaymentData);
        setCameraActive(false);
        setShowScanModal(false);
        setShowPaymentModal(true);
        
        // Stop camera stream
        stream.getTracks().forEach(track => track.stop());
      }, 3000);
      
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please upload a QR image instead.",
        variant: "destructive",
      });
    }
  };

  const processPayment = () => {
    // Mock payment processing
    toast({
      title: "Payment Sent",
      description: `Successfully sent ${scannedData.amount} ${scannedData.asset}`,
    });
    setShowPaymentModal(false);
    setScannedData(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-orbitron font-bold text-neon-indigo">QR Code Scanner</h1>
        <p className="text-cosmic-light">Scan QR codes for instant payments and data transfer</p>
      </div>

      {/* Scanner Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Camera Scanner */}
        <Card className="neon-glow-indigo bg-cosmic-slate">
          <CardHeader>
            <CardTitle className="text-neon-indigo flex items-center">
              <Camera className="w-5 h-5 mr-2" />
              Camera Scanner
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Camera Preview Area */}
              <div className="relative aspect-square bg-cosmic-black rounded-lg overflow-hidden border-2 border-dashed border-cosmic-gray">
                {cameraActive ? (
                  <div className="w-full h-full flex items-center justify-center relative">
                    <div className="text-center">
                      <QrCode className="w-16 h-16 text-neon-indigo mx-auto mb-4 animate-pulse" />
                      <p className="text-cosmic-light">Scanning for QR codes...</p>
                      <div className="scanner-overlay absolute inset-0 opacity-50"></div>
                    </div>
                    {/* Scanning frame overlay */}
                    <div className="absolute inset-4 border-2 border-neon-indigo rounded-lg">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-neon-indigo"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-neon-indigo"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-neon-indigo"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-neon-indigo"></div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Camera className="w-16 h-16 text-cosmic-muted mx-auto mb-4" />
                      <p className="text-cosmic-light mb-2">Camera Preview</p>
                      <p className="text-sm text-cosmic-muted">Click start camera to begin scanning</p>
                    </div>
                  </div>
                )}
              </div>
              
              <Button 
                onClick={cameraActive ? () => setCameraActive(false) : startCamera}
                className="w-full neon-glow-indigo bg-neon-indigo text-cosmic-black hover:bg-neon-indigo/90 font-semibold"
              >
                <Camera className="w-4 h-4 mr-2" />
                {cameraActive ? 'Stop Camera' : 'Start Camera'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* File Upload Scanner */}
        <Card className="neon-glow-green bg-cosmic-slate">
          <CardHeader>
            <CardTitle className="text-neon-green flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              Upload QR Image
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Upload Area */}
              <div 
                className="border-2 border-dashed border-cosmic-gray rounded-lg p-8 text-center hover:border-neon-green transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="w-16 h-16 text-neon-green mx-auto mb-4" />
                <p className="text-cosmic-light mb-2">Drop QR image here or click to upload</p>
                <p className="text-sm text-cosmic-muted">Supports PNG, JPG, GIF formats</p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
              
              <Button 
                onClick={() => fileInputRef.current?.click()}
                disabled={scanQRMutation.isPending}
                className="w-full neon-glow-green bg-neon-green text-cosmic-black hover:bg-neon-green/90 font-semibold"
              >
                <Upload className="w-4 h-4 mr-2" />
                {scanQRMutation.isPending ? 'Processing...' : 'Choose Image'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Scans */}
      <Card className="neon-glow-amber bg-cosmic-slate">
        <CardHeader>
          <CardTitle className="text-neon-amber">Recent Scans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Mock recent scans */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-cosmic-gray/50 border border-cosmic-gray">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-neon-green" />
                </div>
                <div>
                  <p className="font-medium text-cosmic-white">Payment Request</p>
                  <p className="text-sm text-cosmic-light">250 USDC payment</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-cosmic-light">2 minutes ago</p>
                <p className="text-xs text-neon-green">Completed</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-cosmic-gray/50 border border-cosmic-gray">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-neon-purple/20 flex items-center justify-center">
                  <QrCode className="w-5 h-5 text-neon-purple" />
                </div>
                <div>
                  <p className="font-medium text-cosmic-white">Trust Verification</p>
                  <p className="text-sm text-cosmic-light">Document hash verification</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-cosmic-light">1 hour ago</p>
                <p className="text-xs text-neon-green">Verified</p>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-4 rounded-lg bg-cosmic-gray/50 border border-cosmic-gray">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-full bg-neon-red/20 flex items-center justify-center">
                  <AlertCircle className="w-5 h-5 text-neon-red" />
                </div>
                <div>
                  <p className="font-medium text-cosmic-white">Invalid QR Code</p>
                  <p className="text-sm text-cosmic-light">Unrecognized format</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-cosmic-light">3 hours ago</p>
                <p className="text-xs text-neon-red">Failed</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Confirmation Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="bg-cosmic-slate border-cosmic-gray">
          <DialogHeader>
            <DialogTitle className="text-neon-green font-orbitron">Payment Confirmation</DialogTitle>
          </DialogHeader>
          {scannedData && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-neon-green/20 flex items-center justify-center mx-auto mb-4 animate-glow-pulse">
                  <CheckCircle className="w-8 h-8 text-neon-green" />
                </div>
                <h3 className="text-xl font-semibold text-cosmic-white mb-2">QR Code Scanned Successfully</h3>
                <p className="text-cosmic-light">Review the payment details below</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-cosmic-light">Amount:</span>
                  <span className="font-orbitron font-semibold text-cosmic-white">
                    {scannedData.amount} {scannedData.asset}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cosmic-light">Recipient:</span>
                  <span className="font-mono text-sm text-cosmic-white">
                    {scannedData.recipient?.slice(0, 6)}...{scannedData.recipient?.slice(-4)}
                  </span>
                </div>
                {scannedData.description && (
                  <div className="flex justify-between items-center">
                    <span className="text-cosmic-light">Description:</span>
                    <span className="text-cosmic-white">{scannedData.description}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-cosmic-light">Network:</span>
                  <span className="text-cosmic-white">Base</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-cosmic-light">Gas Fee:</span>
                  <span className="text-cosmic-white">~$0.50</span>
                </div>
              </div>
              
              <div className="flex space-x-3 pt-4">
                <Button 
                  variant="outline"
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 border-cosmic-gray text-cosmic-light hover:bg-cosmic-gray"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={processPayment}
                  className="flex-1 neon-glow-green bg-neon-green text-cosmic-black hover:bg-neon-green/90 font-semibold"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Send Payment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
