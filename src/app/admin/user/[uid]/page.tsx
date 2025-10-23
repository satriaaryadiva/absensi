/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useParams } from 'next/navigation'
import useSWR from 'swr'
import axios from 'axios'
import { useState } from 'react'
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { QRCodeSVG } from 'qrcode.react'

export default function UserDetailPage() {
  const { uid } = useParams()
  const fetcher = (url: string) => axios.get(url).then((res) => res.data)
  const { data, error } = useSWR(`/api/absen/user/${uid}`, fetcher)

  const [filterTanggal, setFilterTanggal] = useState('')
  const [filterBulan, setFilterBulan] = useState('')

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

  if (error) return <div className="text-red-500 p-4">Gagal memuat data</div>
  if (!data) return <div className="p-4">Loading...</div>

  // ✅ Normalisasi data biar aman
  const absensi = (data.absensi || []).map((a: any) => ({
    tanggal: a.tanggal,
    datang: a.datang,
    pulang: a.pulang,
  }))

  // ✅ Filter tanggal & bulan
  const filtered = absensi.filter((item: any) => {
    const date = new Date(item.tanggal)
    if (isNaN(date.getTime())) return false

    const matchTanggal = filterTanggal
      ? safeFormatDate(date, 'yyyy-MM-dd') === filterTanggal
      : true
    const matchBulan = filterBulan
      ? safeFormatDate(date, 'MM') === filterBulan
      : true

    return matchTanggal && matchBulan
  })

  return (
    <div className="max-w-4xl mx-auto p-6 text-black">
      <h1 className="text-2xl font-bold mb-4">👤 Detail Absensi</h1>

      {/* Card Profil */}
      <div className="flex justify-center mb-6">
        <div className="w-72 h-96 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-xl shadow-lg p-5 text-white flex flex-col items-center">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black font-bold text-lg shadow-md mb-3">
            {data.user?.nama?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <h3 className="text-xl font-bold">{data.user?.nama || 'Unknown'}</h3>
          <p className="text-sm opacity-80 mb-4">{data.user?.jabatan || 'Staff'}</p>

          <div className="bg-white p-3 rounded-lg shadow-inner">
            <QRCodeSVG value={uid as string} size={120} />
          </div>

          <p className="mt-3 text-xs opacity-80">UID: {uid}</p>
        </div>
      </div>

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
          <div className="italic text-gray-500">Tidak ada data yang cocok.</div>
        )}

        {filtered.map((item: any, i: number) => (
          <div
            key={i}
            className="border p-4 rounded shadow-sm hover:shadow transition-all bg-white"
          >
            <p className="text-sm text-gray-500 mb-1">
              {safeFormatDate(item.tanggal, 'EEEE, dd MMMM yyyy')}
            </p>
            <div className="flex justify-between text-sm sm:text-base">
              <p>🟢 Datang: {item.datang || '-'}</p>
              <p>🔴 Pulang: {item.pulang || '-'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
