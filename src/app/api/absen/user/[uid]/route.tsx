// ✅ src/app/api/absen/user/[uid]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase' // asumsi lo pakai Firebase
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore'

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.pathname.split('/').pop()

  if (!uid) {
    return NextResponse.json({ error: 'UID tidak ditemukan' }, { status: 400 })
  }

  try {
    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    const absensiRef = collection(db, 'absensi')
    const absensiQuery = query(absensiRef, where('uid', '==', uid))
    const absensiSnap = await getDocs(absensiQuery)

    const absensiData = absensiSnap.docs.map(doc => doc.data())

    return NextResponse.json({
      user: userSnap.data(),
      absensi: absensiData,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
