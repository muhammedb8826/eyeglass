import { CustomerType } from "@/types/CustomerType";
import { apiSlice } from "../api/apiSlice";

interface CustomerResponse {
    customers: CustomerType[];
    total: number
}

export const customerApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getCustomers: builder.query<CustomerResponse, {page: number; limit: number}>({
            query: ({page, limit}) => ({
                url: `/customers?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags:(result) =>
                result
                    ? [
                        ...result.customers.map((customer) => ({ type: 'Customers' as const, id: customer.id })),
                        { type: 'Customers', id: 'LIST' },
                    ]
                    : [{ type: 'Customers', id: 'LIST' }],
        }),
        getAllCustomers: builder.query<CustomerType[], { search?: string }>({
            query: ({search}) => ({
                url: '/customers/all',
                params: { search },
                method: 'GET'
            }),
            providesTags: ['Customers']
          }),
        getCustomer: builder.query<CustomerType, string>({
            query: (id) => ({
                url: `/customers/${id}`,
                method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{ type: 'Customers', id }]
        }),
        createCustomer: builder.mutation<CustomerType, Partial<CustomerType>>({
            query: (formData) => ({
                url: '/customers',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['Customers']
        }),
        updateCustomer: builder.mutation({
            query: (formData) => ({
                url: `/customers/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [{ type: 'Customers', id: formData.id }]
        }),
        deleteCustomer: builder.mutation<CustomerType, string>({
            query: (id) => ({
                url: `/customers/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Customers', id }, { type: 'Customers', id: 'LIST' }]
        })
    })
})


export const {
    useGetCustomersQuery,
    useGetAllCustomersQuery,
    useGetCustomerQuery,
    useCreateCustomerMutation,
    useUpdateCustomerMutation,
    useDeleteCustomerMutation
} = customerApiSlice;