/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import { useSearchParams, useParams } from 'next/navigation'
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

  if (error) return <div className="text-red-500 p-4">Gagal memuat data</div>
  if (!data) return <div className="p-4">Loading...</div>

  const filtered = data.filter((item: any) => {
    const tanggal = new Date(item.tanggal)
    const matchTanggal = filterTanggal ? format(tanggal, 'yyyy-MM-dd') === filterTanggal : true
    const matchBulan = filterBulan ? format(tanggal, 'MM') === filterBulan : true
    return matchTanggal && matchBulan
  })

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-2">👤 Detail Absensi</h1>
      <p className="text-gray-black mb-4">
        <span className="font-semibold">Nama:</span> {data[0]?.nama || 'Unknown'} <br />
        <span className="font-semibold">Jabatan:</span> {data[0]?.jabatan || 'Unknown'}
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
                {format(new Date(2025, i), 'MMMM', { locale: id })}
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
          <div key={i} className="border p-4 rounded shadow-sm hover:shadow transition-all  ">
            <p className="text-sm text-gray-500 mb-1">
              {format(new Date(item.tanggal), 'EEEE, dd MMMM yyyy', { locale: id })}
            </p>
            <div className="flex justify-between text-sm sm:text-base">
              <p>🟢 Datang: {item.datang ? format(new Date(item.datang), 'HH:mm') : '-'}</p>
              <p>🔴 Pulang: {item.pulang ? format(new Date(item.pulang), 'HH:mm') : '-'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
