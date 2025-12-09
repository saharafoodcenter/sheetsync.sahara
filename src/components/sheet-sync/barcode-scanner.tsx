"use client";

import { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, type IScannerControls } from '@zxing/browser';
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
  const controlsRef = useRef<IScannerControls | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        // Check for permission without prompting first
        const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
        if (permission.state === 'granted') {
           setHasCameraPermission(true);
        } else if (permission.state === 'prompt') {
           setHasCameraPermission(null); // Will prompt on getUserMedia
        } else {
           setHasCameraPermission(false);
        }
        
        // This will prompt if not granted
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
    } else {
        // Stop camera when not scanning
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
        controlsRef.current?.stop();
        controlsRef.current = null;
    }
  }, [isScanning, toast]);


  useEffect(() => {
    if (!isScanning || !hasCameraPermission || !videoRef.current) {
        return;
    }

    const codeReader = new BrowserMultiFormatReader();
    const videoElement = videoRef.current;
    
    const startScan = async () => {
        if (!videoElement) return;
        try {
           const controls = await codeReader.decodeFromVideoDevice(undefined, videoElement, (result, err) => {
                if (result) {
                    onScan(result.getText());
                }
                if (err && !(err instanceof NotFoundException)) {
                    console.error('Barcode scan error:', err);
                }
            });
            controlsRef.current = controls;
        } catch(err) {
            console.error("Decode error", err)
        }
    }

    if (videoElement.readyState >= 3) { // HAVE_FUTURE_DATA
        startScan();
    } else {
        videoElement.oncanplay = () => {
            startScan();
        }
    }

    return () => {
      controlsRef.current?.stop();
      controlsRef.current = null;
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
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
