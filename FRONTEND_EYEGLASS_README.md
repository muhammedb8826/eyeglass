## Overview

The backend now supports **eyeglass lens production**:

- Stores **patient (customer)** data including DOB and gender.
- Stores **order-level prescription metadata** (prescription date, optometrist, urgency).
- Stores **per‑order‑item lens prescription and lens parameters** (SPH/CYL/AXIS/ADD, PD, material, coating, index, etc.).
- Existing order/pricing logic continues to work; the new fields are additive.

Base URL, auth, and general API behavior are as in `FRONTEND_GUIDE.md` (e.g. `http://host:8080/api/v1` with Bearer JWT).

---

## 1. Customer (Patient) Data

### New fields on `Customer`

- `dateOfBirth` – `string` (ISO date `YYYY-MM-DD`), optional  
- `gender` – `string`, optional

### Example payload (create/update customer)

```json
{
  "fullName": "John Doe",
  "email": "john@example.com",
  "phone": "+251900000000",
  "address": "123 Main St",
  "dateOfBirth": "1980-05-12",
  "gender": "MALE"
}
```

When reading customers (`GET /api/v1/customers` or `/customers/:id`), expect these fields to be present if set.

---

## 2. Order-Level Prescription Metadata

### New fields on `Order`

- `prescriptionDate` – `string` (ISO datetime or date), optional  
- `optometristName` – `string`, optional  
- `urgency` – `string` (e.g. `"STANDARD"`, `"RUSH"`), optional  

These fields are exposed through `CreateOrderDto` / `UpdateOrderDto`.

### Example `POST /api/v1/orders` body (simplified)

```json
{
  "series": "ORD-2025-0001",
  "customerId": "uuid-of-customer",
  "status": "Pending",
  "orderDate": "2025-03-01T10:00:00.000Z",
  "prescriptionDate": "2025-02-28T00:00:00.000Z",
  "optometristName": "Dr. Smith",
  "urgency": "RUSH",
  "orderSource": "WEB",
  "deliveryDate": "2025-03-05T00:00:00.000Z",
  "totalAmount": 0,
  "tax": 0,
  "grandTotal": 0,
  "totalQuantity": 0,
  "internalNote": "High-priority job",
  "fileNames": [],
  "adminApproval": false,
  "orderItems": [ /* see section 3 */ ]
}
```

- For **updates** (`PATCH /api/v1/orders/:id`), you can send these fields inside the body; if omitted they stay unchanged.

---

## 3. Order Item Prescription & Lens Fields

Each order item (line in an order) can capture a complete prescription and lens spec.

### New fields on `OrderItems` / `CreateOrderItemDto` / `UpdateOrderItemDto`

All are optional unless your frontend enforces them:

**Rx per eye:**

- `sphereRight`, `sphereLeft` – `number`
- `cylinderRight`, `cylinderLeft` – `number`
- `axisRight`, `axisLeft` – `number` (0–180)
- `addRight`, `addLeft` – `number`

**PD:**

- `pd` – binocular PD (`number`)
- `pdMonocularRight`, `pdMonocularLeft` – monocular PDs (`number`)

**Lens parameters:**

- `lensType` – `string` (e.g. `"SINGLE_VISION"`, `"BIFOCAL"`, `"PROGRESSIVE"`)
- `lensMaterial` – `string` (e.g. `"CR-39"`, `"POLYCARBONATE"`, `"HI-INDEX_1.67"`)
- `lensCoating` – `string` (e.g. `"AR"`, `"AR_ANTI_SCRATCH"`)
- `lensIndex` – `number` (e.g. `1.5`, `1.59`, `1.67`)
- `baseCurve` – `number`
- `diameter` – `number`
- `tintColor` – `string`, optional (e.g. `"GRAY"`, `"BROWN"`)

These sit **in addition** to existing fields:

- `itemId`, `serviceId` / `nonStockServiceId`, `isNonStockService`
- `pricingId`, `uomId`, `baseUomId`
- `quantity`, `unitPrice`, `totalAmount`, `discount`, `level`, `status`, etc.

### Example order item in `orderItems` array

```json
{
  "itemId": "uuid-of-lens-blank-item",
  "serviceId": "uuid-of-lab-service",          // or nonStockServiceId + isNonStockService: true
  "isNonStockService": false,
  "pricingId": "uuid-of-pricing",
  "uomId": "uuid-of-uom",
  "baseUomId": "uuid-of-base-uom",
  "quantity": 1,
  "unitPrice": 500,
  "totalAmount": 500,
  "level": 1,
  "adminApproval": false,
  "isDiscounted": false,
  "status": "Pending",
  "description": "SV lenses, AR coating",

  "sphereRight": -2.00,
  "sphereLeft": -1.50,
  "cylinderRight": -0.50,
  "cylinderLeft": -0.75,
  "axisRight": 180,
  "axisLeft": 170,
  "addRight": 0.0,
  "addLeft": 0.0,
  "pd": 62,
  "pdMonocularRight": 31,
  "pdMonocularLeft": 31,
  "lensType": "SINGLE_VISION",
  "lensMaterial": "POLYCARBONATE",
  "lensCoating": "AR",
  "lensIndex": 1.59,
  "baseCurve": 4.0,
  "diameter": 70.0,
  "tintColor": null
}
```

- For **creating orders**: send these inside `orderItems` in `POST /orders`.
- For **updating existing order items**: send them via `PATCH /order-items/:id` (they’re part of `UpdateOrderItemDto`).

The backend persists these values and returns them in:

- `GET /orders`, `GET /orders/:id` (in `orderItems[]`)
- `GET /order-items`, `GET /order-items/:id`

You can then:

- Show them in **Rx detail dialogs**, **job tickets**, and **production screens**.
- Use them to filter or search orders on the frontend if desired.

---

## 4. Lens Blank Metadata on Items

`Item` entities can be labeled as lens blanks and carry lens-specific metadata.

### New item fields

- `lensMaterial` – e.g. `"CR-39"`, `"POLYCARBONATE"`, `"HI-INDEX_1.67"`
- `lensIndex` – e.g. `1.5`, `1.6`, `1.67`
- `lensType` – e.g. `"SINGLE_VISION"`, `"PROGRESSIVE"`

### Example `POST /api/v1/items` (simplified)

```json
{
  "name": "SV Polycarbonate 1.59",
  "description": "Single vision polycarbonate blank",
  "reorder_level": 50,
  "initial_stock": 200,
  "updated_initial_stock": 200,
  "machineId": "uuid-of-machine",
  "quantity": 200,
  "unitCategoryId": "uuid-of-unit-category",
  "defaultUomId": "uuid-of-pair-uom",
  "purchaseUomId": "uuid-of-pair-uom",

  "lensMaterial": "POLYCARBONATE",
  "lensIndex": 1.59,
  "lensType": "SINGLE_VISION"
}
```

On reads (`GET /items` / `/items/:id`), use these fields to:

- Group items in dropdowns (e.g. by material or index).
- Auto-fill some lens defaults when creating an order item.

---

## 5. Backwards Compatibility & Migration Strategy

- All new fields are **optional**; existing clients that don’t send them still work.
- You can roll out changes gradually:

  - Phase 1: Show new fields in **read-only views** (order details, job tickets).
  - Phase 2: Add fields to **create/edit forms** for orders and order items.
  - Phase 3: Add client-side validation rules for prescription ranges and completeness.

No additional endpoints were introduced; all changes are **additive extensions** of existing payloads and responses.

