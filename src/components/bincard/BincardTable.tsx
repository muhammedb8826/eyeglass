import { useEffect, useState } from "react";
import { useGetBincardByItemQuery } from "@/redux/bincard/bincardApiSlice";
import { useGetItemBasesQuery } from "@/redux/items/itemsApiSlice";
import Loader from "@/common/Loader";
import Pagination from "@/common/Pagination";
import type { BincardEntryType, BincardReferenceType } from "@/types/BincardType";
import type { ItemBaseType } from "@/types/ItemBaseType";

const REFERENCE_LABELS: Record<BincardReferenceType, string> = {
  OPENING: "Opening stock",
  ORDER: "Order",
  SALE: "Sale",
  PURCHASE: "Purchase",
  ADJUSTMENT: "Adjustment",
};

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

function formatVariantCell(entry: BincardEntryType): string {
  if (entry.itemBaseId) {
    const b = entry.itemBase;
    if (b?.baseCode != null && typeof b.addPower === "number" && !Number.isNaN(b.addPower)) {
      return `${b.baseCode}^+${b.addPower}`;
    }
    return "Variant";
  }
  return "Parent item";
}

function materialLabel(entry: BincardEntryType, fallbackName?: string) {
  return entry.item?.name ?? fallbackName ?? "—";
}

interface BincardTableProps {
  itemId: string;
  itemName?: string;
  pageSize?: number;
  /** When provided, used for variant filter options instead of fetching `/items/:id/bases` again */
  itemBases?: ItemBaseType[];
}

export const BincardTable = ({
  itemId,
  itemName,
  pageSize = 20,
  itemBases: itemBasesProp,
}: BincardTableProps) => {
  const [page, setPage] = useState(1);
  /** `""` = all movements; `"none"` = API parent-level only; else variant UUID */
  const [variantFilter, setVariantFilter] = useState<string>("");

  const { data: basesFetched } = useGetItemBasesQuery(itemId, {
    skip: !itemId || Boolean(itemBasesProp?.length),
  });
  const basesList = itemBasesProp?.length ? itemBasesProp : basesFetched;

  const itemBaseIdParam =
    variantFilter === "" ? undefined : variantFilter === "none" ? "none" : variantFilter;

  useEffect(() => {
    setPage(1);
    setVariantFilter("");
  }, [itemId]);

  useEffect(() => {
    setPage(1);
  }, [variantFilter]);

  const { data, isLoading, isError } = useGetBincardByItemQuery(
    {
      itemId,
      page,
      limit: pageSize,
      itemBaseId: itemBaseIdParam,
    },
    {
      refetchOnFocus: true,
      refetchOnReconnect: true,
    },
  );

  if (!itemId) return null;

  if (isLoading) return <Loader />;
  if (isError) {
    return (
      <div className="rounded border border-stroke bg-white p-4 dark:border-strokedark dark:bg-boxdark">
        <p className="text-danger">
          Failed to load bincard. Please try again.
        </p>
      </div>
    );
  }

  if (!data) return null;

  const { entries, total } = data;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const showVariantFilter = Boolean(basesList && basesList.length > 0);

  const variantFilterSelect = showVariantFilter ? (
    <div className="mt-3 max-w-md">
      <label className="mb-1 block text-xs font-medium text-black dark:text-white">
        Filter by variant
      </label>
      <select
        title="Limit bincard to one variant or parent-level rows only"
        value={variantFilter}
        onChange={(e) => setVariantFilter(e.target.value)}
        className="w-full rounded border border-stroke bg-transparent py-2 px-3 text-sm dark:border-strokedark dark:bg-form-input dark:text-white"
      >
        <option value="">All movements</option>
        <option value="none">Parent level only (no variant)</option>
        {(basesList ?? []).map((b) => (
          <option key={b.id} value={b.id}>
            {b.baseCode}
            {typeof b.addPower === "number" && !Number.isNaN(b.addPower)
              ? `^+${b.addPower}`
              : ""}
          </option>
        ))}
      </select>
    </div>
  ) : null;

  return (
    <div className="rounded border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
      {(itemName || showVariantFilter) && (
        <div className="border-b border-stroke px-4 py-3 dark:border-strokedark">
          {itemName && (
            <>
              <h3 className="text-lg font-medium text-black dark:text-white">
                Bincard – {itemName}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Stock movements (newest first). Total: {total} entries.
                {showVariantFilter && (
                  <span className="mt-1 block text-xs">
                    Balance after is per variant when a variant is shown; parent-level rows
                    use item-level balance.
                  </span>
                )}
              </p>
            </>
          )}
          {variantFilterSelect}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          <thead>
            <tr className="bg-gray-2 text-left dark:bg-meta-4">
              <th className="py-3 px-4 font-medium text-black dark:text-white">
                Date
              </th>
              <th className="py-3 px-4 font-medium text-black dark:text-white">
                Material
              </th>
              <th className="py-3 px-4 font-medium text-black dark:text-white">
                Variant
              </th>
              <th className="py-3 px-4 font-medium text-black dark:text-white">
                Type
              </th>
              <th className="py-3 px-4 font-medium text-black dark:text-white">
                Quantity
              </th>
              <th className="py-3 px-4 font-medium text-black dark:text-white">
                Balance after
              </th>
              <th className="py-3 px-4 font-medium text-black dark:text-white">
                Reference
              </th>
              <th className="py-3 px-4 font-medium text-black dark:text-white">
                Description
              </th>
            </tr>
          </thead>
          <tbody>
            {entries.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No bincard entries for this filter.
                </td>
              </tr>
            ) : (
              entries.map((entry: BincardEntryType) => (
                <tr
                  key={entry.id}
                  className="border-b border-stroke dark:border-strokedark"
                >
                  <td className="py-2 px-4 text-black dark:text-white">
                    {formatDate(entry.createdAt)}
                  </td>
                  <td className="py-2 px-4 text-black dark:text-white">
                    {materialLabel(entry, itemName)}
                  </td>
                  <td className="py-2 px-4 text-gray-700 dark:text-gray-300">
                    {formatVariantCell(entry)}
                  </td>
                  <td className="py-2 px-4">
                    <span
                      className={
                        entry.movementType === "IN"
                          ? "text-success font-medium"
                          : "text-danger font-medium"
                      }
                    >
                      {entry.movementType}
                    </span>
                  </td>
                  <td className="py-2 px-4 text-black dark:text-white">
                    {entry.quantity}
                    {entry.uom?.abbreviation && (
                      <span className="ml-1 text-gray-500">
                        {entry.uom.abbreviation}
                      </span>
                    )}
                  </td>
                  <td className="py-2 px-4 text-black dark:text-white">
                    {entry.balanceAfter}
                  </td>
                  <td className="py-2 px-4 text-black dark:text-white">
                    {REFERENCE_LABELS[entry.referenceType] ?? entry.referenceType}
                  </td>
                  <td className="py-2 px-4 text-gray-600 dark:text-gray-400">
                    {entry.description ?? "–"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex justify-end border-t border-stroke p-3 dark:border-strokedark">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      )}
    </div>
  );
};
