import { MdDelete } from "react-icons/md";
import { IoBagAdd, IoCloseCircleOutline } from "react-icons/io5";
import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useMemo, useRef, useState } from "react";
import ErroPage from "../common/ErroPage";

import { CiMenuKebab } from "react-icons/ci";
import Swal from "sweetalert2";
import Loader from "@/common/Loader";
import Breadcrumb from "../Breadcrumb";
import { selectCurrentUser } from "@/redux/authSlice";
import {
  useDeleteOrderMutation,
  useGetOrdersQuery,
  type GetOrdersQueryArgs,
} from "@/redux/order/orderApiSlice";
import { BsTicketDetailed } from "react-icons/bs";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { toast } from "react-toastify";
import Pagination from "@/common/Pagination";
import * as XLSX from 'xlsx';

interface ErrorData {
  message: string;
  error?: string;
  statusCode?: number;
}

const DEFAULT_DATE_FIELD: NonNullable<GetOrdersQueryArgs['dateField']> = 'orderDate';
const DEFAULT_SORT_BY: NonNullable<GetOrdersQueryArgs['sortBy']> = 'createdAt';
const DEFAULT_SORT_ORDER: NonNullable<GetOrdersQueryArgs['sortOrder']> = 'DESC';

const fieldLabel =
  'mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400';
const fieldInput =
  'w-full rounded-xl border border-stroke/90 bg-white py-2.5 px-3.5 text-sm text-black shadow-sm outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary/15 dark:border-strokedark dark:bg-meta-4/40 dark:text-white dark:placeholder:text-gray-500';

const OrdersList = () => {
  const user = useSelector(selectCurrentUser);
  const [search, setSearch] = useState('');
  const [dateField, setDateField] = useState<GetOrdersQueryArgs['dateField']>(DEFAULT_DATE_FIELD);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [datePreset, setDatePreset] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState<GetOrdersQueryArgs['sortBy']>(DEFAULT_SORT_BY);
  const [sortOrder, setSortOrder] = useState<GetOrdersQueryArgs['sortOrder']>(DEFAULT_SORT_ORDER);
  const [minGrandTotal, setMinGrandTotal] = useState('');
  const [maxGrandTotal, setMaxGrandTotal] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const hasCustomRange = Boolean(startDate || endDate);

  const ordersQuery = useMemo((): GetOrdersQueryArgs => {
    const q: GetOrdersQueryArgs = {
      page,
      limit,
      search: search.trim() || undefined,
      dateField,
      sortBy,
      sortOrder,
    };
    if (statusFilter.trim()) q.status = statusFilter.trim();
    if (hasCustomRange) {
      if (startDate) q.startDate = startDate;
      if (endDate) q.endDate = endDate;
    } else if (datePreset) {
      q.datePreset = datePreset;
    }
    const min = parseFloat(minGrandTotal);
    if (minGrandTotal.trim() !== '' && !Number.isNaN(min)) q.minGrandTotal = min;
    const max = parseFloat(maxGrandTotal);
    if (maxGrandTotal.trim() !== '' && !Number.isNaN(max)) q.maxGrandTotal = max;
    return q;
  }, [
    page,
    limit,
    search,
    dateField,
    startDate,
    endDate,
    datePreset,
    hasCustomRange,
    statusFilter,
    sortBy,
    sortOrder,
    minGrandTotal,
    maxGrandTotal,
  ]);

  const { data, isLoading, isError, error } = useGetOrdersQuery(ordersQuery);

  const hasActiveFilters = useMemo(() => {
    return (
      search.trim() !== '' ||
      startDate !== '' ||
      endDate !== '' ||
      datePreset !== '' ||
      statusFilter.trim() !== '' ||
      minGrandTotal.trim() !== '' ||
      maxGrandTotal.trim() !== '' ||
      dateField !== DEFAULT_DATE_FIELD ||
      sortBy !== DEFAULT_SORT_BY ||
      sortOrder !== DEFAULT_SORT_ORDER
    );
  }, [
    search,
    startDate,
    endDate,
    datePreset,
    statusFilter,
    minGrandTotal,
    maxGrandTotal,
    dateField,
    sortBy,
    sortOrder,
  ]);

  const clearFilters = () => {
    setSearch('');
    setDateField(DEFAULT_DATE_FIELD);
    setStartDate('');
    setEndDate('');
    setDatePreset('');
    setStatusFilter('');
    setSortBy(DEFAULT_SORT_BY);
    setSortOrder(DEFAULT_SORT_ORDER);
    setMinGrandTotal('');
    setMaxGrandTotal('');
    setPage(1);
  };

  useEffect(() => {
    setPage(1);
  }, [
    search,
    dateField,
    startDate,
    endDate,
    datePreset,
    statusFilter,
    sortBy,
    sortOrder,
    minGrandTotal,
    maxGrandTotal,
  ]);
  const [deleteOrder, { isLoading: isDeleting }] = useDeleteOrderMutation();

  const [showPopover, setShowPopover] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef(null);

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


  const handleAction = (index: number) => {
    setDropdownOpen(!dropdownOpen);
    setShowPopover(index);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };

  const handleStartDateSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatePreset('');
    setStartDate(e.target.value);
  };

  const handleToDateSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDatePreset('');
    setEndDate(e.target.value);
  };

  const handleDatePresetChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setDatePreset(v);
    if (v) {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleDeleteOrder = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this order!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteOrder(id).unwrap();
          toast.success('Order deleted successfully');
                  } catch (error) {
            console.error('Delete order error:', error);
            const fetchError = error as FetchBaseQueryError;
            
            // Debug logging
            console.log('Error status:', fetchError.status);
            console.log('Error data:', fetchError.data);
            
            // Extract error message from the response
            let errorMessage = 'Failed to delete the order';
            
            if (fetchError.data) {
              const errorData = fetchError.data as ErrorData;
              if (errorData.message) {
                errorMessage = errorData.message;
              } else if (errorData.error) {
                errorMessage = errorData.error;
              }
            }
            
            if (fetchError.status === 400) {
              toast.error(errorMessage);
            } else if (fetchError.status === 409) {
              console.log('409 Error data:', fetchError.data);
              toast.error(errorMessage);
            } else if (fetchError.status === 500) {
              toast.error(errorMessage);
            } else {
              console.log('Unexpected error status:', fetchError.status);
              toast.error(errorMessage);
            }
          }
      }
    });
  }


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

  if (isError) {
    return <ErroPage error={error.toString()} />;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (!data) return <div>No data available</div>;

  const { orders, total } = data;
  const totalPages = Math.ceil(total / limit);

  const orderListContent = orders.map((order, index: number) => (
    <tr key={order.id}>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        <h5 className="font-medium text-black dark:text-white">
          <NavLink
            to={`/dashboard/order/${order.id}`}
            className="font-medium text-blue-600 dark:text-blue-500 hover:underline"
          >
            {order.series}
          </NavLink>{" "}
        </h5>
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        {/* <FaFirstOrderAlt className="w-8 h-8 rounded-full" /> */}
        <div className="">
          <div className="text-base font-semibold">
            {order.customer?.fullName}
          </div>
          <div className="font-normal text-gray-500">
            {order.customer?.phone}
          </div>
        </div>
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        {order.grandTotal?.toLocaleString()}
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        {order.status === "Pending" && (
          <span className="inline-flex rounded-full bg-meta-8 bg-opacity-10 py-1 px-3 text-sm font-medium text-meta-8">
            {order.status}
          </span>
        )}
        {order.status === "Processing" && (
          <span className="inline-flex rounded-full bg-meta-7 bg-opacity-10 py-1 px-3 text-sm font-medium text-meta-7">
            {order.status}
          </span>
        )}
        {order.status === "Ready" && (
          <span className="inline-flex rounded-full bg-meta-3 bg-opacity-10 py-1 px-3 text-sm font-medium text-meta-3">
            {order.status}
          </span>
        )}
        {order.status === "Delivered" && (
          <span className="inline-flex rounded-full bg-meta-5 bg-opacity-10 py-1 px-3 text-sm font-medium text-meta-5">
            {order.status}
          </span>
        )}
        {order.status === "InProgress" && (
          <span className="inline-flex rounded-full text-white py-1 px-3 bg-opacity-10 text-sm font-medium bg-gradient-to-br from-danger to-warning hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800">
            {order.status}
          </span>
        )}
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        {order.paymentTerm?.[0]?.status}
      </td>
      
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        {new Date(order.orderDate).toISOString().split('T')[0].split('-').reverse().join('-')}
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        {new Date(order.deliveryDate).toISOString().split('T')[0].split('-').reverse().join('-')}
      </td>
      <td className="px-6 py-4 relative">
        <Link
          to="#"
          onClick={(event) => {
            handleAction(index);
            event.stopPropagation();
          }}
          ref={triggerRef}
          className="flex items-center gap-4"
        >
          <CiMenuKebab />
        </Link>

        {/* <!-- Dropdown Start --> */}
        {showPopover === index && (
          <div
            ref={dropdownRef}
            onFocus={() => setDropdownOpen(true)}
            onBlur={() => setDropdownOpen(false)}
            className={`absolute right-14 mt-0 flex w-47.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ${dropdownOpen ? "block" : "hidden"
              }`}
          >
            <ul className="flex flex-col gap-2 border-b border-stroke p-3 dark:border-strokedark">
              <li>
                <Link
                  to={`/dashboard/order/${order.id}`}
                  className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                >
                  <BsTicketDetailed />
                  Details
                </Link>
              </li>
              <li>
                <button
                  onClick={() => handleDeleteOrder(order.id)}
                  type="button"
                  disabled={isDeleting}
                  className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-danger lg:text-base"
                >
                  <MdDelete />
                  Delete
                </button>
              </li>
            </ul>
          </div>
        )}
        {/* <!-- Dropdown End --> */}
      </td>
    </tr>
  ));

  return (
    <>
      <Breadcrumb pageName="Orders" />

      <div className="mb-6 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {(user?.roles === "RECEPTION" || user?.roles === "ADMIN") && (
            <NavLink
              to="/dashboard/add-order"
              className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-center text-sm font-semibold text-white shadow-md shadow-primary/25 transition hover:bg-opacity-95"
            >
              <IoBagAdd className="text-lg" />
              Add New Order
            </NavLink>
          )}
        </div>

        <div className="overflow-hidden rounded-2xl border border-stroke/80 bg-gradient-to-b from-white to-gray-50/90 shadow-sm dark:border-strokedark dark:from-boxdark dark:to-meta-4/30">
          <div className="flex flex-col gap-4 border-b border-stroke/60 bg-white/60 px-5 py-4 backdrop-blur-sm dark:border-strokedark dark:bg-meta-4/20 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-black dark:text-white">
                Filters
              </h2>
              <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
                Narrow orders by date, status, amount, or search text.
              </p>
            </div>
            <button
              type="button"
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-stroke bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-45 dark:border-strokedark dark:bg-meta-4/50 dark:text-gray-200 dark:hover:bg-meta-4"
            >
              <IoCloseCircleOutline className="text-lg" aria-hidden />
              Clear filters
            </button>
          </div>

          <div className="space-y-8 p-5 sm:p-6">
            <div>
              <p className={fieldLabel}>When</p>
              <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-12 lg:items-end">
                <div className="lg:col-span-2">
                  <label htmlFor="dateField" className={fieldLabel}>
                    Date column
                  </label>
                  <select
                    id="dateField"
                    name="dateField"
                    value={dateField}
                    onChange={(e) =>
                      setDateField(
                        e.target.value as GetOrdersQueryArgs["dateField"],
                      )
                    }
                    className={fieldInput}
                  >
                    <option value="orderDate">Order date</option>
                    <option value="createdAt">Created at</option>
                    <option value="deliveryDate">Delivery date</option>
                  </select>
                </div>
                <div className="lg:col-span-3">
                  <label htmlFor="startDate" className={fieldLabel}>
                    From
                  </label>
                  <input
                    name="startDate"
                    id="startDate"
                    type="date"
                    onChange={handleStartDateSearch}
                    value={startDate}
                    className={`${fieldInput} custom-input-date custom-input-date-1`}
                  />
                </div>
                <div className="flex items-end justify-center pb-2 text-sm font-medium text-gray-400 dark:text-gray-500 lg:col-span-1">
                  to
                </div>
                <div className="lg:col-span-3">
                  <label htmlFor="endDate" className={fieldLabel}>
                    To
                  </label>
                  <input
                    name="endDate"
                    id="endDate"
                    type="date"
                    onChange={handleToDateSearch}
                    value={endDate}
                    className={`${fieldInput} custom-input-date custom-input-date-1`}
                  />
                </div>
                <div className="sm:col-span-2 lg:col-span-3">
                  <label htmlFor="datePreset" className={fieldLabel}>
                    Quick range
                  </label>
                  <select
                    id="datePreset"
                    name="datePreset"
                    value={datePreset}
                    onChange={handleDatePresetChange}
                    disabled={hasCustomRange}
                    title={
                      hasCustomRange
                        ? "Clear custom dates to use a preset"
                        : undefined
                    }
                    className={`${fieldInput} disabled:cursor-not-allowed disabled:opacity-50`}
                  >
                    <option value="">None</option>
                    <option value="today">Today</option>
                    <option value="this_week">This week</option>
                    <option value="this_month">This month</option>
                    <option value="last_week">Last week</option>
                    <option value="last_month">Last month</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div>
                <p className={fieldLabel}>Status &amp; sort</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-3">
                  <div className="sm:col-span-1">
                    <label htmlFor="orderStatusFilter" className={fieldLabel}>
                      Status
                    </label>
                    <select
                      id="orderStatusFilter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className={fieldInput}
                    >
                      <option value="">All</option>
                      <option value="Pending">Pending</option>
                      <option value="Processing">Processing</option>
                      <option value="InProgress">In progress</option>
                      <option value="Ready">Ready</option>
                      <option value="Delivered">Delivered</option>
                      <option value="Cancelled">Cancelled</option>
                      <option value="Pending,Processing">
                        Pending + Processing
                      </option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="sortBy" className={fieldLabel}>
                      Sort by
                    </label>
                    <select
                      id="sortBy"
                      value={sortBy}
                      onChange={(e) =>
                        setSortBy(
                          e.target.value as GetOrdersQueryArgs["sortBy"],
                        )
                      }
                      className={fieldInput}
                    >
                      <option value="createdAt">Created at</option>
                      <option value="orderDate">Order date</option>
                      <option value="deliveryDate">Delivery date</option>
                      <option value="grandTotal">Grand total</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="sortOrder" className={fieldLabel}>
                      Order
                    </label>
                    <select
                      id="sortOrder"
                      value={sortOrder}
                      onChange={(e) =>
                        setSortOrder(
                          e.target.value as GetOrdersQueryArgs["sortOrder"],
                        )
                      }
                      className={fieldInput}
                    >
                      <option value="DESC">Newest first</option>
                      <option value="ASC">Oldest first</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <p className={fieldLabel}>Grand total range</p>
                <div className="mt-3 grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="minGrandTotal" className={fieldLabel}>
                      Minimum
                    </label>
                    <input
                      id="minGrandTotal"
                      type="number"
                      min={0}
                      step="0.01"
                      value={minGrandTotal}
                      onChange={(e) => setMinGrandTotal(e.target.value)}
                      className={fieldInput}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label htmlFor="maxGrandTotal" className={fieldLabel}>
                      Maximum
                    </label>
                    <input
                      id="maxGrandTotal"
                      type="number"
                      min={0}
                      step="0.01"
                      value={maxGrandTotal}
                      onChange={(e) => setMaxGrandTotal(e.target.value)}
                      className={fieldInput}
                      placeholder="No limit"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="table-search" className={fieldLabel}>
                Search
              </label>
              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 start-0 flex items-center ps-3.5">
                  <svg
                    className="h-4 w-4 text-gray-400"
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
                  onChange={handleSearchChange}
                  value={search}
                  type="text"
                  id="table-search"
                  className={`${fieldInput} ps-10`}
                  placeholder="Series, customer, notes, references…"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-sm dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          {orders && (
            <>
              {/* Action Buttons - Fixed outside scroll area */}
              <div className="flex justify-end gap-2 mb-4">
                <button 
                  type="button" 
                  onClick={onDownload} 
                  className="bg-gray-2 text-left dark:bg-meta-4 hover:bg-gray-3 text-graydark dark:text-white font-bold py-2 px-4 rounded inline-flex items-center"
                >
                  <svg className="fill-current w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
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
                        Series
                      </th>
                      <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                        Customer
                      </th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">
                        Price
                      </th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">
                        Status
                      </th>
                      <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                        Payment Status
                      </th>
                      <th className="min-w-[130px] py-4 px-4 font-medium text-black dark:text-white">
                        Date
                      </th>
                      <th className="min-w-[130px] py-4 px-4 font-medium text-black dark:text-white">
                        Delivery Date
                      </th>
                      <th className="py-4 px-4 font-medium text-black dark:text-white">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>{orderListContent}</tbody>
                </table>
              </div>

              {/* Pagination - Fixed outside scroll area */}
              <div className="mt-4">
                <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
              </div>
            </>
          )}
          {orders.length === 0 && (
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
                <p className="text-gray-600 dark:text-gray-400">No orders found</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default OrdersList;
