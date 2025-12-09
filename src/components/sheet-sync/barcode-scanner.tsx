"use client";

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { NotFoundException } from '@zxing/library';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CameraOff } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  isScanning: boolean;
}

export function BarcodeScanner({ onScan, isScanning }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use the scanner.',
        });
      }
    };

    if (isScanning) {
        getCameraPermission();
    }
  }, [isScanning, toast]);


  useEffect(() => {
    if (!isScanning || !hasCameraPermission || !videoRef.current) return;

    const codeReader = new BrowserMultiFormatReader();
    
    // Ensure video element is ready before decoding
    const startScan = () => {
        if(videoRef.current) {
            codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
                if (result) {
                onScan(result.getText());
                }
                if (err && !(err instanceof NotFoundException)) {
                console.error('Barcode scan error:', err);
                }
            }).catch(err => console.error("Decode error", err));
        }
    }

    // Delay start of scan to ensure video is playing
    const videoElement = videoRef.current;
    videoElement.oncanplay = () => {
        startScan();
    }
    if (videoElement.readyState >= 3) { // HAVE_FUTURE_DATA
        startScan();
    }


    return () => {
      codeReader.reset();
    };
  }, [isScanning, onScan, hasCameraPermission]);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-md border bg-muted">
       <video ref={videoRef} className="h-full w-full object-cover" autoPlay muted playsInline />
      {hasCameraPermission === false && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 p-4 text-center">
            <CameraOff className="h-12 w-12 text-muted-foreground" />
            <Alert variant="destructive" className="mt-4">
                <AlertTitle>Camera Access Required</AlertTitle>
                <AlertDescription>
                    Please allow camera access in your browser to use the barcode scanner.
                </AlertDescription>
            </Alert>
        </div>
      )}
       {hasCameraPermission === null && isScanning && (
        <div className="absolute inset-0 flex items-center justify-center">
            <p>Requesting camera permission...</p>
        </div>
      )}
    </div>
  );
}
