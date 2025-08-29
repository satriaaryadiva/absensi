 
import { NextResponse } from 'next/server'
import { collection, getDocs, } from 'firebase/firestore'
import { db } from '@/lib/firebase'
// export async function GET() {
//   try {
//     const snapshot = await getDocs(collection(db, 'absensi'))
//     const data: any[] = []

//     for (const docSnap of snapshot.docs) {
//       const absen = docSnap.data()

//       if (!absen?.uid) continue // Skip jika uid tidak valid

//       const userRef = doc(db, 'users', absen.uid)
//       const userSnap = await getDoc(userRef)

//       data.push({
//         uid: absen.uid,
//         nama: userSnap.exists() ? userSnap.data().nama : 'Unknown',
//         jabatan: userSnap.exists() ? userSnap.data().jabatan : 'Unknown',
//         tanggal: absen.tanggal,
//         datang: absen.datang?.toDate?.() || null,
//         pulang: absen.pulang?.toDate?.() || null,
//       })
//     }

//     return NextResponse.json(data)
//   } catch (err) {
//     console.error('🔥 Gagal fetch absensi:', err)
//     return NextResponse.json({ error: 'Gagal ambil data absensi' }, { status: 500 })
//   }
// }


/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search')?.toLowerCase() || ''
  const jabatanFilter = searchParams.get('jabatan')?.toLowerCase() || ''

  try {
    // 1. Ambil semua user, simpan ke Map biar efisien
    const usersSnap = await getDocs(collection(db, 'users'))
    const userMap = new Map<string, any>()
    usersSnap.forEach(doc => {
      const data = doc.data()
      userMap.set(doc.id, {
        nama: data.nama,
        nim: data.nim || '-',
        jabatan: data.jabatan || '-',
      })
    })

    // 2. Ambil semua absensi
    const absenSnap = await getDocs(collection(db, 'absensi'))
    const data: any[] = []

    for (const doc of absenSnap.docs) {
      const absen = doc.data()
      const user = userMap.get(absen.uid)
      if (!user) continue

      const nama = user.nama.toLowerCase()
      const jabatan = user.jabatan.toLowerCase()

      const matchNama = nama.includes(search)
      const matchJabatan = jabatanFilter ? jabatan === jabatanFilter : true

      if (!(matchNama && matchJabatan)) continue

      data.push({
        uid: absen.uid,
        nama: user.nama,
        nim: user.nim,
        jabatan: user.jabatan,
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
