import { PurchaseType } from "@/types/PurchaseType";
import { apiSlice } from "../api/apiSlice";
import { PurchaseItem } from "@/types/PurchaseItem";

interface PurchaseResponse {
    purchases: PurchaseType[];
    total: number;
    grandTotalSum: number;
}

interface PurchaseItemResponse {
    purchaseItems: PurchaseItem[];
    total: number;
    totalAmountSum: number;
}

export const purchaseApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getPurchases: builder.query<PurchaseResponse, {page: number; limit: number; search?: string; startDate?: string; endDate?: string; item1?: string; item2?: string; item3?: string}>({
            query: ({page, limit, search, startDate, endDate,  item1, item2, item3}) => {
                const params: Record<string, string | number> = { page, limit };

                if (search) params.search = search;
                if (startDate) params.startDate = startDate;
                if (endDate) params.endDate = endDate;
                if(item1) params.item1 = item1;
                if(item2) params.item2 = item2;
                if(item3) params.item3 = item3;
               return {
                    url: `/purchases`,
                    params,
                    method: 'GET'
                };
            },
            providesTags:(result) =>
                result
                    ? [
                        ...result.purchases.map((purchase) => ({ type: 'Purchases' as const, id: purchase.id })),
                        { type: 'Purchases', id: 'LIST' },
                    ]
                    : [{ type: 'Purchases', id: 'LIST' }],
        }),
        getAllPurchases: builder.query<PurchaseType[], void>({
            query: () => '/purchases/all',
            providesTags: ['Purchases']
        }),
        getPurchase: builder.query<PurchaseType, string>({
            query: (id) => ({
                url: `/purchases/${id}`,
                method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{ type: 'Purchases', id }]
        }),
        createPurchase: builder.mutation<PurchaseType, Partial<PurchaseType>>({
            query: (formData) => ({
                url: '/purchases',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['Purchases']
        }),
        updatePurchase: builder.mutation({
            query: (formData) => ({
                url: `/purchases/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [{ type: 'Purchases', id: formData.id }]
        }),
        deletePurchase: builder.mutation<PurchaseType, string>({
            query: (id) => ({
                url: `/purchases/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Purchases', id }, { type: 'Purchases', id: 'LIST' }]
        }),
        getPurchaseItems: builder.query<PurchaseItem[], string>({
            query: (purchaseId) => ({
                url: `/purchase-items/${purchaseId}`,
                method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{ type: 'Purchases', id }]
        }),
        getAllPurchaseItems: builder.query<PurchaseItemResponse, { page: number; limit: number; search?: string; startDate?: string; endDate?: string; item?: string; status?: string;}>({
            query: ({ page, limit, search, startDate, endDate, item, status }) => {
                const params: Record<string, string | number> = { page, limit };

                if (search) params.search = search;
                if (startDate) params.startDate = startDate;
                if (endDate) params.endDate = endDate;
                if (item) params.item = item;
                if (status) params.status = status;
                return {
                    url: '/purchase-items/all',
                    params,
                    method: 'GET'
                }
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.purchaseItems.map((orderItem) => ({ type: 'Purchases' as const, id: orderItem.id })),
                        { type: 'Purchases', id: 'LIST' },
                    ]
                    : [{ type: 'Purchases', id: 'LIST' }],
            }),
        createPurchaseItem: builder.mutation<PurchaseItem, Partial<PurchaseItem>>({
            query: (formData) => ({
                url: '/purchase-items',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['Purchases']
        }),
        updatePurchaseItem: builder.mutation({
            query: (formData) => ({
                url: `/purchase-items/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [{ type: 'Purchases', id: formData.id }]
        }),
        deletePurchaseItem: builder.mutation<PurchaseItem, string>({
            query: (id) => ({
                url: `/purchase-items/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Purchases', id }, { type: 'Purchases', id: 'LIST' }]
        })
    }),
    overrideExisting: false
    })

export const {
    useGetPurchasesQuery,
    useGetAllPurchasesQuery,
    useGetPurchaseQuery,
    useCreatePurchaseMutation,
    useUpdatePurchaseMutation,
    useDeletePurchaseMutation,
    useGetPurchaseItemsQuery,
    useGetAllPurchaseItemsQuery,
    useCreatePurchaseItemMutation,
    useUpdatePurchaseItemMutation,
    useDeletePurchaseItemMutation
} = purchaseApiSlice;