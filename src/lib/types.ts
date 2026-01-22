import { Timestamp } from 'firebase/firestore';

export interface Attendance {
    id: string;
    userId: string;
    userName: string;
    checkIn: Timestamp | Date | null;
    checkOut: Timestamp | Date | null;
    status: 'hadir' | 'pulang';
    date: string;
}
