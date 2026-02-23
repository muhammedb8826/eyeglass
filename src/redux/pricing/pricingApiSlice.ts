import { PricingType } from "@/types/PricingType";
import { apiSlice } from "../api/apiSlice";

interface PriceResponse {
    pricings: PricingType[];
    total: number;
}

export const pricingApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getPricings: builder.query<PriceResponse, {page: number; limit: number}>({
            query: ({page, limit}) => ({
                url: `/pricing?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags:(result) =>
                result
                    ? [
                        ...result.pricings.map((pricing) => ({ type: 'Pricings' as const, id: pricing.id })),
                        { type: 'Pricings', id: 'LIST' },
                    ]
                    : [{ type: 'Pricings', id: 'LIST' }],
        }),
        getAllPricings: builder.query<PricingType[], void>({
            query: () => '/pricing/all',
            providesTags: ['Pricings']
        }),
        getPricing: builder.query<PricingType, string>({
            query: (id) => ({
                url: `/pricing/${id}`,
                method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{ type: 'Pricings', id }]
        }),
        createPricing: builder.mutation<PricingType, Partial<PricingType>>({
            query: (formData) => ({
                url: '/pricing',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['Pricings']
        }),
        updatePricing: builder.mutation<PricingType, Partial<PricingType>>({
            query: (formData) => ({
                url: `/pricing/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [
                { type: 'Pricings', id: formData.id },
                { type: 'Pricings', id: 'LIST' },
                'Pricings'
            ]
        }),
        deletePricing: builder.mutation<PricingType, string>({
            query: (id) => ({
                url: `/pricing/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'Pricings', id },
                { type: 'Pricings', id: 'LIST' },
                'Pricings'
            ]
        })
    }),
    overrideExisting: false
})

export const {
    useGetPricingsQuery,
    useGetAllPricingsQuery,
    useGetPricingQuery,
    useCreatePricingMutation,
    useUpdatePricingMutation,
    useDeletePricingMutation
} = pricingApiSlice;