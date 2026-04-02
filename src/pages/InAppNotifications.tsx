import { useMemo, useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import Loader from "@/common/Loader";
import ErroPage from "@/components/common/ErroPage";
import {
  useDeleteNotificationMutation,
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/redux/notifications/notificationsApiSlice";

export default function InAppNotifications() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<"all" | "unread" | "read">("all");

  const { data, isLoading, isError, error } = useGetNotificationsQuery({
    page,
    limit: 20,
    status,
  });
  const [markRead, { isLoading: isMarkingRead }] =
    useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: isMarkingAll }] =
    useMarkAllNotificationsReadMutation();
  const [deleteNotification, { isLoading: isDeleting }] =
    useDeleteNotificationMutation();

  const items = data?.items || [];
  const total = data?.total || 0;
  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / 20)), [total]);

  if (isError) return <ErroPage error={error} />;
  if (isLoading) return <Loader />;

  return (
    <>
      <Breadcrumb pageName="Notifications" />

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <label className="text-sm text-black dark:text-white">Status</label>
          <select
            className="rounded border border-stroke bg-transparent px-3 py-2 text-sm font-medium outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
            value={status}
            onChange={(e) => {
              setPage(1);
              setStatus(e.target.value as typeof status);
            }}
          >
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
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
                  Status
                </th>
                <th className="min-w-[180px] px-4 py-4 font-medium text-black dark:text-white">
                  Created
                </th>
                <th className="px-4 py-4 font-medium text-black dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="border-t border-stroke px-4 py-6 text-center text-sm text-bodydark dark:border-strokedark"
                  >
                    No notifications.
                  </td>
                </tr>
              ) : (
                items.map((n) => (
                  <tr key={n.id}>
                    <td className="border-t border-stroke px-4 py-3 text-sm dark:border-strokedark">
                      {n.type}
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
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-stroke px-4 py-3 text-sm dark:border-strokedark">
          <div className="text-bodydark">
            Page {page} of {pageCount}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="rounded border border-stroke px-3 py-1.5 disabled:opacity-50 dark:border-strokedark"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
            >
              Prev
            </button>
            <button
              type="button"
              className="rounded border border-stroke px-3 py-1.5 disabled:opacity-50 dark:border-strokedark"
              onClick={() => setPage((p) => Math.min(pageCount, p + 1))}
              disabled={page >= pageCount}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

