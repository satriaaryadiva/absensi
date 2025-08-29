import { db } from '@/lib/firebase'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { uid, status } = await req.json()
    const now = new Date()
    const tanggal = now.toISOString().split('T')[0] // Format: 2025-07-25

    if (!uid || !['datang', 'pulang'].includes(status)) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const ref = doc(db, 'absensi', tanggal, 'records', uid)
    const snapshot = await getDoc(ref)

    const data = snapshot.exists() ? snapshot.data() : {}

    // Cegah absen dua kali
    if (status === 'datang' && data.datang) {
      return NextResponse.json({ error: 'Sudah absen datang hari ini' }, { status: 409 })
    }

    if (status === 'pulang' && data.pulang) {
      return NextResponse.json({ error: 'Sudah absen pulang hari ini' }, { status: 409 })
    }

    const updateField = status === 'datang' ? { datang: Timestamp.now() } : { pulang: Timestamp.now() }

    await setDoc(ref, {
      uid,
      ...data,
      ...updateField,
    })

    return NextResponse.json({ message: 'Absen berhasil' })
  } catch (err) {
    console.error('🔥 Gagal absen:', err)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
