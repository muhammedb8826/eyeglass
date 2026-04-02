import { apiSlice } from "@/redux/api/apiSlice";
import type {
  PermissionCatalogEntry,
  PermissionsMeResponse,
  RolePermissionsRow,
} from "@/types/PermissionsType";
import {
  normalizePermissionCatalog,
  normalizePermissionMatrix,
} from "@/utils/permissionsApiNormalize";

export const permissionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPermissionsMe: builder.query<PermissionsMeResponse, void>({
      query: () => ({
        url: "/permissions/me",
        method: "GET",
      }),
      providesTags: ["PermissionsMe"],
    }),
    getPermissionsCatalog: builder.query<PermissionCatalogEntry[], void>({
      query: () => ({
        url: "/permissions",
        method: "GET",
      }),
      transformResponse: (raw: unknown) => normalizePermissionCatalog(raw),
      providesTags: ["PermissionsCatalog"],
    }),
    getPermissionsMatrix: builder.query<RolePermissionsRow[], void>({
      query: () => ({
        url: "/permissions/matrix",
        method: "GET",
      }),
      transformResponse: (raw: unknown) => normalizePermissionMatrix(raw),
      providesTags: ["PermissionsMatrix"],
    }),
    updateRolePermissions: builder.mutation<
      void,
      { role: string; codes: string[] }
    >({
      query: ({ role, codes }) => ({
        url: `/permissions/roles/${encodeURIComponent(role)}`,
        method: "PUT",
        body: { codes },
      }),
      invalidatesTags: ["PermissionsMatrix", "PermissionsMe"],
    }),
  }),
});

export const {
  useGetPermissionsMeQuery,
  useGetPermissionsCatalogQuery,
  useGetPermissionsMatrixQuery,
  useUpdateRolePermissionsMutation,
} = permissionsApiSlice;
