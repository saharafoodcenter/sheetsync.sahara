
"use client";

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { CameraOff } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
}

export function BarcodeScanner({ onScan }: BarcodeScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();
  const controlsRef = useRef<IScannerControls | null>(null);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    
    const startScan = async () => {
      if (!videoRef.current || hasCameraPermission === false) return;
      try {
        // Ensure we only ask for permission once
        if (hasCameraPermission === null) {
          const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
          setHasCameraPermission(true);
          
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        }
        
        // Only start decoding if we have permission and a video element
        if (videoRef.current && hasCameraPermission !== false) {
           controlsRef.current = await codeReader.decodeFromVideoDevice(undefined, videoRef.current, (result, err) => {
            if (result) {
              // Once a result is found, stop the scanner and call the onScan prop
              controlsRef.current?.stop();
              onScan(result.getText());
            }
            if (err && err.name !== 'NotFoundException' && err.name !== 'ChecksumException' && err.name !== 'FormatException') {
              console.error('Barcode scan error:', err);
            }
          });
        }

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

    startScan();

    // Cleanup function to stop scanner and camera
    return () => {
      if (controlsRef.current) {
          controlsRef.current.stop();
          controlsRef.current = null;
      }
      if (videoRef.current && videoRef.current.srcObject) {
          const stream = videoRef.current.srcObject as MediaStream;
          stream.getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
      }
    };
  }, [onScan, toast, hasCameraPermission]);

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
       {hasCameraPermission === null && (
        <div className="absolute inset-0 flex items-center justify-center">
            <p>Requesting camera permission...</p>
        </div>
      )}
    </div>
  );
}
