import { NextRequest, NextResponse } from 'next/server';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // pastikan ini export Firestore instance

export async function GET(req: NextRequest, { params }: { params: { tanggal: string } }) {
  const { tanggal } = params;

  try {
    const ref = collection(db, `absensi/${tanggal}/records`);
    const snapshot = await getDocs(ref);

    const data = snapshot.docs.map(doc => ({
      uid: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('🔥 Gagal fetch absensi:', error);
    return NextResponse.json({ success: false, error: 'Gagal ambil data absensi' }, { status: 500 });
  }
}
