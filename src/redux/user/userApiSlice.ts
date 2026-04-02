import { apiSlice } from "@/redux/api/apiSlice";
import { UserType } from "@/types/UserType";


interface UsersResponse {
    users: UserType[];
    total: number;
}

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getUsers: builder.query<UsersResponse, { page: number; limit: number }>({
            query: ({ page, limit }) => ({
                url: `/users?page=${page}&limit=${limit}`,
                method: "GET",
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.users.map((user) => ({ type: 'Users' as const, id: user.id })),
                        { type: 'Users', id: 'LIST' },
                    ]
                    : [{ type: 'Users', id: 'LIST' }],
        }),
        getAllUsers: builder.query<UserType[], void>({
            query: () => "/users/all",
            providesTags: [{ type: 'Users', id: 'LIST' }],
        }),
        getOperatorUser: builder.query<UserType[], void>({
            query: () => ({
                url: 'users/by-role?roles=OPERATOR',
                method: "GET",  
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map((user) => ({ type: 'Users' as const, id: user.id })),
                        { type: 'Users', id: 'LIST' },
                    ]
                    : [{ type: 'Users', id: 'LIST' }],
          }),
        getUser: builder.query<UserType, string>({
            query: (id) => `users/${id}`,
          }),
        createUser: builder.mutation<UserType, FormData>({
            query: (formData) => ({
                url: "/users",
                method: "POST",
                body: formData,
            }),
            invalidatesTags: [{ type: 'Users', id: 'LIST' }],
        }),
        updateUser: builder.mutation<UserType, FormData>({
            query: (formData) => ({
                url: `/users/${formData.get('id')}`,
                method: "PATCH",
                body: formData,
            }),
            invalidatesTags: (_result, _error, formData) => {
                const id = formData.get('id');
                if (id) {
                    return [{ type: 'Users', id: id as string }]; // Assert that id is a string
                }
                return []; // Return an empty array if id is null
            },
        }),
        deleteUser: builder.mutation<{ success: boolean; id: string }, string>({
            query: (id) => ({
                url: `/users/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Users', id }, { type: 'Users', id: 'LIST' }],
        }),
        activateUser: builder.mutation<void, string>({
            query: (id) => ({
                url: `/users/${id}/activate`,
                method: "PATCH",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Users', id },
                { type: 'Users', id: 'LIST' },
                { type: 'Notifications', id: 'LIST' },
                { type: 'Notifications', id: 'UNREAD' },
            ],
        }),
        deactivateUser: builder.mutation<void, string>({
            query: (id) => ({
                url: `/users/${id}/deactivate`,
                method: "PATCH",
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Users', id },
                { type: 'Users', id: 'LIST' },
                { type: 'Notifications', id: 'LIST' },
                { type: 'Notifications', id: 'UNREAD' },
            ],
        }),
    })
})


export const {
    useGetUsersQuery,
    useCreateUserMutation,
    useGetOperatorUserQuery,
    useUpdateUserMutation,
    useDeleteUserMutation,
    useGetUserQuery,
    useGetAllUsersQuery,
    useActivateUserMutation,
    useDeactivateUserMutation,
} = usersApiSlice;
