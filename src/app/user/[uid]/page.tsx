/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore"
import { app } from "@/lib/firebase"

const db = getFirestore(app)

// Lokasi kantor contoh
const OFFICE_LOCATION = { lat: 3.6021, lng: 98.7042 } // Ganti dengan lokasi kamu
const MAX_DISTANCE = 200 // meter

function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371e3
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) *
      Math.cos(φ2) *
      Math.sin(Δλ / 2) *
      Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // meter
}

export default function UserPage() {
  const { uid } = useParams<{ uid: string }>()
  const [locationAllowed, setLocationAllowed] = useState(false)
  const [status, setStatus] = useState("")
  const [todayCheck, setTodayCheck] = useState<{ in?: string; out?: string }>({})

  const today = new Date().toISOString().split("T")[0]

  useEffect(() => {
    const fetchAbsensi = async () => {
      const ref = doc(db, "users", uid, "absensi", today)
      const snap = await getDoc(ref)
      if (snap.exists()) {
        setTodayCheck(snap.data() as any)
      }
    }
    fetchAbsensi()
  }, [uid, today])

  const handleCheckInOut = async (type: "in" | "out") => {
    if (!navigator.geolocation) {
      setStatus("Geolocation tidak didukung")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        const distance = getDistance(
          latitude,
          longitude,
          OFFICE_LOCATION.lat,
          OFFICE_LOCATION.lng
        )

        if (distance > MAX_DISTANCE) {
          setStatus("❌ Anda berada di luar lokasi absensi")
          return
        }

        const now = new Date().toLocaleTimeString()
        const ref = doc(db, "users", uid, "absensi", today)

        await setDoc(
          ref,
          {
            ...(type === "in" && { in: now }),
            ...(type === "out" && { out: now }),
          },
          { merge: true }
        )

        setStatus(`✅ ${type === "in" ? "Check-In" : "Check-Out"} berhasil`)
        setTodayCheck((prev) => ({ ...prev, [type]: now }))
      },
      () => setStatus("Gagal mendapatkan lokasi")
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white p-6 rounded shadow w-96 space-y-4 text-center">
        <h1 className="text-xl font-bold">Absensi</h1>
        <p>UID: {uid}</p>
        <p>Hari ini: {today}</p>

        {todayCheck.in && <p>✅ Check-In: {todayCheck.in}</p>}
        {todayCheck.out && <p>✅ Check-Out: {todayCheck.out}</p>}

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

        {status && <p className="mt-3">{status}</p>}
      </div>
    </div>
  )
}
