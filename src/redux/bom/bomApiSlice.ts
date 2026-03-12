import { apiSlice } from "@/redux/api/apiSlice";
import type { BomType } from "@/types/BomType";

export const bomApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getBoms: builder.query<
      BomType[],
      { parentItemId?: string } | void
    >({
      query: (args) => {
        const parentItemId =
          typeof args === "object" && args ? args.parentItemId : undefined;
        return {
          url: "/boms",
          method: "GET",
          params: parentItemId ? { parentItemId } : undefined,
        };
      },
      providesTags: (result) =>
        result && Array.isArray(result)
          ? [
              ...result.map((b) => ({ type: "Boms" as const, id: b.id })),
              { type: "Boms", id: "LIST" },
            ]
          : [{ type: "Boms", id: "LIST" }],
    }),
    createBom: builder.mutation<
      BomType,
      {
        parentItemId: string;
        componentItemId: string;
        quantity: number;
        uomId: string;
      }
    >({
      query: (body) => ({
        url: "/boms",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Boms", id: "LIST" }],
    }),
    updateBom: builder.mutation<
      BomType,
      Partial<Omit<BomType, "id">> & { id: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/boms/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "Boms", id },
        { type: "Boms", id: "LIST" },
      ],
    }),
    deleteBom: builder.mutation<void, string>({
      query: (id) => ({
        url: `/boms/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "Boms", id },
        { type: "Boms", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetBomsQuery,
  useCreateBomMutation,
  useUpdateBomMutation,
  useDeleteBomMutation,
} = bomApiSlice;

