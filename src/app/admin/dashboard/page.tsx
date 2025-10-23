/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import Link from 'next/link'
import useSWR from 'swr'
import axios from 'axios'
import { useState } from 'react'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export default function AdminDashboard() {
  const fetcher = (url: string) => axios.get(url).then(res => res.data)
  const { data, error } = useSWR('/api/absen/list', fetcher, {
    refreshInterval: 10000, // auto refresh tiap 10 detik
  })

  const [search, setSearch] = useState('')
  const [filterJabatan, setFilterJabatan] = useState('')

  if (error) return <div className="text-red-500 p-4">❌ Gagal memuat data</div>
  if (!data) return <div className="p-4">⏳ Loading...</div>

  // ✅ Pastikan data aman (ada nama, jabatan, tanggal, dll)
  const filtered = data.filter((item: any) => {
    const nama = item.nama?.toLowerCase?.() ?? ''
    const jabatan = item.jabatan ?? ''
    const matchNama = nama.includes(search.toLowerCase())
    const matchJabatan = filterJabatan ? jabatan === filterJabatan : true
    return matchNama && matchJabatan
  })

  // ✅ Statistik
  const totalAbsen = filtered.length
  const hadirHariIni = countToday(filtered)
  const belumPulang = countBelumPulang(filtered)
  const totalData = data.length

  return (
    <div className="p-6 max-w-6xl mx-auto text-black">
      <h1 className="text-2xl font-bold mb-4">📊 Dashboard Absensi</h1>

      {/* 🔎 Filter */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Cari nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/3"
        />
        <select
          value={filterJabatan}
          onChange={(e) => setFilterJabatan(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/4"
        >
          <option value="">Semua Jabatan</option>
          <option value="murid">Murid</option>
          <option value="guru">Guru</option>
          <option value="staf">Staf</option>
        </select>
      </div>

      {/* 📈 Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Absen" value={totalAbsen} color="bg-blue-500" />
        <StatCard title="Hadir Hari Ini" value={hadirHariIni} color="bg-green-500" />
        <StatCard title="Belum Pulang" value={belumPulang} color="bg-yellow-500" />
        <StatCard title="Total Data" value={totalData} color="bg-purple-500" />
      </div>

      {/* 📋 List Absen */}
      <div className="grid gap-4">
        {filtered.length === 0 ? (
          <div className="italic text-gray-500">Tidak ada data cocok.</div>
        ) : (
          filtered.map((absen: any, i: number) => (
            <Link key={i} href={`/admin/user/${absen.uid}`} target="_blank">
              <div className="border rounded-md p-4 shadow hover:bg-gray-50 cursor-pointer transition">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold text-blue-700 underline">
                      {absen.nama}
                    </h3>
                    <p className="text-sm text-gray-700">Jabatan: {absen.jabatan}</p>
                    <p className="text-sm text-gray-700">NIM: {absen.nim ?? '-'}</p>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>{formatDate(absen.tanggal)}</p>
                    <p>{absen.datang ? `🟢 ${absen.datang}` : 'Belum Datang'}</p>
                    <p>{absen.pulang ? `🔴 ${absen.pulang}` : 'Belum Pulang'}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}

/* =====================
   🔹 Komponen & Utils 🔹
===================== */

function StatCard({
  title,
  value,
  color,
}: {
  title: string
  value: any
  color: string
}) {
  return (
    <div className={`p-4 text-white rounded ${color}`}>
      <h2 className="text-sm">{title}</h2>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function formatDate(date: any) {
  try {
    if (!date) return '-'
    const d = typeof date.toDate === 'function' ? date.toDate() : new Date(date)
    return format(d, 'dd MMM yyyy', { locale: id })
  } catch {
    return '-'
  }
}

function countToday(data: any[]) {
  const today = new Date().toDateString()
  return data.filter(item => {
    const tanggal = new Date(item.tanggal).toDateString()
    return tanggal === today
  }).length
}

function countBelumPulang(data: any[]) {
  return data.filter(item => !item.pulang).length
}
