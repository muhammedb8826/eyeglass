import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import {
  useGetNotificationsQuery,
  useMarkAllNotificationsReadMutation,
  useMarkNotificationReadMutation,
} from "@/redux/notifications/notificationsApiSlice";
import {
  getNotificationDeepLink,
  notificationTypeLabel,
} from "@/utils/notificationDeepLink";

/** Poll unread list + total while logged in (same source as badge count). */
const UNREAD_POLL_MS = 8_000;
const PREVIEW_LIMIT = 10;

/** Same digits as bell badge; cap display at 99+. */
function formatUnreadBadgeCount(n: number): string {
  if (n <= 0) return "0";
  return n > 99 ? "99+" : String(n);
}

const BADGE_COUNT_MIN_W = "min-w-[2rem]";

const DropdownNotification = () => {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    data: listData,
    isFetching: listFetching,
    isError: listError,
  } = useGetNotificationsQuery(
    { page: 1, limit: PREVIEW_LIMIT, status: "unread" },
    {
      skip: !accessToken,
      pollingInterval: UNREAD_POLL_MS,
      refetchOnMountOrArgChange: true,
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  const [markRead] = useMarkNotificationReadMutation();
  const [markAllRead, { isLoading: markingAll }] =
    useMarkAllNotificationsReadMutation();

  /** Server total unread — same number as bell badge and panel header. */
  const unreadTotal = listData?.total ?? 0;
  const items = listData?.items ?? [];
  const badgeText = formatUnreadBadgeCount(unreadTotal);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdownRef.current || !triggerRef.current) return;
      if (
        !dropdownOpen ||
        dropdownRef.current.contains(target as Node) ||
        triggerRef.current.contains(target as Node)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  if (!accessToken) {
    return null;
  }

  return (
    <li className="relative">
      <Link
        ref={triggerRef}
        onClick={(e) => {
          e.preventDefault();
          setDropdownOpen((open) => !open);
        }}
        to="#"
        aria-label={`Notifications${unreadTotal > 0 ? `, ${unreadTotal} unread` : ""}`}
        className="relative flex h-8.5 w-8.5 items-center justify-center rounded-full border-[0.5px] border-stroke bg-gray hover:text-primary dark:border-strokedark dark:bg-meta-4 dark:text-white"
      >
        {unreadTotal > 0 && (
          <span
            className={`absolute -right-1 -top-1 z-1 flex h-5 ${BADGE_COUNT_MIN_W} items-center justify-center rounded-full bg-meta-1 px-1 text-[10px] font-semibold tabular-nums leading-none text-white`}
            title={`${unreadTotal} unread`}
          >
            {badgeText}
          </span>
        )}

        <svg
          className="fill-current duration-300 ease-in-out"
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M16.1999 14.9343L15.6374 14.0624C15.5249 13.8937 15.4687 13.7249 15.4687 13.528V7.67803C15.4687 6.01865 14.7655 4.47178 13.4718 3.31865C12.4312 2.39053 11.0812 1.7999 9.64678 1.6874V1.1249C9.64678 0.787402 9.36553 0.478027 8.9999 0.478027C8.6624 0.478027 8.35303 0.759277 8.35303 1.1249V1.65928C8.29678 1.65928 8.24053 1.65928 8.18428 1.6874C4.92178 2.05303 2.4749 4.66865 2.4749 7.79053V13.528C2.44678 13.8093 2.39053 13.9499 2.33428 14.0343L1.7999 14.9343C1.63115 15.2155 1.63115 15.553 1.7999 15.8343C1.96865 16.0874 2.2499 16.2562 2.55928 16.2562H8.38115V16.8749C8.38115 17.2124 8.6624 17.5218 9.02803 17.5218C9.36553 17.5218 9.6749 17.2405 9.6749 16.8749V16.2562H15.4687C15.778 16.2562 16.0593 16.0874 16.228 15.8343C16.3968 15.553 16.3968 15.2155 16.1999 14.9343ZM3.23428 14.9905L3.43115 14.653C3.5999 14.3718 3.68428 14.0343 3.74053 13.6405V7.79053C3.74053 5.31553 5.70928 3.23428 8.3249 2.95303C9.92803 2.78428 11.503 3.2624 12.6562 4.2749C13.6687 5.1749 14.2312 6.38428 14.2312 7.67803V13.528C14.2312 13.9499 14.3437 14.3437 14.5968 14.7374L14.7655 14.9905H3.23428Z"
            fill=""
          />
        </svg>
      </Link>

      <div
        ref={dropdownRef}
        className={`absolute -right-27 mt-2.5 flex max-h-90 w-75 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark sm:right-0 sm:w-80 ${
          dropdownOpen ? "block" : "hidden"
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-4.5 py-3">
          <h5 className="text-sm font-medium text-bodydark2">
            <span className="text-black dark:text-white">Unread</span>
            {unreadTotal > 0 && (
              <span
                className={`ml-1.5 inline-flex ${BADGE_COUNT_MIN_W} justify-center rounded bg-meta-1/15 px-1.5 py-0.5 text-xs font-semibold tabular-nums text-meta-1 dark:bg-meta-1/25 dark:text-meta-1`}
                title={`${unreadTotal} unread (same as bell)`}
              >
                {badgeText}
              </span>
            )}
          </h5>
          <button
            type="button"
            disabled={unreadTotal === 0 || markingAll}
            onClick={() => markAllRead()}
            className="text-xs font-medium text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            Mark all read
          </button>
        </div>

        <ul className="flex max-h-64 flex-col overflow-y-auto">
          {listFetching && (
            <li className="border-t border-stroke px-4.5 py-3 text-sm text-bodydark2 dark:border-strokedark">
              Loading…
            </li>
          )}

          {!listFetching && listError && (
            <li className="border-t border-stroke px-4.5 py-3 text-sm text-meta-1 dark:border-strokedark">
              Could not load notifications.
            </li>
          )}

          {!listFetching && !listError && items.length === 0 && (
            <li className="border-t border-stroke px-4.5 py-3 dark:border-strokedark">
              <p className="text-sm text-black dark:text-white">
                No unread notifications
              </p>
            </li>
          )}

          {!listFetching &&
            !listError &&
            items.map((n) => {
              const href = getNotificationDeepLink(n);
              const rowClass =
                "flex w-full flex-col gap-1 border-t border-stroke px-4.5 py-3 text-left bg-gray-2/60 hover:bg-gray-2 dark:border-strokedark dark:bg-meta-4/40 dark:hover:bg-meta-4";
              const inner = (
                <>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-black dark:text-white">
                      {n.title}
                    </p>
                    <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-primary">
                      {notificationTypeLabel(n.type)}
                    </span>
                  </div>
                  <p className="text-xs text-bodydark2">{n.message}</p>
                  <p className="text-[11px] text-bodydark2">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </>
              );
              return (
                <li key={n.id}>
                  {href ? (
                    <Link
                      to={href}
                      className={rowClass}
                      onClick={() => {
                        setDropdownOpen(false);
                        void markRead(n.id);
                      }}
                    >
                      {inner}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      className={rowClass}
                      onClick={() => {
                        void markRead(n.id);
                      }}
                    >
                      {inner}
                    </button>
                  )}
                </li>
              );
            })}
          {!listFetching && unreadTotal > items.length && (
            <li className="border-t border-stroke px-4.5 py-2 text-center text-xs text-bodydark2 dark:border-strokedark">
              +{unreadTotal - items.length} more unread — open{" "}
              <Link
                to="/dashboard/in-app-notifications"
                className="font-medium text-primary hover:underline"
                onClick={() => setDropdownOpen(false)}
              >
                View all
              </Link>
            </li>
          )}
        </ul>

        <div className="border-t border-stroke px-4.5 py-3 dark:border-strokedark">
          <Link
            onClick={() => setDropdownOpen(false)}
            className="block text-center text-sm font-medium text-primary"
            to="/dashboard/in-app-notifications"
          >
            View all
          </Link>
        </div>
      </div>
    </li>
  );
};

export default DropdownNotification;
