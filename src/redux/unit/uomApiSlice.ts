import { UoMType } from "@/types/UomType";
import { apiSlice } from "../api/apiSlice";

export const uomApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getUoms: builder.query<UoMType[], { categoryId: string }>({
            query: ({ categoryId }) => ({
                url: `/uom`,
                method: 'GET',
                params: { categoryId }, // Pass the categoryId as a query parameter
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.map((uom: UoMType) => ({ type: 'Users' as const, id: uom.id })),
                        { type: 'Users', id: 'LIST' },
                    ]
                    : [{ type: 'Users', id: 'LIST' }],

        }),
        getAllUoms: builder.query<UoMType[], void>({
            query: ()=>({
                url: `/uom/all`,
                method: 'GET'
            }),
            providesTags: ['Users']
        }),
        getUom: builder.query<UoMType, string>({
            query: (id) => ({
                url: `/uom/${id}`,
                method: 'GEt',
            }),
            providesTags: (_result, _error, id) => [{ type: 'Users', id }]
        }),
        createUom: builder.mutation<UoMType, Partial<UoMType>>({
            query: (formData) => ({
                url: `/uom`,
                method: 'POST',
                body: formData
            }),
            transformResponse: (response: UoMType) => response, // Ensure the response includes the id
            invalidatesTags: ['Users']
        }),
        updateUom: builder.mutation<UoMType, Partial<UoMType>>({
            query: (formData) => ({
                url: `/uom/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [{ type: 'Users', id: formData.id }]
        }),
        deleteUom: builder.mutation<UoMType, string>({
            query: (id) => ({
                url: `/uom/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Users', id }, { type: 'Users', id: 'LIST' }]
        })
    }),
    overrideExisting: false

    })

    export const {
        useGetUomsQuery,
        useGetUomQuery,
        useGetAllUomsQuery,
        useCreateUomMutation,
        useUpdateUomMutation,
        useDeleteUomMutation
    } = uomApiSlice;
