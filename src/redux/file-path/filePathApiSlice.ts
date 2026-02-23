import { FilePathType } from "@/types/FilePathType";
import { apiSlice } from "../api/apiSlice";

interface FilePathResponse {
    filePaths: FilePathType[],
    total: number;
}

export const filePathApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getFilePaths: builder.query<FilePathResponse, {page: number; limit: number}>({
            query: ({page, limit}) => ({
                url: `/file-path?page=${page}&limit=${limit}`,
                method: 'GET'
            }),
            providesTags: (result) =>
                result
                    ? [
                        ...result.filePaths.map((filePath) => ({ type: 'FilePaths' as const, id: filePath.id })),
                        { type: 'FilePaths', id: 'LIST' },
                    ]
                    : [{ type: 'FilePaths', id: 'LIST' }],
        }),
        getFilePath: builder.query<FilePathType, string>({
            query: (id) => ({
                url: `/file-path/${id}`,
                method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{ type: 'FixedCosts', id }]
        }),
        createFilePath: builder.mutation<FilePathType, FilePathType>({
            query: (filePath) => ({
                url: '/file-path',
                method: 'POST',
                body: filePath
            }),
            invalidatesTags: ['FilePaths', { type: 'Orders', id: 'LIST' }]
        }),
        updateFilePath: builder.mutation<FilePathType, FilePathType>({
            query: (filePath) => ({
                url: `/file-path/${filePath.id}`,
                method: 'PATCH',
                body: filePath
            }),
            invalidatesTags: (_result, _error, filePath) => {
                const id = filePath.id;
                if (id) {
                    return [
                        { type: 'FilePaths', id: id as string },
                        { type: 'FilePaths', id: 'LIST' },
                        { type: 'Orders', id: 'LIST' }
                    ];
                }
                return [];
            }
        }),
        deleteFilePath: builder.mutation<void, string>({
            query: (id) => ({
                url: `/file-path/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [
                { type: 'FilePaths', id }, 
                { type: 'FilePaths', id: 'LIST' },
                { type: 'Orders', id: 'LIST' }
            ]
        }),
    }),
});

export const { useGetFilePathsQuery, useGetFilePathQuery, useCreateFilePathMutation, useUpdateFilePathMutation, useDeleteFilePathMutation } = filePathApiSlice;