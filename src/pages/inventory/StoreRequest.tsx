import Loader from "@/common/Loader";
import ErroPage from "@/components/common/ErroPage";
import { useEffect, useRef, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import { MdDelete} from "react-icons/md";
import { useSelector } from "react-redux";
import { Link, NavLink, } from "react-router-dom";
import Swal from "sweetalert2";
import Breadcrumb from "@/components/Breadcrumb";
import { BsTicketDetailed } from "react-icons/bs";
import { selectCurrentUser, selectPermissions } from "@/redux/authSlice";
import { userHasPermission } from "@/utils/permissions";
import { PERMISSION_SALES_WRITE } from "@/constants/permissions";
import { useDeleteSaleMutation, useGetSalesQuery } from "@/redux/sale/saleApiSlice";
import { toast } from "react-toastify";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import Pagination from "@/common/Pagination";
import { FcSalesPerformance } from "react-icons/fc";
import { handleApiError } from "@/utils/errorHandling";

export const StoreRequest = () => {
  const user = useSelector(selectCurrentUser);
  const permissions = useSelector(selectPermissions);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { data, isLoading, isError, error } = useGetSalesQuery({ page, limit });
  const [deleteSale, { isLoading: isDeleting }] = useDeleteSaleMutation();

  const [showPopover, setShowPopover] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const triggerRef = useRef<HTMLAnchorElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  const handleDeleteProduct = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this category!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteSale(id).unwrap();
          toast.success("Sale deleted successfully");
        } catch (error) {
          const fetchError = error as FetchBaseQueryError;
          const errorMessage = handleApiError(fetchError, 'Failed to delete the sale');
          toast.error(errorMessage);
        }
      }
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isError) {
    return <ErroPage error={error} />;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (!data) return <div>No data available</div>;
  
  const { sales, total } = data;
  const totalPages = Math.ceil(total / limit);

  const productListContent = sales.map((sale, index) => (
    <tr key={sale.id}>
      <td className="border-b flex items-center border-[#eee] py-5 px-4 dark:border-strokedark">
        <NavLink to={`/dashboard/inventory/store-request/${sale.id}`} className="flex items-center gap-4 text-graydark/80 hover:text-primary hover:underline lg:text-base">
        <FcSalesPerformance />
          {sale.series}
        </NavLink>
      </td>
      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
        {new Date(sale.orderDate).toLocaleDateString()}
      </td>
      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
        {sale.operator?.first_name}
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
            className={`absolute right-14 mt-0 flex w-47.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ${
              dropdownOpen ? "block" : "hidden"
            }`}
          >
              
            <ul className="flex flex-col gap-2 border-b border-stroke p-3 dark:border-strokedark">
              <li>
                <Link
                to={`/dashboard/inventory/store-request/${sale.id}`}
                  className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                >
                  <BsTicketDetailed />
                  Details
                </Link>
              </li>
              <li>
                <button
                type="button"
                  onClick={() => handleDeleteProduct(sale.id)}
                  disabled={isDeleting}
                  className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
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
      <Breadcrumb pageName="Store request" />

      <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4">
        
      {userHasPermission(user, permissions, PERMISSION_SALES_WRITE) && (
        <div>
          <Link
          to={"/dashboard/inventory/store-request/add"}
            className="inline-flex items-center justify-center rounded bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
            type="button"
          >
            <FcSalesPerformance />
            <span className="ml-2">Add</span>
          </Link>
        </div>
      )}

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
            id="table-search-products"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 ps-10 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            placeholder="Search for products"
          />
        </div>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-hidden overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                  Reference
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Order Date
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Operator
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Action
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
}
