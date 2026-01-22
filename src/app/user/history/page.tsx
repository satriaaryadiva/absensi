// src/app/(user)/user/history/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useAppSelector } from '@/store/hooks';
import { Attendance } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { History, Calendar, Clock, LogOut, CheckCircle2, CalendarDays } from 'lucide-react';

export default function HistoryPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [history, setHistory] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/attendance/history?userId=${user?.uid}`);
      const data = await res.json();
      setHistory(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('id-ID', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp: Timestamp | Date | null) => {
    if (!timestamp) return '-';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  // Calculate stats
  const totalDays = history.length;
  const completeDays = history.filter(h => h.status === 'pulang').length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Card>
          <CardContent className="p-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full mb-2" />
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <History className="size-6" />
          Riwayat Absensi
        </h1>
        <p className="text-muted-foreground">Lihat catatan kehadiran Anda</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <CalendarDays className="size-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalDays}</p>
              <p className="text-sm text-muted-foreground">Total Kehadiran</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="size-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <CheckCircle2 className="size-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{completeDays}</p>
              <p className="text-sm text-muted-foreground">Absensi Lengkap</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History Table */}
      <Card>
        <CardContent className="p-0">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <History className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Belum Ada Riwayat</h3>
              <p className="text-muted-foreground max-w-sm">
                Riwayat absensi Anda akan muncul di sini setelah melakukan check-in.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="size-3.5" />
                      Tanggal
                    </div>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5" />
                      Check-In
                    </div>
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">
                    <div className="flex items-center gap-1.5">
                      <LogOut className="size-3.5" />
                      Check-Out
                    </div>
                  </TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{formatDate(item.date)}</p>
                        <p className="text-xs text-muted-foreground sm:hidden">
                          {formatTime(item.checkIn)} - {formatTime(item.checkOut)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">
                        {formatTime(item.checkIn)}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="font-mono text-sm text-violet-600 dark:text-violet-400">
                        {formatTime(item.checkOut)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === 'pulang' ? 'purple' : 'success'}
                        className="gap-1"
                      >
                        {item.status === 'pulang' ? (
                          <>
                            <CheckCircle2 className="size-3" />
                            Selesai
                          </>
                        ) : (
                          <>
                            <Clock className="size-3" />
                            Hadir
                          </>
                        )}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}