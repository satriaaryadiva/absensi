/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'
import Link from 'next/link'
import useSWR from 'swr'
import axios from 'axios'
import { useState } from 'react'

export default function AdminDashboard() {
  const fetcher = (url: string) => axios.get(url).then(res => res.data)
  const { data, error } = useSWR('/api/absen/list', fetcher, {
    refreshInterval: 10000,
  })

  const [search, setSearch] = useState('')
  const [filterJabatan, setFilterJabatan] = useState('')

  if (error) return <div className="text-red-500">Gagal memuat data</div>
  if (!data) return <div>Loading...</div>

  const filtered = data.filter((item: any) => {
    const matchNama = item.nama.toLowerCase().includes(search.toLowerCase())
    const matchJabatan = filterJabatan ? item.jabatan === filterJabatan : true
    return matchNama && matchJabatan
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📊 Dashboard Absensi</h1>

      {/* Filter */}
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

      {/* Statistik */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard title="Total Absen" value={filtered.length} color="bg-blue-500" />
        <StatCard title="Hadir Hari Ini" value={countToday(filtered)} color="bg-green-500" />
        <StatCard title="Belum Pulang" value={countBelumPulang(filtered)} color="bg-yellow-500" />
        <StatCard title="Total Data" value={data.length} color="bg-purple-500" />
      </div>

      {/* List Absen */}
      <div className="grid gap-4">
        {filtered.map((absen: any, i: number) => (
          <Link key={i} href={`/admin/user/${absen.uid}`} target="_blank">
            <div className="border rounded-md p-4 shadow hover:bg-gray-50 cursor-pointer transition">
              <h3 className="text-lg font-semibold text-blue-700 underline">{absen.nama}</h3>
              <p className="text-sm text-gray-700">Jabatan: {absen.jabatan}</p>
              <p className="text-sm text-gray-700">NIM: {absen.nim ?? '-'}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

// StatCard & utils
function StatCard({ title, value, color }: { title: string, value: any, color: string }) {
  return (
    <div className={`p-4 text-white rounded ${color}`}>
      <h2 className="text-sm">{title}</h2>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

function countToday(data: any[]) {
  const today = new Date().toDateString()
  return data.filter(item => new Date(item.tanggal).toDateString() === today).length
}

function countBelumPulang(data: any[]) {
  return data.filter(item => !item.pulang).length
}
