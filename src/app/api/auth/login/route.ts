import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { idToken } = await req.json();

        if (!idToken) {
            return NextResponse.json({ error: 'Missing ID token' }, { status: 400 });
        }

        // Set session expiration to 2 weeks (14 days)
        const expiresIn = 14 * 24 * 60 * 60 * 1000;

        // Create the session cookie
        const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

        // Set cookie options
        const options = {
            name: 'session',
            value: sessionCookie,
            maxAge: expiresIn,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            path: '/',
        };

        // Set the cookie
        (await cookies()).set(options);

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
