'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/store/hooks';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  QrCode,
  Shield,
  Clock,
  Users,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const features = [
  {
    icon: QrCode,
    title: 'QR Code Unik',
    description: 'Setiap pengguna memiliki QR Code unik yang diperbarui setiap hari'
  },
  {
    icon: Shield,
    title: 'Aman & Terenkripsi',
    description: 'Data absensi tersimpan aman di Firebase dengan enkripsi end-to-end'
  },
  {
    icon: Clock,
    title: 'Real-time',
    description: 'Pantau kehadiran secara real-time dengan laporan instant'
  },
  {
    icon: Users,
    title: 'Multi-Role',
    description: 'Sistem multi-level untuk Admin dan User dengan dashboard berbeda'
  }
];

export default function Home() {
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user, loading, initialized } = useAppSelector((state: { auth: any; }) => state.auth);

  useEffect(() => {
    if (initialized && user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/user/dashboard');
      }
    }
  }, [user, initialized, router]);

  // Show loading briefly, but if not initialized after a short time, show landing page anyway
  if (loading && !initialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="size-8 animate-spin text-blue-600" />
          <p className="text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  // If user is logged in but we're still here, redirect
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-violet-400/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b bg-background/50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
                <QrCode className="size-5 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">Absensi QR</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/auth/login">
                <Button variant="ghost">Masuk</Button>
              </Link>
              <Link href="/register">
                <Button variant="gradient">Daftar</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
          <div className="text-center max-w-3xl mx-auto">
            <Badge variant="info" className="mb-6 gap-1.5 py-1.5 px-4">
              <Sparkles className="size-3.5" />
              Sistem Absensi Modern
            </Badge>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-6">
              Absensi Mudah dengan{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                QR Code
              </span>
            </h1>

            <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
              Kelola kehadiran dengan sistem QR Code yang aman, cepat, dan mudah digunakan.
              Pantau absensi real-time dari mana saja.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/auth/login">
                <Button size="xl" variant="gradient" className="gap-2 min-w-[200px]">
                  Mulai Sekarang
                  <ChevronRight className="size-5" />
                </Button>
              </Link>
              <Link href="#features">
                <Button size="xl" variant="outline" className="min-w-[200px]">
                  Lihat Fitur
                </Button>
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
              {[
                { value: '99.9%', label: 'Uptime' },
                { value: '500+', label: 'Pengguna' },
                { value: '50K+', label: 'Absensi' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Features Section */}
        <section id="features" className="py-20 bg-background/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
                Fitur Unggulan
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Dirancang untuk kemudahan dan keamanan dalam mengelola absensi
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="group hover:shadow-lg transition-all hover:-translate-y-1">
                  <CardContent className="p-6">
                    <div className="size-12 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <feature.icon className="size-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
              <CardContent className="p-8 sm:p-12 text-center">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Siap Mencoba Absensi QR?
                </h2>
                <p className="text-blue-100 mb-8 max-w-lg mx-auto">
                  Daftar sekarang dan rasakan kemudahan absensi dengan QR Code. Gratis untuk memulai!
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/register">
                    <Button size="lg" variant="secondary" className="gap-2 min-w-[180px]">
                      <CheckCircle2 className="size-4" />
                      Daftar Gratis
                    </Button>
                  </Link>
                  <Link href="/auth/login">
                    <Button size="lg" variant="outline" className="min-w-[180px] border-white/30 text-white hover:bg-white/10">
                      Sudah Punya Akun
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t bg-background/50 backdrop-blur-sm py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                <QrCode className="size-4 text-white" />
              </div>
              <span className="font-semibold text-foreground">Absensi QR</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 Absensi QR. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
