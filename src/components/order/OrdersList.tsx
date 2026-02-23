import { MdDelete } from "react-icons/md";
import { IoBagAdd } from "react-icons/io5";
import { Link, NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import ErroPage from "../common/ErroPage";

import { CiMenuKebab } from "react-icons/ci";
import Swal from "sweetalert2";
import Loader from "@/common/Loader";
import Breadcrumb from "../Breadcrumb";
import { selectCurrentUser } from "@/redux/authSlice";
import { useDeleteOrderMutation, useGetOrdersQuery } from "@/redux/order/orderApiSlice";
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

const OrdersList = () => {
  const user = useSelector(selectCurrentUser);
  const [search, setSearch] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [deliveryDateFilter, setDeliveryDateFilter] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { data, isLoading, isError, error } = useGetOrdersQuery({ page, limit, search, startDate, endDate });
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
    setStartDate(e.target.value);
  }

  const handleToDateSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndDate(e.target.value);
  }

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

  const filteredOrders = deliveryDateFilter
    ? orders.filter(order =>
        order.deliveryDate &&
        new Date(order.deliveryDate).toISOString().split('T')[0] === deliveryDateFilter
      )
    : orders;

  console.log(filteredOrders);
  

  const orderListContent = filteredOrders.map((order, index: number) => (
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
        {order.status === "Completed" && (
          <span className="inline-flex rounded-full bg-meta-3 bg-opacity-10 py-1 px-3 text-sm font-medium text-meta-3">
            {order.status}
          </span>
        )}
        {order.status === "Delivered" && (
          <span className="inline-flex rounded-full bg-meta-5 bg-opacity-10 py-1 px-3 text-sm font-medium text-meta-5">
            {order.status}
          </span>
        )}
        {order.status === "Printed" && (
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

      <div
        className={`rounded-sm border border-stroke border-b-0 bg-white dark:bg-boxdark dark:border-strokedark px-4 flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 py-4`}
      >
        {(user?.roles === "RECEPTION" || user?.roles === 'ADMIN') && (
          <div>
            <NavLink
              to="/dashboard/add-order"
              className="inline-flex items-center justify-center rounded bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
            >
              <IoBagAdd />
              <span className="ml-2">Add New Order</span>
            </NavLink>
          </div>
        )}

        <div date-rangepicker className="flex items-center">
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

        <div className="relative ml-4">
          <label
            htmlFor="deliveryDateFilter"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
            Delivery Date
          </label>
          <input
            name="deliveryDateFilter"
            id="deliveryDateFilter"
            type="date"
            value={deliveryDateFilter}
            onChange={e => setDeliveryDateFilter(e.target.value)}
            className="custom-input-date custom-input-date-1 w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            placeholder="Filter by delivery date"
          />
        </div>

        <div className="relative">
          <label
            htmlFor="table-search"
            className="mb-2 block text-sm font-medium text-black dark:text-white"
          >
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
              onChange={handleSearchChange}
              value={search}
              type="text"
              id="table-search"
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 ps-10 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
              placeholder="Search for orders"
            />
          </div>
        </div>
      </div>

      <div className="rounded-sm border border-stroke border-t-0 bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          {filteredOrders && (
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
          {filteredOrders.length === 0 && (
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
