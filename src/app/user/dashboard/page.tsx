// src/app/(user)/user/dashboard/page.tsx
'use client';
import { useEffect, useState, useCallback } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Attendance } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { toast } from 'sonner';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Clock,
  LogOut,
  QrCode,
  History,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Timer,
  Loader2
} from 'lucide-react';

export default function UserDashboard() {
  const { user } = useAppSelector((state) => state.auth);
  const [attendance, setAttendance] = useState<Attendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState(false);

  const fetchTodayAttendance = useCallback(async () => {
    try {
      const res = await fetch(`/api/attendance/today?userId=${user?.uid}`);
      const data = await res.json();
      setAttendance(data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      fetchTodayAttendance();
    }
  }, [fetchTodayAttendance, user?.uid]);

  const handleCheckOut = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch('/api/attendance/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.uid })
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Check-out berhasil!');
        fetchTodayAttendance();
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal check-out');
    } finally {
      setCheckingOut(false);
    }
  };

  const formatTime = (timestamp: Timestamp | Date | null) => {
    if (!timestamp) return '-';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Selamat Datang, {user?.name}! 👋
        </h1>
        <p className="text-muted-foreground flex items-center gap-2">
          <Calendar className="size-4" />
          {currentDate}
        </p>
      </div>

      {/* Status Card */}
      <Card className="overflow-hidden">
        <CardHeader className="border-b bg-muted/30">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="size-5 text-muted-foreground" />
              <CardTitle className="text-lg">Status Absensi Hari Ini</CardTitle>
            </div>
            {attendance && (
              <Badge
                variant={attendance.status === 'pulang' ? 'purple' : 'success'}
                className="gap-1"
              >
                {attendance.status === 'pulang' ? (
                  <>
                    <CheckCircle2 className="size-3" />
                    Sudah Pulang
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-3" />
                    Sedang Hadir
                  </>
                )}
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {!attendance ? (
            <div className="text-center py-8">
              <div className="size-20 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
                <Clock className="size-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Belum Check-in
              </h3>
              <p className="text-muted-foreground max-w-sm mx-auto mb-6">
                Anda belum melakukan check-in hari ini. Silakan scan QR Code Anda di admin.
              </p>
              <Link href="/user/qrcode">
                <Button variant="gradient" className="gap-2">
                  <QrCode className="size-4" />
                  Lihat QR Code Saya
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Time Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 p-5 border border-emerald-200/50 dark:border-emerald-800/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="size-4 text-emerald-600 dark:text-emerald-400" />
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Check-In</p>
                  </div>
                  <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                    {formatTime(attendance.checkIn)}
                  </p>
                </div>

                <div className={`rounded-xl p-5 border ${attendance.checkOut
                  ? 'bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-200/50 dark:border-violet-800/30'
                  : 'bg-muted/50 border-border'
                  }`}>
                  <div className="flex items-center gap-2 mb-2">
                    <LogOut className={`size-4 ${attendance.checkOut ? 'text-violet-600 dark:text-violet-400' : 'text-muted-foreground'}`} />
                    <p className={`text-sm font-medium ${attendance.checkOut ? 'text-violet-700 dark:text-violet-300' : 'text-muted-foreground'}`}>
                      Check-Out
                    </p>
                  </div>
                  <p className={`text-3xl font-bold font-mono ${attendance.checkOut
                    ? 'text-violet-700 dark:text-violet-300'
                    : 'text-muted-foreground/50'
                    }`}>
                    {formatTime(attendance.checkOut)}
                  </p>
                </div>
              </div>

              {/* Checkout Button */}
              {!attendance.checkOut && (
                <Button
                  onClick={handleCheckOut}
                  disabled={checkingOut}
                  className="w-full h-12 gap-2"
                  variant="gradient"
                >
                  {checkingOut ? (
                    <>
                      <Loader2 className="size-5 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <LogOut className="size-5" />
                      Check-Out Sekarang
                    </>
                  )}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/user/qrcode">
          <Card className="group hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all cursor-pointer h-full">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 flex items-center justify-center">
                  <QrCode className="size-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-emerald-600 transition-colors">
                    QR Code Saya
                  </h3>
                  <p className="text-sm text-muted-foreground">Tampilkan QR untuk di-scan</p>
                </div>
                <ArrowRight className="size-5 text-muted-foreground group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href="/user/history">
          <Card className="group hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-800 transition-all cursor-pointer h-full">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 flex items-center justify-center">
                  <History className="size-6 text-violet-600 dark:text-violet-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground group-hover:text-violet-600 transition-colors">
                    Riwayat Absensi
                  </h3>
                  <p className="text-sm text-muted-foreground">Lihat riwayat kehadiran</p>
                </div>
                <ArrowRight className="size-5 text-muted-foreground group-hover:text-violet-600 group-hover:translate-x-1 transition-all" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}