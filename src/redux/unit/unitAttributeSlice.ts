import { UnitAttributeType } from "@/types/UnitAttributeType";
import { apiSlice } from "../api/apiSlice";

interface UnitAttributeResponse {
    unitAttributes: UnitAttributeType[];
    total: number;
}

export const unitAttributeApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getUnitAttributes: builder.query<UnitAttributeResponse, {page: number; limit: number}>({
            query: ({page, limit}) => ({
                url: `/unit-attribute?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags:(result) =>
                result
                    ? [
                        ...result.unitAttributes.map((unitAttribute) => ({ type: 'Users' as const, id: unitAttribute.id })),
                        { type: 'Users', id: 'LIST' },
                    ]
                    : [{ type: 'Users', id: 'LIST' }],
        }),
        getAllUnitAttributes: builder.query<UnitAttributeResponse[], void>({
            query: () => '/unit-attribute/all',
            providesTags: ['Users']
        }),
        getUnitAttribute: builder.query<UnitAttributeType, string>({
            query: (id) => ({
                url: `/unit-attribute/${id}`,
                method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{ type: 'Users', id }]
        }),
        createUnitAttribute: builder.mutation<UnitAttributeType, Partial<UnitAttributeType>>({
            query: (formData) => ({
                url: '/unit-attribute',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['Users']
        }),
        updateUnitAttribute: builder.mutation<UnitAttributeType, Partial<UnitAttributeType>>({
            query: (formData) => ({
                url: `/unit-attribute/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [{ type: 'Users', id: formData.id }]
        }),
        deleteUnitAttribute: builder.mutation<UnitAttributeType, string>({
            query: (id) => ({
                url: `/unit-attribute/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Users', id }, { type: 'Users', id: 'LIST' }]
        })
    }),
    overrideExisting: false
})

export const {
    useGetUnitAttributesQuery,
    useGetAllUnitAttributesQuery,
    useGetUnitAttributeQuery,
    useCreateUnitAttributeMutation,
    useUpdateUnitAttributeMutation,
    useDeleteUnitAttributeMutation
} = unitAttributeApiSlice;