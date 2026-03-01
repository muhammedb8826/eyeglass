import { BaseQueryFn, createApi, FetchArgs, fetchBaseQuery, FetchBaseQueryError, QueryReturnValue } from "@reduxjs/toolkit/query/react";
import { setCredentials, logOut } from "../authSlice";
import { RootState } from "../store";

const baseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = fetchBaseQuery({
    baseUrl: import.meta.env.VITE_NEST_BACKEND_URL || 'https://api.ianprint.com/api/v1',
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
        const state = getState() as RootState;
        const { accessToken } = state.auth;
        if (accessToken) {
            headers.set('Authorization', `Bearer ${accessToken}`);
        }
        // Debug logging in development
        if (import.meta.env.DEV) {
            console.log('API Request - Base URL:', import.meta.env.VITE_NEST_BACKEND_URL || 'https://api.ianprint.com/api/v1');
            console.log('API Request - Has Token:', !!accessToken);
        }
        return headers;
    }
});

type WrappedSuccessResponse<T = unknown> = {
    success: boolean;
    message: string;
    data: T;
    timestamp?: string;
};

const unwrapApiResponse = (result: QueryReturnValue<unknown, FetchBaseQueryError, unknown>): void => {
    const raw = result.data as WrappedSuccessResponse | undefined;

    if (
        raw &&
        typeof raw === "object" &&
        Object.prototype.hasOwnProperty.call(raw, "success") &&
        Object.prototype.hasOwnProperty.call(raw, "data")
    ) {
        if (raw.success) {
            // Happy path – expose the inner data to RTK Query consumers
            result.data = raw.data;
        } else {
            // Business error with HTTP 200 – surface it as a RTK Query error
            result.error = {
                status: "CUSTOM_ERROR",
                data: raw,
            } as FetchBaseQueryError;
            delete result.data;
        }
    }

};

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, extraOptions) => {
    let result = await baseQuery(args, api, extraOptions);
    unwrapApiResponse(result);

    if (result.error && result.error.status === 401) {
        console.log('Access token expired. Attempting to refresh.');

        const refreshToken = localStorage.getItem('refreshToken');
        console.log('refreshToken', refreshToken);
        
        if (refreshToken) {
            const refreshArgs: FetchArgs = {
                url: '/refresh',
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${refreshToken}`
                }
            };

            const refreshResult = await baseQuery(refreshArgs, api, extraOptions);
            unwrapApiResponse(refreshResult);
            console.log('refreshResult', refreshResult);

            if (refreshResult.data) {

                const { accessToken, refreshToken: newRefreshToken, user } = refreshResult.data as { accessToken: string; refreshToken: string; user?: import('@/types/UserType').UserType };

                api.dispatch(setCredentials({ user: user ?? (api.getState() as RootState).auth.user, accessToken, refreshToken: newRefreshToken }));

                localStorage.setItem('refreshToken', newRefreshToken);

                // Retry the original request with new access token
                result = await baseQuery(args, api, extraOptions);
                unwrapApiResponse(result);
            } else {
                api.dispatch(logOut())
            }
        } else {
            api.dispatch(logOut());
        }
    }

    return result;
};

export const apiSlice = createApi({
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Users',
        'Items',
        'Vendors',
        'Customers',
        'SalesPartners',
        'Orders',
        'UnitCategories',
        'Pricings',
        'OrderItemNotes',
        'PurchaseItemNotes',
        'Purchases',
        'Sales',
        'Discounts',
        'Commissions',
        'Machines',
        'OrderItems',
        'FixedCosts',
        'FilePaths',
        'Services',
        'NonStockServices',
        'Account',
        'Bincard',
        'LabTools'
    ],
    endpoints: (builder) => ({
        signup: builder.mutation({
            query: (credentials: { email: string; password: string; phone?: string; address?: string }) => ({
                url: '/signup',
                method: 'POST',
                body: credentials
            }),
            invalidatesTags: ['Users']
        }),
        contact: builder.mutation({
            query: (contactData: { fullName: string; email: string; phone: string; company?: string; serviceType?: string; projectDetails?: string }) => ({
                url: '/contact',
                method: 'POST',
                body: contactData
            })
        }),
        // Account (current user) – requires auth
        getAccountMe: builder.query<import('@/types/UserType').UserType, void>({
            query: () => ({ url: '/account/me', method: 'GET' }),
            providesTags: ['Account']
        }),
        updateAccountMe: builder.mutation<import('@/types/UserType').UserType, Partial<{ email: string; first_name: string; middle_name: string; last_name: string; gender: string; phone: string; address: string }>>({
            query: (body) => ({
                url: '/account/me',
                method: 'PATCH',
                body
            }),
            invalidatesTags: ['Account', 'Users']
        }),
        updateAccountMeWithProfile: builder.mutation<import('@/types/UserType').UserType, FormData>({
            query: (formData) => ({
                url: '/account/me',
                method: 'PATCH',
                body: formData,
            }),
            invalidatesTags: ['Account', 'Users']
        }),
        changePassword: builder.mutation<void, { currentPassword: string; newPassword: string }>({
            query: (body) => ({
                url: '/account/password',
                method: 'PATCH',
                body
            })
        }),
    })
});

export const { useSignupMutation, useContactMutation, useGetAccountMeQuery, useUpdateAccountMeMutation, useUpdateAccountMeWithProfileMutation, useChangePasswordMutation } = apiSlice;