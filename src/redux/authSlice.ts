import { createSlice } from "@reduxjs/toolkit";
import { RootState } from "./store";
import { UserType } from "@/types/UserType";

interface AuthState {
    user: UserType | null;
    accessToken: string | null;
    refreshToken: string | null;
    isLoggedOut: boolean; // Add flag to track logout state
    /** Codes from GET /permissions/me; null until loaded (or cleared on logout). */
    permissions: string[] | null;
}

const initialState: AuthState = {
    user: (() => {
        const userString = localStorage.getItem('user');
        return userString ? JSON.parse(userString) as UserType : null;
    })(),
    accessToken: localStorage.getItem('accessToken') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,
    isLoggedOut: false,
    permissions: null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            const { user, accessToken, refreshToken } = action.payload;
            state.user = user;
            state.accessToken = accessToken;
            state.refreshToken = refreshToken;
            state.isLoggedOut = false; // Reset logout flag
            state.permissions = null;
            localStorage.setItem('accessToken', accessToken);
            localStorage.setItem('refreshToken', refreshToken);
            localStorage.setItem('user', JSON.stringify(user));
        },
        setPermissions: (state, action: { payload: string[] }) => {
            state.permissions = action.payload;
        },
        clearPermissions: (state) => {
            state.permissions = null;
        },
        updateUser: (state, action: { payload: Partial<UserType> }) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
                localStorage.setItem('user', JSON.stringify(state.user));
            }
        },
        logOut: (state) => {
            state.user = null;
            state.accessToken = null;
            state.refreshToken = null;
            state.isLoggedOut = true; // Set logout flag
            state.permissions = null;
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            
            // Clear any other auth-related items
            localStorage.removeItem('persist:root');
            sessionStorage.clear();
        },
    }
});

export const { setCredentials, logOut, updateUser, setPermissions, clearPermissions } = authSlice.actions;
export default authSlice.reducer;

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectCurrentToken = (state: RootState) => state.auth.accessToken;
export const selectIsLoggedOut = (state: RootState) => state.auth.isLoggedOut;
export const selectPermissions = (state: RootState) => state.auth.permissions;
