import { configureStore, EnhancedStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import { apiSlice } from "./api/apiSlice";
import "./permissions/permissionsApiSlice";
import userReducer from "./user/usersSlice";
import authReducer, { setCredentials } from "./authSlice";
import { UserType } from "@/types/UserType";

const store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        auth: authReducer,
        user: userReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true
});

setupListeners(store.dispatch);

// Initialize auth state only if tokens exist and haven't been cleared
let authInitialized = false;

const initializeAuth = () => {
    if (authInitialized) return;
    
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (accessToken && refreshToken) {
        const user = (() => {
            const userString = localStorage.getItem('user');
            return userString ? JSON.parse(userString) as UserType : null;
        })();
        
        if (user) {
            store.dispatch(setCredentials({ user, accessToken, refreshToken }));
        }
    }
    
    authInitialized = true;
};

// Cleanup function for logout
export const cleanupStore = () => {
    authInitialized = false;
    // Reset the store to initial state
    store.dispatch({ type: 'RESET' });
};

// Initialize auth state
initializeAuth();

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppStore = EnhancedStore<RootState>;
