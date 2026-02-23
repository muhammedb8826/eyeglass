import { OperatorStockType } from "@/types/OperatorStockType";
import { apiSlice } from "../api/apiSlice";


interface SaleItemNoteResponse {
    operatorStocks: OperatorStockType[];
    total: number
}


export const operatorStockApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getOperatorStocks: builder.query<SaleItemNoteResponse, { page: number; limit: number; search?: string }>({
            query: ({ page, limit, search }) => ({
                url: '/operator-stocks',
                params: { page, limit, search },
                method: 'GET'
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.operatorStocks.map((item) => ({ type: 'Users' as const, id: item.id })),
                        { type: 'Users', id: 'LIST' },
                    ]
                    : [{ type: 'Users', id: 'LIST' }],
        }),
        getOperatorStock: builder.query({
            query: (id) => `/operator-stocks/${id}`
        }),
        createOperatorStock: builder.mutation({
            query: (formData) => ({
                url: '/operator-stocks',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['Users']
        }),
        updateOperatorStock: builder.mutation({
            query: (formData)=>({
                url: `/operator-stocks/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => {
                const id = formData.id;
                if (id) {
                    return [{ type: 'Users', id: id as string }]; // Assert that id is a string
                }
                return []; // Return an empty array if id is null
            },
        }),
        deleteOperatorStock: builder.mutation({
            query: (id) => ({
                url: `/operator-stocks/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Users', id }, { type: 'Users', id: 'LIST' }]
        })
    })
})
export const {
    useGetOperatorStocksQuery,
    useGetOperatorStockQuery,
    useCreateOperatorStockMutation,
    useUpdateOperatorStockMutation,
    useDeleteOperatorStockMutation
} = operatorStockApiSlice;