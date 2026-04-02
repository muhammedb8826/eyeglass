/**
 * Backend `resource.action` codes (see GET /permissions catalog & integration guide §8.3).
 * In-app notifications are JWT-only on the API (no matrix code); UI shows them for any signed-in user.
 */
export const ADMIN_ROLE = "ADMIN";

export const PERMISSION_USERS_MANAGE = "users.manage";
export const PERMISSION_PERMISSIONS_MANAGE = "permissions.manage";

export const PERMISSION_ORDERS_READ = "orders.read";
export const PERMISSION_ORDERS_WRITE = "orders.write";
export const PERMISSION_ORDER_ITEMS_READ = "order_items.read";
export const PERMISSION_ORDER_ITEMS_WRITE = "order_items.write";

export const PERMISSION_CUSTOMERS_READ = "customers.read";
export const PERMISSION_CUSTOMERS_WRITE = "customers.write";

export const PERMISSION_ITEMS_READ = "items.read";
export const PERMISSION_ITEMS_WRITE = "items.write";

export const PERMISSION_PURCHASES_READ = "purchases.read";
export const PERMISSION_PURCHASES_WRITE = "purchases.write";

export const PERMISSION_SALES_READ = "sales.read";
export const PERMISSION_SALES_WRITE = "sales.write";

export const PERMISSION_BINCARD_READ = "bincard.read";

export const PERMISSION_PRICING_READ = "pricing.read";
export const PERMISSION_PRICING_WRITE = "pricing.write";

export const PERMISSION_VENDORS_READ = "vendors.read";
export const PERMISSION_VENDORS_WRITE = "vendors.write";

/** Machines, services, UOM, unit categories, sales partners, non-stock services, user–machine assignments */
export const PERMISSION_MASTER_READ = "master.read";
export const PERMISSION_MASTER_WRITE = "master.write";

export const PERMISSION_BOM_READ = "bom.read";
export const PERMISSION_BOM_WRITE = "bom.write";

export const PERMISSION_LAB_TOOL_READ = "lab_tool.read";
export const PERMISSION_LAB_TOOL_WRITE = "lab_tool.write";

/** Discounts, commissions, fixed costs, payment flows, etc. */
export const PERMISSION_FINANCE_READ = "finance.read";
export const PERMISSION_FINANCE_WRITE = "finance.write";

export const PERMISSION_STOCK_OPS_READ = "stock_ops.read";
export const PERMISSION_STOCK_OPS_WRITE = "stock_ops.write";

export const PERMISSION_FILE_WRITE = "file.write";
