'use client';

import { useEffect, useState } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Search, Loader2 } from 'lucide-react';

interface User {
    uid: string;
    name?: string;
    nama?: string;
    email?: string;
    role?: 'admin' | 'user' | 'staf' | 'murid' | 'guru';
    jabatan?: string;
    nim?: string;
}

export default function UserManagementPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            const result = await response.json();

            if (result.success) {
                setUsers(result.data);
            } else {
                toast.error(result.message || 'Gagal memuat data user');
            }
        } catch (error) {
            console.error('Error fetching users:', error);
            toast.error('Gagal memuat data user');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const filteredUsers = users.filter(user => {
        const name = (user.name || user.nama || '').toLowerCase();
        const email = (user.email || '').toLowerCase();
        const query = searchQuery.toLowerCase();
        return name.includes(query) || email.includes(query);
    });

    const getInitials = (name?: string, nama?: string) => {
        return (name || nama || 'U').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const getRoleBadgeColor = (role?: string) => {
        switch (role) {
            case 'admin': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
            case 'guru': return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300';
            case 'staf': return 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300';
            case 'murid': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
            default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Manajemen User</h1>
                    <p className="text-muted-foreground">Daftar pengguna terdaftar</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                        placeholder="Cari nama atau email..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role Saat Ini</TableHead>
                            <TableHead>Detail</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={3} className="h-24 text-center">
                                    <div className="flex items-center justify-center gap-2">
                                        <Loader2 className="size-4 animate-spin" />
                                        Memuat data...
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="h-24 text-center">
                                    Tidak ada user ditemukan
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredUsers.map((user) => (
                                <TableRow key={user.uid}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar>
                                                <AvatarFallback>{getInitials(user.name, user.nama)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{user.name || user.nama || 'Tanpa Nama'}</div>
                                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="secondary" className={getRoleBadgeColor(user.role)}>
                                            {user.role || 'user'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="sm" asChild>
                                            <a href={`/admin/user/${user.uid}`}>Lihat Absensi</a>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
