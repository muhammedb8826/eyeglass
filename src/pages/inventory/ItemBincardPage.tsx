import { useState } from "react";
import Breadcrumb from "@/components/Breadcrumb";
import ErroPage from "@/components/common/ErroPage";
import Loader from "@/common/Loader";
import Pagination from "@/common/Pagination";
import { BincardTable } from "@/components/bincard/BincardTable";
import { useGetItemQuery, useGetItemsQuery } from "@/redux/items/itemsApiSlice";
import { NavLink, useNavigate, useParams } from "react-router-dom";

const ITEMS_PAGE_SIZE = 10;

export const ItemBincardPage = () => {
  const { itemId } = useParams<{ itemId?: string }>();
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const {
    data: itemsData,
    isLoading: itemsLoading,
    isError: itemsError,
    error: itemsErr,
  } = useGetItemsQuery(
    { page, limit: ITEMS_PAGE_SIZE, search: search.trim() || undefined },
    { skip: Boolean(itemId) },
  );

  const {
    data: itemRow,
    isLoading: itemLoading,
    isError: itemError,
    error: itemErr,
  } = useGetItemQuery(itemId!, { skip: !itemId });

  if (itemId) {
    if (itemLoading) return <Loader />;
    if (itemError) return <ErroPage error={itemErr} />;
    if (!itemRow) return <Loader />;
  }

  if (!itemId) {
    if (itemsError) return <ErroPage error={itemsErr} />;
    if (itemsLoading) return <Loader />;
  }

  const handlePickItem = (id: string) => {
    navigate(`/dashboard/inventory/bincard/${id}`);
  };

  return (
    <div className="mx-auto max-w-270">
      <Breadcrumb pageName="Item bincard" />

      {itemId ? (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-xl font-semibold text-black dark:text-white">
                {itemRow?.itemCode ? `${itemRow.itemCode} — ` : ""}
                {itemRow?.name}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Stock movement history for this item.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => navigate("/dashboard/inventory/bincard")}
                className="rounded border border-stroke bg-white py-2 px-4 text-sm font-medium text-black hover:bg-gray-2 dark:border-strokedark dark:bg-boxdark dark:text-white dark:hover:bg-meta-4"
              >
                Choose another item
              </button>
              <NavLink
                to={`/dashboard/inventory/items/${itemId}`}
                className="rounded bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-opacity-90"
              >
                Open item (edit)
              </NavLink>
            </div>
          </div>
          <BincardTable itemId={itemId} itemName={itemRow?.name} pageSize={20} />
        </div>
      ) : (
        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
          <div className="border-b border-stroke px-6 py-4 dark:border-strokedark">
            <h2 className="text-lg font-medium text-black dark:text-white">
              Select an item
            </h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Search and open the bincard for any stock item. The bincard tab on
              item edit shows the same data.
            </p>
            <div className="relative mt-4 max-w-md">
              <input
                type="search"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by name or code…"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white"
              />
            </div>
          </div>
          <div className="max-w-full overflow-x-auto px-5 pb-6 pt-2 sm:px-7.5">
            {!itemsData ? (
              <p className="py-6 text-center text-gray-500">No data.</p>
            ) : (
              <>
                <table className="w-full table-auto">
                  <thead>
                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                      <th className="py-3 px-4 font-medium text-black dark:text-white">
                        Code
                      </th>
                      <th className="py-3 px-4 font-medium text-black dark:text-white">
                        Name
                      </th>
                      <th className="py-3 px-4 font-medium text-black dark:text-white">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemsData.items.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="py-8 text-center text-gray-500 dark:text-gray-400"
                        >
                          No items match your search.
                        </td>
                      </tr>
                    ) : (
                      itemsData.items.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-stroke dark:border-strokedark"
                        >
                          <td className="py-3 px-4 text-black dark:text-white">
                            {row.itemCode ?? "–"}
                          </td>
                          <td className="py-3 px-4 text-black dark:text-white">
                            {row.name}
                          </td>
                          <td className="py-3 px-4">
                            <button
                              type="button"
                              onClick={() => handlePickItem(row.id)}
                              className="text-primary hover:underline"
                            >
                              View bincard
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                <Pagination
                  page={page}
                  totalPages={Math.max(
                    1,
                    Math.ceil(itemsData.total / ITEMS_PAGE_SIZE),
                  )}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
