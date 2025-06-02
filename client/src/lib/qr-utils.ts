import QRCode from 'qrcode';

export async function generateQRCode(data: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(data, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#F59E0B', // neon-amber
        light: '#0F172A'  // cosmic-black
      },
      width: 256
    });
    return qrCodeDataURL;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
}

export async function parseQRCode(imageBuffer: Buffer): Promise<string | null> {
  try {
    // In a real implementation, you would use a QR code parsing library
    // For now, we'll simulate the parsing since we don't have access to image processing libraries
    // This would typically use libraries like jsQR or qr-scanner
    
    // Mock implementation for demo purposes
    // In production, this would actually process the image buffer
    return null;
  } catch (error) {
    console.error('Error parsing QR code:', error);
    return null;
  }
}

export function validateQRData(data: string): { isValid: boolean; type: string | null; parsedData: any } {
  try {
    const parsed = JSON.parse(data);
    
    if (parsed.type === 'payment_request' && parsed.amount && parsed.asset) {
      return {
        isValid: true,
        type: 'payment_request',
        parsedData: parsed
      };
    }
    
    if (parsed.type === 'trust_verification' && parsed.documentHash) {
      return {
        isValid: true,
        type: 'trust_verification',
        parsedData: parsed
      };
    }
    
    return {
      isValid: false,
      type: null,
      parsedData: null
    };
  } catch {
    // Not JSON, treat as raw data
    return {
      isValid: true,
      type: 'raw',
      parsedData: data
    };
  }
}
