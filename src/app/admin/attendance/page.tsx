// src/app/(admin)/admin/attendance/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { Attendance } from '@/lib/types';
import { Timestamp } from 'firebase/firestore';
import { Card, CardContent } from '@/components/ui/card';
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
import { ClipboardList, Users, Clock, CheckCircle2, LogOut } from 'lucide-react';

export default function AttendancePage() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayAttendances();
  }, []);

  const fetchTodayAttendances = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await fetch(`/api/attendance/report?type=daily&date=${today}`);
      const data = await res.json();
      setAttendances(data.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (timestamp: Timestamp | Date | null) => {
    if (!timestamp) return '-';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const presentCount = attendances.filter(a => a.status === 'hadir').length;
  const checkoutCount = attendances.filter(a => a.status === 'pulang').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <ClipboardList className="size-6" />
            Data Absensi Hari Ini
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString('id-ID', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="info" className="gap-1.5 py-1.5 px-3">
            <Users className="size-3.5" />
            Total: {attendances.length}
          </Badge>
          <Badge variant="success" className="gap-1.5 py-1.5 px-3">
            <CheckCircle2 className="size-3.5" />
            Hadir: {presentCount}
          </Badge>
          <Badge variant="purple" className="gap-1.5 py-1.5 px-3">
            <LogOut className="size-3.5" />
            Pulang: {checkoutCount}
          </Badge>
        </div>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {attendances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="size-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <ClipboardList className="size-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">Belum Ada Data</h3>
              <p className="text-muted-foreground max-w-sm">
                Belum ada data absensi hari ini. Data akan muncul setelah user melakukan check-in.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">No</TableHead>
                  <TableHead>Nama</TableHead>
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
                {attendances.map((item, index) => (
                  <TableRow key={item.id} className="group">
                    <TableCell className="font-medium text-muted-foreground">
                      {index + 1}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
                          {(item.userName || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{item.userName}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {formatTime(item.checkIn)} - {formatTime(item.checkOut)}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="font-mono text-sm">{formatTime(item.checkIn)}</span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <span className="font-mono text-sm">{formatTime(item.checkOut)}</span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={item.status === 'pulang' ? 'purple' : 'success'}
                        className="gap-1"
                      >
                        {item.status === 'pulang' ? (
                          <>
                            <LogOut className="size-3" />
                            Selesai
                          </>
                        ) : (
                          <>
                            <CheckCircle2 className="size-3" />
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
