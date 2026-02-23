import { apiSlice } from "./api/apiSlice";

export const authApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (credentials) => ({
                url: "/signin",
                method: "POST",
                body: credentials,
            }),
        }),
        logout: builder.mutation({
            query: () => ({
                url: '/logout',
                method: 'POST',
            }),
        }),
        refresh: builder.mutation<
            { accessToken: string; refreshToken: string; user: import('@/types/UserType').UserType },
            void
        >({
            query: () => ({
                url: "/refresh",
                method: 'POST',
            }),
        }),
    }),
});

export const { useLoginMutation, useLogoutMutation, useRefreshMutation } = authApiSlice;