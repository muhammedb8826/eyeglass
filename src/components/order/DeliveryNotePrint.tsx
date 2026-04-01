import { forwardRef } from "react";
import type { OrderType } from "@/types/OrderType";
import type { OrderItemType } from "@/types/OrderItemType";
import type { CustomerType } from "@/types/CustomerType";
import type { ItemType } from "@/types/ItemType";
import type { ServiceType } from "@/types/ServiceType";
import type { PaymentTransactions } from "@/types/PaymentTransactions";

type PaymentRow = Omit<PaymentTransactions, "date"> & { date: string };

const dash = (v: unknown): string => {
  if (v === null || v === undefined || v === "") return "—";
  return String(v);
};

const fmtMoney = (n: number | undefined): string =>
  typeof n === "number" && !Number.isNaN(n) ? n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—";

const fmtDiopter = (v: number | undefined): string =>
  typeof v === "number" && !Number.isNaN(v) ? v.toFixed(2) : "—";

const lineQtyLabel = (row: OrderItemType): string => {
  const r = row.quantityRight;
  const l = row.quantityLeft;
  const usePerEye =
    typeof r === "number" &&
    !Number.isNaN(r) &&
    typeof l === "number" &&
    !Number.isNaN(l);
  if (usePerEye) return `R ${r} / L ${l} (Σ ${r + l})`;
  return dash(row.quantity);
};

const serviceLabel = (
  serviceId: string | undefined,
  services: ServiceType[] | undefined,
  nonStock: ServiceType[] | undefined,
): string => {
  if (!serviceId) return "—";
  return (
    services?.find((s) => s.id === serviceId)?.name ||
    nonStock?.find((s) => s.id === serviceId)?.name ||
    "—"
  );
};

const uomLabel = (row: OrderItemType): string =>
  row.uom?.abbreviation ||
  row.uomsOptions?.find((u) => u.id === row.uomId)?.abbreviation ||
  dash(row.uomId);

const dimensionsLabel = (row: OrderItemType): string => {
  const w = row.width;
  const h = row.height;
  if ((w === "" || w === undefined) && (h === "" || h === undefined)) return "—";
  return `${dash(w)} × ${dash(h)}`;
};

const buildSpecs = (row: OrderItemType): string => {
  const parts: string[] = [];

  const rx: string[] = [];
  if (
    row.sphereRight != null ||
    row.sphereLeft != null ||
    row.cylinderRight != null ||
    row.cylinderLeft != null
  ) {
    rx.push(
      `Sph R ${fmtDiopter(row.sphereRight)} / L ${fmtDiopter(row.sphereLeft)}`,
    );
    rx.push(
      `Cyl R ${fmtDiopter(row.cylinderRight)} / L ${fmtDiopter(row.cylinderLeft)}`,
    );
    rx.push(
      `Axis R ${dash(row.axisRight)} / L ${dash(row.axisLeft)}`,
    );
    rx.push(
      `Add R ${fmtDiopter(row.addRight)} / L ${fmtDiopter(row.addLeft)}`,
    );
    if (row.pd != null) rx.push(`PD ${row.pd}`);
    if (row.pdMonocularRight != null || row.pdMonocularLeft != null) {
      rx.push(
        `PD mono R ${dash(row.pdMonocularRight)} / L ${dash(row.pdMonocularLeft)}`,
      );
    }
    if (row.prismRight != null || row.prismLeft != null) {
      rx.push(`Prism R ${dash(row.prismRight)} / L ${dash(row.prismLeft)}`);
    }
    parts.push(rx.join("\n"));
  }

  const lens: string[] = [];
  if (row.lensType) lens.push(`Type: ${row.lensType}`);
  if (row.lensMaterial) lens.push(`Material: ${row.lensMaterial}`);
  if (row.lensCoating) lens.push(`Coating: ${row.lensCoating}`);
  if (row.lensIndex != null) lens.push(`Index: ${row.lensIndex}`);
  if (row.baseCurve != null) lens.push(`Base curve: ${row.baseCurve}`);
  if (row.diameter != null) lens.push(`Ø: ${row.diameter}`);
  if (row.tintColor) lens.push(`Tint: ${row.tintColor}`);
  if (row.itemBase?.baseCode) lens.push(`Base: ${row.itemBase.baseCode}`);
  if (lens.length) parts.push(lens.join("\n"));

  if (row.description) parts.push(`Desc: ${row.description}`);

  const notes = row.orderItemNotes
    ?.map((n) => n.text)
    .filter(Boolean)
    .join("; ");
  if (notes) parts.push(`Notes: ${notes}`);

  if (row.storeRequestStatus && row.storeRequestStatus !== "None") {
    parts.push(`Store: ${row.storeRequestStatus}`);
  }
  if (row.approvalStatus) parts.push(`Approval: ${row.approvalStatus}`);
  if (row.qualityControlStatus) parts.push(`QC: ${row.qualityControlStatus}`);

  return parts.length ? parts.join("\n\n") : "—";
};

const lineTotal = (row: OrderItemType): number => {
  const fromRow = row.totalAmount;
  if (typeof fromRow === "number" && !Number.isNaN(fromRow)) return fromRow;
  const q = parseFloat(row.quantity?.toString() || "0");
  const u = parseFloat(row.unitPrice?.toString() || "0");
  return q * u;
};

export type DeliveryNotePrintProps = {
  orderInfo: OrderType;
  customer: CustomerType | null | undefined;
  lines: OrderItemType[];
  items: ItemType[] | undefined;
  services: ServiceType[] | undefined;
  nonStockServices: ServiceType[] | undefined;
  discountAmount: number;
  paymentTransactions: PaymentRow[];
  totalPaid: number;
  remainingBalance: number;
  salesPartnerName: string;
  totalCommission: number;
};

export const DeliveryNotePrint = forwardRef<HTMLDivElement, DeliveryNotePrintProps>(
  function DeliveryNotePrint(
    {
      orderInfo,
      customer,
      lines,
      items,
      services,
      nonStockServices,
      discountAmount,
      paymentTransactions,
      totalPaid,
      remainingBalance,
      salesPartnerName,
      totalCommission,
    },
    ref,
  ) {
    const printedAt = new Date().toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });

    const itemName = (itemId: string) =>
      items?.find((i) => i.id === itemId)?.name || "—";

    return (
      <div
        ref={ref}
        className="delivery-note-print bg-white p-6 text-black"
        style={{ width: "210mm", maxWidth: "100%", fontSize: "11px", lineHeight: 1.35 }}
      >
        <header className="border-b-2 border-black pb-3 mb-4">
          <h1 className="text-xl font-bold tracking-wide">DELIVERY NOTE</h1>
          <p className="text-gray-700 mt-1">Order reference and dispatch details</p>
        </header>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div>
            <p className="font-semibold text-xs uppercase text-gray-600">Order</p>
            <p>
              <span className="font-medium">Series:</span> {dash(orderInfo.series)}
            </p>
            <p>
              <span className="font-medium">Status:</span> {dash(orderInfo.status)}
            </p>
            <p>
              <span className="font-medium">Order date:</span> {dash(orderInfo.orderDate)}
            </p>
            <p>
              <span className="font-medium">Delivery date:</span> {dash(orderInfo.deliveryDate)}
            </p>
            <p>
              <span className="font-medium">Prescription date:</span>{" "}
              {orderInfo.prescriptionDate ? dash(orderInfo.prescriptionDate) : "—"}
            </p>
            <p>
              <span className="font-medium">Optometrist:</span>{" "}
              {dash(orderInfo.optometristName)}
            </p>
            <p>
              <span className="font-medium">Urgency:</span> {dash(orderInfo.urgency)}
            </p>
            <p>
              <span className="font-medium">Source:</span> {dash(orderInfo.orderSource)}
            </p>
            <p>
              <span className="font-medium">Admin approval:</span>{" "}
              {orderInfo.adminApproval ? "Yes" : "No"}
            </p>
          </div>
          <div>
            <p className="font-semibold text-xs uppercase text-gray-600">Deliver to</p>
            <p className="font-medium">{dash(customer?.fullName)}</p>
            {customer?.company ? (
              <p>
                <span className="font-medium">Company:</span> {customer.company}
              </p>
            ) : null}
            <p>
              <span className="font-medium">Phone:</span> {dash(customer?.phone)}
            </p>
            <p>
              <span className="font-medium">Email:</span> {dash(customer?.email)}
            </p>
            <p className="whitespace-pre-wrap">
              <span className="font-medium">Address:</span> {dash(customer?.address)}
            </p>
          </div>
        </div>

        <p className="text-xs text-gray-600 mb-2">Printed: {printedAt}</p>

        <table className="w-full border-collapse border border-black text-left mb-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-black px-1 py-1 w-6 font-semibold">#</th>
              <th className="border border-black px-1 py-1 font-semibold min-w-[72px]">Item</th>
              <th className="border border-black px-1 py-1 font-semibold min-w-[64px]">Service</th>
              <th className="border border-black px-1 py-1 font-semibold">Specifications</th>
              <th className="border border-black px-1 py-1 font-semibold w-16">UOM</th>
              <th className="border border-black px-1 py-1 font-semibold w-20">Qty</th>
              <th className="border border-black px-1 py-1 font-semibold w-16">W×H</th>
              <th className="border border-black px-1 py-1 font-semibold w-16 text-right">Unit</th>
              <th className="border border-black px-1 py-1 font-semibold w-18 text-right">Line</th>
              <th className="border border-black px-1 py-1 font-semibold w-20">Status</th>
            </tr>
          </thead>
          <tbody>
            {lines.length === 0 ? (
              <tr>
                <td colSpan={10} className="border border-black px-2 py-2 text-center">
                  No line items
                </td>
              </tr>
            ) : (
              lines.map((row, index) => (
                <tr key={row.id || index} className="align-top break-inside-avoid">
                  <td className="border border-black px-1 py-1">{index + 1}</td>
                  <td className="border border-black px-1 py-1">{itemName(row.itemId)}</td>
                  <td className="border border-black px-1 py-1">
                    {serviceLabel(row.serviceId, services, nonStockServices)}
                  </td>
                  <td className="border border-black px-1 py-1 text-[10px] whitespace-pre-wrap">
                    {buildSpecs(row)}
                  </td>
                  <td className="border border-black px-1 py-1">{uomLabel(row)}</td>
                  <td className="border border-black px-1 py-1">{lineQtyLabel(row)}</td>
                  <td className="border border-black px-1 py-1">{dimensionsLabel(row)}</td>
                  <td className="border border-black px-1 py-1 text-right">
                    {fmtMoney(
                      typeof row.unitPrice === "number" ? row.unitPrice : parseFloat(String(row.unitPrice || 0)),
                    )}
                  </td>
                  <td className="border border-black px-1 py-1 text-right">
                    {fmtMoney(lineTotal(row))}
                  </td>
                  <td className="border border-black px-1 py-1">{dash(row.status)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="font-semibold text-xs uppercase text-gray-600 mb-1">Totals</p>
            <p>
              <span className="font-medium">Total quantity:</span>{" "}
              {typeof orderInfo.totalQuantity === "number"
                ? orderInfo.totalQuantity.toLocaleString()
                : dash(orderInfo.totalQuantity)}
            </p>
            <p>
              <span className="font-medium">Total amount:</span>{" "}
              {fmtMoney(orderInfo.totalAmount)}
            </p>
            {discountAmount > 0 ? (
              <p>
                <span className="font-medium">Order discount:</span>{" "}
                {fmtMoney(discountAmount)}
              </p>
            ) : null}
            <p className="font-semibold">
              <span className="font-medium">Grand total:</span>{" "}
              {fmtMoney(orderInfo.grandTotal)}
            </p>
          </div>
          <div>
            <p className="font-semibold text-xs uppercase text-gray-600 mb-1">Payments</p>
            {paymentTransactions.length === 0 ? (
              <p>—</p>
            ) : (
              <table className="w-full border-collapse border border-black text-[10px]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-black px-1 py-0.5 text-left">Date</th>
                    <th className="border border-black px-1 py-0.5 text-left">Method</th>
                    <th className="border border-black px-1 py-0.5 text-left">Ref.</th>
                    <th className="border border-black px-1 py-0.5 text-right">Amount</th>
                    <th className="border border-black px-1 py-0.5 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {paymentTransactions.map((t, i) => (
                    <tr key={i}>
                      <td className="border border-black px-1 py-0.5">{dash(t.date)}</td>
                      <td className="border border-black px-1 py-0.5">{dash(t.paymentMethod)}</td>
                      <td className="border border-black px-1 py-0.5">{dash(t.reference)}</td>
                      <td className="border border-black px-1 py-0.5 text-right">
                        {fmtMoney(Number(t.amount))}
                      </td>
                      <td className="border border-black px-1 py-0.5">{dash(t.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <p className="mt-1">
              <span className="font-medium">Recorded payments:</span> {fmtMoney(totalPaid)}
            </p>
            <p>
              <span className="font-medium">Balance:</span> {fmtMoney(remainingBalance)}
            </p>
          </div>
        </div>

        {totalCommission > 0 || salesPartnerName ? (
          <div className="mb-4 border border-black p-2">
            <p className="font-semibold text-xs uppercase text-gray-600 mb-1">Commission</p>
            <p>
              <span className="font-medium">Sales partner:</span> {dash(salesPartnerName)}
            </p>
            {totalCommission > 0 ? (
              <p>
                <span className="font-medium">Commission total:</span>{" "}
                {fmtMoney(totalCommission)}
              </p>
            ) : null}
          </div>
        ) : null}

        <div className="mb-6">
          <p className="font-semibold text-xs uppercase text-gray-600 mb-1">Internal / delivery notes</p>
          <p className="whitespace-pre-wrap border border-gray-400 min-h-[48px] p-2">
            {orderInfo.internalNote?.trim() ? orderInfo.internalNote : "—"}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-8 mt-10 pt-4 border-t border-gray-400">
          <div>
            <p className="text-xs text-gray-600 mb-8">Prepared by</p>
            <div className="border-t border-black pt-1 text-xs">Name & signature</div>
          </div>
          <div>
            <p className="text-xs text-gray-600 mb-8">Received by (customer)</p>
            <div className="border-t border-black pt-1 text-xs">Name & signature & date</div>
          </div>
        </div>
      </div>
    );
  },
);
