import Loader from "@/common/Loader";
import Breadcrumb from "../Breadcrumb";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { StoreRequestNotificationTable } from "./StoreRequestNotificationTable";
import { selectCurrentUser, selectPermissions } from "@/redux/authSlice";
import { userHasPermission } from "@/utils/permissions";
import {
  PERMISSION_APPROVALS_MANAGE,
  PERMISSION_SALES_WRITE,
} from "@/constants/permissions";
import { useCreateSaleItemNoteMutation, useGetSaleItemsQuery, useUpdateSaleItemMutation } from "@/redux/sale/saleApiSlice";
import { SaleItemNoteType } from "@/types/SaleItemNoteType";
import ErroPage from "../common/ErroPage";
import Tabs from "@/common/TabComponent";
import { SaleItem } from "@/types/SaleItem";
import { toast } from "react-toastify";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { handleApiError } from "@/utils/errorHandling";

export const StoreRequestNotifications = () => {
    const { id } = useParams<{ id: string }>();
    const user = useSelector(selectCurrentUser);
    const permissions = useSelector(selectPermissions);
    const { data: saleItems, isLoading: isSaleItemsLoading, error: saleError, isError, refetch, isSuccess } = useGetSaleItemsQuery(id ? id : '');
    const [updateSaleItems, { isLoading: isUpdateSaleItemsLoading }] = useUpdateSaleItemMutation();
    const [createSaleItemNote, { isLoading: isCreateSaleItemNoteLoading }] = useCreateSaleItemNoteMutation();

    const [approveReadyRequests, setApproveReadyRequests] = useState<SaleItem[]>([]);
    const [pendingStockOutRequests, setPendingStockOutRequests] = useState<SaleItem[]>([]);

    const [expandedNotes, setExpandedNotes] = useState<boolean[]>([]);
    const [activeTabId, setActiveTabId] = useState<string>('pending');
    const handleTabChange = (id: string) => {
        setActiveTabId(id);
    };

    const [showPopover, setShowPopover] = useState<number | null>(null);
    const [dropdownOpen, setDropdownOpen] = useState(false);


    const approveReadyPopoverRef = useRef<HTMLDivElement>(null);
    const pendingStockOutPopoverRef = useRef<HTMLDivElement>(null);
    const triggerRef = useRef<HTMLAnchorElement>(null);
    const dropdownRef = useRef<HTMLElement>(null);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        const refs = [approveReadyPopoverRef, pendingStockOutPopoverRef, triggerRef, dropdownRef];
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
        if (saleItems && isSuccess) {
            setApproveReadyRequests(saleItems.filter((item) => item.status === "Requested" || item.status === "Rejected" || item.status === "Cancelled"));
            setPendingStockOutRequests(saleItems.filter((item) => item.status === "Approved" || item.status === "Stocked-out"));
        }
    }, [saleItems, isSuccess, id]);

    const handleAction = (index: number) => setShowPopover(prevIndex => (prevIndex === index ? null : index));


    const handleUpdateSaleItem = async (id: string, status: string, index: number) => {
        if (status === "Approved") {
            if (!userHasPermission(user, permissions, PERMISSION_APPROVALS_MANAGE)) {
                toast.error("You are not authorized to approve store requests.");
                return;
            }
        } else if (!userHasPermission(user, permissions, PERMISSION_SALES_WRITE)) {
            toast.error("You are not authorized to edit this order");
            return;
        }

        try {
            const saleLists = [approveReadyRequests, pendingStockOutRequests];
            const list = saleLists.find((list) => list.some((item) => item.id === id));

            if (!list) {
                toast.error("Sale order not found");
                return;
            }

            const itemToUpdate = list[index];

            if (!itemToUpdate) {
                toast.error("Item to update not found");
                return;
            }
            if (status === "Stocked-out") {
                const hasBases = Boolean(itemToUpdate.item?.itemBases && itemToUpdate.item.itemBases.length > 0);
                if (hasBases && !itemToUpdate.itemBaseId) {
                    toast.error("Variant (base/ADD) is required before stock-out for this item.");
                    return;
                }
            }

            await updateSaleItems({ ...itemToUpdate, status }).unwrap();
            toast.success("Order updated successfully");
            refetch();
        } catch (error) {
            console.error('Error updating purchase item:', error);
            const fetchError = error as FetchBaseQueryError;
            const errorMessage = handleApiError(fetchError, 'Failed to update purchase item');
            toast.error(errorMessage);
            handleAction(index);
        }
    };


    const handleUpdateNote = async (newNote: SaleItemNoteType, index: number) => {
        if (newNote.text?.trim()) {
            try {
                await createSaleItemNote(newNote).unwrap();
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

    if (isError) return <ErroPage error={saleError.toString()} />;

    if (isSaleItemsLoading || isCreateSaleItemNoteLoading || isUpdateSaleItemsLoading) {
        return <Loader />;
    }

    const tabs = [
        { id: 'pending', label: `Pending approval (${approveReadyRequests.length})` },
        { id: 'stock-out', label: `Pending stockout (${pendingStockOutRequests.length})` },
    ];

    return (
        <>
            <Breadcrumb pageName="Request list" />
            <div className="rounded-sm border border-stroke border-t-0 bg-white px-4 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark">
                <Tabs tabs={tabs} activeTabId={activeTabId} onTabChange={handleTabChange} />
                {activeTabId === "pending" && (
                    <StoreRequestNotificationTable
                        title={`Pending approval requests`}
                        orders={approveReadyRequests}
                        handleAction={handleAction}
                        handleModalOpen={(id, status, index) => handleUpdateSaleItem(id, status, index)}
                        handleUpdateNote={handleUpdateNote}
                        showPopover={showPopover}
                        popoverRef={approveReadyPopoverRef}
                        user={user}
                        status1={{ label: "Approve", value: "Approved" }}
                        status2={{ label: "Reject", value: "Rejected" }}
                        expandedNotes={expandedNotes}
                        setExpandedNotes={setExpandedNotes}
                    />
                )}
                {activeTabId === "stock-out" && (
                    <StoreRequestNotificationTable
                        title={`Pending stock out`}
                        orders={pendingStockOutRequests}
                        handleAction={handleAction}
                        handleModalOpen={(id, status, index) => handleUpdateSaleItem(id, status, index)}
                        handleUpdateNote={handleUpdateNote}
                        showPopover={showPopover}
                        popoverRef={pendingStockOutPopoverRef}
                        user={user}
                        status1={{ label: "Stock out", value: "Stocked-out" }}
                        status2={{ label: "Cancel", value: "Cancelled" }}
                        expandedNotes={expandedNotes}
                        setExpandedNotes={setExpandedNotes}
                    />
                )}
            </div>
        </>
    );
}
