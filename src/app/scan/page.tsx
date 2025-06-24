/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import {   useState } from 'react'
import QrScanner from '@/components/QrScanner'
import axios from 'axios'
import toast from 'react-hot-toast'

export default function ScanPage() {
  const [detail, setDetail] = useState<null | {
    nama: string
    jabatan: string
    datang: string
    pulang?: string
  }>(null)

  const formatTime = (time: any) => {
    try {
      if (!time) return undefined
      const parsed = new Date(time)
      return isNaN(parsed.getTime())
        ? undefined
        : parsed.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          })
    } catch {
      return undefined
    }
  }

  const handleScan = async (uid: string) => {
    const loading = toast.loading('Mencatat absensi...')
    try {
      const res = await axios.post('/api/absen', { uid })

      const { user, datang, pulang } = res.data

      setDetail({
        nama: user.nama,
        jabatan: user.jabatan,
        datang: formatTime(datang) || 'Waktu tidak valid',
        pulang: formatTime(pulang),
      })

      toast.success(`✅ ${user.nama} berhasil absen`, { id: loading })
    } catch (err: any) {
      console.error(err)
      toast.error(err.response?.data?.error || '❌ Gagal mencatat absensi.', { id: loading })
      setDetail(null)
    }
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h1 className="text-xl font-bold mb-4">Scan QR</h1>
      <QrScanner onScan={handleScan} />

      {detail && (
        <div className="mt-4 p-4 bg-green-100  text-black rounded border">
          <p><strong>Nama:</strong> {detail.nama}</p>
          <p><strong>Jabatan:</strong> {detail.jabatan}</p>
          <p>
            <strong>Waktu Absen:</strong> Datang: {detail.datang}
            {detail.pulang && ` — Pulang: ${detail.pulang}`}
          </p>
        </div>
      )}
    </div>
  )
}
