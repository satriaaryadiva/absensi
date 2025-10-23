import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { doc, getDoc, collection, getDocs } from 'firebase/firestore'

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.pathname.split('/').pop()

  if (!uid) {
    return NextResponse.json({ error: 'UID tidak ditemukan' }, { status: 400 })
  }

  try {
    // 🔹 Ambil data user
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    // 🔹 Ambil subkoleksi absensi
    const absensiRef = collection(db, 'users', uid, 'absensi')
    const absensiSnap = await getDocs(absensiRef)

    // 🔹 Normalisasi data
    const absensiData = absensiSnap.docs.map((d) => {
      const data = d.data()
      return {
        id: d.id,
        tanggal: d.id || data.tanggal || null,
        datang: data.datang || data.in || null,
        pulang: data.pulang || data.out || null,
      }
    })

    return NextResponse.json({
      user: { id: uid, ...userSnap.data() },
      absensi: absensiData,
    })
  } catch (error) {
    console.error('🔥 Error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
