'use client'
import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '@/lib/firebase'
import { doc, getDoc } from 'firebase/firestore'
import { QRCodeSVG } from 'qrcode.react'

type UserData = {
  uid: string
  nama: string
  nim: string
  email: string
  jabatan: string
}

export default function ProfilePage() {
  const [userData, setUserData] = useState<UserData | null>(null)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const ref = doc(db, 'users', user.uid)
        const snap = await getDoc(ref)
        if (snap.exists()) {
          setUserData(snap.data() as UserData)
        }
      }
    })
    return () => unsub()
  }, [])

  if (!userData) return <p>Loading...</p>

  return (
    <div className="p-6 bg-amber-50 text">
      <h1 className="text-xl font-bold mb-2">Profil Pengguna</h1>
      <p><strong>Nama:</strong> {userData.nama}</p>
      <p><strong>NIM:</strong> {userData.nim}</p>
      <p><strong>Email:</strong> {userData.email}</p>
      <p><strong>Jabatan:</strong> {userData.jabatan}</p>

      <div className="mt-4">
        <h3 className="font-semibold">QR Code Anda:</h3>
        <QRCodeSVG value={userData.uid} size={200} />
      </div>
    </div>
  )
}
