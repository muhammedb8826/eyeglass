import ErroPage from "../common/ErroPage";
import { useEffect, useRef, useState } from "react";
import { CustomerRegistration } from "./CustomerRegistrationModal";
import { CiMenuKebab } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { FaRegEdit } from "react-icons/fa";
import Swal from "sweetalert2";
import Breadcrumb from "../Breadcrumb";
import { useDeleteCustomerMutation, useGetCustomersQuery } from "@/redux/customer/customerApiSlice";
import { toast } from "react-toastify";
import userImage from "../../assets/images/avatar.jpg";
import Pagination from "@/common/Pagination";
import Loader from "@/common/Loader";
import { FaUserPlus } from "react-icons/fa6";
import CustomerEdit from "./CustomerEdit";


export const CustomerList = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { data, isLoading, isError, error } = useGetCustomersQuery({ page, limit });
  const [deleteCustomer, { isLoading: isDeleting }] = useDeleteCustomerMutation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [id, setId] = useState<string | null>(null);


  const [showPopover, setShowPopover] = useState<number | null>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const handleModalOpen = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleUpdateModalOpen = (id: string) => {
    setId(id);
    setUpdateModalOpen(!updateModalOpen);
  };

  const handleModalClose = () => {
    setUpdateModalOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        setShowPopover(null);
      }
    };

    if (showPopover !== null) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showPopover]);


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

  const { customers, total } = data;
  const totalPages = Math.ceil(total / limit);

  const handleAction = (index: number) => {
    setShowPopover((prevIndex) => (prevIndex === index ? null : index));
  };

  const handleDeleteCustomer = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this customer!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Deleted!",
          text: "The customer has been deleted.",
          icon: "success",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await deleteCustomer(id).unwrap();
              toast.success("Customer deleted successfully");
            } catch (error) {
              console.log("Failed to delete the customer:", error);
              toast.error("Failed to delete the customer");
            }
          }
        });
      }
    });
  }

  const CustomerListContent = customers?.map((customer, index) => (
    <tr key={customer.id}>
      <td className="border-b flex items-center border-[#eee] py-5 px-4 dark:border-strokedark">
        <img
          className="w-10 h-10 rounded-full"
          src={userImage}
          alt="Jese image"
        />
        <div className="ps-3">
          <div className="text-base font-semibold text-black dark:text-white">
            {customer.fullName}
          </div>
          <div className="font-normal text-gray-500">{customer.email}</div>
        </div>
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        {customer.phone}
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        {customer.company}
      </td>
      <td className="border-b border-[#eee] p-4 dark:border-strokedark">
        {customer.address}
      </td>
      <td className="px-6 py-4 relative">
        <button
          onClick={() => handleAction(index)}
          title="action"
          data-popover-target={`popover-bottom-${index}`}
          data-popover-trigger="click"
          id={`dropdownAvatarNameButton-${customer.id}-${index}`}
          type="button"
          className="text-black focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
        >
          <CiMenuKebab />
        </button>
        {showPopover === index && (
          <div
            ref={popoverRef}
            className="absolute z-40 right-10 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow w-44"
          >
            <ul className="py-2 text-sm text-gray-700">
              <>
                <li>
                  <button
                    type="button"
                    onClick={() => handleUpdateModalOpen(customer.id)}
                    className="flex items-center w-full gap-2 px-4 py-2 font-medium text-primary dark:text-primary hover:underline hover:bg-gray-100"
                  >
                    <FaRegEdit />
                    Edit
                  </button>{" "}
                </li>
                <li>
                  <button
                    onClick={() => handleDeleteCustomer(customer.id)}
                    type="button"
                    className="text-left text-red-500 flex items-center gap-2 w-full px-4 py-2 hover:bg-gray-100"
                    disabled={isDeleting}
                  >
                    <MdDelete /> Delete
                  </button>
                </li>
              </>
            </ul>
          </div>
        )}
      </td>
    </tr>
  ));

  return (
    <>
      <Breadcrumb pageName="Customers" />
      <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4">
        <div>
          <button
            onClick={handleModalOpen}
            className="inline-flex items-center justify-center rounded bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
            type="button"
          >
            <FaUserPlus />
            <span className="ml-2">Add Customer</span>
          </button>
        </div>

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
            placeholder="Search customers"
          />
        </div>
      </div>

      <div className="rounded-sm border border-stroke border-t-0 bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                  Customer name
                </th>
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                  Phone number
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Company
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Address
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {CustomerListContent}
            </tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
      {isModalOpen && (
        <CustomerRegistration handleModalOpen={handleModalOpen} />
      )}
      {updateModalOpen && id && (
        <CustomerEdit handleModalOpen={handleModalClose} id={id} />
      )}
    </>
  )
}
