import { useState } from "react"
import SelectMachines from "./SelectMachines"
import SelectUsers from "./SelectUsers";
import Breadcrumb from "../Breadcrumb";
import { FaUserPlus } from "react-icons/fa6";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/redux/authSlice";
import { useAssignedMachinesQuery, useAssignMachineMutation, useUnassignMachineMutation } from "@/redux/machines/assignMachineApiSlice";
import Loader from "@/common/Loader";
import ErroPage from "../common/ErroPage";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import { isFetchBaseQueryError } from "@/types/ErrorType";
import  Pagination  from "@/common/Pagination";


const AssignUserMachine = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { data, isLoading, isError, error } = useAssignedMachinesQuery({ page, limit });
  const [unAssignMachine, {isLoading: isDeleting}] = useUnassignMachineMutation();
  const [assignMachine, {isLoading: isAssigning}] = useAssignMachineMutation();
  const [selectedMachineIds, setSelectedMachineIds] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string>("");
  const user = useSelector(selectCurrentUser);

  const handleUsersChange = (user: string) => {
    setSelectedUsers(user);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const handleAssignMachine = async () => {
    if (selectedUsers && selectedMachineIds.length > 0) {
      try {
          const response = await assignMachine({ userId: selectedUsers, machineId: selectedMachineIds }).unwrap();
          toast.success(response.message);
          if (response.duplicates && response.duplicates.length > 0) {
              toast.warn(`Some machines were already assigned: ${response.duplicates.join(', ')}`);
          }
      } catch (error) {
        if (isFetchBaseQueryError(error) && 'data' in error) {
            const errorMessage = (error.data as { message?: string })?.message;
            if (errorMessage) {
                toast.error(errorMessage);
            } else {
                toast.error('An unknown error occurred');
            }
        } else {
            toast.error('Failed to assign machine');
        }
    }
} else {
    toast.error("Please select a user and machine");
}
  };

  const handleUnAssignMachine = (id: string) => {
    Swal.fire({
      title: 'Are you sure?',
      text: 'You will not be able to recover this machine!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete it!',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        try {
          unAssignMachine(id);
          Swal.fire('Deleted!', 'Machine has been deleted.', 'success');
          
        } catch (error) {
          console.error('Failed to delete the user:', error);
              toast.error('Failed to delete the user');
        }
      }
    });
  }

  if (isError) {
    return <ErroPage error={error.toString()} />;
  }

  if (isLoading) {
    return <Loader />;
  }

  if (!data) return <div>No data available</div>;

  const { userMachines, total } = data;
  const totalPages = Math.ceil(total / limit);

  const assignedmachines = userMachines?.map((machine) => (
    <tr key={machine.id}>
      <td className="border-b border-[#eee] py-5 px-4 pl-4 dark:border-strokedark xl:pl-11">
        <h5 className="font-medium text-black dark:text-white">
          <div>
            <div className="text-base font-semibold text-black dark:text-white">
              {machine.user.first_name} {machine.user.middle_name}
            </div>
            <div className="font-normal text-gray-500">{machine.user.email}</div>
          </div>
        </h5>
      </td>
      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
        <p className="text-black dark:text-white">{machine.machine.name}</p>
      </td>
      <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
        <div className="flex items-center space-x-3.5">
          <button
            onClick={()=>handleUnAssignMachine(machine.id)}
            disabled={isDeleting}
            type="button" className="hover:text-primary" title="delete">
            <svg
              className="fill-current"
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502ZM7.67852 1.9969C7.67852 1.85627 7.79102 1.74377 7.93164 1.74377H10.0973C10.2379 1.74377 10.3504 1.85627 10.3504 1.9969V2.47502H7.70664V1.9969H7.67852ZM4.02227 3.96565C4.02227 3.85315 4.10664 3.74065 4.24727 3.74065H13.7535C13.866 3.74065 13.9785 3.82502 13.9785 3.96565V4.8094C13.9785 4.9219 13.8941 5.0344 13.7535 5.0344H4.24727C4.13477 5.0344 4.02227 4.95002 4.02227 4.8094V3.96565ZM11.7285 16.2563H6.27227C5.79414 16.2563 5.40039 15.8906 5.37227 15.3844L4.95039 6.2719H13.0785L12.6566 15.3844C12.6004 15.8625 12.2066 16.2563 11.7285 16.2563Z"
                fill=""
              />
              <path
                d="M9.00039 9.11255C8.66289 9.11255 8.35352 9.3938 8.35352 9.75942V13.3313C8.35352 13.6688 8.63477 13.9782 9.00039 13.9782C9.33789 13.9782 9.64727 13.6969 9.64727 13.3313V9.75942C9.64727 9.3938 9.33789 9.11255 9.00039 9.11255Z"
                fill=""
              />
              <path
                d="M11.2502 9.67504C10.8846 9.64692 10.6033 9.90004 10.5752 10.2657L10.4064 12.7407C10.3783 13.0782 10.6314 13.3875 10.9971 13.4157C11.0252 13.4157 11.0252 13.4157 11.0533 13.4157C11.3908 13.4157 11.6721 13.1625 11.6721 12.825L11.8408 10.35C11.8408 9.98442 11.5877 9.70317 11.2502 9.67504Z"
                fill=""
              />
              <path
                d="M6.72245 9.67504C6.38495 9.70317 6.1037 10.0125 6.13182 10.35L6.3287 12.825C6.35683 13.1625 6.63808 13.4157 6.94745 13.4157C6.97558 13.4157 6.97558 13.4157 7.0037 13.4157C7.3412 13.3875 7.62245 13.0782 7.59433 12.7407L7.39745 10.2657C7.39745 9.90004 7.08808 9.64692 6.72245 9.67504Z"
                fill=""
              />
            </svg>
          </button>
        </div>
      </td>
    </tr>
  ));

  return (
    <>
      <Breadcrumb pageName="Assign machines" />
      <div className="md:flex flex-col justify-between gap-4">
        <SelectUsers selectedUsers={selectedUsers} onUsersChange={handleUsersChange} />
        <SelectMachines id="multiSelect" selectedIds={selectedMachineIds} setSelectedIds={setSelectedMachineIds} />
      </div>

      <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4">
        {user?.roles === 'ADMIN' && (
          <div>
            <button type="button" onClick={handleAssignMachine} disabled={isAssigning} className="inline-flex items-center justify-center rounded bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90">
              <FaUserPlus />
              <span className="ml-2">Assign User to Machine</span>
            </button>
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
            id="table-search-users"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 ps-10 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            placeholder="Search for users"
          />
        </div>
      </div>

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                  Operators
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Machines
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>{assignedmachines}</tbody>
          </table>
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      </div>
    </>
  )
}

export default AssignUserMachine
