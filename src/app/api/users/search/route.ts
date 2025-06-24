/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import { collection, getDocs, } from 'firebase/firestore'

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams.get('q')?.toLowerCase() || ''

  try {
    const snapshot = await getDocs(collection(db, 'users'))

    const filtered = snapshot.docs
      .map(doc => ({
        uid: doc.id,
        nama: doc.data().nama,
      }))
      .filter(user => user.nama.toLowerCase().includes(search))

    return NextResponse.json(filtered)
  } catch (error) {
    return NextResponse.json({ error: 'Gagal mengambil data user' }, { status: 500 })
  }
}
