/**
 * Backend fan-out notifications (see integration guide §9.6).
 * `data` often includes `orderId`, `saleId`, `purchaseId`, `itemId`, `orderItemId`, etc. for deep links.
 */
export type NotificationType = {
  id: string;
  recipientId: string;
  type: string;
  title: string;
  message: string;
  data?: Record<string, unknown> | null;
  isRead: boolean;
  readAt: string | null;
  createdAt: string;
};

export type NotificationsListResponse = {
  items: NotificationType[];
  total: number;
  page: number;
  limit: number;
};

