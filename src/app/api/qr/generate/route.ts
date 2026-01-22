import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyUser } from '@/lib/verifyUser';
import { randomBytes } from 'crypto';

export async function POST(req: Request) {
    try {
        const uid = await verifyUser(req);

        // Generate a secure random token
        const token = randomBytes(32).toString('hex');
        const timestamp = Date.now();
        const qrCode = `${token}.${timestamp}`;

        // Calculate expiration (e.g., 24 hours, since user said "diperbarui setiap hari")
        const expiresAt = timestamp + (24 * 60 * 60 * 1000);

        // Store in Firestore
        await adminDb.collection('users').doc(uid).update({
            currentQrCode: qrCode,
            qrImageUrl: qrCode, // Some legacy apps might look for this, but main logic should use the string
            qrExpiresAt: expiresAt,
            updatedAt: timestamp
        });

        return NextResponse.json({
            success: true,
            qrData: qrCode,
            expiresAt
        });

    } catch (error) {
        console.error("Generate QR Error:", error);
        return NextResponse.json(
            { error: (error as Error).message || "Internal Server Error" },
            { status: 401 }
        );
    }
}
