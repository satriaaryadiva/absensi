import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyUser } from '@/lib/verifyUser';
import { Timestamp } from 'firebase-admin/firestore';

export async function POST(req: Request) {
    try {
        // Authenticate the scanner (admin/staff)
        await verifyUser(req);

        const { userId, qrCode } = await req.json();

        if (!userId || !qrCode) {
            return NextResponse.json({ success: false, message: "Data tidak lengkap" }, { status: 400 });
        }

        const now = new Date();
        const todayDate = now.toLocaleDateString('id-ID', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        }).split('/').reverse().join('-'); // Format: YYYY-MM-DD

        // Correct path: absensi/{date}/records/{userId}
        // Matching the structure used in other parts if any, or defining a standard here.
        // Based on `src/app/api/absen/route.ts` it uses `absensi/{date}/records/{uid}`
        const attendanceRef = adminDb.collection('absensi').doc(todayDate).collection('records').doc(userId);

        const snapshot = await attendanceRef.get();

        if (snapshot.exists) {
            const data = snapshot.data();
            if (data?.datang) {
                return NextResponse.json({ success: false, message: "User sudah check-in hari ini" }, { status: 409 });
            }
        }

        // Get user details for denormalization if needed
        const userDoc = await adminDb.collection('users').doc(userId).get();
        const userData = userDoc.data();

        await attendanceRef.set({
            uid: userId,
            name: userData?.name || userData?.nama || 'Unknown',
            datang: Timestamp.now(),
            qrCodeVal: qrCode,
            status: 'hadir', // default status
            role: userData?.role || 'user'
        }, { merge: true });

        // Force expiration of the used QR code to prevent reuse? 
        // Logic says "diperbarui setiap hari", so maybe we don't strictly expire it immediately, 
        // but for security it's good practice. However, user requirements didn't specify single-use.
        // Let's keep it simple.

        return NextResponse.json({
            success: true,
            message: "Check-in berhasil"
        });

    } catch (error) {
        console.error("Check-in Error:", error);
        return NextResponse.json(
            { success: false, message: (error as Error).message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
