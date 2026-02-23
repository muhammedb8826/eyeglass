import ErroPage from "@/components/common/ErroPage";
import Loader from "@/common/Loader";
import CardOne from "@/components/CardOne";
import CardTwo from "@/components/CardTwo";
import { FcSalesPerformance } from "react-icons/fc";
import { BiPurchaseTag } from "react-icons/bi";
import Pagination from "@/common/Pagination";
import { useEffect, useState } from "react";
import { useGetItemsQuery } from "@/redux/items/itemsApiSlice";
import { ItemType } from "@/types/ItemType";
import { useGetAllSalesQuery } from "@/redux/sale/saleApiSlice";
import { useGetAllPurchasesQuery } from "@/redux/purchase/purchaseApiSlice";

export const Stock = () => {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { data, isLoading, isError, error, refetch } = useGetItemsQuery({ page, limit, search })
  const { data: sales } = useGetAllSalesQuery();
  const { data: purchases } = useGetAllPurchasesQuery();

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  const convertToDesiredUom = (item: ItemType) => {
    const { defaultUom, quantity, unitCategory } = item;
    const baseUom = unitCategory?.uoms?.find((u) => u.baseUnit === true);
    if (!unitCategory?.constant && baseUom) {
      const unit = quantity / (baseUom?.conversionRate * defaultUom?.conversionRate);
      return unit;
    }

    if (unitCategory.constant && baseUom) {
      const constantValue = unitCategory?.constantValue;
      // const baseConversionRate = baseUom.conversionRate; 
      const defaultConversionRate = defaultUom.conversionRate;

      // Ensure none of the critical values are zero or null
      if (constantValue !== 0 && defaultConversionRate !== 0) {
        const unit = quantity / defaultConversionRate;

        // If the constant value is not 1, then divide the unit by the constant value
        if (constantValue !== 1) {
          return unit / constantValue;
        }

        return  unit;
      } else {
        throw new Error("Division by zero or invalid constant value/conversion rate.");
      }
    }
    return [quantity, 1];
  }


  if (isError) {
    return <ErroPage error={error.toString()} />;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (!data) return <div>No data available</div>;

  const { items, total } = data;
  const totalPages = Math.ceil(total / limit);

  const productListContent = items?.map((item) => {
    const isLowStock = Number(item?.quantity) <= Number(item?.reorder_level);
    const rowClassName = isLowStock ? "bg-danger/25 dark:bg-danger/80" : "";
    const quantity = convertToDesiredUom(item);
    return (
      <tr key={item?.id} className={rowClassName}>
        <td className="border-b flex items-center border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
          {item?.name}
        </td>
        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          {parseFloat(quantity.toString()).toFixed(2)}
        </td>
        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          {item?.initial_stock}
        </td>
        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          {item?.reorder_level}
        </td>
        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          {item?.defaultUom?.abbreviation}
        </td>
      </tr>
    );
  });

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardOne icons={<FcSalesPerformance />} text="Total Request" count={sales ? sales.length : 0} url='/dashboard/inventory/store-request' />
        <CardTwo icons={<BiPurchaseTag />} text="Total Purchases" count={purchases ? purchases?.length : 0} url='/dashboard/inventory/purchases' />
        {/* <CardThree />
        <CardFour /> */}
      </div>

      <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 py-4">
        <label htmlFor="table-search" className="sr-only">
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            onChange={handleSearchChange}
            id="table-search-products"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 ps-10 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            placeholder="Search for items"
          />
        </div>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-hidden overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                  Product name
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Onhand quantity
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Initial stock
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Reorder level
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  UOM
                </th>
              </tr>
            </thead>
            <tbody>{productListContent}</tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
    </>
  );
};
