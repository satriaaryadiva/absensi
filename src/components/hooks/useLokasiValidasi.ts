// hooks/useLokasiValidasi.ts
import { useState } from 'react'

const kantorLat = -6.200000 // ubah ke lokasi kantor kamu
const kantorLng = 106.816666
const maxDistance = 100 // dalam meter

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3 // radius bumi (meter)
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) ** 2 +
    Math.cos(φ1) * Math.cos(φ2) *
    Math.sin(Δλ / 2) ** 2
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export function useLokasiValidasi() {
  const [loading, setLoading] = useState(false)
  const [jarak, setJarak] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  const cekLokasi = (): Promise<{ valid: boolean; jarak: number | null }> =>
    new Promise((resolve) => {
      setLoading(true)
      setError(null)

      if (!navigator.geolocation) {
        setError('Geolocation tidak didukung')
        resolve({ valid: false, jarak: null })
        return
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          const dist = getDistance(latitude, longitude, kantorLat, kantorLng)
          const isValid = dist <= maxDistance

          setJarak(dist)
          setLoading(false)
          resolve({ valid: isValid, jarak: dist })
        },
        (err) => {
          setError('Gagal mendapatkan lokasi')
          console.error(err)
          setLoading(false)
          resolve({ valid: false, jarak: null })
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      )
    })

  return { cekLokasi, loading, jarak, error }
}
