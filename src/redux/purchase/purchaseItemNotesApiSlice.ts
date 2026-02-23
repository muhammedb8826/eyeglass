import { PurchaseItemNoteType } from "@/types/PurchaseItemNoteType";
import { apiSlice } from "../api/apiSlice";

export const purchaseItemNoteApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getPurchaseItemNotes: builder.query<PurchaseItemNoteType[], string>({
            query: (purchaseItemId) => ({
                url: `/purchase-item-notes/${purchaseItemId}`,
                method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{ type: 'PurchaseItemNotes', id }]
        }),
        createPurchaseItemNote: builder.mutation<PurchaseItemNoteType, Partial<PurchaseItemNoteType>>({
            query: (formData) => ({
                url: `/purchase-item-notes/${formData.purchaseItemId}`,
                method: 'POST',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [{ type: 'PurchaseItemNotes', id: formData.purchaseItemId }]
        }),
        updatePurchaseItemNote: builder.mutation<PurchaseItemNoteType, Partial<PurchaseItemNoteType>>({
            query: (formData) => ({
                url: `/purchase-item-notes/note/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [{ type: 'PurchaseItemNotes', id: formData.id }]
        }),
        deletePurchaseItemNote: builder.mutation<PurchaseItemNoteType, string>({
            query: (id) => ({
                url: `/purchase-item-notes/note/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'PurchaseItemNotes', id }]
        })
    }),
    overrideExisting: false
});

export const {
    useGetPurchaseItemNotesQuery,
    useCreatePurchaseItemNoteMutation,
    useUpdatePurchaseItemNoteMutation,
    useDeletePurchaseItemNoteMutation
} = purchaseItemNoteApiSlice;
