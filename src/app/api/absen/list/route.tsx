/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')?.toLowerCase() || ''
  const jabatanFilter = searchParams.get('jabatan')?.toLowerCase() || ''

  try {
    const usersSnap = await getDocs(collection(db, 'users'))
    const data: any[] = []

    // Loop setiap user
    for (const userDoc of usersSnap.docs) {
      const user = userDoc.data()
      const uid = userDoc.id

      // Ambil subkoleksi absensi
      const absensiRef = collection(db, 'users', uid, 'absensi')
      const absensiSnap = await getDocs(absensiRef)

      absensiSnap.forEach(absenDoc => {
        const absen = absenDoc.data()

        const nama = user.nama?.toLowerCase() || ''
        const jabatan = user.jabatan?.toLowerCase() || ''
        const matchNama = nama.includes(search)
        const matchJabatan = jabatanFilter ? jabatan === jabatanFilter : true

        if (matchNama && matchJabatan) {
          data.push({
            uid,
            nama: user.nama,
            nim: user.nim || '-',
            jabatan: user.jabatan || '-',
            tanggal: absen.tanggal || absenDoc.id,
            datang: absen.datang?.toDate?.() || null,
            pulang: absen.pulang?.toDate?.() || null,
          })
        }
      })
    }

    return NextResponse.json(data)
  } catch (err) {
    console.error('🔥 Gagal fetch absensi:', err)
    return NextResponse.json({ error: 'Gagal ambil data absensi' }, { status: 500 })
  }
}
