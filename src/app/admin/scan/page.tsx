/* eslint-disable @typescript-eslint/no-unused-vars */

// src/app/(admin)/admin/scan/page.tsx
'use client';
import { useState, useEffect, useCallback } from 'react';
import QrScanner from '@/components/QrScanner';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QrCode, Camera, CheckCircle2, XCircle, RefreshCw, Loader2 } from 'lucide-react';

interface ScanResult {
  success: boolean;
  userName: string;
  time: string;
}

export default function ScanPage() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [processing, setProcessing] = useState(false);

  // No longer need manual cleanup for scanner state since QrScanner component handles it

  const startScanner = () => {
    setScanning(true);
    setResult(null);
  };

  const onScanSuccess = useCallback(async (decodedText: string) => {
    setProcessing(true);
    try {
      // decodedText is the direct QR string (token.timestamp)
      const qrCode = decodedText;

      const verifyRes = await fetch('/api/qr/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qrCode })
      });

      const verifyData = await verifyRes.json();

      if (!verifyData.valid) { // Changed from !verifyData.success to !verifyData.valid
        toast.error(verifyData.message || "QR Code tidak valid");
        setProcessing(false);
        return;
      }

      const checkinRes = await fetch('/api/attendance/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: verifyData.user.uid,
          userName: verifyData.user.name,
          qrCode: qrCode
        })
      });

      const checkinData = await checkinRes.json();

      if (checkinData.success) {
        setResult({
          success: true,
          userName: verifyData.user.name,
          time: new Date().toLocaleTimeString('id-ID')
        });
        setDialogOpen(true);
        toast.success(`Check-in berhasil untuk ${verifyData.user.name}!`);

        setScanning(false);
      } else {
        toast.error(checkinData.message || "Gagal melakukan check-in");
      }
    } catch (error) {
      console.error(error);
      toast.error('Terjadi kesalahan saat memproses QR Code');
    } finally {
      setProcessing(false);
    }
  }, []);

  const onScanError = (error: string) => {
    // Silent error handling
  };

  const resetScanner = () => {
    setResult(null);
    setScanning(false);
    setDialogOpen(false);
  };

  const scanAgain = () => {
    setDialogOpen(false);
    setResult(null);
    setScanning(true);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Scan QR Code</h1>
        <p className="text-muted-foreground">Scan QR Code user untuk melakukan check-in absensi</p>
      </div>

      {/* Scanner Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {!scanning ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-2xl animate-pulse" />
                <div className="relative flex size-24 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-xl shadow-blue-500/30">
                  <QrCode className="size-12 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Scan QR Code User</h3>
              <p className="text-muted-foreground mb-8 max-w-sm">
                Klik tombol di bawah untuk memulai scanner dan scan QR Code user untuk melakukan check-in
              </p>
              <Button
                onClick={startScanner}
                size="lg"
                variant="gradient"
                className="gap-2 px-8"
              >
                <Camera className="size-5" />
                Mulai Scan
              </Button>
            </div>
          ) : (
            <div className="relative">
              {processing && (
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="size-8 animate-spin text-blue-600" />
                    <p className="text-sm font-medium text-muted-foreground">Memproses...</p>
                  </div>
                </div>
              )}
              <div>
                <QrScanner onScan={onScanSuccess} />
              </div>
              <div className="p-4 border-t">
                <Button
                  onClick={resetScanner}
                  variant="outline"
                  className="w-full"
                >
                  <XCircle className="size-4 mr-2" />
                  Batal
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="size-8 shrink-0 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50">
              <QrCode className="size-4 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Tips</p>
              <p className="text-blue-700 dark:text-blue-300">
                Pastikan QR Code dalam kondisi jelas dan pencahayaan cukup untuk hasil scan yang optimal.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Success Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader className="text-center sm:text-center">
            <div className="mx-auto mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse" />
                <div className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-500/30">
                  <CheckCircle2 className="size-10 text-white" />
                </div>
              </div>
            </div>
            <DialogTitle className="text-xl">Check-in Berhasil! 🎉</DialogTitle>
            <DialogDescription>
              Absensi telah berhasil dicatat di sistem
            </DialogDescription>
          </DialogHeader>

          {result && (
            <div className="bg-muted/50 rounded-lg p-4 text-center space-y-2">
              <p className="text-lg font-semibold text-foreground">{result.userName}</p>
              <Badge variant="success" className="gap-1">
                <CheckCircle2 className="size-3" />
                Hadir
              </Badge>
              <p className="text-sm text-muted-foreground">Waktu: {result.time}</p>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-col gap-2">
            <Button onClick={scanAgain} variant="gradient" className="w-full gap-2">
              <RefreshCw className="size-4" />
              Scan Lagi
            </Button>
            <Button onClick={resetScanner} variant="outline" className="w-full">
              Kembali
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}