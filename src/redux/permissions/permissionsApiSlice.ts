import { apiSlice } from "@/redux/api/apiSlice";
import type { PermissionsMeResponse } from "@/types/PermissionsType";

export const permissionsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPermissionsMe: builder.query<PermissionsMeResponse, void>({
      query: () => ({
        url: "/permissions/me",
        method: "GET",
      }),
    }),
  }),
});

export const { useGetPermissionsMeQuery } = permissionsApiSlice;
