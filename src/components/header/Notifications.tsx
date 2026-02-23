import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ErroPage from "../common/ErroPage";
import Loader from "@/common/Loader";
import { useParams } from "react-router-dom";
import Breadcrumb from "../Breadcrumb";
import { NotificationTable } from "./NotificationTable";
import { selectCurrentUser } from "@/redux/authSlice";
import { useCreateOrderItemNoteMutation} from "@/redux/order/orderItemNotesApiSlice";
import { OrderItemNotes } from "@/types/OrderItemNotes";
import { useGetOrderItemsQuery, useUpdateOrderItemMutation } from "@/redux/order/orderApiSlice";
import { useAssignedMachinesQuery } from "@/redux/machines/assignMachineApiSlice";
import { toast } from "react-toastify";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { OrderItemType } from "@/types/OrderItemType";
import Tabs from "@/common/TabComponent";
import { handleApiError } from "@/utils/errorHandling";


export const Notifications = () => {
  const { id } = useParams<{ id: string }>()
  const user = useSelector(selectCurrentUser);
  const { data: orderData, isLoading, error, isError, isSuccess, refetch } = useGetOrderItemsQuery(id ? id : '');
  const [updateOrderItem, { isLoading: isUpdatingOrderItem }] = useUpdateOrderItemMutation();
  const [createOrderItemNote, { isLoading: isCreatingNote }] = useCreateOrderItemNoteMutation()
  
  // Get user's assigned machines
  const { data: assignedMachinesData, isLoading: assignedMachinesLoading } = useAssignedMachinesQuery({ 
    page: 1, 
    limit: 1000 
  });

  const [proofReadyOrders, setProofReadyOrders] = useState<OrderItemType[]>([]);
  const [pendingApprovalOrders, setPendingApprovalOrders] = useState<OrderItemType[]>([]);
  const [printReadyOrders, setPrintReadyOrders] = useState<OrderItemType[]>([]);
  const [qualityControl, setQualityControl] = useState<OrderItemType[]>([]);
  const [delivery, setDelivery] = useState<OrderItemType[]>([]);

  const [expandedNotes, setExpandedNotes] = useState<boolean[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('proof-ready');
  const handleTabChange = (id: string) => {
    setActiveTabId(id);
  };


  const [showPopover, setShowPopover] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const proofReadyPopoverRef = useRef<HTMLDivElement>(null);
  const pendingApprovalPopoverRef = useRef<HTMLDivElement>(null);
  const printReadyPopoverRef = useRef<HTMLDivElement>(null);
  const qualityControlPopoverRef = useRef<HTMLDivElement>(null);
  const deliveryPopoverRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLElement>(null);


  const handleClickOutside = useCallback((event: MouseEvent) => {
    const refs = [proofReadyPopoverRef, pendingApprovalPopoverRef, printReadyPopoverRef, qualityControlPopoverRef, deliveryPopoverRef];
  
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
      
      // Role-based filtering logic
      if (user?.roles === 'ADMIN') {
        // Admin sees all orders
        filteredOrderData = orderData;
      } else if (user?.roles === 'GRAPHIC_DESIGNER') {
        // Graphic designers see orders that need design work (Received/Rejected status)
        // They don't need machine assignments for this role
        filteredOrderData = orderData.filter(item => 
          item.status === "Received" || item.status === "Rejected"
        );
      } else if (user?.roles === 'OPERATOR') {
        // Operators see orders based on their assigned machines
        filteredOrderData = orderData.filter(item => 
          userAssignedMachineIds.includes(item.item?.machineId || '')
        );
      } else if (user?.roles === 'RECEPTION') {
        // Reception sees orders that need their attention (Received/Rejected/Completed status)
        filteredOrderData = orderData.filter(item => 
          item.status === "Received" || item.status === "Rejected" || item.status === "Completed"
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
      
      setProofReadyOrders(filteredOrderData.filter((item) => item.status && (item.status === "Rejected" || item.status === "Received")));
      setPendingApprovalOrders(filteredOrderData.filter((item) => item.status === "Edited"));
      setPrintReadyOrders(filteredOrderData.filter((item) => item.status === "Approved"));
      setQualityControl(filteredOrderData.filter((item) => item.status === "Printed" || item.status === "Void"));
      setDelivery(filteredOrderData.filter((item) => item.status === "Completed" || item.status === "Delivered"));
    }
  }, [id, isSuccess, orderData, assignedMachinesData, user]);
    

  const handleAction = (index: number) => setShowPopover(prevIndex => (prevIndex === index ? null : index));

  const handleUpdateOrderItem = async (id: string, status: string, index: number, roleCheck: (roles: string) => boolean) => {
    if (!user?.roles || !roleCheck(user?.roles)) {
      toast.error("You are not authorized to edit this order");
      return;
    }

    try {
      const orderLists = [proofReadyOrders, pendingApprovalOrders, printReadyOrders, qualityControl, delivery];
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
    proofReady: (role: string) => ["GRAPHIC_DESIGNER", "RECEPTION", "ADMIN"].includes(role),
    pendingApproval: (role: string) => role === "ADMIN",
    printReady: (role: string) => ["OPERATOR", "ADMIN"].includes(role),
    qualityControl: (role: string) => role === "ADMIN",
    delivery: (role: string) => ["RECEPTION", "ADMIN"].includes(role),
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


  if (isError) return <ErroPage error={error.toString()} />
  if (isLoading || isCreatingNote || isUpdatingOrderItem || assignedMachinesLoading) return <Loader />

  const tabs = [
    { id: 'proof-ready', label: `Proof ready (${proofReadyOrders.length})` },
    { id: 'pending', label: `Pending (${pendingApprovalOrders.length})` },
    { id: 'print-ready', label: `Print ready (${printReadyOrders.length})` },
    { id: 'quality-control', label: `Quality control (${qualityControl.length})` },
    { id: 'delivery', label: `Delivery (${delivery.length})` },
  ];

  return (
    <>
      <Breadcrumb pageName="Order item list" />
      <Tabs tabs={tabs} activeTabId={activeTabId} onTabChange={handleTabChange} />
      <div className="rounded-sm border border-stroke border-t-0 bg-white px-4 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark">
        {activeTabId === "proof-ready" && (
          <NotificationTable
            title={`Proof ready orders`}
            orders={proofReadyOrders}
            handleAction={handleAction}
            handleModalOpen={(id, status, index) => handleUpdateOrderItem(id, status, index, roleCheckers.proofReady)}
            handleUpdateNote={handleUpdateNote}
            showPopover={showPopover}
            popoverRef={proofReadyPopoverRef}
            user={user}
            status1={{ label: "Edited", value: "Edited" }}
            status2={{ label: "", value: "" }}
            expandedNotes={expandedNotes}
            setExpandedNotes={setExpandedNotes}
          />
        )}
        {activeTabId === "pending" && (
          <NotificationTable
            title={`Pending approval orders`}
            orders={pendingApprovalOrders}
            handleAction={handleAction}
            handleModalOpen={(id, status, index) => handleUpdateOrderItem(id, status, index, roleCheckers.pendingApproval)}
            handleUpdateNote={handleUpdateNote}
            showPopover={showPopover}
            popoverRef={pendingApprovalPopoverRef}
            user={user}
            status1={{ label: "Approve", value: "Approved" }}
            status2={{ label: "Reject", value: "Rejected" }}
            expandedNotes={expandedNotes}
            setExpandedNotes={setExpandedNotes}
          />
        )}
        {activeTabId === "print-ready" && (
          <NotificationTable
            title={`Print ready orders`}
            orders={printReadyOrders}
            handleAction={handleAction}
            handleModalOpen={(id, status, index) => handleUpdateOrderItem(id, status, index, roleCheckers.printReady)}
            handleUpdateNote={handleUpdateNote}
            showPopover={showPopover}
            popoverRef={printReadyPopoverRef}
            user={user}
            status1={{ label: "print", value: "Printed" }}
            status2={{ label: "Reject", value: "Rejected" }}
            expandedNotes={expandedNotes}
            setExpandedNotes={setExpandedNotes}
          />
        )}
        {activeTabId === "quality-control" && (
          <NotificationTable
            title={`Quality control and approval orders`}
            orders={qualityControl}
            handleAction={handleAction}
            handleModalOpen={(id, status, index) => handleUpdateOrderItem(id, status, index, roleCheckers.qualityControl)}
            handleUpdateNote={handleUpdateNote}
            showPopover={showPopover}
            popoverRef={qualityControlPopoverRef}
            user={user}
            status1={{ label: "Approve", value: "Completed" }}
            status2={{ label: "Void", value: "Void" }}
            expandedNotes={expandedNotes}
            setExpandedNotes={setExpandedNotes}
          />
        )}
        {activeTabId === "delivery" && (
          <NotificationTable
            title={`Delivery and shipping orders`}
            orders={delivery}
            handleAction={handleAction}
            handleModalOpen={(id, status, index) => handleUpdateOrderItem(id, status, index, roleCheckers.delivery)}
            handleUpdateNote={handleUpdateNote}
            showPopover={showPopover}
            popoverRef={deliveryPopoverRef}
            user={user}
            status1={{ label: "Deliver", value: "Delivered" }}
            status2={{ label: "", value: "" }}
            expandedNotes={expandedNotes}
            setExpandedNotes={setExpandedNotes}
          />
        )}
      </div>
    </>
  );

};
