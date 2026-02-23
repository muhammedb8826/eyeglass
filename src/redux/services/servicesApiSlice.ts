import { ServiceType } from "@/types/ServiceType";
import { apiSlice } from "../api/apiSlice";

interface ServiceResponse {
    services: ServiceType[];
    total: number
}

export const servicesApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getServices: builder.query<ServiceResponse, {page: number; limit: number}>({
           
            query: ({page, limit}) => ({
                url: `/services?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags:(result) =>
                result
                    ? [
                        ...result.services.map((service) => ({ type: 'Users' as const, id: service.id })),
                        { type: 'Users', id: 'LIST' },
                    ]
                    : [{ type: 'Users', id: 'LIST' }],
        }),
        getAllServices: builder.query<ServiceType[], void>({
            query: () => '/services/all',
            providesTags: ['Users']
        }),
        getService: builder.query<ServiceType, string>({
            query: (id) => ({
             url: `/services/${id}`,
             method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{ type: 'Users', id }]
        }),
        createService: builder.mutation<ServiceType, Partial<ServiceType>>({
            query: (formData) => ({
                url: '/services',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['Users']
        }),
        updateService: builder.mutation({
            query: (formData) => ({
                url: `/services/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [{ type: 'Users', id: formData.id }]
        }),
        deleteService: builder.mutation<ServiceType, string>({
            query: (id) => ({
                url: `/services/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Users', id }, { type: 'Users', id: 'LIST' }]
        })
    }),
    overrideExisting: false
})

export const { useGetServicesQuery, useGetServiceQuery, useCreateServiceMutation, useUpdateServiceMutation, useDeleteServiceMutation, useGetAllServicesQuery } = servicesApiSlice;