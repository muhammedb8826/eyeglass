import { apiSlice } from "@/redux/api/apiSlice";
import type {
  LabToolType,
  LabToolListResponse,
  LabToolCheckResponse,
} from "@/types/LabToolType";

export const labToolsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getLabTools: builder.query<
      LabToolListResponse,
      { page?: number; limit?: number }
    >({
      query: ({ page = 1, limit = 50 } = {}) => ({
        url: "/lab-tools",
        params: { page, limit },
        method: "GET",
      }),
      transformResponse: (raw: { labTools?: LabToolType[]; data?: LabToolType[]; total?: number }) => {
        const list = raw?.labTools ?? raw?.data ?? [];
        const items = Array.isArray(list) ? list : [];
        const total = typeof raw?.total === "number" ? raw.total : items.length;
        return { labTools: items, total };
      },
      providesTags: (result) => {
        const items = result?.labTools ?? [];
        return [
          ...items.map((t) => ({ type: "LabTools" as const, id: t.id })),
          { type: "LabTools", id: "LIST" },
        ];
      },
    }),
    getLabTool: builder.query<LabToolType, string>({
      query: (id) => ({ url: `/lab-tools/${id}`, method: "GET" }),
      providesTags: (_r, _e, id) => [{ type: "LabTools", id }],
    }),
    checkLabTools: builder.query<LabToolCheckResponse, { baseCurves: number[] }>({
      query: ({ baseCurves }) => ({
        url: "/lab-tools/check",
        params: {
          baseCurves: baseCurves.length ? baseCurves.join(",") : undefined,
        },
        method: "GET",
      }),
    }),
    createLabTool: builder.mutation<
      LabToolType,
      {
        code?: string;
        baseCurveMin: number;
        baseCurveMax: number;
        quantity: number;
      }
    >({
      query: (body) => ({
        url: "/lab-tools",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "LabTools", id: "LIST" }],
    }),
    updateLabTool: builder.mutation<
      LabToolType,
      Partial<LabToolType> & { id: string }
    >({
      query: ({ id, ...body }) => ({
        url: `/lab-tools/${id}`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: "LabTools", id },
        { type: "LabTools", id: "LIST" },
      ],
    }),
    deleteLabTool: builder.mutation<void, string>({
      query: (id) => ({
        url: `/lab-tools/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: "LabTools", id },
        { type: "LabTools", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetLabToolsQuery,
  useGetLabToolQuery,
  useCheckLabToolsQuery,
  useCreateLabToolMutation,
  useUpdateLabToolMutation,
  useDeleteLabToolMutation,
} = labToolsApiSlice;
