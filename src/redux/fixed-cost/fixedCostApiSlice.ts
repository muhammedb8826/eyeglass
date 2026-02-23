import { FixedCostType } from "@/types/FixedCostType";
import { apiSlice } from "../api/apiSlice";

interface FixedCostResponse {
    fixedCosts: FixedCostType[],
    total: number;
}

export const fixedCostApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getFixedCosts: builder.query<FixedCostResponse, {page: number; limit: number}>({
            query: ({page, limit}) => ({
                url: `/fixed-cost?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.fixedCosts.map((fixedCost) => ({ type: 'FixedCosts' as const, id: fixedCost.id })),
                        { type: 'FixedCosts', id: 'LIST' },
                    ]
                    : [{ type: 'FixedCosts', id: 'LIST' }],
        }),
        getFixedCost: builder.query<FixedCostType, string>({
            query: (id) => ({
                url: `/fixed-cost/${id}`,
                method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{ type: 'FixedCosts', id }]
        }),
        createFixedCost: builder.mutation<FixedCostType, FixedCostType>({
            query: (fixedCost) => ({
                url: '/fixed-cost',
                method: 'POST',
                body: fixedCost
            }),
            invalidatesTags: ['FixedCosts', { type: 'Orders', id: 'LIST' }]
        }),
        updateFixedCost: builder.mutation<FixedCostType, FixedCostType>({
            query: (fixedCost) => ({
                url: `/fixed-cost/${fixedCost.id}`,
                method: 'PATCH',
                body: fixedCost
            }),
            invalidatesTags: (_result, _error, fixedCost) => {
                const id = fixedCost.id;
                if (id) {
                    return [
                        { type: 'FixedCosts', id: id as string },
                        { type: 'FixedCosts', id: 'LIST' },
                        { type: 'Orders', id: 'LIST' }
                    ];
                }
                return [];
            }
        }),
        deleteFixedCost: builder.mutation<void, string>({
            query: (id) => ({
                url: `/fixed-cost/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'FixedCosts', id }, 
                { type: 'FixedCosts', id: 'LIST' },
                { type: 'Orders', id: 'LIST' }
            ]
        }),
    }),
});

export const { useGetFixedCostsQuery, useGetFixedCostQuery, useCreateFixedCostMutation, useUpdateFixedCostMutation, useDeleteFixedCostMutation  } = fixedCostApiSlice;