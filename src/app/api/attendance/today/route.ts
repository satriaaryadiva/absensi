import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyUser } from '@/lib/verifyUser';

export async function GET(req: Request) {
    try {
        await verifyUser(req);

        const { searchParams } = new URL(req.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ success: false, message: "User ID required" }, { status: 400 });
        }

        const now = new Date();
        const todayDate = now.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).split('/').reverse().join('-');

        const doc = await adminDb.collection('users').doc(userId).collection('absensi').doc(todayDate).get();

        if (!doc.exists) {
            return NextResponse.json({ success: true, data: null });
        }

        const data = doc.data();

        // Transform Firestore Timestamps to ISO strings or serializable objects if needed
        // But for internal API usually handled by JSON.stringify but custom types might need help.
        // Let's return raw data, client usually handles parsing.

        // Map to expected structure in frontend `Attendance` type
        const attendanceData = {
            id: doc.id,
            checkIn: data?.datang ? data.datang.toDate() : null,
            checkOut: data?.pulang ? data.pulang.toDate() : null,
            status: data?.status || 'hadir',
            date: todayDate
        };

        return NextResponse.json({
            success: true,
            data: attendanceData
        });

    } catch (error) {
        console.error("Fetch Today Error:", error);
        return NextResponse.json(
            { success: false, message: (error as Error).message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
