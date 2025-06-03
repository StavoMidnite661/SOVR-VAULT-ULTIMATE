import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { QrCode, Camera, Upload, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QRScannerModal({ isOpen, onClose }: QRScannerModalProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && isScanning) {
      startCamera();
    } else {
      stopCamera();
    }

    return () => stopCamera();
  }, [isOpen, isScanning]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // In a real implementation, you would use a QR code library to decode the image
    // For now, we'll simulate processing
    toast({
      title: "Processing QR Code",
      description: "Scanning uploaded image...",
    });

    // Simulate QR code processing
    setTimeout(() => {
      const mockQRData = {
        type: 'payment',
        address: '0x742d35Cc6634C0532925a3b8D0D35D4B96',
        amount: '150.00',
        token: 'USDC',
        network: 'ethereum'
      };
      setScannedData(mockQRData);
    }, 1500);
  };

  const processQRCode = async (qrData: string) => {
    try {
      const response = await apiRequest('POST', '/api/qr/process', { qrData });
      const processedData = await response.json();
      setScannedData(processedData);
    } catch (error) {
      console.error('Error processing QR code:', error);
      toast({
        title: "QR Processing Error",
        description: "Failed to process QR code data.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmPayment = async () => {
    if (!scannedData) return;

    try {
      // In a real implementation, this would trigger the payment process
      toast({
        title: "Payment Initiated",
        description: `Processing payment of ${scannedData.amount} ${scannedData.token}`,
      });
      
      onClose();
      setScannedData(null);
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Error",
        description: "Failed to process payment.",
        variant: "destructive",
      });
    }
  };

  const handleClose = () => {
    setIsScanning(false);
    setScannedData(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md bg-slate-800 border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold flex items-center space-x-2">
            <QrCode className="w-5 h-5" />
            <span>Scan QR Payment</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!scannedData ? (
            <>
              {/* Camera View */}
              <div className="aspect-square bg-slate-900 rounded-lg flex items-center justify-center relative overflow-hidden">
                {isScanning && stream ? (
                  <video
                    ref={videoRef}
                    className="w-full h-full object-cover"
                    autoPlay
                    playsInline
                  />
                ) : (
                  <div className="text-center">
                    <div className="w-32 h-32 border-2 border-indigo-500 rounded-lg mx-auto mb-4 relative neon-glow-indigo">
                      <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-indigo-400 rounded-tl-lg"></div>
                      <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-indigo-400 rounded-tr-lg"></div>
                      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-indigo-400 rounded-bl-lg"></div>
                      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-indigo-400 rounded-br-lg"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <QrCode className="w-8 h-8 text-indigo-400 animate-pulse" />
                      </div>
                    </div>
                    <p className="text-slate-400">Position QR code within the frame</p>
                  </div>
                )}
              </div>

              {/* Camera Controls */}
              <div className="flex items-center justify-between">
                <Button
                  onClick={() => setIsScanning(!isScanning)}
                  className={`flex items-center space-x-2 px-4 py-2 ${
                    isScanning 
                      ? 'neon-glow-amber bg-amber-500/10 text-amber-400 hover:bg-amber-500/20' 
                      : 'neon-glow-indigo bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20'
                  }`}
                >
                  <Camera className="w-4 h-4" />
                  <span>{isScanning ? 'Stop Camera' : 'Start Camera'}</span>
                </Button>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex items-center space-x-2 border-slate-600 hover:border-slate-500"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload QR</span>
                </Button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </>
          ) : (
            /* Payment Confirmation */
            <div className="space-y-4">
              <Card className="bg-slate-700/50 border-slate-600">
                <CardContent className="p-4">
                  <p className="text-sm text-slate-400 mb-2">Detected Payment:</p>
                  <p className="text-xl font-bold mb-1">
                    {scannedData.amount} {scannedData.token}
                  </p>
                  <p className="text-xs text-slate-500 font-mono break-all">
                    To: {scannedData.address}
                  </p>
                  {scannedData.network && (
                    <p className="text-xs text-slate-400 mt-1">
                      Network: {scannedData.network}
                    </p>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-3">
                <Button 
                  onClick={handleConfirmPayment}
                  className="w-full p-4 neon-glow-amber bg-amber-500 text-black font-bold hover:bg-amber-600"
                >
                  <QrCode className="w-4 h-4 mr-2" />
                  Confirm Payment
                </Button>
                <Button 
                  onClick={() => setScannedData(null)}
                  variant="outline"
                  className="w-full border-slate-600 hover:border-slate-500"
                >
                  Scan Again
                </Button>
              </div>
            </div>
          )}

          <Button
            onClick={handleClose}
            variant="ghost"
            className="w-full text-slate-400 hover:text-slate-300"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
