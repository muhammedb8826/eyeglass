import { apiSlice } from "@/redux/api/apiSlice";
import { ItemType } from "@/types/ItemType";
import { ItemBaseType } from "@/types/ItemBaseType";

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
        getItemBases: builder.query<ItemBaseType[], string>({
            query: (id) => `/items/${id}/bases`,
            providesTags: (_result, _error, itemId) => [{ type: 'Items', id: itemId }],
        }),
        createItemBase: builder.mutation<
            ItemBaseType,
            { itemId: string; baseCode: string; addPower: number }
        >({
            query: ({ itemId, baseCode, addPower }) => ({
                url: `/items/${itemId}/bases`,
                method: 'POST',
                body: { baseCode, addPower },
            }),
            invalidatesTags: (_result, _error, { itemId }) => [
                { type: 'Items', id: itemId },
            ],
        }),
        updateItemBase: builder.mutation<
            ItemBaseType,
            { itemId: string; baseId: string; baseCode?: string; addPower?: number }
        >({
            query: ({ itemId, baseId, baseCode, addPower }) => ({
                url: `/items/${itemId}/bases/${baseId}`,
                method: 'PATCH',
                body: { baseCode, addPower },
            }),
            invalidatesTags: (_result, _error, { itemId }) => [
                { type: 'Items', id: itemId },
            ],
        }),
        deleteItemBase: builder.mutation<void, { itemId: string; baseId: string }>({
            query: ({ itemId, baseId }) => ({
                url: `/items/${itemId}/bases/${baseId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (_result, _error, { itemId }) => [
                { type: 'Items', id: itemId },
            ],
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
    useGetItemBasesQuery,
    useLazyGetItemBasesQuery,
    useCreateItemBaseMutation,
    useUpdateItemBaseMutation,
    useDeleteItemBaseMutation,
    useCreateItemMutation,
    useUpdateItemMutation,
    useDeleteItemsMutation
} = itemsApiSlice;