# Frontend Guide (Eyeglass Lens Lab)

## User roles (eyeglass lens lab standard)

The application uses the following roles. Permissions and visibility (e.g. order notifications, purchase approvals, settings) are based on these values.

| Role | Value | Typical use |
|------|--------|-------------|
| User | `USER` | Basic access |
| Admin | `ADMIN` | Full access; settings, all notifications, approvals |
| Reception | `RECEPTION` | Orders, reception flow, delivery |
| Lab technician | `LAB_TECHNICIAN` | Lab work, order items (pending/design), Rx |
| Operator | `OPERATOR` | Production; order items in progress (assigned machines) |
| Finance | `FINANCE` | Finance, purchase approvals, discounts |
| Dispenser | `DISPENSER` | Dispensing, delivery-related actions |
| Purchaser | `PURCHASER` | Purchases, receive stock, store requests |

Backend and frontend must use these exact role values (e.g. `ADMIN`, `LAB_TECHNICIAN`). When adding role-based UI or API checks, refer to this list.
