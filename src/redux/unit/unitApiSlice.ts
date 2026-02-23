import { UnitType } from "@/types/UnitType";
import { apiSlice } from "../api/apiSlice";

interface UnitResponse {
    unitCategories: UnitType[];
    total: number;
}

export const unitApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getUnits: builder.query<UnitResponse, {page: number; limit: number}>({
            query: ({page, limit}) => ({
                url: `/unit-category?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags:(result) =>
                result
                    ? [
                        ...result.unitCategories.map((unit) => ({ type: 'UnitCategories' as const, id: unit.id })),
                        { type: 'UnitCategories', id: 'LIST' },
                    ]
                    : [{ type: 'UnitCategories', id: 'LIST' }],
        }),
        getAllUnits: builder.query<UnitType[], void>({
            query: () => '/unit-category/all',
            providesTags: ['UnitCategories']
        }),
        getUnit: builder.query<UnitType, string>({
            query: (id) => ({
                url: `/unit-category/${id}`,
                method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{ type: 'UnitCategories', id }]
        }),
        createUnit: builder.mutation<UnitType, Partial<UnitType>>({
            query: (formData) => ({
                url: '/unit-category',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['UnitCategories']
        }),
        updateUnit: builder.mutation<UnitType, Partial<UnitType>>({
            query: (formData) => ({
                url: `/unit-category/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [{ type: 'UnitCategories', id: formData.id }]
        }),
        deleteUnit: builder.mutation<UnitType, string>({
            query: (id) => ({
                url: `/unit-category/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'UnitCategories', id }, { type: 'UnitCategories', id: 'LIST' }]
        })
    }),
    overrideExisting: false
})

export const {
    useGetUnitsQuery,
    useGetAllUnitsQuery,
    useGetUnitQuery,
    useCreateUnitMutation,
    useUpdateUnitMutation,
    useDeleteUnitMutation
} = unitApiSlice;