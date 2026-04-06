import Loader from "@/common/Loader";
import ErroPage from "@/components/common/ErroPage";
import { useEffect, useState } from "react";
import { useGetOperatorStocksQuery } from "@/redux/operator-stock/operatorStockApiSlice";
import Pagination from "@/common/Pagination";
import Tabs from "@/common/TabComponent";
import { useGetAllUomsQuery } from "@/redux/unit/uomApiSlice";
import { useGetAllOrdersQuery } from "@/redux/order/orderApiSlice";
import { useGetAllItemsQuery } from "@/redux/items/itemsApiSlice";
import { useGetAllServicesQuery } from "@/redux/services/servicesApiSlice";

const tabs = [
  { id: 'home', label: 'Home' },
  { id: 'printed', label: 'Printed to Delivered Items' },
];

export const OperatorStock = () => {
  const [search, setSearch] = useState('');
  const [printedSearch, setPrintedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [printedPage, setPrintedPage] = useState(1);
  const [limit] = useState(10);
  const { data, isLoading, error, isError, refetch } = useGetOperatorStocksQuery({ page, limit, search });
  const {data: uoms, isLoading: uomsLoading, isError: uomsError} = useGetAllUomsQuery();
  const { data: orders, isLoading: ordersLoading, isError: ordersError, refetch: ordersRefetch } = useGetAllOrdersQuery();
  const { data: items, isLoading: itemsLoading, isError: itemsError } = useGetAllItemsQuery();
  const { data: services, isLoading: servicesLoading, isError: servicesError } = useGetAllServicesQuery();

console.log({
  'orders': orders,
});


  useEffect(() => {
    refetch();
    ordersRefetch();
  }, [refetch, ordersRefetch]);

  const [activeTabId, setActiveTabId] = useState<string>('home');
  const handleTabChange = (id: string) => {
    setActiveTabId(id);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handlePrintedPageChange = (newPage: number) => {
    setPrintedPage(newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handlePrintedSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrintedSearch(e.target.value);
  };

  if (isError || uomsError || ordersError || itemsError || servicesError) {
    return <ErroPage error={`${error}`} />;
  }

  if (isLoading || uomsLoading || ordersLoading || itemsLoading || servicesLoading) {
    return <Loader />;
  }

  if (!data) return <div>No data available</div>;

  const { operatorStocks, total } = data;
  const totalPages = Math.ceil(total / limit);

  // Filter orders that have status from InProgress to Delivered and map with related data
  const printedOrders = orders?.flatMap(order => 
    order.orderItems?.map(orderItem => {
      // Find related data
      const item = items?.find(item => item.id === orderItem.itemId);
      const service = services?.find(service => service.id === orderItem.serviceId);
      const uom = uoms?.find(uom => uom.id === orderItem.uomId);
      
      return {
        ...orderItem,
        item,
        service,
        uom,
        order: { series: order.series, id: order.id }
      };
    }) || []
  ).filter(orderItem => {
    // Filter by status only; item-machine links were removed from the backend
    const statusMatch = [
      'InProgress',
      'Ready',
      'SentToShop',
      'ShopReceived',
      'Delivered',
    ].includes(orderItem.status);
    return statusMatch;
  }) || [];
  
  // Apply search filter
  const filteredPrintedItems = printedSearch 
    ? printedOrders.filter(item => 
        item.item?.name?.toLowerCase().includes(printedSearch.toLowerCase()) ||
        item.order?.series?.toLowerCase().includes(printedSearch.toLowerCase())
      )
    : printedOrders;
  
  // Apply pagination
  const startIndex = (printedPage - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedPrintedItems = filteredPrintedItems.slice(startIndex, endIndex);
  const printedTotalPages = Math.ceil(filteredPrintedItems.length / limit);

  const operatorStoreList = operatorStocks.map((data) => {
    const baseUom = uoms?.find((uom) => uom.id === data.baseUomId)?.abbreviation;
    return (
      <tr key={data.id}>
        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          {data.item?.name}
        </td>
        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          {data.quantity}
        </td>
        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          {baseUom}
        </td>
      </tr>
    );
  });




  const printedListContent = paginatedPrintedItems?.map((orderItem) => {
    return (
      <tr key={orderItem.id}>
        <td className="border-b flex items-center border-[#eee] py-5 px-4 dark:border-strokedark">
          {orderItem.order?.series || 'N/A'}
        </td>
        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          {orderItem.item?.name || 'N/A'}
        </td>
        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          {orderItem.service?.name || 'N/A'}
        </td>
        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          {orderItem.quantity}
        </td>
        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          {orderItem.uom?.abbreviation || orderItem.uom?.name || 'N/A'}
        </td>
        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          {orderItem.status}
        </td>
      </tr>
    );
  });


  return (
    <>
      <Tabs tabs={tabs} activeTabId={activeTabId} onTabChange={handleTabChange} />
      {activeTabId === 'home' && (
        <>
          <div className="mt-5 flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4">
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
                placeholder="Search for products"
              />
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="max-w-full overflow-hidden overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                      Item
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Available stock (in units)
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      UOM
                    </th>
                  </tr>
                </thead>
                <tbody>{operatorStoreList}</tbody>
              </table>
              <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
            </div>
          </div>
        </>
      )}

      {activeTabId === 'printed' && (
        <>
          <div className="mt-5 flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4">
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
                onChange={handlePrintedSearchChange}
                value={printedSearch}
                id="table-search-printed"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 ps-10 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                placeholder="Search for printed to delivered items"
              />
            </div>
          </div>

          <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
            <div className="max-w-full overflow-hidden overflow-x-auto">
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Reference
                    </th>
                    <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                      Product
                    </th>
                    <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                      Service
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Quantity
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Printed unit
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody>{printedListContent}</tbody>
              </table>
              <Pagination page={printedPage} totalPages={printedTotalPages} onPageChange={handlePrintedPageChange} />
            </div>
          </div>
        </>
      )}
    </>
  );

}
