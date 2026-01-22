// src/app/(admin)/admin/dashboard/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  UserX,
  QrCode,
  ClipboardList,
  TrendingUp,
  ArrowRight,
  Clock,
  Calendar
} from 'lucide-react';

interface Stats {
  todayPresent: number;
  todayCheckOut: number;
  totalUsers: number;
}

function StatCard({
  title,
  value,
  icon: Icon,
  variant = 'default',
  description
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  variant?: 'default' | 'success' | 'purple' | 'blue';
  description?: string;
}) {


  const bgVariants = {
    default: 'bg-slate-100 dark:bg-slate-800',
    success: 'bg-emerald-100 dark:bg-emerald-900/30',
    purple: 'bg-violet-100 dark:bg-violet-900/30',
    blue: 'bg-blue-100 dark:bg-blue-900/30',
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-foreground">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="size-3" />
                {description}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${bgVariants[variant]}`}>
            <Icon className={`size-6 text-${variant === 'default' ? 'slate' : variant === 'success' ? 'emerald' : variant === 'purple' ? 'violet' : 'blue'}-600 dark:text-${variant === 'default' ? 'slate' : variant === 'success' ? 'emerald' : variant === 'purple' ? 'violet' : 'blue'}-400`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionCard({
  href,
  title,
  description,
  icon: Icon,
  gradient
}: {
  href: string;
  title: string;
  description: string;
  icon: React.ElementType;
  gradient: string;
}) {
  return (
    <Link href={href}>
      <Card className={`group overflow-hidden border-0 bg-gradient-to-br ${gradient} text-white hover:shadow-lg hover:shadow-${gradient.includes('blue') ? 'blue' : 'emerald'}-500/20 transition-all duration-300 hover:-translate-y-1`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Icon className="size-8 opacity-90" />
              <h3 className="text-lg font-semibold">{title}</h3>
              <p className="text-sm opacity-80">{description}</p>
            </div>
            <ArrowRight className="size-5 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    todayPresent: 0,
    todayCheckOut: 0,
    totalUsers: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const [reportRes, usersRes] = await Promise.all([
        fetch(`/api/attendance/report?type=daily&date=${today}`),
        fetch('/api/admin/users?role=user')
      ]);

      const reportData = await reportRes.json();
      const usersData = await usersRes.json();

      setStats({
        todayPresent: reportData.stats?.hadir || 0,
        todayCheckOut: reportData.stats?.pulang || 0,
        totalUsers: usersData.data?.length || 0
      });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Admin</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Calendar className="size-4" />
            {currentDate}
          </p>
        </div>
        <Badge variant="info" className="w-fit">
          <Clock className="size-3 mr-1" />
          {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Total User"
          value={stats.totalUsers}
          icon={Users}
          variant="blue"
          description="Pengguna terdaftar"
        />
        <StatCard
          title="Hadir Hari Ini"
          value={stats.todayPresent}
          icon={UserCheck}
          variant="success"
          description="Sudah check-in"
        />
        <StatCard
          title="Sudah Pulang"
          value={stats.todayCheckOut}
          icon={UserX}
          variant="purple"
          description="Sudah check-out"
        />
      </div>

      {/* Action Cards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">Aksi Cepat</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ActionCard
            href="/admin/scan"
            title="Scan QR Code"
            description="Scan QR Code user untuk check-in"
            icon={QrCode}
            gradient="from-blue-600 to-indigo-600"
          />
          <ActionCard
            href="/admin/attendance"
            title="Lihat Data Absensi"
            description="Kelola dan lihat semua data absensi"
            icon={ClipboardList}
            gradient="from-emerald-600 to-teal-600"
          />
        </div>
      </div>
    </div>
  );
}
