import { ServiceType } from "@/types/ServiceType";
import { apiSlice } from "../api/apiSlice";

interface NonStockServiceResponse {
    data: ServiceType[];
    total: number
}

export const nonStockServicesApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getNonStockServices: builder.query<NonStockServiceResponse, {page: number; limit: number}>({
           
            query: ({page, limit}) => ({
                url: `/non-stock-services?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags:(result) =>
                result
                    ? [
                        ...result.data.map((nonStockService: ServiceType) => ({ type: 'Users' as const, id: nonStockService.id })),
                        { type: 'Users', id: 'LIST' },
                    ]
                    : [{ type: 'Users', id: 'LIST' }],
        }),
        getAllNonStockServices: builder.query<ServiceType[], void>({
            query: () => '/non-stock-services/all',
            providesTags: ['Users']
        }),
        getNonStockService: builder.query<ServiceType, string>({
            query: (id) => ({
             url: `/non-stock-services/${id}`,
             method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{ type: 'Users', id }]
        }),
        createNonStockService: builder.mutation<ServiceType, Partial<ServiceType>>({
            query: (formData) => ({
                url: '/non-stock-services',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['Users']
        }),
        updateNonStockService: builder.mutation({
            query: (formData) => ({
                url: `/non-stock-services/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [{ type: 'Users', id: formData.id }]
        }),
        deleteNonStockService: builder.mutation<ServiceType, string>({
            query: (id) => ({
                url: `/non-stock-services/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Users', id }, { type: 'Users', id: 'LIST' }]
        })
    }),
    overrideExisting: false
})

export const { useGetNonStockServicesQuery, useGetNonStockServiceQuery, useCreateNonStockServiceMutation, useUpdateNonStockServiceMutation, useDeleteNonStockServiceMutation, useGetAllNonStockServicesQuery } = nonStockServicesApiSlice;