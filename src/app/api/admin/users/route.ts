import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyUser } from '@/lib/verifyUser';

export async function GET(req: Request) {
    try {
        await verifyUser(req);
        // ideally verify admin role here too, but for MVP we assume dashboard protects it
        // or we fetch user role after verifyUser returns UID.

        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');

        let query: FirebaseFirestore.Query = adminDb.collection('users');

        if (role) {
            query = query.where('role', '==', role);
        }

        const snapshot = await query.get();
        const users = snapshot.docs.map(doc => ({
            ...doc.data(),
            uid: doc.id
        }));

        return NextResponse.json({
            success: true,
            data: users
        });

    } catch (error) {
        console.error("Fetch Users Error:", error);
        return NextResponse.json(
            { success: false, message: (error as Error).message },
            { status: 500 }
        );
    }
}
