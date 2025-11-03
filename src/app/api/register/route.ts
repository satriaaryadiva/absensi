/* eslint-disable @typescript-eslint/no-explicit-any */
export const runtime = "nodejs"; // 🧠 pakai runtime Node.js

import { NextResponse } from 'next/server'
import { adminAuth, adminDb } from '@/lib/firebaseAdmin'

export async function POST(req: Request) {
  try {
    const { nama, nim, email, password, jabatan } = await req.json()

    if (!nama || !nim || !email || !password || !jabatan) {
      return NextResponse.json({ error: 'Semua field wajib diisi!' }, { status: 400 })
    }

    // ✅ Buat akun di Firebase Authentication
    const userRecord = await adminAuth.createUser({
      email,
      password,
      displayName: nama,
    })

    // ✅ Simpan data tambahan ke Firestore
    await adminDb.collection('users').doc(userRecord.uid).set({
      uid: userRecord.uid,
      nama,
      nim,
      email,
      jabatan,
      createdAt: new Date().toISOString(),
    })

    return NextResponse.json(
      { message: 'Registrasi berhasil', uid: userRecord.uid },
      { status: 200 }
    )
  } catch (error: any) {
    console.error('🔥 Error register:', error)
    return NextResponse.json(
      { error: error.message || 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
