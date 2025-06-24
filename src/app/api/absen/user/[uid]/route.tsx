// app/api/absen/user/[uid]/route.ts
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore'

export async function GET(_: Request, { params }: { params: { uid: string } }) {
  try {
    const uid = params.uid
    if (!uid) return NextResponse.json({ error: 'UID tidak ditemukan' }, { status: 400 })

    const absenRef = query(collection(db, 'absensi'), where('uid', '==', uid))
    const snapshot = await getDocs(absenRef)

    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)

    const nama = userSnap.exists() ? userSnap.data().nama : 'Unknown'
    const jabatan = userSnap.exists() ? userSnap.data().jabatan : 'Unknown'

    const data: any[] = []
    snapshot.forEach(doc => {
      const absen = doc.data()
      data.push({
        uid,
        nama,
        jabatan,
        tanggal: absen.tanggal,
        datang: absen.datang?.toDate?.() || null,
        pulang: absen.pulang?.toDate?.() || null,
      })
    })

    return NextResponse.json(data)
  } catch (err) {
    console.error('🔥 Gagal ambil data user:', err)
    return NextResponse.json({ error: 'Gagal ambil data user' }, { status: 500 })
  }
}
