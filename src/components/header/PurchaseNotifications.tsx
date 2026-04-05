import Loader from "@/common/Loader";
import Breadcrumb from "../Breadcrumb";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { PurchaseNotificationTable } from "./PurchaseNotificationTable";
import { selectCurrentUser, selectPermissions } from "@/redux/authSlice";
import { userHasPermission } from "@/utils/permissions";
import {
  PERMISSION_APPROVALS_MANAGE,
  PERMISSION_PURCHASES_WRITE,
  PERMISSION_STOCK_OPS_WRITE,
} from "@/constants/permissions";
import { useGetPurchaseItemsQuery, useUpdatePurchaseItemMutation } from "@/redux/purchase/purchaseApiSlice";
import { useCreatePurchaseItemNoteMutation } from "@/redux/purchase/purchaseItemNotesApiSlice";
import { PurchaseItem } from "@/types/PurchaseItem";
import ErroPage from "../common/ErroPage";
import { toast } from "react-toastify";
import { PurchaseItemNoteType } from "@/types/PurchaseItemNoteType";
import Tabs from "@/common/TabComponent";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { handleApiError } from "@/utils/errorHandling";




export const PurchaseNotifications = () => {
    const { id } = useParams<{ id: string }>();
    const user = useSelector(selectCurrentUser);
    const permissions = useSelector(selectPermissions);
    const { data: purchaseItems, isLoading: purchaseItemsLoading, error: purchaseError, isError, isSuccess, refetch } = useGetPurchaseItemsQuery(id ? id : "");
    const [updatePurchaseItem, { isLoading }] = useUpdatePurchaseItemMutation();
    const [createPurchaseItemNote] = useCreatePurchaseItemNoteMutation();

    const [receiveReadyPurchases, setReceiveReadyPurchases] = useState<PurchaseItem[]>([]);
    const [pendingApprovalPurchases, setPendingApprovalPurchases] = useState<PurchaseItem[]>([]);

    const [expandedNotes, setExpandedNotes] = useState<boolean[]>([]);
    const [activeTabId, setActiveTabId] = useState<string>('pending');
    const handleTabChange = (id: string) => {
        setActiveTabId(id);
    };

    const [showPopover, setShowPopover] = useState<number | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const receiveReadyPopoverRef = useRef<HTMLDivElement>(null);
    const pendingApprovalPopoverRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLAnchorElement>(null);
    const dropdownRef = useRef<HTMLElement>(null);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        const refs = [receiveReadyPopoverRef, pendingApprovalPopoverRef];
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
        if (purchaseItems && isSuccess) {
            setReceiveReadyPurchases(
                purchaseItems.filter(
                    (item) => item.status === "Approved" || item.status === "Received"
                )
            );
            setPendingApprovalPurchases(
                purchaseItems.filter(
                    (item) =>
                        item.status === "Purchased" ||
                        item.status === "Returned" ||
                        item.status === "Cancelled"
                )
            );
        }

    }, [id, purchaseItems, isSuccess]);

    const handleAction = (index: number) => setShowPopover(prevIndex => (prevIndex === index ? null : index));


    const handleUpdatePurchaseItem = async (id: string, status: string, index: number) => {
        if (status === "Approved") {
            if (!userHasPermission(user, permissions, PERMISSION_APPROVALS_MANAGE)) {
                toast.error("You are not authorized to approve purchase lines.");
                return;
            }
        } else if (status === "Received") {
            if (!userHasPermission(user, permissions, PERMISSION_PURCHASES_WRITE)) {
                toast.error("You are not authorized to update purchase lines.");
                return;
            }
            if (!userHasPermission(user, permissions, PERMISSION_STOCK_OPS_WRITE)) {
                toast.error(
                    "Receiving into inventory requires stock_ops.write (in addition to purchases access).",
                );
                return;
            }
        } else if (!userHasPermission(user, permissions, PERMISSION_PURCHASES_WRITE)) {
            toast.error("You are not authorized to edit this order");
            return;
        }

        try {
            const purchaseLists = [pendingApprovalPurchases, receiveReadyPurchases];
            const list = purchaseLists.find((list) => list.some((item) => item.id === id));

            if (!list) {
                toast.error('Purchase list not found');
                return;
            }

            const itemToUpdate = list[index];
            if (!itemToUpdate) {
                toast.error('Item to update not found');
                return;
            }
            if (status === "Received") {
                const hasBases = Boolean(itemToUpdate.item?.itemBases && itemToUpdate.item.itemBases.length > 0);
                if (hasBases && !itemToUpdate.itemBaseId) {
                    toast.error("Variant (base/ADD) is required before receiving this item.");
                    return;
                }
            }
            await updatePurchaseItem({ ...itemToUpdate, status }).unwrap();
            toast.success('Item status updated successfully!');
            refetch();
        } catch (error) {
            console.error('Error updating purchase item:', error);
            const fetchError = error as FetchBaseQueryError;
            const errorMessage = handleApiError(fetchError, 'Failed to update purchase item');
            toast.error(errorMessage);
            handleAction(index);
        }
    };

    const handleUpdateNote = async (newNote: PurchaseItemNoteType, index: number) => {
        if (newNote.text?.trim()) {
            try {
                await createPurchaseItemNote(newNote).unwrap();
                toast.success("Note added successfully");
                refetch();

                setExpandedNotes(prevNotes =>
                    prevNotes.map((expanded, i) => (i === index ? true : expanded))
                );
            } catch (error) {
                const fetchError = error as FetchBaseQueryError;
                const errorMessage = handleApiError(fetchError, 'Failed to add note');
                toast.error(errorMessage);
            }
        } else {
            toast.error("Note cannot be empty");
        }
    };


    if (isError) return <ErroPage error={purchaseError.toString()} />;
    if (purchaseItemsLoading || isLoading) return <Loader />


    const tabs = [
        { id: 'pending', label: `Pending approval (${pendingApprovalPurchases.length})` },
        { id: 'receive', label: `Receive ready (${receiveReadyPurchases.length})` },
    ];

    return (
        <>
            <Breadcrumb pageName="Purchase list" />
            <div className="rounded-sm border border-stroke border-t-0 bg-white px-4 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark">
                <Tabs tabs={tabs} activeTabId={activeTabId} onTabChange={handleTabChange} />
                {activeTabId === "pending" && (
                    <PurchaseNotificationTable
                        title={`Pending approval purchases`}
                        orders={pendingApprovalPurchases}
                        handleAction={handleAction}
                        handleModalOpen={(id, status, index) => handleUpdatePurchaseItem(id, status, index)}
                        handleUpdateNote={handleUpdateNote}
                        showPopover={showPopover}
                        popoverRef={pendingApprovalPopoverRef}
                        user={user}
                        status1={{ label: "Approve", value: "Approved" }}
                        status2={{ label: "Return", value: "Returned" }}
                        expandedNotes={expandedNotes}
                        setExpandedNotes={setExpandedNotes}
                    />
                )}
                {activeTabId === "receive" && (
                    <PurchaseNotificationTable
                        title={`Pending approval orders`}
                        orders={receiveReadyPurchases}
                        handleAction={handleAction}
                        handleModalOpen={(id, status, index) => handleUpdatePurchaseItem(id, status, index)}
                        handleUpdateNote={handleUpdateNote}
                        showPopover={showPopover}
                        popoverRef={receiveReadyPopoverRef}
                        user={user}
                        status1={{ label: "Receive", value: "Received" }}
                        status2={{ label: "Cancel", value: "Cancelled" }}
                        expandedNotes={expandedNotes}
                        setExpandedNotes={setExpandedNotes}
                    />
                )}
            </div>
        </>
    );
}
