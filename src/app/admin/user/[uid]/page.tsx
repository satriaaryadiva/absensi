/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import axios from 'axios'
import { useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale/id'

export default function UserDetailPage() {
  const { uid } = useParams()
  const fetcher = (url: string) => axios.get(url).then(res => res.data)
  const { data, error } = useSWR(`/api/absen/user/${uid}`, fetcher)

  const [filterTanggal, setFilterTanggal] = useState('')
  const [filterBulan, setFilterBulan] = useState('')

  // ✅ Helper aman untuk format tanggal
  const safeFormatDate = (value: any, formatStr: string): string => {
    try {
      if (!value) return '-'
      const date = typeof value.toDate === 'function' ? value.toDate() : new Date(value)
      if (isNaN(date.getTime())) return '-'
      return format(date, formatStr, { locale: id })
    } catch {
      return '-'
    }
  }

  if (error) return <div className="text-red-500 p-4">Gagal memuat data</div>
  if (!data) return <div className="p-4">Loading...</div>

  const filtered = data.absensi.filter((item: any) => {
    const tanggal = item.tanggal?.toDate?.() ?? new Date(item.tanggal)
    if (isNaN(tanggal.getTime())) return false

    const matchTanggal = filterTanggal
      ? safeFormatDate(tanggal, 'yyyy-MM-dd') === filterTanggal
      : true
    const matchBulan = filterBulan
      ? safeFormatDate(tanggal, 'MM') === filterBulan
      : true

    return matchTanggal && matchBulan
  })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">👤 Detail Absensi</h1>
      <p className="text-gray-black mb-4">
        <span className="font-semibold">Nama:</span> {data.user?.nama || 'Unknown'} <br />
        <span className="font-semibold">Jabatan:</span> {data.user?.jabatan || 'Unknown'}
      </p>

      {/* Filter */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="date"
          value={filterTanggal}
          onChange={(e) => setFilterTanggal(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-auto"
        />
        <select
          value={filterBulan}
          onChange={(e) => setFilterBulan(e.target.value)}
          className="border px-3 py-2 rounded w-full sm:w-auto"
        >
          <option value="">Semua Bulan</option>
          {Array.from({ length: 12 }, (_, i) => {
            const value = (i + 1).toString().padStart(2, '0')
            return (
              <option key={value} value={value}>
                {safeFormatDate(new Date(2025, i), 'MMMM')}
              </option>
            )
          })}
        </select>
      </div>

      {/* List Absensi */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="text-black italic">Tidak ada data yang cocok.</div>
        )}

        {filtered.map((item: any, i: number) => (
          <div key={i} className="border p-4 rounded shadow-sm hover:shadow transition-all">
            <p className="text-sm text-gray-500 mb-1">
              {safeFormatDate(item.tanggal, 'EEEE, dd MMMM yyyy')}
            </p>
            <div className="flex justify-between text-sm sm:text-base">
              <p>🟢 Datang: {safeFormatDate(item.datang, 'HH:mm')}</p>
              <p>🔴 Pulang: {safeFormatDate(item.pulang, 'HH:mm')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
