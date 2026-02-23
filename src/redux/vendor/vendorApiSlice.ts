import { VendorType } from "@/types/VendorType";
import { apiSlice } from "../api/apiSlice";

interface VendorResponse {
    vendors: VendorType[];
    total: number
}

export const vendorApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getVendors: builder.query<VendorResponse, {page: number; limit: number}>({
            query: ({page, limit}) => ({
                url: `/vendors?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags:(result) =>
                result
                    ? [
                        ...result.vendors.map((vendor) => ({ type: 'Vendors' as const, id: vendor.id })),
                        { type: 'Vendors', id: 'LIST' },
                    ]
                    : [{ type: 'Vendors', id: 'LIST' }],
        }),
        getAllVendors: builder.query<VendorType[], { search?: string }>({
            query: ({search}) => ({
                url: '/vendors/all',
                params: { search },
                method: 'GET'
            }),
            providesTags: ['Vendors']
          }),
        getVendor: builder.query<VendorType, string>({
            query: (id) => ({
                url: `/vendors/${id}`,
                method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{ type: 'Vendors', id }]
        }),
        createVendor: builder.mutation<VendorType, Partial<VendorType>>({
            query: (formData) => ({
                url: '/vendors',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['Vendors']
        }),
        updateVendor: builder.mutation({
            query: (formData) => ({
                url: `/vendors/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [{ type: 'Vendors', id: formData.id }]
        }),
        deleteVendor: builder.mutation<VendorType, string>({
            query: (id) => ({
                url: `/vendors/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Vendors', id }, { type: 'Vendors', id: 'LIST' }]
        })
    }),
    overrideExisting: false
});

export const {
    useGetVendorsQuery,
    useGetAllVendorsQuery,
    useGetVendorQuery,
    useCreateVendorMutation,
    useUpdateVendorMutation,
    useDeleteVendorMutation
} = vendorApiSlice;
