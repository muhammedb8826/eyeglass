import { apiSlice } from "@/redux/api/apiSlice";
import { MachineType } from "@/types/MachineType";

interface MachineResponse {
    machines: MachineType[];
    total: number
}

export const machinesApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getMachines: builder.query<MachineResponse, {page: number; limit: number}>({
            query:({page, limit})=>({
                url: `/machines?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.machines.map((machine) => ({ type: 'Machines' as const, id: machine.id })),
                        { type: 'Machines', id: 'LIST' },
                    ]
                    : [{ type: 'Machines', id: 'LIST' }],
        }),
        getAllMachines: builder.query<MachineType[], void>({
            query: () => '/machines/all',
            providesTags: ['Machines']
        }),
        getMachine: builder.query({
            query: (id) => `/machines/${id}`
        }),
        createMachine: builder.mutation({
            query: (formData) => ({
                url: '/machines',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['Machines']
        }),
        updateMachine: builder.mutation({
            query: (formData)=>({
                url: `/machines/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => {
                const id = formData.id;
                if (id) {
                    return [{ type: 'Machines', id: id as string }]; // Assert that id is a string
                }
                return []; // Return an empty array if id is null
            },
        }),
        deleteMachines: builder.mutation({
            query: (id) => ({
                url: `/machines/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Machines', id }, { type: 'Machines', id: 'LIST' }]
        })
    }),
   
})

export const {useCreateMachineMutation, useGetAllMachinesQuery, useDeleteMachinesMutation, useGetMachineQuery, useGetMachinesQuery, useUpdateMachineMutation} = machinesApiSlice