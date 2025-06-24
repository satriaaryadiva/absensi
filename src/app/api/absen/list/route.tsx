/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { collection, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
export async function GET() {
  try {
    const snapshot = await getDocs(collection(db, 'absensi'))
    const data: any[] = []

    for (const docSnap of snapshot.docs) {
      const absen = docSnap.data()

      if (!absen?.uid) continue // Skip jika uid tidak valid

      const userRef = doc(db, 'users', absen.uid)
      const userSnap = await getDoc(userRef)

      data.push({
        uid: absen.uid,
        nama: userSnap.exists() ? userSnap.data().nama : 'Unknown',
        jabatan: userSnap.exists() ? userSnap.data().jabatan : 'Unknown',
        tanggal: absen.tanggal,
        datang: absen.datang?.toDate?.() || null,
        pulang: absen.pulang?.toDate?.() || null,
      })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('🔥 Gagal fetch absensi:', err)
    return NextResponse.json({ error: 'Gagal ambil data absensi' }, { status: 500 })
  }
}

