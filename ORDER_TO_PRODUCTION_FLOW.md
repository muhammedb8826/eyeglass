# Order to Production Flow (Frontend)

This document describes how **order item statuses** work from order creation through lens production and delivery, and how the frontend interacts with the backend. It aligns with the backend flow described in ORDER_TO_PRODUCTION_FLOW.md (backend repo).

---

## Order item statuses (eyeglass manufacturing standard)

Order items use this lifecycle:

**Pending** → **InProgress** → **Ready** → **Delivered**  
(or **Cancelled** at any time before Delivered)

| Status       | Meaning                          | Backend behavior |
|-------------|-----------------------------------|------------------|
| **Pending** | Order received, not yet in production | — |
| **InProgress** | Lens in production             | For **stock** items: reduces **operator stock** by `unit`, records **bincard** OUT. Requires sufficient operator stock; otherwise 409 Conflict. |
| **Ready**   | Production done, ready for pickup/delivery | — |
| **Delivered** | Handed to customer            | If payment term has `forcePayment` and `remainingAmount > 0`, backend blocks with 409. |
| **Cancelled** | Job cancelled                 | Same stock reduction as InProgress (stock is consumed). Reverting from Cancelled restores stock. |

**Order status** is derived from its items (e.g. all items InProgress → order InProgress; all Delivered → order Delivered; mixed → often "Processing").

---

## Current frontend status labels

The UI may show a different set of labels that map to the standard flow. For example:

- **Received** → treated as order received (similar to **Pending**).
- **Edited** / **Approved** → workflow states before production.
- **Printed** → often used when production has started (similar to **InProgress** for stock consumption).
- **Completed** → production done (similar to **Ready**).
- **Delivered** → same as standard **Delivered**.
- **Void** → job cancelled (similar to **Cancelled**).

The backend may accept either the standard statuses (`Pending`, `InProgress`, `Ready`, `Delivered`, `Cancelled`) or the legacy labels above. When integrating, ensure the value sent in **PATCH order-items** matches what the backend expects and triggers the correct behavior (e.g. stock reduction only when the backend considers the item “in production”).

---

## How the frontend updates order item status

1. **API**  
   **PATCH /api/v1/order-items/:id** with body including `status` (and other fields as needed).  
   Implemented via RTK Query: `useUpdateOrderItemMutation()` in `src/redux/order/orderApiSlice.ts`.

2. **Order Details page**  
   - **OrderDetailsPage** (`src/components/order/OrderDetailsPage.tsx`) loads an order and displays each order item with its current status.
   - The status dropdown/actions (e.g. “Mark as Printed”, “Mark as Completed”, “Mark as Delivered”, “Mark as Void”) call `handleUpdateItemStatus(index, newStatus)`.
   - That handler calls `updateOrderItem({ id: formData[index].id, ...formData[index], status: newStatus })`, which sends **PATCH** to `/order-items/:id` with the new status.
   - After a successful update, the order is refetched (via invalidateTags), so the UI and any derived order status stay in sync.

3. **To “produce the lenses” from the UI**  
   - Ensure the order is created/updated (pricing and lab tools are validated at order create/update).
   - Ensure **operator stock** is available for each lens item (handled outside this page, e.g. stock requests).
   - On Order Details, for each order item, set status to the value that the backend treats as **InProgress** (e.g. `InProgress` or `Printed`), so the backend reduces operator stock and records bincard.
   - Then move items to **Ready** (e.g. `Completed`) and **Delivered** as needed. Use **Cancelled**/Void only when the job is cancelled.

---

## Order create/update (relevant to production)

- **POST /api/v1/orders** and **PATCH /api/v1/orders/:id**  
  The backend resolves pricing, calculates totals, and for items with a base curve runs the **lab tool check** (at least one lab tool must cover that base curve with `quantity > 0`). If not, the request fails so the order cannot be produced without the right tools.
- The frontend order form (Order Registration and Order Details) sends full order and order-item payloads; lab tool and pricing validation are done on the backend.

---

## Order delete

The backend allows order delete only when **all** order items are in **Pending** (or the equivalent “not yet in production”) status. The frontend does not need to send status for delete; the backend enforces this rule.

---

## Optional backend improvements (for reference)

These are not required for the basic flow but may be added later:

- **Lab tool check at InProgress** – Re-check (and optionally decrement) lab tool availability when an item’s status changes to InProgress.
- **Lab tool reservation/decrement** – Reserve or decrement the matching lab tool at InProgress and restore when reverted.
- **“Can produce” endpoint** – e.g. **GET /api/v1/orders/:id/can-produce** returning whether the order is ready for production (operator stock, lab tools, optionally payment). The frontend could call this before showing “Start production” or enabling the InProgress action.

---

## Summary

- **Order item statuses:** Pending → InProgress → Ready → Delivered (or Cancelled). InProgress and Cancelled consume operator stock.
- **Order status** is derived from its items.
- **Frontend:** Use **Order Details** and the status actions to move items through the flow; each update is sent via **PATCH /api/v1/order-items/:id** with the new `status`.
- **Producing lenses:** Set each item to the status that the backend treats as InProgress (e.g. `InProgress` or `Printed`) so stock is reduced and bincard updated; then Ready → Delivered as appropriate.
