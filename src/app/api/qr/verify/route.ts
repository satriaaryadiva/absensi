import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyUser } from '@/lib/verifyUser';

export async function POST(req: Request) {
    try {
        // Only admins or authorized staff should be able to verify QRs?
        // For now, let's allow any authenticated user (e.g. creating a generic scanner for staff)
        // or strictly check for 'admin'/'guru' role if we had that info in the token claim.
        // verifyUser only returns UID. We'd need to fetch the caller's role to be strict.
        // For MVP, just authenticated access is better than public.
        await verifyUser(req);

        const body = await req.json();
        const { qrCode } = body;

        if (!qrCode) {
            return NextResponse.json({ error: "QR Code is required" }, { status: 400 });
        }

        // Find user with this QR code
        // Optimization: Depending on scale, this query might be slow without an index on 'currentQrCode'.
        // ideally currentQrCode should be indexed.
        const usersRef = adminDb.collection('users');
        const snapshot = await usersRef.where('currentQrCode', '==', qrCode).limit(1).get();

        if (snapshot.empty) {
            return NextResponse.json({ valid: false, message: "QR Code tidak ditemukan" }, { status: 404 });
        }

        const userDoc = snapshot.docs[0];
        const userData = userDoc.data();

        // Check expiration
        const now = Date.now();
        if (userData.qrExpiresAt && now > userData.qrExpiresAt) {
            return NextResponse.json({ valid: false, message: "QR Code kedaluwarsa" }, { status: 400 });
        }

        return NextResponse.json({
            valid: true,
            user: {
                uid: userDoc.id,
                name: userData.name || userData.nama,
                role: userData.role,
                nim: userData.nim,
                jabatan: userData.jabatan
            }
        });

    } catch (error) {
        console.error("Verify QR Error:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Internal Server Error" },
            { status: 401 } // 401 often returned by verifyUser
        );
    }
}
