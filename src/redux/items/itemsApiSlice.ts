import { apiSlice } from "@/redux/api/apiSlice";
import { ItemType } from "@/types/ItemType";

interface ItemResponse {
    items: ItemType[];
    total: number
}

type ItemsTag = { type: 'Items'; id: string | 'LIST' } | 'Items';

export const itemsApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getItems: builder.query<ItemResponse, { page: number; limit: number; search?: string }>({
            query: ({ page, limit, search }) => ({
                url: '/items',
                params: { page, limit, search },
                method: 'GET'
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.items.map((item) => ({ type: 'Items' as const, id: item.id })),
                        { type: 'Items', id: 'LIST' },
                    ]
                    : [{ type: 'Items', id: 'LIST' }],
        }),
        getAllItems: builder.query<ItemType[], void>({
            query: () => '/items/all',
            providesTags: ['Items', { type: 'Items', id: 'LIST' }]
        }),
        getItem: builder.query({
            query: (id) => `/items/${id}`
        }),
        createItem: builder.mutation({
            query: (formData) => ({
                url: '/items',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['Items']
        }),
        updateItem: builder.mutation({
            query: (formData)=>({
                url: `/items/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => {
                const id = formData.id as string | undefined;
                const baseTags: ItemsTag[] = ['Items', { type: 'Items', id: 'LIST' }];
                return id ? [...baseTags, { type: 'Items', id }] : baseTags;
            },
        }),
        deleteItems: builder.mutation({
            query: (id) => ({
                url: `/items/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Items', id }, { type: 'Items', id: 'LIST' }]
        })
    }),
})

export const {
    useGetItemsQuery,
    useGetAllItemsQuery,
    useGetItemQuery,
    useCreateItemMutation,
    useUpdateItemMutation,
    useDeleteItemsMutation
} = itemsApiSlice;