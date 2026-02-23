import Loader from "@/common/Loader";
import { useGetAllServicesQuery } from "@/redux/services/servicesApiSlice";
import { useGetAllNonStockServicesQuery } from "@/redux/services/nonStockServicesApiSlice";
import { OrderItemNotes } from "@/types/OrderItemNotes";
import { OrderItemType } from "@/types/OrderItemType";
import { UserType } from "@/types/UserType";
import React, { useEffect, useState } from "react";
import { CiMenuKebab } from "react-icons/ci";
import { FaRegEdit } from "react-icons/fa";
import { SiMicrosoftonenote } from "react-icons/si";
import { Link } from "react-router-dom";


interface NotificationTableProps {
  title: string;
  orders: OrderItemType[];
  handleAction: (index: number) => void;
  showPopover: null | number;
  handleModalOpen: (id: string, status: string, index: number, width?: number, height?: number) => void;
  handleUpdateNote: (
    newNote: OrderItemNotes,
    index: number,
    setExpandedNotes: React.Dispatch<React.SetStateAction<boolean[]>>,
    expandedNotes: boolean[]
  ) => void;
  popoverRef: React.RefObject<HTMLDivElement>;
  user: UserType | null;
  status1: { value: string; label: string };
  status2: { value: string; label: string };
  expandedNotes: boolean[];
  setExpandedNotes: React.Dispatch<React.SetStateAction<boolean[]>>;
}

export const NotificationTable = ({
  title,
  orders,
  handleAction,
  showPopover,
  handleModalOpen,
  handleUpdateNote,
  popoverRef,
  user,
  status1,
  status2,
  expandedNotes,
  setExpandedNotes,
}: NotificationTableProps) => {
  const { data: services, isLoading } = useGetAllServicesQuery();
  const { data: nonStockServices, isLoading: isNonStockServicesLoading } = useGetAllNonStockServicesQuery();

  const [newNote, setNewNote] = useState<OrderItemNotes>({
    orderItemId: '',
    text: '',
    userId: '',
  });

  useEffect(() => {
    if (expandedNotes.length === 0) {
      setExpandedNotes(new Array(orders.length).fill(false));
    }
  }, [orders, expandedNotes.length, setExpandedNotes]);

  const handleChangeNotes = (value: string, orderItemId: string, userId: string) => {
    setNewNote({ orderItemId, text: value, userId });
  };

  const handleExpandNotes = (index: number) => {
    const updatedExpandedNotes = expandedNotes.map((expanded, expandedIndex) =>
      expandedIndex === index ? !expanded : expanded
    );
    setExpandedNotes(updatedExpandedNotes);
  };

  if (isLoading || isNonStockServicesLoading) return <Loader />

  return (
    <div className="max-w-full overflow-x-auto">
      <div>
        <span className="text-black dark:text-white w-full py-2 px-4 border-t border-b border-[#eee] mb-4 font-semibold flex items-center gap-4">
          {title}
        </span>
        <div className="max-w-full px-4">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  No
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Item
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Services
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Width
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Height
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Quantity
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Status
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Note
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Action
                </th>
              </tr>
            </thead>
            <tbody>
              {orders?.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center">
                    No data found
                  </td>
                </tr>
              )}
              {orders &&
                orders.length > 0 &&
                orders?.map((data, index: number) => {
                  if (!data.id || (!data.serviceId && !data.nonStockServiceId)) {
                    return null; // Skip rendering if id or serviceId/nonStockServiceId is undefined
                  }

                  // Get service name from either regular services or non-stock services
                  console.log('Order item data:', data);
                  console.log('Service ID:', data.serviceId);
                  console.log('Non-stock service ID:', data.nonStockServiceId);
                  console.log('Non-stock service object:', data.nonStockService);
                  
                  const serviceName = data.serviceId 
                    ? services?.find((s) => s.id === data.serviceId)?.name
                    : data.nonStockService?.name || nonStockServices?.find((s) => s.id === data.nonStockServiceId)?.name || "Service not found";
                  
                  console.log('Final service name:', serviceName);
                  return (
                    <React.Fragment key={index}>
                      <tr>
                        <td className="border-b text-graydark border-[#eee] py-2 px-4 dark:border-strokedark">
                          {index + 1}
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <Link to={`/dashboard/order/${data.orderId}`} className="text-primary dark:text-primary hover:underline">
                            {data.item?.name}
                          </Link>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                         {serviceName ?? "Service not found"}
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          {data.width}
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          {data.height}
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          {data.quantity}
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          {data.status}
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <button
                            title="notes"
                            type="button"
                            onClick={() => handleExpandNotes(index)}
                          >
                            <SiMicrosoftonenote />
                          </button>
                        </td>
                        <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                          <button
                            onClick={() => handleAction(index)}
                            title="action"
                            type="button"
                            className="text-black font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                          >
                            <CiMenuKebab />
                          </button>
                          {showPopover === index && (
                            <div
                              ref={popoverRef}
                              className="absolute z-40 right-10 mt-2 bg-white divide-y divide-gray-100 rounded-lg shadow w-44"
                            >
                              <ul className="py-2 text-sm text-gray-700">
                                {data.status !== "Void" && (
                                  <li>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleModalOpen(
                                          data.id,
                                          status1.value,
                                          index,
                                        )
                                      }
                                      className="flex items-center w-full gap-2 px-4 py-2 font-medium text-primary dark:text-primary hover:underline hover:bg-gray-100"
                                    >
                                      <FaRegEdit />
                                      {status1.label}
                                    </button>
                                  </li>
                                )}

                                {status2.value && data.status !== "Void" && (
                                  <li>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleModalOpen(
                                          data.id,
                                          status2.value,
                                          index
                                        )
                                      }
                                      className="flex items-center w-full gap-2 px-4 py-2 font-medium text-primary dark:text-primary hover:underline hover:bg-gray-100"
                                    >
                                      <FaRegEdit />
                                      {status2.label}
                                    </button>
                                  </li>
                                )}
                              </ul>
                            </div>
                          )}
                        </td>
                      </tr>
                      {expandedNotes[index] && (
                        <tr>
                          <td colSpan={8} className="p-2 border-b border-[#eee] dark:border-strokedark">
                            <div className="relative">
                              <textarea
                                onChange={(e) =>
                                  handleChangeNotes(e.target.value, data.id, user?.id || "")
                                }
                                // value={newNote.text || (data.orderItemNotes && data.orderItemNotes[index]?.text) || ""}
                                placeholder="Enter note"
                                className="w-full p-4 text-graydark rounded-lg bg-gray-100 dark:bg-form-input dark:border-form-strokedark dark:focus:border-primary"
                              />
                              <button
                                type="button"
                                className="absolute top-2 right-2 bg-primary text-white px-4 py-1 rounded-lg"
                                onClick={() =>
                                  handleUpdateNote(
                                    {
                                      orderItemId: data.id,
                                      text: newNote.text || (data.orderItemNotes && data.orderItemNotes[index]?.text) || "",
                                      userId: user?.id || "",
                                    },
                                    index,
                                    setExpandedNotes,
                                    expandedNotes
                                  )
                                }
                              >
                                Save
                              </button>
                            </div>
                            {/* Displaying the list of notes */}
                            {data.orderItemNotes && data.orderItemNotes.length > 0 && (
                              <div className="mt-4">
                                <h4 className="font-medium">Previous Notes:</h4>
                                <ul className="list-disc ml-4">
                                  {data.orderItemNotes.map((note, noteIndex) => (
                                    <li key={noteIndex} className="text-graydark">
                                      {note.text} - <span className="italic">By {note.user?.first_name} at {new Date(note.date? note.date : '').toLocaleDateString()}{" "}
                                        {new Date(note.date? note.date : '').toLocaleTimeString()}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
