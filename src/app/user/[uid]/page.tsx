/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"
import { app } from "@/lib/firebase"

const db = getFirestore(app)

// Lokasi kantor (Sei Kera Hilir II)
const OFFICE_LOCATION = { lat: 3.376800, lng:98.553037}
const MAX_DISTANCE = 150 // meter

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export default function UserPage() {
  const { uid } = useParams<{ uid: string }>()
  const [status, setStatus] = useState("")
  const [todayCheck, setTodayCheck] = useState<{ in?: string; out?: string }>({})
  const [location, setLocation] = useState("Mendeteksi lokasi...")
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null)

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const fetchAbsensi = async () => {
      const ref = doc(db, "users", uid, "absensi", today)
      const snap = await getDoc(ref)
      if (snap.exists()) setTodayCheck(snap.data() as any)
    }
    fetchAbsensi()
  }, [uid, today])

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation("⚠️ Browser tidak mendukung Geolocation")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        setCoords({ lat: latitude, lon: longitude })

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          )
          const data = await res.json()
          setLocation(data.display_name || "Lokasi tidak ditemukan")
        } catch {
          setLocation(`Koordinat: ${latitude}, ${longitude}`)
        }
      },
      (err) => setLocation("⚠️ Gagal mendapatkan lokasi: " + err.message),
      { enableHighAccuracy: true }
    )
  }, [])

  const handleCheckInOut = async (type: "in" | "out") => {
    if (!coords) {
      setStatus("⚠️ Lokasi belum terdeteksi")
      return
    }

    const distance = getDistance(
      coords.lat,
      coords.lon,
      OFFICE_LOCATION.lat,
      OFFICE_LOCATION.lng
    )

    if (distance > MAX_DISTANCE) {
      setStatus("❌ Anda berada di luar area absensi")
      return
    }

    const now = new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })

    const ref = doc(db, "users", uid, "absensi", today)
    await setDoc(
      ref,
      {
        ...(type === "in" && { in: now }),
        ...(type === "out" && { out: now }),
      },
      { merge: true }
    )

    setTodayCheck((prev) => ({ ...prev, [type]: now }))
    setStatus(`✅ ${type === "in" ? "Check-In" : "Check-Out"} berhasil!`)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-96 space-y-4 text-center">
        <h1 className="text-xl font-bold">📍 Absensi Lokasi</h1>
        <p className="text-gray-600">UID: {uid}</p>
        <p className="text-gray-600">Tanggal: {today}</p>

        <div className="mt-3 p-2 text-black bg-gray-50 rounded text-sm">
          <p><strong>Lokasi Anda:</strong></p>
          <p>{location}</p>
          {coords && (
            <p className="text-gray-500">
              Koordinat: {coords.lat.toFixed(6)}, {coords.lon.toFixed(6)}
            </p>
          )}
        </div>

        {todayCheck.in && <p className="text-green-600">✅ Check-In: {todayCheck.in}</p>}
        {todayCheck.out && <p className="text-red-600">✅ Check-Out: {todayCheck.out}</p>}

        <button
          onClick={() => handleCheckInOut("in")}
          disabled={!!todayCheck.in}
          className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600 disabled:bg-gray-300"
        >
          Check In
        </button>

        <button
          onClick={() => handleCheckInOut("out")}
          disabled={!!todayCheck.out}
          className="w-full bg-red-500 text-white py-2 rounded hover:bg-red-600 disabled:bg-gray-300"
        >
          Check Out
        </button>

        {status && <p className="mt-3 text-sm">{status}</p>}
      </div>
    </div>
  )
}
