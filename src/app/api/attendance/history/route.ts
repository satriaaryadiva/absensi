import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyUser } from '@/lib/verifyUser';

export async function GET(req: Request) {
    try {
        const uid = await verifyUser(req);

        // Simpler query on nested collection: users/{uid}/absensi
        // No need for Collection Group Query here since we know the UID
        const attendanceRef = adminDb.collection('users').doc(uid).collection('absensi');

        // Order by date (ID) or adding a timestamp field would be better
        // Since ID is YYYY-MM-DD, descending order works for date string
        const snapshot = await attendanceRef.limit(50).get();

        const history = snapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                datang: data.datang?.toDate(),
                pulang: data.pulang?.toDate(),
            };
        });

        // Sort in memory (descending date)
        history.sort((a, b) => {
            return b.id.localeCompare(a.id);
        });

        return NextResponse.json({
            success: true,
            data: history
        });

    } catch (error) {
        console.error("History Error:", error);
        return NextResponse.json(
            { success: false, message: (error as Error).message },
            { status: 500 }
        );
    }
}
