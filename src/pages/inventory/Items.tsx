import { useEffect, useRef, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import Breadcrumb from "../../components/Breadcrumb";
import Loader from "@/common/Loader";
import { Link, NavLink } from "react-router-dom";
import ErroPage from "@/components/common/ErroPage";
import { MdDelete, MdOutlineProductionQuantityLimits, MdOutlineReceiptLong } from "react-icons/md";
import Swal from "sweetalert2";
import { useDeleteItemsMutation, useGetItemsQuery } from "@/redux/items/itemsApiSlice";
import Pagination from "@/common/Pagination";
import { toast } from "react-toastify";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { selectCurrentUser } from "@/redux/authSlice";
import { useSelector } from "react-redux";
interface ErrorData {
  message: string;
}

export const Items = () => {
  const user = useSelector(selectCurrentUser);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { data, isLoading, isError, error } = useGetItemsQuery({ page, limit, search })

  const [deleteItem, { isLoading: isDeleting }] = useDeleteItemsMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const handleModalOpen = () => {
    setIsModalOpen(!isModalOpen);
  };


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



  const handleDeleteItem = (id: string) => {
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
          await deleteItem(id).unwrap();
          toast.success('Item deleted successfully');
        } catch (error) {
          const fetchError = error as FetchBaseQueryError;
          if (fetchError.status === 400) {
            const errorData = fetchError.data as ErrorData;
            toast.error(errorData.message);
          } else {
            console.error('Failed to delete the item:', error);
            toast.error('Failed to delete the item');
          }
        }
      }
    });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
};


  if (isError) {
    return <ErroPage error={error} />;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (!data) return <div>No data available</div>;

  const { items, total } = data;
  const totalPages = Math.ceil(total / limit);

  const itemsListContent = items?.map((item, index) => {
    return (
      <tr key={item.id}>
        <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
          {item?.itemCode ?? "–"}
        </td>
        <td className="border-b flex items-center border-[#eee] py-5 px-4 dark:border-strokedark">
          <NavLink to={`/dashboard/inventory/items/${item.id}`}
           className="text-base font-semibold text-black dark:text-white hover:text-primary">
            {item?.name}
          </NavLink>
        </td>
        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          {item?.purchaseUom?.abbreviation}
        </td>
        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
          {item?.defaultUom?.abbreviation}
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
                  <NavLink
                    to={`/dashboard/inventory/items/${item.id}`}
                    className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                  >
                    <FaRegEdit />
                    Edit
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    to={`/dashboard/inventory/bincard/${item.id}`}
                    className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                  >
                    <MdOutlineReceiptLong />
                    Bincard
                  </NavLink>
                </li>
                <li>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
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
    )
  });

  return (
    <>
      <Breadcrumb pageName="Items" />

      <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4">
      {user?.roles === 'ADMIN' && (
        <div>
          <NavLink
           to={'/dashboard/inventory/items/register'}
            onClick={handleModalOpen}
            className="inline-flex items-center justify-center rounded bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
          >
            <MdOutlineProductionQuantityLimits />
            <span className="ml-2">Add Item</span>
          </NavLink>
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
            onChange={handleSearchChange}
            id="table-search-products"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 ps-10 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            placeholder="Search items"
          />
        </div>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Item code
                </th>
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                  Item name
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Purchase UOM
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  UOM
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>{itemsListContent}</tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
    </>
  );
};
