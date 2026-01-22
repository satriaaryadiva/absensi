/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import axios from 'axios'
import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { QRCodeSVG } from 'qrcode.react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, Clock, TrendingUp, User, Loader2 } from 'lucide-react'

interface AttendanceRecord {
  tanggal: string | null;
  datang: string | null;
  pulang: string | null;
  status: string;
}

export default function UserDetailPage() {
  const { uid } = useParams()
  const fetcher = (url: string) => axios.get(url).then((res) => res.data)
  const { data, error } = useSWR(`/api/absen/user/${uid}`, fetcher)

  const [filterBulan, setFilterBulan] = useState('all')

  const safeFormatDate = (value: any, formatStr: string): string => {
    try {
      if (!value) return '-'
      const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
      if (isNaN(date.getTime())) return '-'
      return format(date, formatStr, { locale: localeId })
    } catch {
      return '-'
    }
  }

  const safeFormatTime = (value: any): string => {
    try {
      if (!value) return '-'
      const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
      if (isNaN(date.getTime())) return '-'
      return format(date, 'HH:mm', { locale: localeId })
    } catch {
      return '-'
    }
  }

  // Normalize and filter data
  const absensi = useMemo<AttendanceRecord[]>(() => {
    if (!data?.absensi) return []
    return (data.absensi || []).map((a: any) => ({
      tanggal: a.tanggal || a.id,
      datang: a.datang,
      pulang: a.pulang,
      status: a.status || 'hadir'
    }))
  }, [data])

  const filtered = useMemo(() => {
    return absensi.filter((item) => {
      const date = new Date(item.tanggal || '')
      if (isNaN(date.getTime())) return false

      const matchBulan = filterBulan !== 'all'
        ? safeFormatDate(date, 'MM') === filterBulan
        : true

      return matchBulan
    })
  }, [absensi, filterBulan])

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filtered.length
    const hadir = filtered.filter(a => a.status === 'hadir' || a.datang).length
    const terlambat = filtered.filter(a => {
      if (!a.datang) return false
      const time = safeFormatTime(a.datang)
      if (time === '-') return false
      const [hour] = time.split(':').map(Number)
      return hour >= 8 // Assuming 08:00 is the cutoff
    }).length

    return { total, hadir, terlambat }
  }, [filtered])

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <Card className="w-96">
          <CardContent className="pt-6">
            <p className="text-center text-destructive">Gagal memuat data</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memuat data...</p>
        </div>
      </div>
    )
  }

  const userName = data.user?.name || data.user?.nama || 'Unknown'
  const userRole = data.user?.role || data.user?.jabatan || 'User'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Detail Absensi</h1>
        <p className="text-muted-foreground">Riwayat kehadiran pengguna</p>
      </div>

      {/* Profile Card */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Avatar & QR */}
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-24 w-24 ring-4 ring-primary/10">
                <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
                  {userName.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="bg-card border rounded-lg p-3">
                <QRCodeSVG value={uid as string} size={120} />
              </div>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-2xl font-bold">{userName}</h2>
              <Badge variant="secondary" className="mt-2">
                <User className="mr-1 h-3 w-3" />
                {userRole}
              </Badge>
              <p className="text-sm text-muted-foreground mt-4">UID: {uid}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Kehadiran</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Hari</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hadir</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.hadir}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? `${Math.round((stats.hadir / stats.total) * 100)}%` : '0%'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Terlambat</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.terlambat}</div>
            <p className="text-xs text-muted-foreground">Kali</p>
          </CardContent>
        </Card>
      </div>

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Absensi</CardTitle>
          <CardDescription>Filter berdasarkan bulan</CardDescription>
        </CardHeader>
        <CardContent>
          <Select value={filterBulan} onValueChange={setFilterBulan}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Semua Bulan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Bulan</SelectItem>
              {Array.from({ length: 12 }, (_, i) => {
                const value = (i + 1).toString().padStart(2, '0')
                return (
                  <SelectItem key={value} value={value}>
                    {safeFormatDate(new Date(2025, i), 'MMMM')}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardContent className="pt-6">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              Tidak ada data absensi yang cocok dengan filter.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Datang</TableHead>
                  <TableHead>Pulang</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item, i) => (
                  <TableRow key={i}>
                    <TableCell className="font-medium">
                      {safeFormatDate(item.tanggal, 'EEEE, dd MMMM yyyy')}
                    </TableCell>
                    <TableCell>{safeFormatTime(item.datang)}</TableCell>
                    <TableCell>{safeFormatTime(item.pulang)}</TableCell>
                    <TableCell>
                      <Badge variant={item.status === 'hadir' ? 'default' : 'secondary'}>
                        {item.status || 'hadir'}
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
  )
}
