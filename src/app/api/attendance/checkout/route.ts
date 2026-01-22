import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyUser } from '@/lib/verifyUser';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req: Request) {
    try {
        // Authenticate the user checking out
        const uid = await verifyUser(req);
        // Typically check-out is done by the user themselves from dashboard

        const { userId } = await req.json();

        // Security check: ensure user is checking out for themselves
        if (userId !== uid) {
            return NextResponse.json({ success: false, message: "Unauthorized action" }, { status: 403 });
        }

        const now = new Date();
        const todayDate = now.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).split('/').reverse().join('-');

        const attendanceRef = adminDb.collection('users').doc(userId).collection('absensi').doc(todayDate);
        const snapshot = await attendanceRef.get();

        if (!snapshot.exists) {
            return NextResponse.json({ success: false, message: "Anda belum check-in hari ini" }, { status: 404 });
        }

        const data = snapshot.data();
        if (data?.pulang) {
            return NextResponse.json({ success: false, message: "Anda sudah check-out hari ini" }, { status: 409 });
        }

        await attendanceRef.update({
            pulang: Timestamp.now(),
            status: 'pulang'
        });

        return NextResponse.json({
            success: true,
            message: "Check-out berhasil"
        });

    } catch (error) {
        console.error("Check-out Error:", error);
        return NextResponse.json(
            { success: false, message: (error as Error).message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
