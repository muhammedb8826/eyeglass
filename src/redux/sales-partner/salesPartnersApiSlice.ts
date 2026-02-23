import { SalesPartnerType } from "@/types/SalesPartnerType";
import { apiSlice } from "../api/apiSlice";

interface SalesPartnerRespone {
    salesPartners: SalesPartnerType[];
    total: number
}

export const salesPartnersApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getSalesPartners: builder.query<SalesPartnerRespone, {page: number; limit: number}>({
            query: ({page, limit}) => ({
                url: `/sales-partners?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags:(result) =>
                result
                    ? [
                        ...result.salesPartners.map((salesPartner) => ({ type: 'SalesPartners' as const, id: salesPartner.id })),
                        { type: 'SalesPartners', id: 'LIST' },
                    ]
                    : [{ type: 'SalesPartners', id: 'LIST' }],
        }),
        getAllSalesPartners: builder.query<SalesPartnerType[], { search?: string }>({
            query: ({search}) => ({
                url: '/sales-partners/all',
                params: { search },
                method: 'GET'
            }),
            providesTags: ['SalesPartners']
          }),
        getSalesPartner: builder.query<SalesPartnerType, string>({
            query: (id) => ({
                url: `/sales-partners/${id}`,
                method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{ type: 'SalesPartners', id }]
        }),
        createSalesPartner: builder.mutation<SalesPartnerType, Partial<SalesPartnerType>>({
            query: (formData) => ({
                url: '/sales-partners',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['SalesPartners']
        }),
        updateSalesPartner: builder.mutation({
            query: (formData) => ({
                url: `/sales-partners/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [{ type: 'SalesPartners', id: formData.id }]
        }),
        deleteSalesPartner: builder.mutation<SalesPartnerType, string>({
            query: (id) => ({
                url: `/sales-partners/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'SalesPartners', id }, { type: 'SalesPartners', id: 'LIST' }]
        })
    }),
});

export const { useGetSalesPartnersQuery, useGetAllSalesPartnersQuery, useGetSalesPartnerQuery, useCreateSalesPartnerMutation, useUpdateSalesPartnerMutation, useDeleteSalesPartnerMutation } = salesPartnersApiSlice;