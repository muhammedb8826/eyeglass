import { apiSlice } from "@/redux/api/apiSlice";
import { AssignedMachineType } from "@/types/UserMachineType";

interface UserMachineResponse {
    userMachines: AssignedMachineType[];
    total: number;
}

export const assignMachineApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        assignedMachines: builder.query<UserMachineResponse, {page: number; limit: number }>({
            query: ({page, limit}) => ({
               url: `/user-machine?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags: ['Users']
        }),
        assignMachine: builder.mutation({
            query: ({ userId, machineId }) => ({
                url: '/user-machine',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    userId,
                    machineId
                }),
            }),
            invalidatesTags: ['Users']
        }),
        unassignMachine: builder.mutation({
            query: (id) => ({
                url: `/user-machine/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Users']
        }),
        
    }),
})

export const { useAssignMachineMutation, useUnassignMachineMutation, useAssignedMachinesQuery } = assignMachineApiSlice;