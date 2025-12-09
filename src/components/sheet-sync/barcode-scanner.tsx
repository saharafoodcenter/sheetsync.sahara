"use client";

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader } from '@zxing/browser';
import type { IScannerControls } from '@zxing/browser';
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
    const codeReader = new BrowserMultiFormatReader();
    let controls: IScannerControls;

    const startScan = async () => {
      if (!videoRef.current || hasCameraPermission === false) return;
      try {
        // Ask for permission and get stream
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        controls = await codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
          if (result) {
            onScan(result.getText());
          }
          // The error for "no barcode found" has the name "NotFoundException"
          if (err && err.name !== 'NotFoundException') {
            console.error('Barcode scan error:', err);
          }
        });

      } catch (error) {
        console.error('Error accessing camera or starting scanner:', error);
        setHasCameraPermission(false);
        if ((error as Error).name === 'NotAllowedError') {
          toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use the scanner.',
          });
        }
      }
    };

    const stopScan = () => {
        if (controls) {
            controls.stop();
        }
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    }

    if (isScanning) {
      startScan();
    } else {
      stopScan();
    }

    return () => {
      stopScan();
    };
  }, [isScanning, onScan, toast, hasCameraPermission]);

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
