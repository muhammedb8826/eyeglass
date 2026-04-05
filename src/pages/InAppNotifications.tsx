import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "@/components/Breadcrumb";
import Loader from "@/common/Loader";
import ErroPage from "@/components/common/ErroPage";
import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/redux/notifications/notificationsApiSlice";
import {
  APP_NOTIFICATION_TYPES,
  getNotificationDeepLink,
  notificationTypeLabel,
} from "@/utils/notificationDeepLink";

const PAGE_SIZE = 20;
/** Load up to API max (100) so client-side type filter spans recent notifications. */
const FETCH_LIMIT = 100;
const LIST_POLL_MS = 8_000;

export default function InAppNotifications() {
  const [clientPage, setClientPage] = useState(1);
  const [status, setStatus] = useState<"all" | "unread" | "read">("all");
  const [eventType, setEventType] = useState<"all" | (typeof APP_NOTIFICATION_TYPES)[number]>(
    "all",
  );

  const { data, isLoading, isError, error } = useGetNotificationsQuery(
    {
      page: 1,
      limit: FETCH_LIMIT,
      status,
    },
    {
      pollingInterval: LIST_POLL_MS,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );
  const [markRead, { isLoading: isMarkingRead }] =
    useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();

  const filteredItems = useMemo(() => {
    const raw = data?.items ?? [];
    if (eventType === "all") return raw;
    return raw.filter((n) => n.type === eventType);
  }, [data, eventType]);

  const pageCount = useMemo(
    () => Math.max(1, Math.ceil(filteredItems.length / PAGE_SIZE)),
    [filteredItems.length],
  );

  const pagedItems = useMemo(() => {
    const start = (clientPage - 1) * PAGE_SIZE;
    return filteredItems.slice(start, start + PAGE_SIZE);
  }, [filteredItems, clientPage]);

  if (isError) return <ErroPage error={error} />;
  if (isLoading) return <Loader />;

  return (
    <>
      <Breadcrumb pageName="Notifications" />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-black dark:text-white">Read status</label>
            <select
              className="rounded border border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              value={status}
              onChange={(e) => {
                setClientPage(1);
                setStatus(e.target.value as typeof status);
              }}
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-black dark:text-white">Type</label>
            <select
              className="rounded border border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              value={eventType}
              onChange={(e) => {
                setClientPage(1);
                setEventType(e.target.value as typeof eventType);
              }}
            >
              <option value="all">All types</option>
              {APP_NOTIFICATION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {notificationTypeLabel(t)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isMarkingAll}
            onClick={() => markAllRead()}
            className="rounded bg-primary px-4 py-2 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60"
          >
            Mark all read
          </button>
        </div>
      </div>

      <p className="mb-3 text-xs text-bodydark dark:text-bodydark">
        Showing up to {FETCH_LIMIT} most recent notifications from the server. Type filter applies to
        that set. Use <code className="rounded bg-gray-2 px-1 dark:bg-meta-4">data</code> IDs for
        links (order, sale, purchase, item).
      </p>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[180px] px-4 py-4 font-medium text-black dark:text-white">
                  Type
                </th>
                <th className="min-w-[260px] px-4 py-4 font-medium text-black dark:text-white">
                  Title
                </th>
                <th className="min-w-[320px] px-4 py-4 font-medium text-black dark:text-white">
                  Message
                </th>
                <th className="min-w-[140px] px-4 py-4 font-medium text-black dark:text-white">
                  Read status
                </th>
                <th className="min-w-[180px] px-4 py-4 font-medium text-black dark:text-white">
                  Created
                </th>
                <th className="min-w-[100px] px-4 py-4 font-medium text-black dark:text-white">
                  Open
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {pagedItems.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="border-t border-stroke px-4 py-6 text-center text-sm text-bodydark dark:border-strokedark"
                  >
                    No notifications.
                  </td>
                </tr>
              ) : (
                pagedItems.map((n) => {
                  const href = getNotificationDeepLink(n);
                  return (
                    <tr key={n.id}>
                      <td className="border-t border-stroke px-4 py-3 text-sm dark:border-strokedark">
                        <span title={n.type}>{notificationTypeLabel(n.type)}</span>
                      </td>
                      <td className="border-t border-stroke px-4 py-3 text-sm dark:border-strokedark">
                        {n.title}
                      </td>
                      <td className="border-t border-stroke px-4 py-3 text-sm dark:border-strokedark">
                        {n.message}
                      </td>
                      <td className="border-t border-stroke px-4 py-3 text-sm dark:border-strokedark">
                        {n.isRead ? (
                          <span className="text-success">Read</span>
                        ) : (
                          <span className="text-danger">Unread</span>
                        )}
                      </td>
                      <td className="border-t border-stroke px-4 py-3 text-sm dark:border-strokedark">
                        {new Date(n.createdAt).toLocaleString()}
                      </td>
                      <td className="border-t border-stroke px-4 py-3 text-sm dark:border-strokedark">
                        {href ? (
                          <Link
                            to={href}
                            className="font-medium text-primary hover:underline"
                            onClick={() => {
                              if (!n.isRead) void markRead(n.id);
                            }}
                          >
                            View
                          </Link>
                        ) : (
                          <span className="text-bodydark2">—</span>
                        )}
                      </td>
                      <td className="border-t border-stroke px-4 py-3 text-sm dark:border-strokedark">
                        <div className="flex flex-wrap gap-2">
                          {!n.isRead && (
                            <button
                              type="button"
                              disabled={isMarkingRead}
                              onClick={() => markRead(n.id)}
                              className="rounded bg-primary px-3 py-1.5 text-xs font-medium text-white hover:bg-opacity-90 disabled:opacity-60"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            type="button"
                            disabled={isDeleting}
                            onClick={() => deleteNotification(n.id)}
                            className="rounded bg-danger px-3 py-1.5 text-xs font-medium text-white hover:bg-opacity-90 disabled:opacity-60"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-stroke px-4 py-3 text-sm dark:border-strokedark">
          <div className="text-bodydark">
            {filteredItems.length === 0
              ? "No items"
              : `Showing ${(clientPage - 1) * PAGE_SIZE + 1}–${Math.min(
                  clientPage * PAGE_SIZE,
                  filteredItems.length,
                )} of ${filteredItems.length}`}
            {(data?.items?.length ?? 0) >= FETCH_LIMIT && eventType === "all" && (
              <span className="ml-1 text-bodydark2">(capped at {FETCH_LIMIT})</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border border-stroke px-3 py-1.5 disabled:opacity-50 dark:border-strokedark"
              onClick={() => setClientPage((p) => Math.max(1, p - 1))}
              disabled={clientPage <= 1}
            >
              Prev
            </button>
            <button
              type="button"
              className="rounded border border-stroke px-3 py-1.5 disabled:opacity-50 dark:border-strokedark"
              onClick={() => setClientPage((p) => Math.min(pageCount, p + 1))}
              disabled={clientPage >= pageCount}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
