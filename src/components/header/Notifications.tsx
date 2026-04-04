import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import ErroPage from "../common/ErroPage";
import Loader from "@/common/Loader";
import { Link, useParams } from "react-router-dom";
import Breadcrumb from "../Breadcrumb";
import { NotificationTable } from "./NotificationTable";
import { selectCurrentUser, selectPermissions } from "@/redux/authSlice";
import { userHasAnyPermission, userHasPermission } from "@/utils/permissions";
import {
  ADMIN_ROLE,
  PERMISSION_ORDER_ITEMS_WRITE,
  PERMISSION_ORDERS_READ,
  PERMISSION_ORDERS_WRITE,
  PERMISSION_PRODUCTION_WRITE,
  PERMISSION_QUALITY_CONTROL_WRITE,
} from "@/constants/permissions";
import { useCreateOrderItemNoteMutation } from "@/redux/order/orderItemNotesApiSlice";
import { OrderItemNotes } from "@/types/OrderItemNotes";
import { useGetOrderQuery, useGetOrderItemsQuery, useUpdateOrderItemMutation } from "@/redux/order/orderApiSlice";
import { useAssignedMachinesQuery } from "@/redux/machines/assignMachineApiSlice";
import { toast } from "react-toastify";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { OrderItemType } from "@/types/OrderItemType";
import Tabs from "@/common/TabComponent";
import { handleApiError } from "@/utils/errorHandling";
import { QcFailureModal } from "../order/QcFailureModal";


export const Notifications = () => {
  const { id } = useParams<{ id: string }>();
  const user = useSelector(selectCurrentUser);
  const permissions = useSelector(selectPermissions);
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
  const [approvedItems, setApprovedItems] = useState<OrderItemType[]>([]);
  const [qcItems, setQcItems] = useState<OrderItemType[]>([]);

  const [expandedNotes, setExpandedNotes] = useState<boolean[]>([]);
  const [activeTabId, setActiveTabId] = useState<string>('pending');
  const handleTabChange = (id: string) => {
    setActiveTabId(id);
  };


  const [showPopover, setShowPopover] = useState<number | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [qcFailOrderItemId, setQcFailOrderItemId] = useState<string | null>(null);
  const [qcFailSubmitting, setQcFailSubmitting] = useState(false);

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
      const normalizedOrderData: OrderItemType[] = orderData.map((item) => {
        const itemAny = item as OrderItemType & {
          sales?: number;
          pricing?: { sellingPrice?: number };
        };
        const qty = Number(item.quantity || 0);
        const unitPrice = Number(item.unitPrice || 0);
        const totalAmount = Number(item.totalAmount || 0);
        const sales = Number(itemAny.sales || 0);
        const pricingUnit = Number(itemAny.pricing?.sellingPrice || 0);

        let normalizedQty = qty;
        let normalizedUnitPrice = unitPrice;
        let normalizedTotalAmount = totalAmount;
        let normalizedQtyRight =
          typeof item.quantityRight === "number" ? item.quantityRight : 0;
        let normalizedQtyLeft =
          typeof item.quantityLeft === "number" ? item.quantityLeft : 0;

        if (normalizedUnitPrice <= 0 && pricingUnit > 0) {
          normalizedUnitPrice = pricingUnit;
        }
        if (normalizedTotalAmount <= 0 && sales > 0) {
          normalizedTotalAmount = sales;
        }
        if (normalizedQty <= 0 && normalizedUnitPrice > 0 && normalizedTotalAmount > 0) {
          normalizedQty = normalizedTotalAmount / normalizedUnitPrice;
        }
        if (
          normalizedQtyRight <= 0 &&
          normalizedQtyLeft <= 0 &&
          normalizedQty > 0
        ) {
          const half = normalizedQty / 2;
          normalizedQtyRight = half;
          normalizedQtyLeft = half;
        }

        return {
          ...item,
          quantity: String(normalizedQty),
          quantityRight: normalizedQtyRight,
          quantityLeft: normalizedQtyLeft,
          unitPrice: normalizedUnitPrice,
          totalAmount: normalizedTotalAmount,
        } as OrderItemType;
      });

      // Visibility: production/QC/line-edit permissions see full lists; front desk (orders only) sees a subset
      let filteredOrderData = normalizedOrderData;
      const canSeeFullProductionView =
        user?.roles === ADMIN_ROLE ||
        userHasAnyPermission(user, permissions, [
          PERMISSION_ORDER_ITEMS_WRITE,
          PERMISSION_PRODUCTION_WRITE,
          PERMISSION_QUALITY_CONTROL_WRITE,
        ]);
      const canSeeFrontDeskView =
        userHasPermission(user, permissions, PERMISSION_ORDERS_READ) ||
        userHasPermission(user, permissions, PERMISSION_ORDERS_WRITE);

      if (canSeeFullProductionView) {
        filteredOrderData = normalizedOrderData;
      } else if (canSeeFrontDeskView) {
        filteredOrderData = normalizedOrderData.filter((item) =>
          ["Pending", "Ready", "Delivered", "Cancelled"].includes(item.status || ""),
        );
      } else {
        filteredOrderData = [];
      }
      
      // Map statuses to production flow tabs (backend standard values only)
      const isPending = (s: string) => s === "Pending";
      const isInProgress = (s: string) => s === "InProgress";
      const isReady = (s: string) => s === "Ready";
      const isDelivered = (s: string) => s === "Delivered";
      const isCancelled = (s: string) => s === "Cancelled";

      // Pending tab should only show items that are not yet approved.
      // Once a line is approved (approvalStatus === "Approved") and still Pending,
      // it moves to the Approved tab and should not remain in Pending.
      const pending = filteredOrderData.filter(
        (item) =>
          item.status &&
          isPending(item.status) &&
          item.approvalStatus !== "Approved",
      );
      const inProgress = filteredOrderData.filter(
        (item) => item.status && isInProgress(item.status),
      );

      // Split Ready into two mutually-exclusive tabs:
      // - Ready tab: items that are Ready AND QC has already been set (Passed/Failed)
      // - Quality control tab: items that are Ready AND QC is still Pending/empty (needs QC action)
      const qcPending = (qc: string | undefined) => !qc || qc === "Pending";
      const qcDone = (qc: string | undefined) => !!qc && qc !== "Pending";

      const ready = filteredOrderData.filter(
        (item) => item.status && isReady(item.status) && qcDone(item.qualityControlStatus),
      );
      const delivered = filteredOrderData.filter((item) => item.status && isDelivered(item.status));
      const cancelled = filteredOrderData.filter((item) => item.status && isCancelled(item.status));

      setPendingItems(pending);
      setInProgressItems(inProgress);
      setReadyItems(ready);
      setDeliveredItems(delivered);
      setCancelledItems(cancelled);

      // Approval and quality control groupings
      // Approved tab shows lines that are approved but still Pending
      setApprovedItems(
        filteredOrderData.filter(
          (item) => item.status === "Pending" && item.approvalStatus === "Approved",
        ),
      );

      // Quality control tab: Ready items awaiting QC
      setQcItems(
        filteredOrderData.filter(
          (item) => item.status === "Ready" && qcPending(item.qualityControlStatus),
        ),
      );
    }
  }, [id, isSuccess, orderData, assignedMachinesData, user, permissions]);
    

  const handleAction = (index: number) => setShowPopover(prevIndex => (prevIndex === index ? null : index));

  const handleUpdateOrderItem = async (
    orderItemId: string,
    status: string,
    index: number,
    authorized: () => boolean,
  ) => {
    if (!authorized()) {
      toast.error("You are not authorized to edit this order");
      return;
    }

    try {
      const orderLists = [
        pendingItems,
        inProgressItems,
        readyItems,
        deliveredItems,
        cancelledItems,
        approvedItems,
        qcItems,
      ];
      const list = orderLists.find(list => list.some(item => item.id === orderItemId));
      const itemToUpdate = list?.find(item => item.id === orderItemId);

      if (!itemToUpdate) return;

      const orderIdResolved = itemToUpdate.orderId || id || "";

      // Enforce QC pass before delivery
      if (status === "Delivered" && itemToUpdate.qualityControlStatus !== "Passed") {
        toast.error("Quality control must be Passed before delivery.");
        handleAction(index);
        return;
      }

      type ItemPatch = Partial<OrderItemType> & { id: string; orderId: string };
      const base: { id: string; orderId: string } = {
        id: itemToUpdate.id,
        orderId: orderIdResolved,
      };

      let payload: ItemPatch;

      if (status === "Pending") {
        payload = { ...base, approvalStatus: "Approved" };
      } else if (status === "REQUEST_STORE_ITEMS") {
        if (itemToUpdate.storeRequestStatus === "Issued") {
          toast.info("Store has already issued items for this line.");
          handleAction(index);
          return;
        }
        payload = { ...base, storeRequestStatus: "Requested" };
        if (user?.id) {
          payload.operatorId = user.id;
        }
      } else if (status === "QC_PASSED") {
        if (itemToUpdate.status !== "Ready") {
          toast.error("Quality control applies only to items that are Ready.");
          handleAction(index);
          return;
        }
        payload = { ...base, qualityControlStatus: "Passed" };
      } else if (status === "QC_FAILED") {
        // Open modal from tab handler instead
        return;
      } else {
        if (status === "InProgress") {
          if (itemToUpdate.approvalStatus !== "Approved") {
            toast.error("This line must be approved before starting production.");
            handleAction(index);
            return;
          }
          if (itemToUpdate.storeRequestStatus !== "Issued") {
            toast.error(
              "Start production is blocked until the store has issued materials (store request must be Issued).",
            );
            handleAction(index);
            return;
          }
        }
        payload = { ...base, status };
      }

      await updateOrderItem(payload).unwrap();
      toast.success("Order updated successfully");
      handleAction(index);
      refetch();
    } catch (error) {
      const fetchError = error as FetchBaseQueryError;
      const errorMessage = handleApiError(fetchError, "Failed to update order item");
      toast.error(errorMessage);
      handleAction(index);
    }
  };

  const permissionCheckers = {
    pending: () => userHasPermission(user, permissions, PERMISSION_ORDER_ITEMS_WRITE),
    inProgress: () =>
      userHasAnyPermission(user, permissions, [
        PERMISSION_PRODUCTION_WRITE,
        PERMISSION_ORDER_ITEMS_WRITE,
      ]),
    ready: () => userHasPermission(user, permissions, PERMISSION_ORDER_ITEMS_WRITE),
    delivered: () => userHasPermission(user, permissions, PERMISSION_ORDER_ITEMS_WRITE),
    cancelled: () => userHasPermission(user, permissions, PERMISSION_ORDER_ITEMS_WRITE),
    approved: () =>
      userHasAnyPermission(user, permissions, [
        PERMISSION_ORDER_ITEMS_WRITE,
        PERMISSION_PRODUCTION_WRITE,
      ]),
    qc: () => userHasPermission(user, permissions, PERMISSION_QUALITY_CONTROL_WRITE),
  };

  const handleQcFailConfirm = async (reason: string, requestStoreWithOperator: boolean) => {
    if (
      !user?.id ||
      !qcFailOrderItemId ||
      !userHasPermission(user, permissions, PERMISSION_QUALITY_CONTROL_WRITE)
    ) {
      toast.error("You are not authorized or session is incomplete.");
      return;
    }

    const item = qcItems.find((i) => i.id === qcFailOrderItemId);
    if (!item) {
      toast.error("Line not found.");
      setQcFailOrderItemId(null);
      return;
    }
    if (item.status !== "Ready") {
      toast.error("Quality control applies only to items that are Ready.");
      setQcFailOrderItemId(null);
      return;
    }
    if (item.qualityControlStatus === "Failed") {
      toast.error("This line is already marked QC Failed.");
      setQcFailOrderItemId(null);
      return;
    }

    const orderIdResolved = item.orderId || id || "";
    setQcFailSubmitting(true);
    try {
      await createOrderItemNote({
        orderItemId: item.id,
        text: `[QC Failed] ${reason}`,
        userId: user.id,
      }).unwrap();

      const payload: Partial<OrderItemType> & {
        id: string;
        orderId: string;
        qualityControlStatus: string;
      } = {
        id: item.id,
        orderId: orderIdResolved,
        qualityControlStatus: "Failed",
      };
      if (requestStoreWithOperator && user.id) {
        payload.operatorId = user.id;
      }

      await updateOrderItem(payload).unwrap();
      toast.success(
        requestStoreWithOperator
          ? "QC failure recorded; line reset for remake with store request."
          : "QC failure recorded; line reset for remake (request store separately if needed).",
      );
      setQcFailOrderItemId(null);
      setShowPopover(null);
      refetch();
    } catch (error) {
      const fetchError = error as FetchBaseQueryError;
      toast.error(handleApiError(fetchError, "Failed to record QC failure"));
    } finally {
      setQcFailSubmitting(false);
    }
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
    { id: 'approved', label: `Approved (${approvedItems.length})` },
    { id: 'in-progress', label: `In progress (${inProgressItems.length})` },
    { id: 'qc', label: `Quality control (${qcItems.length})` },
    { id: 'ready', label: `Ready (${readyItems.length})` },
    { id: 'delivered', label: `Delivered (${deliveredItems.length})` },
    { id: 'cancelled', label: `Cancelled (${cancelledItems.length})` },
  ];

  return (
    <>
      <QcFailureModal
        open={Boolean(qcFailOrderItemId)}
        onClose={() => !qcFailSubmitting && setQcFailOrderItemId(null)}
        onConfirm={handleQcFailConfirm}
        isSubmitting={qcFailSubmitting}
      />
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
            statusLabel="Pending"
            handleAction={handleAction}
            handleModalOpen={(id, status, index) => handleUpdateOrderItem(id, status, index, permissionCheckers.pending)}
            handleUpdateNote={handleUpdateNote}
            showPopover={showPopover}
            popoverRef={pendingPopoverRef}
            user={user}
            status1={{ label: "Approve", value: "Pending" }}
            status2={{ label: "", value: "" }}
            expandedNotes={expandedNotes}
            setExpandedNotes={setExpandedNotes}
          />
        )}
        {activeTabId === "in-progress" && (
          <NotificationTable
            title="In progress (lens in production)"
            orders={inProgressItems}
            statusLabel="In progress"
            handleAction={handleAction}
            handleModalOpen={(id, status, index) => handleUpdateOrderItem(id, status, index, permissionCheckers.inProgress)}
            handleUpdateNote={handleUpdateNote}
            showPopover={showPopover}
            popoverRef={inProgressPopoverRef}
            user={user}
            status1={{ label: "Mark ready", value: "Ready" }}
            status2={{ label: "Cancel", value: "Cancelled" }}
            expandedNotes={expandedNotes}
            setExpandedNotes={setExpandedNotes}
          />
        )}
        {activeTabId === "ready" && (
          <NotificationTable
            title="Ready (production done)"
            orders={readyItems}
            statusLabel="Ready"
            handleAction={handleAction}
            handleModalOpen={(id, status, index) => handleUpdateOrderItem(id, status, index, permissionCheckers.ready)}
            handleUpdateNote={handleUpdateNote}
            showPopover={showPopover}
            popoverRef={readyPopoverRef}
            user={user}
            status1={{ label: "Deliver", value: "Delivered" }}
            status2={{ label: "", value: "" }}
            expandedNotes={expandedNotes}
            setExpandedNotes={setExpandedNotes}
          />
        )}
        {activeTabId === "delivered" && (
          <NotificationTable
            title="Delivered"
            orders={deliveredItems}
            statusLabel="Delivered"
            handleAction={handleAction}
            handleModalOpen={(id, status, index) => handleUpdateOrderItem(id, status, index, permissionCheckers.delivered)}
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
            statusLabel="Cancelled"
            handleAction={handleAction}
            handleModalOpen={(id, status, index) => handleUpdateOrderItem(id, status, index, permissionCheckers.cancelled)}
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
        {activeTabId === "approved" && (
          <NotificationTable
            title="Approved items"
            orders={approvedItems}
            statusLabel="Approved"
            handleAction={handleAction}
            handleModalOpen={(id, status, index) => handleUpdateOrderItem(id, status, index, permissionCheckers.approved)}
            handleUpdateNote={handleUpdateNote}
            showPopover={showPopover}
            popoverRef={deliveredPopoverRef}
            user={user}
            status1={{ label: "Request items from store", value: "REQUEST_STORE_ITEMS" }}
            status2={{ label: "Start production", value: "InProgress" }}
            expandedNotes={expandedNotes}
            setExpandedNotes={setExpandedNotes}
          />
        )}
        {activeTabId === "qc" && (
          <NotificationTable
            title="Quality control"
            orders={qcItems}
            statusLabel="Quality control"
            handleAction={handleAction}
            handleModalOpen={(orderItemId, status, index) => {
              if (status === "QC_FAILED") {
                setShowPopover(null);
                setQcFailOrderItemId(orderItemId);
                return;
              }
              handleUpdateOrderItem(orderItemId, status, index, permissionCheckers.qc);
            }}
            handleUpdateNote={handleUpdateNote}
            showPopover={showPopover}
            popoverRef={deliveredPopoverRef}
            user={user}
            status1={{ label: "QC Passed", value: "QC_PASSED" }}
            status2={{ label: "QC Failed", value: "QC_FAILED" }}
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
