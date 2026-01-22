import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session');
    const path = request.nextUrl.pathname;

    const isAuthRoute = path.startsWith('/auth');
    const isProtectedRoute = path.startsWith('/admin') || path.startsWith('/user');

    // 1. If trying to access Auth routes (Login/Register)
    if (isAuthRoute) {
        if (session) {
            // If user is already logged in, redirect to dashboard
            // Note: Ideal would be to check role, but we can default to user dashboard
            // and let the dashboard redirect to admin if needed (though we removed client redirects, 
            // so maybe we just send to /user/dashboard for now. 
            // A better approach in Edge is just generic dashboard or let them choose).
            return NextResponse.redirect(new URL('/user/dashboard', request.url));
        }
        // Allow access to login page
        return NextResponse.next();
    }

    // 2. If trying to access Protected routes (Admin/User)
    if (isProtectedRoute) {
        if (!session) {
            // If not logged in, redirect to login
            const loginUrl = new URL('/auth/login', request.url);
            // Optional: Add ?next=path to redirect back after login
            return NextResponse.redirect(loginUrl);
        }
        // Allow access
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public files (images, etc)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
};
