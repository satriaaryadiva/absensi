/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { verifyUser } from '@/lib/verifyUser'

export async function GET(req: Request) {
  try {
    await verifyUser(req);

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')?.toLowerCase() || ''
    const jabatanFilter = searchParams.get('jabatan')?.toLowerCase() || ''

    // 1. Get all users
    const usersSnap = await adminDb.collection('users').get();
    const data: any[] = [];

    // 2. Loop through users (Note: for large data, this is inefficient, 
    // but keeping current logic and just switching to Admin SDK for permissions)
    for (const userDoc of usersSnap.docs) {
      const user = userDoc.data();
      const uid = userDoc.id;

      // Filter by user name/jabatan before fetching subcollection if possible to save reads
      const namaMatch = (user.name || user.nama || '').toLowerCase().includes(search);
      const jabatanMatch = jabatanFilter ? (user.jabatan || '').toLowerCase() === jabatanFilter : true;

      if (!namaMatch || !jabatanMatch) continue;

      // 3. Get attendance subcollection
      const absensiSnap = await adminDb.collection('users').doc(uid).collection('absensi').get();

      absensiSnap.forEach(absenDoc => {
        const absen = absenDoc.data();
        data.push({
          uid,
          nama: user.name || user.nama,
          nim: user.nim || '-',
          jabatan: user.jabatan || '-',
          tanggal: absen.date || absenDoc.id,
          datang: absen.datang?.toDate?.() || absen.datang || null,
          pulang: absen.pulang?.toDate?.() || absen.pulang || null,
          status: absen.status || 'hadir'
        });
      });
    }

    // Sort by date desc
    data.sort((a, b) => b.tanggal.localeCompare(a.tanggal));

    return NextResponse.json(data);
  } catch (err) {
    console.error('🔥 Gagal fetch absensi (Admin SDK):', err)
    return NextResponse.json({ error: 'Gagal ambil data absensi' }, { status: 500 })
  }
}
