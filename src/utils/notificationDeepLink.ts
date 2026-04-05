import type { NotificationType } from "@/types/NotificationType";

/** Known backend notification kinds (§9.6); others still render as raw `type`. */
export const APP_NOTIFICATION_TYPES = [
  "SECURITY",
  "ORDER",
  "QC",
  "STORE_REQUEST",
  "PURCHASE",
  "INVENTORY",
] as const;

export type AppNotificationKind = (typeof APP_NOTIFICATION_TYPES)[number];

function dataString(data: Record<string, unknown> | null | undefined, key: string): string | null {
  const v = data?.[key];
  return typeof v === "string" && v.trim().length > 0 ? v : null;
}

/**
 * Resolves a dashboard path from `notification.data` (orderId, saleId, purchaseId, itemId, …).
 * Returns null when there is no safe link.
 */
export function getNotificationDeepLink(
  n: Pick<NotificationType, "type" | "data">,
): string | null {
  const d = (n.data && typeof n.data === "object" ? n.data : null) as Record<
    string,
    unknown
  > | null;

  const orderId = dataString(d, "orderId");
  const saleId = dataString(d, "saleId");
  const purchaseId = dataString(d, "purchaseId");
  const itemId = dataString(d, "itemId");

  switch (n.type) {
    case "ORDER":
    case "QC":
      if (orderId) return `/dashboard/order/${orderId}`;
      return null;
    case "STORE_REQUEST":
      if (saleId) return `/dashboard/inventory/store-request/${saleId}`;
      if (orderId) return `/dashboard/order/${orderId}`;
      return null;
    case "PURCHASE":
      if (purchaseId) return `/dashboard/inventory/purchases/${purchaseId}`;
      return null;
    case "INVENTORY":
      if (itemId) return `/dashboard/inventory/items/${itemId}`;
      return null;
    case "SECURITY":
    default:
      return null;
  }
}

export function notificationTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    SECURITY: "Security",
    ORDER: "Order",
    QC: "Quality control",
    STORE_REQUEST: "Store request",
    PURCHASE: "Purchase",
    INVENTORY: "Inventory",
  };
  return labels[type] ?? type;
}
