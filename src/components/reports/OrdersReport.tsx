import { useCompanyReportQuery } from "@/redux/order/orderApiSlice";
import { useEffect, useRef, useState } from "react";
import { NavLink } from "react-router-dom";
import ErroPage from "../common/ErroPage";
import * as XLSX from "xlsx";
// import { CiMenuKebab } from "react-icons/ci";
// import { BsTicketDetailed } from "react-icons/bs";
import Loader from "@/common/Loader";
import Breadcrumb from "../Breadcrumb";
import Pagination from "@/common/Pagination";
import { useReactToPrint } from "react-to-print";

export const OrdersReport = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [item1, setItem1] = useState("");
  const [item2, setItem2] = useState("");
  const [item3, setItem3] = useState("");
  const [itemStatus, setItemStatus] = useState("");

  const {
    data: companyReportData,
    isLoading: isCompanyReportLoading,
    isError: isCompanyReportError,
    error: companyReportError,
  } = useCompanyReportQuery({
    page,
    limit,
    startDate,
    endDate,
    search,
    item1,
    item2,
    item3,
  });

  // const [showPopover, setShowPopover] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef(null);

  const contentToPrint = useRef(null);
  const handlePrint = useReactToPrint({
    documentTitle: "Print This Document",
    onBeforePrint: () => console.log("before printing..."),
    onAfterPrint: () => console.log("after printing..."),
    removeAfterPrint: true,
  });

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdownRef.current || !triggerRef.current) return;
      if (
        !dropdownOpen ||
        dropdownRef.current.contains(target as Node) ||
        triggerRef.current.contains(target as Node)
      )
        return;
      setDropdownOpen(false);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  // const handleAction = (index: number) => {
  //     setDropdownOpen(!dropdownOpen);
  //     setShowPopover(index);
  // };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleOrderItemSearchChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { value } = e.target;
    setItem1(value);
  };

  const handleItem2SearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setItem2(value);
  };

  const handleItem3SearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setItem3(value);
  };

  const handleStartDateSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStartDate(e.target.value);
  };

  const handleToDateSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemStatus(e.target.value);
  };

  const onDownload = () => {
    const table = tableRef.current;
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.table_to_sheet(table);
    XLSX.utils.book_append_sheet(workbook, worksheet, "Orders");
    XLSX.writeFile(workbook, "orders.xlsx");
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isCompanyReportLoading) {
    return <Loader />;
  }

  if (isCompanyReportError) {
    return <ErroPage error={companyReportError.toString()} />;
  }

  if (!companyReportData) return <div>No company report data available</div>;

  const { reportData, totals } = companyReportData;
  console.log(reportData);
  const totalPages = Math.ceil(totals.ordersCount / limit);

  const orderListContent = reportData?.map((data, index) => (
    <tr key={index}>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        <h5 className="font-medium text-black dark:text-white">{data.date}</h5>
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        <span className="text-black dark:text-white">{data.customerName}</span>
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        <h5 className="font-medium text-black dark:text-white">
          <NavLink
            to={`/dashboard/order/${data.orderId}`}
            className="flex items-center gap-4 text-graydark/80 hover:text-primary hover:underline lg:text-base dark:text-white"
          >
            {data.itemName}
          </NavLink>{" "}
        </h5>
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        <span className="text-black dark:text-white">{data.serviceName}</span>
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        <span className="text-black dark:text-white">
          {parseFloat(data.unit.toFixed(2)).toLocaleString()}
        </span>
      </td>

      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        <span className="text-black dark:text-white">
          {parseFloat(data.quantity.toFixed(2)).toLocaleString()}
        </span>
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        <span className="text-black dark:text-white">
          {parseFloat(data.metersquare.toFixed(2)).toLocaleString()}
        </span>
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        <span className="text-black dark:text-white">
          {parseFloat(data.costPrice.toFixed(2)).toLocaleString()}
        </span>
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        <span className="text-black dark:text-white">
          {parseFloat(data.totalCost.toFixed(2)).toLocaleString()}
        </span>
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        <span className="text-black dark:text-white">
          {parseFloat(data.sellingPrice.toFixed(2)).toLocaleString()}
        </span>
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        <span className="text-black dark:text-white">
          {parseFloat(data.sales.toFixed(2)).toLocaleString()}
        </span>
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        <span className="text-black dark:text-white">
          {parseFloat(data.commission.toFixed(2)).toLocaleString()}
        </span>
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        <span className="text-black dark:text-white">
          {parseFloat(data.profit.toFixed(2)).toLocaleString()}
        </span>
      </td>
    </tr>
  ));
  return (
    <section ref={contentToPrint}>
      <Breadcrumb pageName="Orders Report" />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-4 p-4 bg-white dark:bg-boxdark">
        <div date-rangepicker className="flex items-center col-span-1">
          <div className="relative">
            <label
              htmlFor="startDate"
              className="mb-2 block text-sm font-medium text-black dark:text-white"
            >
              Start Date
            </label>
            <input
              name="startDate"
              id="startDate"
              type="date"
              onChange={(e) => handleStartDateSearch(e)}
              value={startDate}
              className="custom-input-date custom-input-date-1 w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              placeholder="Select date start"
            />
          </div>
          <span className="mx-4 text-gray-500 dark:text-gray-400 mt-8">to</span>

          <div className="relative">
            <label
              htmlFor="endDate"
              className="mb-2 block text-sm font-medium text-black dark:text-white"
            >
              End Date
            </label>
            <input
              name="endDate"
              id="endDate"
              onChange={(e) => handleToDateSearch(e)}
              value={endDate}
              type="date"
              className="custom-input-date custom-input-date-1 w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              placeholder="Select date end"
            />
          </div>
        </div>

        <div className="col-span-1 lg:ps-6">
          <label
            htmlFor="simple-search"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            Search
          </label>
          <input
            type="text"
            onChange={handleSearchChange}
            value={search}
            id="simple-search"
            placeholder="series, phone, email..."
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          />
        </div>

        <div className="col-span-1">
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Order Status
          </label>
          <div className="relative z-20 bg-transparent dark:bg-form-input">
            <select
              id="filter-order"
              title="filter-order"
              defaultValue="all"
              value={itemStatus}
              onChange={(e) => handleSelectChange(e)}
              className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            >
              <option value="">All status</option>
              <option value="Pending">Pending</option>
              <option value="InProgress">In progress</option>
              <option value="Ready">Ready</option>
              <option value="SentToShop">Sent to shop</option>
              <option value="ShopReceived">Shop received</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
              <svg
                className="fill-current"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g opacity="0.8">
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                    fill=""
                  ></path>
                </g>
              </svg>
            </span>
          </div>
        </div>

        <div className="w-full">
          <label
            htmlFor="item1"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            Item 1
          </label>
          <input
            type="text"
            name="item1"
            id="item1"
            value={item1}
            onChange={handleOrderItemSearchChange}
            placeholder="Item 1"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          />
        </div>

        <div className="w-full">
          <label
            htmlFor="item2"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            Item 2
          </label>
          <input
            type="text"
            name="item2"
            id="item2"
            value={item2}
            onChange={handleItem2SearchChange}
            placeholder="Item 2"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          />
        </div>

        <div className="w-full">
          <label
            htmlFor="item3"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            Item 3
          </label>
          <input
            type="text"
            name="item3"
            id="item3"
            value={item3}
            onChange={handleItem3SearchChange}
            placeholder="Item 3"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
          />
        </div>
      </div>

      <div className="rounded-sm border border-stroke border-t-0 bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        {reportData && (
          <>
            {/* Action Buttons - Fixed outside scroll area */}
            <div className="flex justify-end gap-2 mb-4">
              <button
                type="button"
                onClick={() => {
                  handlePrint(null, () => contentToPrint.current);
                }}
                className="bg-gray-2 text-left dark:bg-meta-4 hover:bg-gray-3 text-graydark dark:text-white font-bold py-2 px-4 rounded inline-flex items-center"
              >
                <svg
                  className="fill-current w-4 h-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
                </svg>
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={onDownload}
                className="bg-gray-2 text-left dark:bg-meta-4 hover:bg-gray-3 text-graydark dark:text-white font-bold py-2 px-4 rounded inline-flex items-center"
              >
                <svg
                  className="fill-current w-4 h-4 mr-2"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                >
                  <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
                </svg>
                <span>Export</span>
              </button>
            </div>

            {/* Table Container with Scroll */}
            <div className="max-w-full overflow-x-auto">
              <table ref={tableRef} className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-2 text-left dark:bg-meta-4">
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                      Date
                    </th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Customer
                    </th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Item
                    </th>
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                      Service
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Size
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Qty
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Unit(m2)
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      U.Cost
                    </th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Total Cost
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      S.Price
                    </th>
                    <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                      Sales
                    </th>
                    <th className="py-4 px-4 font-medium text-black dark:text-white">
                      Commission
                    </th>
                    <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                      Profit/Item
                    </th>
                  </tr>
                </thead>
                <tbody>{orderListContent}</tbody>
              </table>
            </div>

            {/* Pagination - Fixed outside scroll area */}
            <div className="mt-4">
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </div>
          </>
        )}
        {reportData && reportData.length === 0 && (
          <div className="flex items-center justify-center w-full">
            <div className="flex flex-col items-center justify-center">
              <svg
                className="w-16 h-16 text-gray-400"
                stroke="currentColor"
                viewBox="0 0 52 52"
              >
                <circle
                  className="fill-transparent stroke-current stroke-2"
                  cx="26"
                  cy="26"
                  r="25"
                ></circle>
                <path
                  className="stroke-current stroke-2"
                  fill="transparent"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 16l20 20m0 0l-20-20"
                ></path>
              </svg>
              <p className="text-gray-600 dark:text-gray-400">
                No orders found
              </p>
            </div>
          </div>
        )}
      </div>
      {reportData && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 my-4 p-4 bg-white dark:bg-boxdark">
          <h2 className="mb-2 text-lg font-semibold text-graydark dark:text-white">
            Summary
          </h2>
          <ul className="max-w-md space-y-1 text-gray-500 list-disc list-inside dark:text-gray-400">
            <li>
              <span className="font-semibold text-graydark dark:text-white">
                Found Records: {totals.ordersCount}
              </span>
            </li>
            <li>
              <span className="font-semibold text-graydark dark:text-white">
                Total Profit: {totals.totalProfit.toLocaleString()}
              </span>{" "}
              ETB
            </li>
            <li>
              <span className="font-semibold text-graydark dark:text-white">
                Total Cost: {totals.totalCost.toLocaleString()}
              </span>{" "}
              ETB
            </li>

            <li>
              <span className="font-semibold text-graydark dark:text-white">
                Total Sales: {totals.totalSales.toLocaleString()}
              </span>{" "}
              ETB
            </li>

            <li>
              <span className="font-semibold text-graydark dark:text-white">
                Total Commission: {totals.totalCommission.toLocaleString()}
              </span>{" "}
              ETB
            </li>

            <li>
              <span className="font-semibold text-graydark dark:text-white">
                Constant Daily Fixed Cost:{" "}
                {totals.constantDailyFixedCost.toLocaleString()}
              </span>{" "}
              ETB
            </li>

            <li>
              <span className="font-semibold text-graydark dark:text-white">
                Total Daily Fixed Cost:{" "}
                {totals.totalDailyFixedCost.toLocaleString()}
              </span>{" "}
              ETB
            </li>

            <li>
              <span className="font-semibold text-graydark dark:text-white">
                Number of Days: {totals.numberOfDays}
              </span>{" "}
            </li>
          </ul>
        </div>
      )}
    </section>
  );
};
