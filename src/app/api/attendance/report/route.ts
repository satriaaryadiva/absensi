import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { verifyUser } from '@/lib/verifyUser';

export async function GET(req: Request) {
    try {
        await verifyUser(req);

        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const date = searchParams.get('date');

        if (!date) {
            return NextResponse.json({ success: false, message: "Date required" }, { status: 400 });
        }

        if (type === 'daily') {
            // Collection Group Query: Find all documents in 'absensi' subcollections
            // where the document ID matches the date (or field 'date' == date)
            // Note: Since ID is dynamic, query by Field is better.
            // We added 'date' field in checkin/checkout for this purpose.

            // 1. Fetch from NEW structure: users/{uid}/absensi (Collection Group)
            const newSnapshot = await adminDb.collectionGroup('absensi')
                .where('date', '==', date)
                .get();

            // 2. Fetch from OLD structure: absensi/{date}/records
            const oldSnapshot = await adminDb.collection('absensi').doc(date).collection('records').get();

            // Merge results
            const allDocs = [...newSnapshot.docs, ...oldSnapshot.docs];

            // Remove duplicates by UID
            const attendanceMap = new Map();

            allDocs.forEach(doc => {
                const data = doc.data();
                const uid = data.uid || doc.id;

                attendanceMap.set(uid, {
                    id: doc.id,
                    ...data,
                    uid: uid,
                    status: data.status || 'hadir',
                    datang: data.datang?.toDate?.() || data.datang,
                    pulang: data.pulang?.toDate?.() || data.pulang
                });
            });

            const attendance = Array.from(attendanceMap.values());

            // Stats calculation below

            const stats = {
                hadir: attendance.filter((r) => r.status === 'hadir').length,
                pulang: attendance.filter((r) => r.status === 'pulang').length,
                izin: attendance.filter((r) => r.status === 'izin').length,
                sakit: attendance.filter((r) => r.status === 'sakit').length,
                alpha: 0
            };

            return NextResponse.json({
                success: true,
                data: attendance,
                stats
            });
        }

        return NextResponse.json({ success: false, message: "Invalid report type" }, { status: 400 });

    } catch (error) {
        console.error("Report Error:", error);
        return NextResponse.json(
            { success: false, message: (error as Error).message },
            { status: 500 }
        );
    }
}
