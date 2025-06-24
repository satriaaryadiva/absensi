/* eslint-disable @typescript-eslint/no-explicit-any */
// components/AbsensiChart.tsx
'use client'

import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js'
import { useMemo } from 'react'

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend)

export default function AbsensiChart({ data }: { data: any[] }) {
  const dailyCount = useMemo(() => {
    const countMap: Record<string, number> = {}

    data.forEach((entry) => {
     if (!entry.tanggal?.seconds) return
const tanggal = new Date(entry.tanggal.seconds * 1000)
  .toISOString()
  .split('T')[0]
      countMap[tanggal] = (countMap[tanggal] || 0) + 1
    })

    const labels = Object.keys(countMap).sort()
    const counts = labels.map((label) => countMap[label])

    return {
      labels,
      datasets: [
        {
          label: 'Jumlah Absen',
          data: counts,
          backgroundColor: '#3b82f6'
        }
      ]
    }
  }, [data])

  return (
    <div className="mt-6">
      <h2 className="font-semibold mb-2">Statistik Kehadiran</h2>
      <Bar data={dailyCount} className='w-full bg-white texb-black' />
    </div>
  )
}
