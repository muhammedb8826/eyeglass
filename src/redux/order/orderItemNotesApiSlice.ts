import { OrderItemNotes } from "@/types/OrderItemNotes";
import { apiSlice } from "../api/apiSlice";


export const orderItemNotesApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getOrderItemNotes: builder.query<OrderItemNotes[], string>({
            query: (orderItemId) => ({
                url: `/order-item-notes/${orderItemId}`,
                method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{ type: 'OrderItemNotes', id }]
        }),
        createOrderItemNote: builder.mutation<OrderItemNotes, Partial<OrderItemNotes>>({
            query: (formData) => ({
                url: `/order-item-notes/${formData.orderItemId}`,
                method: 'POST',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [{ type: 'OrderItemNotes', id: formData.orderItemId }]
        }),
        updateOrderItemNote: builder.mutation<OrderItemNotes, Partial<OrderItemNotes>>({
            query: (formData) => ({
                url: `/order-item-notes/note/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [{ type: 'OrderItemNotes', id: formData.orderItemId }]
        }),
        deleteOrderItemNote: builder.mutation<OrderItemNotes, {orderItemId: string; noteId: string}>({
            query: ({noteId}) => ({
                url: `/order-item-notes/note/${noteId}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, {orderItemId}) => [{ type: 'OrderItemNotes', id: orderItemId }]
        }),
    })
})

export const {
    useGetOrderItemNotesQuery,
    useCreateOrderItemNoteMutation,
    useUpdateOrderItemNoteMutation,
    useDeleteOrderItemNoteMutation
} = orderItemNotesApiSlice;