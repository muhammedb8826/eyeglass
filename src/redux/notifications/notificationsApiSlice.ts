import { apiSlice } from "@/redux/api/apiSlice";
import type {
  NotificationType,
  NotificationsListResponse,
} from "@/types/NotificationType";

type NotificationsTag =
  | { type: "Notifications"; id: string | "LIST" | "UNREAD" }
  | "Notifications";

export const notificationsApiSlice = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getNotifications: builder.query<
      NotificationsListResponse,
      { page?: number; limit?: number; status?: "all" | "unread" | "read" }
    >({
      query: ({ page = 1, limit = 20, status = "all" }) => ({
        url: "/notifications",
        method: "GET",
        params: { page, limit, status },
      }),
      providesTags: (result): NotificationsTag[] =>
        result
          ? [
              ...result.items.map((n) => ({
                type: "Notifications" as const,
                id: n.id,
              })),
              { type: "Notifications", id: "LIST" },
              { type: "Notifications", id: "UNREAD" },
            ]
          : [
              { type: "Notifications", id: "LIST" },
              { type: "Notifications", id: "UNREAD" },
            ],
    }),
    getUnreadCount: builder.query<{ unread: number }, void>({
      query: () => ({
        url: "/notifications/unread-count",
        method: "GET",
      }),
      providesTags: [{ type: "Notifications", id: "UNREAD" }],
    }),
    markNotificationRead: builder.mutation<NotificationType, string>({
      query: (id) => ({
        url: `/notifications/${id}/read`,
        method: "PATCH",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Notifications", id },
        { type: "Notifications", id: "LIST" },
        { type: "Notifications", id: "UNREAD" },
      ],
    }),
    markAllNotificationsRead: builder.mutation<void, void>({
      query: () => ({
        url: "/notifications/read-all",
        method: "PATCH",
      }),
      invalidatesTags: [
        { type: "Notifications", id: "LIST" },
        { type: "Notifications", id: "UNREAD" },
      ],
    }),
    deleteNotification: builder.mutation<void, string>({
      query: (id) => ({
        url: `/notifications/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (_res, _err, id) => [
        { type: "Notifications", id },
        { type: "Notifications", id: "LIST" },
        { type: "Notifications", id: "UNREAD" },
      ],
    }),
  }),
});

export const {
  useGetNotificationsQuery,
  useGetUnreadCountQuery,
  useMarkNotificationReadMutation,
  useMarkAllNotificationsReadMutation,
  useDeleteNotificationMutation,
} = notificationsApiSlice;

