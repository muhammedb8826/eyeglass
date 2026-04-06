import { apiSlice } from "@/redux/api/apiSlice";
import {
  BincardEntryType,
  BincardByItemResponse,
} from "@/types/BincardType";

export const bincardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /** Paginated bincard entries for an item (newest first). Optional `itemBaseId` filters variant vs parent-level. */
    getBincardByItem: builder.query<
      BincardByItemResponse,
      {
        itemId: string;
        page?: number;
        limit?: number;
        /** Variant UUID, or `"none"` for parent-level rows only */
        itemBaseId?: string;
      }
    >({
      query: ({ itemId, page = 1, limit = 50, itemBaseId }) => {
        const params: Record<string, string | number> = { page, limit };
        if (itemBaseId !== undefined && itemBaseId !== "") {
          params.itemBaseId = itemBaseId;
        }
        return {
          url: `/bincard/item/${itemId}`,
          params,
          method: "GET",
        };
      },
      providesTags: (_result, _error, { itemId, itemBaseId }) => {
        const scope = itemBaseId ?? "all";
        return [
          { type: "Bincard", id: itemId },
          { type: "Bincard", id: `LIST-${itemId}-${scope}` },
        ];
      },
    }),
    /** Single bincard entry by ID */
    getBincardEntry: builder.query<BincardEntryType, string>({
      query: (id) => ({
        url: `/bincard/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Bincard", id }],
    }),
  }),
});

export const {
  useGetBincardByItemQuery,
  useGetBincardEntryQuery,
} = bincardApiSlice;
