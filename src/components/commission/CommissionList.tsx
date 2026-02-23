import { useGetCommissionsQuery } from "@/redux/commission/commissionApiSlice";
import Breadcrumb from "../Breadcrumb";
import { useEffect, useRef, useState } from "react";
import ErroPage from "../common/ErroPage";
import Pagination from "@/common/Pagination";
import Loader from "@/common/Loader";
import { Link } from "react-router-dom";
import { CiMenuKebab } from "react-icons/ci";
import { BsTicketDetailed } from "react-icons/bs";

export const CommissionList = () => {

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { data, isLoading, isError, error } = useGetCommissionsQuery({ page, limit });


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

  const { commissions, total } = data;
  const totalPages = Math.ceil(total / limit);

  const commissionsListContent = commissions.map((commission, index) => {
    return (
      <tr key={commission.id}>
        <td className="border-b border-[#eee] p-4 dark:border-strokedark">
          <Link to={`/dashboard/commission/${commission.id}`} className="text-primary">
            {commission.salesPartner?.fullName}
          </Link>
        </td>
        <td className="border-b border-[#eee] p-4 dark:border-strokedark">
          <Link to={`/dashboard/order/${commission.orderId}`} className="text-primary">
            {commission.order?.series}
          </Link>
        </td>
        <td className="border-b border-[#eee] p-4 dark:border-strokedark">
          {commission.salesPartner?.phone}
        </td>
        <td className="border-b border-[#eee] p-4 dark:border-strokedark">
          {commission.totalAmount}
        </td>
        <td className="border-b border-[#eee] p-4 dark:border-strokedark">
          
          {commission.paidAmount === 0 && (
            <span className="inline-flex rounded-full bg-danger bg-opacity-10 py-1 px-3 text-sm font-medium text-danger">
              No
            </span>
          )}
          {commission.paidAmount === commission.totalAmount && (
            <span className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">
              Yes
            </span>
          )}
          {commission.paidAmount > 0 && commission.paidAmount <  commission.totalAmount && (
            <span className="inline-flex rounded-full bg-warning bg-opacity-10 py-1 px-3 text-sm font-medium text-warning">
              Partially Paid
              </span>
            )}
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
                    to={`/dashboard/commission/${commission.id}`}
                    className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                  >
                    <BsTicketDetailed />
                    Details
                  </Link>
                </li>
              </ul>
            </div>
          )}
          {/* <!-- Dropdown End --> */}
        </td>
      </tr>
    )

  });


  return (
    <>
      <Breadcrumb pageName="Commissions" />
      <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4">
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
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                  Partner name
                </th>
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                  Order reference
                </th>
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                  Phone number
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Total earned
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Paid
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {commissionsListContent}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
    </>
  );
};
