/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import useSWR from 'swr'
import axios from 'axios'

export default function AdminDashboard() {
  const fetcher = (url: string) => axios.get(url).then(res => res.data)
  const { data, error } = useSWR('/api/absen/list', fetcher, {
    refreshInterval: 10000, // auto-refresh tiap 10 detik
  })

  if (error) return <div className="text-red-500">Gagal memuat data</div>
  if (!data) return <div>Loading...</div>

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">📊 Dashboard Absensi</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {/* Contoh statistik ringkas */}
        <StatCard title="Total Absen" value={data.length} color="bg-blue-500" />
        <StatCard title="Hadir Hari Ini" value={countToday(data)} color="bg-green-500" />
        <StatCard title="Belum Pulang" value={countBelumPulang(data)} color="bg-yellow-500" />
        <StatCard title="Total Siswa" value="???" color="bg-purple-500" />
      </div>

      <table className="w-full text-sm border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 text-left">Nama</th>
            <th className="p-2 text-left">Jabatan</th>
            <th className="p-2">Datang</th>
            <th className="p-2">Pulang</th>
          </tr>
        </thead>
        <tbody>
          {data.map((absen: any, i: number) => (
            <tr key={i} className="border-t border-gray-200 hover:bg-gray-50">
              <td className="p-2">{absen.nama}</td>
              <td className="p-2">{absen.jabatan}</td>
              <td className="p-2 text-center text-green-700">
                {formatTime(absen.datang)}
              </td>
              <td className="p-2 text-center text-blue-700">
                {absen.pulang ? formatTime(absen.pulang) : <span className="text-red-500">-</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

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

function formatTime(time: any) {
  if (!time) return '-'
  return new Date(time).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit'
  })
}
