import { apiSlice } from "@/redux/api/apiSlice";
import {
  BincardEntryType,
  BincardByItemResponse,
} from "@/types/BincardType";

export const bincardApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    /** Paginated bincard entries for an item (newest first) */
    getBincardByItem: builder.query<
      BincardByItemResponse,
      { itemId: string; page?: number; limit?: number }
    >({
      query: ({ itemId, page = 1, limit = 50 }) => ({
        url: `/bincard/item/${itemId}`,
        params: { page, limit },
        method: "GET",
      }),
      providesTags: (_result, _error, { itemId }) => [
        { type: "Bincard", id: itemId },
        { type: "Bincard", id: `LIST-${itemId}` },
      ],
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
