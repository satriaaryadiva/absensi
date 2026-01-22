// src/app/(admin)/admin/layout.tsx
'use client';
import { useEffect, ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/store/hooks';
import { logoutUser } from '@/store/slices/authSlice';
import Link from 'next/link';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  LayoutDashboard,
  QrCode,
  ClipboardList,
  FileBarChart,
  LogOut,
  Menu,
  ChevronRight,
  Users,
  Settings,
  Bell,
  Shield,
} from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle';

const sidebarLinks = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/scan', label: 'Scan QR Code', icon: QrCode },
  { href: '/admin/attendance', label: 'Data Absensi', icon: ClipboardList },
  { href: '/admin/report', label: 'Laporan', icon: FileBarChart },
  { href: '/admin/user', label: 'Kelola User', icon: Users },
  { href: '/admin/roles', label: 'Kelola Role', icon: Shield },
];

function NavLink({ href, label, icon: Icon, isActive }: { href: string; label: string; icon: React.ElementType; isActive: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
        "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/25"
          : "text-sidebar-foreground"
      )}
    >
      <Icon className={cn("size-5", isActive && "text-white")} />
      <span>{label}</span>
      {isActive && <ChevronRight className="ml-auto size-4" />}
    </Link>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { user, loading } = useAppSelector((state: { auth: any; }) => state.auth);
  const [sheetOpen, setSheetOpen] = useState(false);


  useEffect(() => {
    // Only check for role-based redirect if user data is loaded (hydration)
    if (user && user.role !== 'admin') {
      router.push('/user/dashboard');
    }
  }, [user, router]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    toast.success('Logout berhasil');
    router.push('/auth/login');
  };

  // Allow slight delay for hydration or middleware takes care of it.
  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Memuat...</p>
        </div>
      </div>
    );
  }

  if (user.role !== 'admin') return null;

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:z-40 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-sidebar-background px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/30">
              <QrCode className="size-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">Absensi QR</h1>
              <p className="text-xs text-muted-foreground">Admin Panel</p>
            </div>
          </div>

          <Separator />

          {/* Navigation */}
          <nav className="flex flex-1 flex-col gap-y-1">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                isActive={pathname === link.href}
              />
            ))}
          </nav>

          {/* User Card */}
          <div className="mt-auto">
            <Separator className="mb-4" />
            <div className="flex items-center gap-2 mb-4 px-1">
              <ModeToggle />
              <span className="text-xs text-muted-foreground">Tema Tampilan</span>
            </div>
            <div className="flex items-center gap-3 rounded-lg bg-sidebar-accent/50 p-3">
              <Avatar className="size-10 ring-2 ring-blue-500/20">
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-sm font-semibold">
                  {getInitials(user.name || 'AD')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="truncate text-sm font-medium text-foreground">{user.name}</p>
                <p className="truncate text-xs text-muted-foreground">Administrator</p>
              </div>
              <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive">
                <LogOut className="size-5" />
              </Button>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="sticky top-0 z-40 flex items-center gap-x-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 py-3 lg:hidden">
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden">
              <Menu className="size-6" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <SheetHeader className="border-b px-6 py-4">
              <SheetTitle className="flex items-center gap-3">
                <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
                  <QrCode className="size-5 text-white" />
                </div>
                <span>Absensi QR</span>
              </SheetTitle>
            </SheetHeader>
            <nav className="flex flex-col gap-1 p-4">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSheetOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname === link.href
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                      : "text-foreground hover:bg-accent"
                  )}
                >
                  <link.icon className="size-5" />
                  {link.label}
                </Link>
              ))}
            </nav>
          </SheetContent>
        </Sheet>

        <div className="flex flex-1 items-center gap-3">
          <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600">
            <QrCode className="size-4 text-white" />
          </div>
          <span className="font-semibold text-foreground">Admin Panel</span>
        </div>

        <ModeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="size-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Notifikasi</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Tidak ada notifikasi baru</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="size-9 cursor-pointer ring-2 ring-border hover:ring-blue-500/50 transition-all">
              <AvatarFallback className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs font-semibold">
                {getInitials(user.name || 'AD')}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <Settings className="mr-2 size-4" />
              Pengaturan
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} variant="destructive">
              <LogOut className="mr-2 size-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Main Content */}
      <main className="lg:pl-72">
        <div className="px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
