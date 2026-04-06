/**
 * Order line `status` values for eyeglass production + retail handoff (API contract).
 * @see Eyeglass Lens API – §4.3.2 Order line lifecycle
 */
export const ORDER_LINE_STATUS = {
  PENDING: "Pending",
  IN_PROGRESS: "InProgress",
  READY: "Ready",
  SENT_TO_SHOP: "SentToShop",
  SHOP_RECEIVED: "ShopReceived",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
} as const;

/** Line or order header in these states locks Rx/pricing/item edits */
export const CONTENT_LOCKED_LINE_STATUSES: Set<string> = new Set([
  ORDER_LINE_STATUS.IN_PROGRESS,
  ORDER_LINE_STATUS.READY,
  ORDER_LINE_STATUS.SENT_TO_SHOP,
  ORDER_LINE_STATUS.SHOP_RECEIVED,
]);

export const CONTENT_LOCKED_ORDER_HEADER_STATUSES: Set<string> = new Set([
  ORDER_LINE_STATUS.IN_PROGRESS,
  ORDER_LINE_STATUS.READY,
  ORDER_LINE_STATUS.SENT_TO_SHOP,
  ORDER_LINE_STATUS.SHOP_RECEIVED,
]);

/** Cannot start production from these line statuses */
export const PRODUCTION_STARTED_OR_LATER_STATUSES: Set<string> = new Set([
  ORDER_LINE_STATUS.IN_PROGRESS,
  ORDER_LINE_STATUS.READY,
  ORDER_LINE_STATUS.SENT_TO_SHOP,
  ORDER_LINE_STATUS.SHOP_RECEIVED,
  ORDER_LINE_STATUS.DELIVERED,
  ORDER_LINE_STATUS.CANCELLED,
]);
