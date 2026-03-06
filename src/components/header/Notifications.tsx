import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ErroPage from "../common/ErroPage";
import Loader from "@/common/Loader";
import { Link, useParams } from "react-router-dom";
import Breadcrumb from "../Breadcrumb";
import { NotificationTable } from "./NotificationTable";
import { selectCurrentUser } from "@/redux/authSlice";
import { useCreateOrderItemNoteMutation } from "@/redux/order/orderItemNotesApiSlice";
import { OrderItemNotes } from "@/types/OrderItemNotes";
import { useGetOrderQuery, useGetOrderItemsQuery, useUpdateOrderItemMutation } from "@/redux/order/orderApiSlice";
import { useAssignedMachinesQuery } from "@/redux/machines/assignMachineApiSlice";
import { toast } from "react-toastify";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { OrderItemType } from "@/types/OrderItemType";
import Tabs from "@/common/TabComponent";
import { handleApiError } from "@/utils/errorHandling";


export const Notifications = () => {
  const { id } = useParams<{ id: string }>();
  const user = useSelector(selectCurrentUser);
  const { data: order, isLoading: isOrderLoading } = useGetOrderQuery(id ?? "");
  const { data: orderData, isLoading, error, isError, isSuccess, refetch } = useGetOrderItemsQuery(id ?? "");
  const [updateOrderItem, { isLoading: isUpdatingOrderItem }] = useUpdateOrderItemMutation();
  const [createOrderItemNote, { isLoading: isCreatingNote }] = useCreateOrderItemNoteMutation()
  
  // Get user's assigned machines
  const { data: assignedMachinesData, isLoading: assignedMachinesLoading } = useAssignedMachinesQuery({ 
    page: 1, 
    limit: 1000 
  });

  // Status tracking tabs aligned with order-to-production flow (Pending → InProgress → Ready → Delivered / Cancelled)
  const [pendingItems, setPendingItems] = useState<OrderItemType[]>([]);
  const [inProgressItems, setInProgressItems] = useState<OrderItemType[]>([]);
  const [readyItems, setReadyItems] = useState<OrderItemType[]>([]);
  const [deliveredItems, setDeliveredItems] = useState<OrderItemType[]>([]);
  const [cancelledItems, setCancelledItems] = useState<OrderItemType[]>([]);

  const [expandedNotes, setExpandedNotes] = useState<boolean[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('pending');
  const handleTabChange = (id: string) => {
    setActiveTabId(id);
  };


  const [showPopover, setShowPopover] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const pendingPopoverRef = useRef<HTMLDivElement>(null);
  const inProgressPopoverRef = useRef<HTMLDivElement>(null);
  const readyPopoverRef = useRef<HTMLDivElement>(null);
  const deliveredPopoverRef = useRef<HTMLDivElement>(null);
  const cancelledPopoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const refs = [pendingPopoverRef, inProgressPopoverRef, readyPopoverRef, deliveredPopoverRef, cancelledPopoverRef];
  
    refs.forEach((ref, index) => {
      if (showPopover === index && ref.current && !ref.current.contains(event.target as Node)) {
        setShowPopover(null);
      }
    });
  }, [showPopover]);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (
        dropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(target as Node) &&
        !triggerRef.current?.contains(target as Node)
      ) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  }, [dropdownOpen]);

  useEffect(() => {
    const keyHandler = ({ key }: KeyboardEvent) => {
      if (dropdownOpen && key === 'Escape') setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  }, [dropdownOpen]);


  useEffect(() => {
    if (isSuccess && orderData && assignedMachinesData) {
      // Get user's assigned machine IDs
      const userAssignedMachineIds = assignedMachinesData.userMachines
        ?.filter(assignment => assignment.user.email === user?.email)
        ?.map(assignment => assignment.machine.id) || [];
      
      // Filter order items based on user's role and assigned machines
      let filteredOrderData = orderData;
      
      // Role-based filtering logic (see FRONTEND_GUIDE.md#user-roles)
      if (user?.roles === 'ADMIN') {
        filteredOrderData = orderData;
      } else if (user?.roles === 'LAB_TECHNICIAN') {
        filteredOrderData = orderData.filter(item =>
          item.status === "Received" || item.status === "Rejected" || item.status === "Edited"
        );
      } else if (user?.roles === 'OPERATOR') {
        filteredOrderData = orderData.filter(item =>
          userAssignedMachineIds.includes(item.item?.machineId || '')
        );
      } else if (user?.roles === 'RECEPTION' || user?.roles === 'DISPENSER') {
        filteredOrderData = orderData.filter(item =>
          ["Received", "Rejected", "Completed", "Delivered"].includes(item.status || "")
        );
      } else {
        // For other roles, filter by assigned machines if they have any
        if (userAssignedMachineIds.length > 0) {
          filteredOrderData = orderData.filter(item => 
            userAssignedMachineIds.includes(item.item?.machineId || '')
          );
        } else {
          // If no machines assigned, show no orders
          filteredOrderData = [];
        }
      }
      
      // Map statuses to production flow tabs (support both standard and legacy status values)
      const isPending = (s: string) => ["Pending", "Received", "Rejected", "Edited"].includes(s);
      const isInProgress = (s: string) => ["InProgress", "Approved", "Printed"].includes(s);
      const isReady = (s: string) => ["Ready", "Completed"].includes(s);
      const isDelivered = (s: string) => s === "Delivered";
      const isCancelled = (s: string) => ["Cancelled", "Void"].includes(s);

      setPendingItems(filteredOrderData.filter((item) => item.status && isPending(item.status)));
      setInProgressItems(filteredOrderData.filter((item) => item.status && isInProgress(item.status)));
      setReadyItems(filteredOrderData.filter((item) => item.status && isReady(item.status)));
      setDeliveredItems(filteredOrderData.filter((item) => item.status && isDelivered(item.status)));
      setCancelledItems(filteredOrderData.filter((item) => item.status && isCancelled(item.status)));
    }
  }, [id, isSuccess, orderData, assignedMachinesData, user]);
    

  const handleAction = (index: number) => setShowPopover(prevIndex => (prevIndex === index ? null : index));

  const handleUpdateOrderItem = async (id: string, status: string, index: number, roleCheck: (roles: string) => boolean) => {
    if (!user?.roles || !roleCheck(user?.roles)) {
      toast.error("You are not authorized to edit this order");
      return;
    }

    try {
      const orderLists = [pendingItems, inProgressItems, readyItems, deliveredItems, cancelledItems];
      const list = orderLists.find(list => list.some(item => item.id === id));
      const itemToUpdate = list?.find(item => item.id === id);

      if (itemToUpdate) {
        await updateOrderItem({ ...itemToUpdate, status }).unwrap();
        toast.success("Order updated successfully");
        handleAction(index);
        refetch();
      }
    } catch (error) {
      const fetchError = error as FetchBaseQueryError;
      const errorMessage = handleApiError(fetchError, "Failed to update order item");
      toast.error(errorMessage);
      handleAction(index);
    }
  };

  const roleCheckers = {
    pending: (role: string) => ["LAB_TECHNICIAN", "RECEPTION", "ADMIN"].includes(role),
    inProgress: (role: string) => ["OPERATOR", "ADMIN"].includes(role),
    ready: (role: string) => ["OPERATOR", "ADMIN"].includes(role),
    delivered: (role: string) => ["RECEPTION", "DISPENSER", "ADMIN"].includes(role),
    cancelled: (role: string) => role === "ADMIN",
  };

  const handleUpdateNote = async (newNote: OrderItemNotes, index: number) => {
    if (newNote.text?.trim()) {
      try {
        await createOrderItemNote(newNote).unwrap();
        toast.success("Note added successfully");
        refetch();

        setExpandedNotes(prevNotes =>
          prevNotes.map((expanded, i) => (i === index ? true : expanded))
        );
      } catch (error) {
        const fetchError = error as FetchBaseQueryError;
        const errorMessage = handleApiError(fetchError, "Failed to add note");
        toast.error(errorMessage);
      }
    } else {
      toast.error("Note cannot be empty");
    }
  };


  if (isError) return <ErroPage error={error?.toString() ?? "Failed to load order items"} />;
  if (isOrderLoading || isLoading || isCreatingNote || isUpdatingOrderItem || assignedMachinesLoading) return <Loader />;

  const hasItems = orderData && orderData.length > 0;
  const tabs = [
    { id: 'pending', label: `Pending (${pendingItems.length})` },
    { id: 'in-progress', label: `In progress (${inProgressItems.length})` },
    { id: 'ready', label: `Ready (${readyItems.length})` },
    { id: 'delivered', label: `Delivered (${deliveredItems.length})` },
    { id: 'cancelled', label: `Cancelled (${cancelledItems.length})` },
  ];

  return (
    <>
      <Breadcrumb pageName="Order notifications" />
      {order && (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-sm border border-stroke bg-white px-4 py-3 shadow-default dark:border-strokedark dark:bg-boxdark">
          <Link
            to={`/dashboard/order/${id}`}
            className="text-primary font-medium hover:underline dark:text-primary"
          >
            ← Back to order
          </Link>
          <span className="text-body dark:text-bodydark">
            {order.series && (
              <>
                <span className="font-medium text-black dark:text-white">{order.series}</span>
                {order.customer?.fullName && (
                  <span className="ml-2"> · {order.customer.fullName}</span>
                )}
              </>
            )}
          </span>
        </div>
      )}
      {!id ? (
        <div className="rounded-sm border border-stroke bg-white px-4 py-8 text-center dark:border-strokedark dark:bg-boxdark">
          <p className="text-body dark:text-bodydark">No order selected.</p>
        </div>
      ) : !hasItems ? (
        <div className="rounded-sm border border-stroke bg-white px-4 py-8 text-center dark:border-strokedark dark:bg-boxdark">
          <p className="text-body dark:text-bodydark">This order has no items yet.</p>
          <Link to={`/dashboard/order/${id}`} className="mt-2 inline-block text-primary hover:underline dark:text-primary">
            View order
          </Link>
        </div>
      ) : (
        <>
          <Tabs tabs={tabs} activeTabId={activeTabId} onTabChange={handleTabChange} />
          <div className="rounded-sm border border-stroke border-t-0 bg-white px-4 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        {activeTabId === "pending" && (
          <NotificationTable
            title="Pending (not yet in production)"
            orders={pendingItems}
            handleAction={handleAction}
            handleModalOpen={(id, status, index) => handleUpdateOrderItem(id, status, index, roleCheckers.pending)}
            handleUpdateNote={handleUpdateNote}
            showPopover={showPopover}
            popoverRef={pendingPopoverRef}
            user={user}
            status1={{ label: "Start production", value: "Printed" }}
            status2={{ label: "Edit", value: "Edited" }}
            expandedNotes={expandedNotes}
            setExpandedNotes={setExpandedNotes}
          />
        )}
        {activeTabId === "in-progress" && (
          <NotificationTable
            title="In progress (lens in production)"
            orders={inProgressItems}
            handleAction={handleAction}
            handleModalOpen={(id, status, index) => handleUpdateOrderItem(id, status, index, roleCheckers.inProgress)}
            handleUpdateNote={handleUpdateNote}
            showPopover={showPopover}
            popoverRef={inProgressPopoverRef}
            user={user}
            status1={{ label: "Mark ready", value: "Completed" }}
            status2={{ label: "Cancel", value: "Void" }}
            expandedNotes={expandedNotes}
            setExpandedNotes={setExpandedNotes}
          />
        )}
        {activeTabId === "ready" && (
          <NotificationTable
            title="Ready (production done)"
            orders={readyItems}
            handleAction={handleAction}
            handleModalOpen={(id, status, index) => handleUpdateOrderItem(id, status, index, roleCheckers.ready)}
            handleUpdateNote={handleUpdateNote}
            showPopover={showPopover}
            popoverRef={readyPopoverRef}
            user={user}
            status1={{ label: "Mark delivered", value: "Delivered" }}
            status2={{ label: "", value: "" }}
            expandedNotes={expandedNotes}
            setExpandedNotes={setExpandedNotes}
          />
        )}
        {activeTabId === "delivered" && (
          <NotificationTable
            title="Delivered"
            orders={deliveredItems}
            handleAction={handleAction}
            handleModalOpen={(id, status, index) => handleUpdateOrderItem(id, status, index, roleCheckers.delivered)}
            handleUpdateNote={handleUpdateNote}
            showPopover={showPopover}
            popoverRef={deliveredPopoverRef}
            user={user}
            status1={{ label: "", value: "" }}
            status2={{ label: "", value: "" }}
            expandedNotes={expandedNotes}
            setExpandedNotes={setExpandedNotes}
          />
        )}
        {activeTabId === "cancelled" && (
          <NotificationTable
            title="Cancelled"
            orders={cancelledItems}
            handleAction={handleAction}
            handleModalOpen={(id, status, index) => handleUpdateOrderItem(id, status, index, roleCheckers.cancelled)}
            handleUpdateNote={handleUpdateNote}
            showPopover={showPopover}
            popoverRef={cancelledPopoverRef}
            user={user}
            status1={{ label: "", value: "" }}
            status2={{ label: "", value: "" }}
            expandedNotes={expandedNotes}
            setExpandedNotes={setExpandedNotes}
          />
        )}
          </div>
        </>
      )}
    </>
  );
};
