// src/app/(user)/user/qrcode/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { auth } from '@/lib/firebase';
import QRCode from 'qrcode';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { QrCode, RefreshCw, CheckCircle2, User, Mail, Loader2, Download, Shield } from 'lucide-react';

export default function QRCodePage() {
  const { user } = useAppSelector((state) => state.auth);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    generateQRCode();
  }, []);

  const generateQRCode = async () => {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) throw new Error('User not authenticated');

      const res = await fetch('/api/qr/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user?.uid })
      });

      const data = await res.json();

      if (data.success) {
        const qrString = data.qrData;
        const url = await QRCode.toDataURL(qrString, {
          width: 320,
          margin: 2,
          color: {
            dark: '#1e293b',
            light: '#FFFFFF'
          }
        });
        setQrDataUrl(url);
      }
    } catch (error) {
      toast.error('Gagal generate QR Code');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await generateQRCode();
    setRefreshing(false);
    toast.success('QR Code berhasil diperbarui');
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `qr-code-${user?.name || 'user'}.png`;
    link.href = qrDataUrl;
    link.click();
    toast.success('QR Code berhasil diunduh');
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Card>
          <CardContent className="p-8 flex flex-col items-center">
            <Skeleton className="size-80 rounded-xl" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <QrCode className="size-6" />
          QR Code Saya
        </h1>
        <p className="text-muted-foreground">Tunjukkan QR Code ini kepada admin untuk check-in</p>
      </div>

      {/* QR Card */}
      <Card className="overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col items-center">
            {/* QR Code Container */}
            <div className="relative group">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl blur-lg opacity-20 group-hover:opacity-30 transition-opacity" />
              <div className="relative p-4 bg-white rounded-2xl shadow-lg border-4 border-white">
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="size-72 sm:size-80"
                  />
                )}
              </div>
            </div>

            {/* User Info */}
            <div className="mt-8 text-center space-y-3">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-muted/50">
                <div className="size-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-semibold">
                  {(user?.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">{user?.name}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="size-3" />
                    {user?.email}
                  </p>
                </div>
              </div>

              <Badge variant="success" className="gap-1.5 py-1.5 px-4">
                <CheckCircle2 className="size-3.5" />
                Valid untuk hari ini
              </Badge>
            </div>

            {/* Actions */}
            <div className="mt-8 flex gap-3 w-full max-w-xs">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="flex-1 gap-2"
                disabled={refreshing}
              >
                {refreshing ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <RefreshCw className="size-4" />
                )}
                Refresh
              </Button>
              <Button
                onClick={handleDownload}
                variant="outline"
                className="flex-1 gap-2"
              >
                <Download className="size-4" />
                Download
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <div className="size-10 shrink-0 flex items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/50">
              <Shield className="size-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-emerald-900 dark:text-emerald-100 mb-1">Informasi Penting</p>
              <ul className="text-emerald-700 dark:text-emerald-300 space-y-1 list-disc list-inside">
                <li>QR Code ini unik untuk Anda dan diperbarui setiap hari</li>
                <li>Jangan bagikan QR Code ini kepada orang lain</li>
                <li>Scan QR Code di admin untuk melakukan check-in</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}