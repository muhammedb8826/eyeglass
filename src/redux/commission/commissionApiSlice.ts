import { CommissionType } from "@/types/CommissionType";
import { apiSlice } from "../api/apiSlice";

interface CommissionResponse {
    commissions: CommissionType[],
    total: number;
}

export const commissionApiSlice = apiSlice.injectEndpoints({
  endpoints: builder => ({
    getCommissions: builder.query<CommissionResponse, {page: number; limit: number}>({
      query: ({page, limit}) => ({
        url: `/commissions?page=${page}&limit=${limit}`,
        method: 'GET'
      }),
      providesTags:(result) =>
        result
          ? [
            ...result.commissions.map((commission) => ({ type: 'Commissions' as const, id: commission.id })),
            { type: 'Commissions', id: 'LIST' },
          ]
          : [{ type: 'Commissions', id: 'LIST' }],
    }),
    getAllCommissions: builder.query<CommissionType[], void>({
      query: () => '/commissions/all',
      providesTags: ['Commissions']
    }),
    getCommission: builder.query<CommissionType, string>({
      query: (id) => ({
        url: `/commissions/${id}`,
        method: 'GET'
      }),
      providesTags: (_result, _error, id) => [{ type: 'Commissions', id }]
    }),
    createCommission: builder.mutation<CommissionType, Partial<CommissionType>>({
      query: (formData) => ({
        url: '/commissions',
        method: 'POST',
        body: formData
      }),
      invalidatesTags: ['Commissions']
    }),
    updateCommission: builder.mutation({
      query: (formData) => ({
        url: `/commissions/${formData.id}`,
        method: 'PATCH',
        body: formData
      }),
      invalidatesTags: (_result, _error, formData) => [{ type: 'Commissions', id: formData.id }]
    }),
    deleteCommission: builder.mutation<CommissionType, string>({
      query: (id) => ({
        url: `/commissions/${id}`,
        method: 'DELETE'
      }),
      invalidatesTags: (_result, _error, id) => [{ type: 'Commissions', id }, { type: 'Commissions', id: 'LIST' }]
    }),
  })
})

export const {
  useGetCommissionsQuery,
  useGetAllCommissionsQuery,
  useGetCommissionQuery,
  useCreateCommissionMutation,
  useUpdateCommissionMutation,
  useDeleteCommissionMutation
} = commissionApiSlice;