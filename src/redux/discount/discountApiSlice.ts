import { apiSlice } from './../api/apiSlice';
import { DiscountType } from './../../types/DiscountType';
interface DiscountResponse {
    discounts: DiscountType[],
    total: number,
}


export const discountApi = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getDiscounts: builder.query<DiscountResponse, {page: number, limit: number}>({
            query: ({page, limit}) => ({
                url: `/discounts?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.discounts.map((discount) => ({type: 'Discounts' as const, id: discount.id})),
                        {type: 'Discounts', id: 'LIST'}
                    ]
                    : [{type: 'Discounts', id: 'LIST'}]
        }),
        getAllDiscounts: builder.query<DiscountType[], void>({
            query: () => '/discounts/all',
            providesTags: ['Discounts']
        }),
        getDiscount: builder.query<DiscountType, string>({
            query: (id) => ({
                url: `/discounts/${id}`,
                method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{type: 'Discounts', id}]
        }),
        createDiscount: builder.mutation<DiscountType, Partial<DiscountType>>({
            query: (formData) => ({
                url: '/discounts',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['Discounts']
        }),
        updateDiscount: builder.mutation<DiscountType, Partial<DiscountType>>({
            query: (formData) => ({
                url: `/discounts/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [{type: 'Discounts', id: formData.id}]
        }),
        deleteDiscount: builder.mutation<DiscountType, string>({
            query: (id) => ({
                url: `/discounts/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [{type: 'Discounts', id}, {type: 'Discounts', id: 'LIST'}]
        })
    }),
    overrideExisting: false
})

export const {
    useGetDiscountsQuery,
    useGetAllDiscountsQuery,
    useGetDiscountQuery,
    useCreateDiscountMutation,
    useUpdateDiscountMutation,
    useDeleteDiscountMutation
} = discountApi;