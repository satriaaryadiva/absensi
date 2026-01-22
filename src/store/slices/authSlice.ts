import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

export interface UserData {
    uid: string;
    email: string | null;
    name: string;
    role: 'admin' | 'user' | 'staf' | 'murid' | 'guru';
    jabatan?: string;
    nim?: string;
}

interface AuthState {
    user: UserData | null;
    loading: boolean;
    initialized: boolean;
}

const initialState: AuthState = {
    user: null,
    loading: true,
    initialized: false,
};

// Thunk to check auth state and get user data from Firestore
export const checkAuthState = createAsyncThunk(
    'auth/checkAuthState',
    async (userInfo: { uid: string; email: string | null }) => {
        const userDoc = await getDoc(doc(db, 'users', userInfo.uid));
        if (userDoc.exists()) {
            const userData = userDoc.data();
            return {
                uid: userInfo.uid,
                email: userInfo.email,
                name: userData.nama || userData.name || 'User',
                role: userData.role || 'user',
                jabatan: userData.jabatan,
                nim: userData.nim,
            } as UserData;
        }
        return null;
    }
);

export const logoutUser = createAsyncThunk(
    'auth/logout',
    async () => {
        await signOut(auth);
        return null;
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserData | null>) => {
            state.user = action.payload;
            state.loading = false;
            state.initialized = true;
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.loading = action.payload;
        },
        clearUser: (state) => {
            state.user = null;
            state.loading = false;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(checkAuthState.pending, (state) => {
                state.loading = true;
            })
            .addCase(checkAuthState.fulfilled, (state, action) => {
                state.user = action.payload;
                state.loading = false;
                state.initialized = true;
            })
            .addCase(checkAuthState.rejected, (state) => {
                state.user = null;
                state.loading = false;
                state.initialized = true;
            })
            .addCase(logoutUser.fulfilled, (state) => {
                state.user = null;
                state.loading = false;
            });
    },
});

export const { setUser, setLoading, clearUser } = authSlice.actions;
export default authSlice.reducer;
