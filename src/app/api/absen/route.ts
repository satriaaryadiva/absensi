import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/firebase'
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from 'firebase/firestore'
import dayjs from 'dayjs'

type userData = {
  nama: string
  jabatan: string
}

export async function POST(req: NextRequest) {
  try {
    const { uid } = await req.json()
    if (!uid) {
      return NextResponse.json({ error: 'UID diperlukan' }, { status: 400 })
    }

    const today = dayjs().format('YYYY-MM-DD')
    const absenId = `${uid}_${today}`
    const absenRef = doc(db, 'absensi', absenId)
    const absenSnap = await getDoc(absenRef)

    const userRef = doc(db, 'users', uid)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
    }

    const userData = userSnap.data() as userData

    if (!absenSnap.exists()) {
      await setDoc(absenRef, {
        uid,
        tanggal: today,
        datang: serverTimestamp(),
      })

      return NextResponse.json({
        status: 'success',
        message: 'Absen datang dicatat',
        user: {
          nama: userData.nama,
          jabatan: userData.jabatan,
        },
        datang: new Date().toISOString(),
      })
    }

    const absenData = absenSnap.data()

    if (!absenData.pulang) {
      await updateDoc(absenRef, {
        pulang: serverTimestamp(),
      })

      return NextResponse.json({
        status: 'success',
        message: 'Absen pulang dicatat',
        user: {
          nama: userData.nama,
          jabatan: userData.jabatan,
        },
        datang: absenData?.datang?.toDate?.() instanceof Date
          ? absenData.datang.toDate().toISOString()
          : null,
        pulang: new Date().toISOString(),
      })
    }

    return NextResponse.json({
      status: 'done',
      message: 'Sudah absen lengkap hari ini',
      user: {
        nama: userData.nama,
        jabatan: userData.jabatan,
      },
      datang: absenData?.datang?.toDate?.() instanceof Date
        ? absenData.datang.toDate().toISOString()
        : null,
      pulang: absenData?.pulang?.toDate?.() instanceof Date
        ? absenData.pulang.toDate().toISOString()
        : null,
    })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 })
  }
}
