import { NextRequest, NextResponse } from 'next/server'
import { adminDb } from '@/lib/firebaseAdmin'
import { verifyUser } from '@/lib/verifyUser'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ uid: string }> }
) {
    try {
        // 🔹 Authenticate the request
        await verifyUser(request);

        const { uid } = await params;

        if (!uid || uid === 'undefined') {
            return NextResponse.json({ error: 'UID tidak valid' }, { status: 400 })
        }

        // 🔹 Fetch user data using Admin SDK
        const userSnap = await adminDb.collection('users').doc(uid).get()

        if (!userSnap.exists) {
            return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 })
        }

        // 🔹 Fetch attendance subcollection using Admin SDK
        const absensiSnap = await adminDb.collection('users').doc(uid).collection('absensi').get()

        // 🔹 Normalize data
        const absensiData = absensiSnap.docs.map((d) => {
            const data = d.data()
            return {
                id: d.id,
                tanggal: d.id || data.tanggal || data.date || null,
                datang: data.datang?.toDate?.() || data.datang || null,
                pulang: data.pulang?.toDate?.() || data.pulang || null,
                status: data.status || 'hadir'
            }
        })

        // Sort by date descending
        absensiData.sort((a, b) => b.id.localeCompare(a.id));

        return NextResponse.json({
            success: true,
            user: { uid: uid, ...userSnap.data() },
            absensi: absensiData,
        })
    } catch (error) {
        console.error('🔥 User Details API Error:', error)
        return NextResponse.json({
            success: false,
            error: 'Terjadi kesalahan server',
            message: (error as Error).message
        }, { status: 500 })
    }
}
