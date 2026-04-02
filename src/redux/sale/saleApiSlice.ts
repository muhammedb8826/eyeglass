import { SaleType } from "@/types/SaleType";
import { apiSlice } from "../api/apiSlice";
import { SaleItem } from "@/types/SaleItem";
import { SaleItemNoteType } from "@/types/SaleItemNoteType";
import { PurchaseItemNoteType } from "@/types/PurchaseItemNoteType";

interface SaleResponse {
    sales: SaleType[];
    total: number
}

export const saleApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getSales: builder.query<SaleResponse, {page: number; limit: number}>({
            query: ({page, limit}) => ({
                url: `/sales?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags:(result) =>
                result
                    ? [
                        ...result.sales.map((sale) => ({ type: 'Sales' as const, id: sale.id })),
                        { type: 'Sales', id: 'LIST' },
                    ]
                    : [{ type: 'Sales', id: 'LIST' }],
        }),
        getAllSales: builder.query<SaleType[], void> ({
            query: () => '/sales/all',
            providesTags: ['Sales']
        }),
        getSale: builder.query<SaleType, string>({
            query: (id) => ({
                url: `/sales/${id}`,
                method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{ type: 'Sales', id }]
        }),
        createSale: builder.mutation<SaleType, Partial<SaleType>>({
            query: (formData) => ({
                url: '/sales',
                method: 'POST',
                body: formData
            }),
            // Store sales update linked order lines (e.g. storeRequestStatus → Issued)
            invalidatesTags: ['Sales', 'Orders']
        }),
        updateSale: builder.mutation({
            query: (formData) => ({
                url: `/sales/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [
                { type: 'Sales', id: formData.id },
                'Orders',
            ]
        }),
        deleteSale: builder.mutation({
            query: (id) => ({
                url: `/sales/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Sales', id },
                { type: 'Sales', id: 'LIST' },
                'Orders',
            ]
        }),
        getSaleItems: builder.query<SaleItem[], string>({
            query: (saleId) => ({
                url: `/sale-items/${saleId}`,
                method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{ type: 'Sales', id }]
        }),
        createSaleItem: builder.mutation<SaleItem, Partial<SaleItem>>({
            query: (formData) => ({
                url: '/sale-items',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['Sales', 'Orders']
        }),
        updateSaleItem: builder.mutation({
            query: (formData) => ({
                url: `/sale-items/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [
                { type: 'Sales', id: formData.id },
                'Orders',
            ]
        }),
        deleteSaleItem: builder.mutation<SaleItem, string>({
            query: (itemId) => ({
                url: `/sale-items/${itemId}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, itemId) => [
                { type: 'Sales', id: itemId },
                { type: 'Sales', id: 'LIST' },
                'Orders',
            ]
        }),
        getSaleItemNotes: builder.query<SaleItemNoteType[], string>({
            query: (saleItemId) => ({
                url: `/sale-item-notes/${saleItemId}`,
                method: 'GET'
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map((note) => ({ type: 'Sales' as const, id: note.id })),
                        { type: 'Sales', id: 'LIST' },
                    ]
                    : [{ type: 'Sales', id: 'LIST' }],
        }),
        createSaleItemNote: builder.mutation<SaleItemNoteType, Partial<SaleItemNoteType>>({
            query: (formData) => ({
                url: `/sale-item-notes/${formData.saleItemId}`,
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['Sales']
        }),
        updateSaleItemNote: builder.mutation<PurchaseItemNoteType, Partial<PurchaseItemNoteType>>({
            query: (formData) => ({
                url: `/sale-item-notes/note/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [{ type: 'Sales', id: formData.id }]
        }),
        deleteSaleItemNote: builder.mutation<SaleItemNoteType, string>({
            query: (id) => ({
                url: `/sale-item-notes/note/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, noteId) => [
                { type: 'Sales', id: noteId },
                { type: 'Sales', id: 'LIST' },
            ]
        }),
    }),
});

export const {
    useGetSalesQuery,
    useGetAllSalesQuery,
    useGetSaleQuery,
    useCreateSaleMutation,
    useUpdateSaleMutation,
    useDeleteSaleMutation,
    useGetSaleItemsQuery,
    useCreateSaleItemMutation,
    useUpdateSaleItemMutation,
    useDeleteSaleItemMutation,
    useGetSaleItemNotesQuery,
    useCreateSaleItemNoteMutation,
    useUpdateSaleItemNoteMutation,
    useDeleteSaleItemNoteMutation,
} = saleApiSlice;