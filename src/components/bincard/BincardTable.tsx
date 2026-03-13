import { useEffect, useState } from "react";
import { useGetBincardByItemQuery } from "@/redux/bincard/bincardApiSlice";
import Loader from "@/common/Loader";
import Pagination from "@/common/Pagination";
import type { BincardEntryType, BincardReferenceType } from "@/types/BincardType";

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

interface BincardTableProps {
  itemId: string;
  itemName?: string;
  pageSize?: number;
}

export const BincardTable = ({
  itemId,
  itemName,
  pageSize = 20,
}: BincardTableProps) => {
  const [page, setPage] = useState(1);
  
  // Ensure we always start from page 1 when the item changes
  useEffect(() => {
    setPage(1);
  }, [itemId]);
  const { data, isLoading, isError } = useGetBincardByItemQuery({
    itemId,
    page,
    limit: pageSize,
  });

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

  return (
    <div className="rounded border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
      {itemName && (
        <div className="border-b border-stroke px-4 py-3 dark:border-strokedark">
          <h3 className="text-lg font-medium text-black dark:text-white">
            Bincard – {itemName}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Stock movements (newest first). Total: {total} entries.
          </p>
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
                  colSpan={6}
                  className="py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  No bincard entries for this item.
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
