'use client';

import { ReactNode, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from '@/store';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { checkAuthState, setLoading } from '@/store/slices/authSlice';

function AuthProvider({ children }: { children: ReactNode }) {
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                store.dispatch(checkAuthState({ uid: user.uid, email: user.email }));
            } else {
                store.dispatch(setLoading(false));
            }
        });

        return () => unsubscribe();
    }, []);

    return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
    return (
        <Provider store={store}>
            <AuthProvider>
                {children}
            </AuthProvider>
        </Provider>
    );
}
