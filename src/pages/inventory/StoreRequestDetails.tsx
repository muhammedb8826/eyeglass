import Loader from "@/common/Loader";
import SelectOptions from "@/common/SelectOptions";
import Tabs from "@/common/TabComponent";
import Breadcrumb from "@/components/Breadcrumb";
import ErroPage from "@/components/common/ErroPage";
import { selectCurrentUser, selectPermissions } from "@/redux/authSlice";
import { userHasPermission } from "@/utils/permissions";
import {
  PERMISSION_SALES_WRITE,
  PERMISSION_STOCK_OPS_WRITE,
} from "@/constants/permissions";
import { useGetAllItemsQuery, useLazyGetItemBasesQuery } from "@/redux/items/itemsApiSlice";
import { useGetSaleQuery, useUpdateSaleMutation } from "@/redux/sale/saleApiSlice";
import { ItemType } from "@/types/ItemType";
import { SaleItem } from "@/types/SaleItem";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useEffect, useMemo, useRef, useState } from "react";
import { BsTicketDetailed } from "react-icons/bs";
import { CiMenuKebab } from "react-icons/ci";
import { MdDelete } from "react-icons/md";
import { useSelector } from "react-redux";
import { Link, useNavigate, useParams } from "react-router-dom"
import { toast } from "react-toastify";
import { handleApiError } from "@/utils/errorHandling";
import { ItemBaseType } from "@/types/ItemBaseType";




const tabs = [
    { id: 'items', label: 'Items' },
    { id: 'other-information', label: 'Other information' },
];

const formatBaseLabel = (baseCode?: string, addPower?: number, quantity?: number) => {
    const add = typeof addPower === "number" ? `^+${addPower}` : "";
    const stock = typeof quantity === "number" ? ` (stock: ${quantity})` : "";
    return `${baseCode || "Base"}${add}${stock}`;
};

export const StoreRequestDetails = () => {
    const { id } = useParams();
    const { data: sale, isLoading: isItemsLoading, error: itemsError, isError: itemsIsError } = useGetSaleQuery(id || '');
    const { data: items, isLoading } = useGetAllItemsQuery();
    const user = useSelector(selectCurrentUser);
    const permissions = useSelector(selectPermissions);
    const [updateSale, { isLoading: isUpdating }] = useUpdateSaleMutation();


    const [activeTabId, setActiveTabId] = useState<string>('items');

    const [formData, setFormData] = useState<SaleItem[]>([]);

    const [fetchItemBases] = useLazyGetItemBasesQuery();
    const [itemBasesMap, setItemBasesMap] = useState<
      Record<string, ItemBaseType[]>
    >({});
    const loadedItemBasesRef = useRef<Set<string>>(new Set());

    const [orderDate, setOrderDate] = useState("");
    const [note, setNote] = useState("");
    const [totalQuantity, setTotalQuantity] = useState(0);

    const navigate = useNavigate();

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
        if (sale) {
            setOrderDate(new Date(sale.orderDate).toISOString().split('T')[0]);
            setNote(sale.note);
            setTotalQuantity(sale.totalQuantity);
            setFormData(sale.saleItems?.map((item) => ({
                id: item.id,
                saleId: item.saleId,
                itemId: item.itemId,
                itemBaseId: item.itemBaseId || "",
                uomId: item.uomId,
                quantity: item.quantity,
                description: item.description || '',
                status: item.status,
                uomsOptions: items?.find((i) => i.id === item.itemId)?.unitCategory?.uoms || [],
                baseUomId: item.baseUomId,
                unit: item.unit
            })) || []);

            // Preload item base variants so `itemBaseId` can be matched to an option label.
            const itemIds = Array.from(
              new Set(
                (sale.saleItems || [])
                  .map((si) => si.itemId)
                  .filter((v): v is string => Boolean(v)),
              ),
            );

            itemIds.forEach((itemId) => {
              if (loadedItemBasesRef.current.has(itemId)) return;
              loadedItemBasesRef.current.add(itemId);
              fetchItemBases(itemId)
                .unwrap()
                .then((bases) => {
                  setItemBasesMap((prev) => ({ ...prev, [itemId]: bases || [] }));
                })
                .catch(() => {
                  setItemBasesMap((prev) => ({ ...prev, [itemId]: [] }));
                });
            });
        }
    }, [sale, items]);

    const handleTabChange = (id: string) => {
        setActiveTabId(id);
    };


    const handleAction = (index: number) => {
        setDropdownOpen(!dropdownOpen);
        setShowPopover(index);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const { name, value } = e.target;
        const updatedFormData = [...formData];
        updatedFormData[index] = {
            ...updatedFormData[index],
            [name]: value,
        };
        setFormData(updatedFormData);
    };

    const calculateUnit = (item: SaleItem, selectedItem: ItemType) => {
        const selectedUom = selectedItem.unitCategory?.uoms?.find((u) => u.id === item.uomId);
        const baseUom = selectedItem.unitCategory?.uoms?.find((u) => u.baseUnit === true);
        const unitCategory = selectedItem.unitCategory;
        if (!unitCategory?.constant && selectedUom && baseUom) {
            const unit = (baseUom.conversionRate * selectedUom.conversionRate * item.quantity) / (baseUom.conversionRate);
            return unit;
        }
        if (unitCategory.constant && selectedUom && baseUom && unitCategory) {
            const convertedWidth = unitCategory.constantValue;
            const convertedHeight = item.quantity * selectedUom.conversionRate;
            const unit = (convertedHeight * baseUom.conversionRate) / baseUom.conversionRate;
            return unit * convertedWidth;
        }
        return 0;
    };



    const handleItemChange = (index: number, value: string) => {
        const selectedItem = items?.find(item => item.id === value);
        if (selectedItem) {
            const updatedFormData = [...formData];
            updatedFormData[index] = {
                ...updatedFormData[index],
                itemId: value,
                // itemBaseId options come from `/items/:id/bases`
                itemBaseId: "",
                uomId: selectedItem.defaultUomId,
                uomsOptions: selectedItem.unitCategory?.uoms || [],
                baseUomId: selectedItem.unitCategory?.uoms ? selectedItem.unitCategory.uoms.find((u) => u.baseUnit === true)?.id : "",
            };
            updatedFormData[index].unit = calculateUnit(updatedFormData[index], selectedItem);
            setFormData(updatedFormData);

            fetchItemBases(value)
              .unwrap()
              .then((bases) => {
                setItemBasesMap((prev) => ({ ...prev, [value]: bases || [] }));
                if (bases.length === 1) {
                  setFormData((prev) => {
                    const next = [...prev];
                    if (next[index]) next[index] = { ...next[index], itemBaseId: bases[0].id };
                    return next;
                  });
                }
              })
              .catch(() => {
                setItemBasesMap((prev) => ({ ...prev, [value]: [] }));
              });
        }
    };


    const handleUnitChange = (index: number, value: string) => {
        setFormData((prevFormData) => {
            const updatedFormData = [...prevFormData];
            const selectedItem = items?.find((item) => item.id === updatedFormData[index].itemId);
            if (selectedItem) {
                updatedFormData[index] = {
                    ...updatedFormData[index],
                    uomId: value,
                };
                updatedFormData[index].unit = calculateUnit(updatedFormData[index], selectedItem);
            }
            return updatedFormData;
        });
    };

    const handleItemBaseChange = (index: number, value: string) => {
        setFormData((prev) => {
            const next = [...prev];
            next[index] = {
                ...next[index],
                itemBaseId: value,
            };
            return next;
        });
    };

    const handleQuantityChange = (index: number, value: string) => {
        const item = formData[index]; // Get the item at the specified index

        if (item.status === 'Stocked-out') {
            // Prevent the quantity from being updated if the status is 'Stocked-out'
            toast.error("Cannot update quantity for a 'Stocked-out' item.");
            return; // Exit the function without updating
        }
        const quantity = parseFloat(value) || 0;
        setFormData((prevFormData) => {
            const updatedFormData = [...prevFormData];
            updatedFormData[index] = {
                ...updatedFormData[index],
                quantity,
            };

            const selectedItem = items?.find((item) => item.id === updatedFormData[index].itemId);
            if (selectedItem) {
                updatedFormData[index].unit = calculateUnit(updatedFormData[index], selectedItem);
            }
            return updatedFormData;
        });
    };

    const handleAddRow = () => {
        setFormData([
            ...formData,
            {
                id: '',
                saleId: '',
                uomId: '',
                itemId: "",
                itemBaseId: "",
                quantity: 1,
                description: '',
                status: 'Requested',
                baseUomId: '',
                unit: 0
            }
        ]);
    };

    const handleNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNote(e.target.value)
    }

    const handleOrderDate = (e: React.ChangeEvent<HTMLInputElement>) => {
        setOrderDate(e.target.value);
    };


    const handleDeleteRow = (index: number) => {
        const item = formData[index];

        if (item.status === "Stocked-out") {
            if (!userHasPermission(user, permissions, PERMISSION_SALES_WRITE)) {
                toast.error("You are not authorized to change this store request.");
                return;
            }
            if (!userHasPermission(user, permissions, PERMISSION_STOCK_OPS_WRITE)) {
                toast.error("Deleting a stocked-out line requires stock_ops.write.");
                return;
            }
        }

        const list = [...formData];
        list.splice(index, 1);
        setFormData(list);
    };

    const options = useMemo(
        () => (items?.map((item) => ({
            value: item.id,
            label: item.name
        })) || []),
        [items]
    );

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!user?.id) {
            toast.error("Please select operator");
            return;
        }

        for (const row of formData) {
            const selectedItem = items?.find((i) => i.id === row.itemId);
            const hasKey = Object.prototype.hasOwnProperty.call(
              itemBasesMap,
              row.itemId,
            );

            let bases = itemBasesMap[row.itemId];
            if (!hasKey) {
              try {
                bases = await fetchItemBases(row.itemId).unwrap();
                setItemBasesMap((prev) => ({ ...prev, [row.itemId]: bases || [] }));
              } catch {
                bases = [];
                setItemBasesMap((prev) => ({ ...prev, [row.itemId]: [] }));
              }
            }

            const hasBases = (bases || []).length > 0;
            if (hasBases && !row.itemBaseId) {
                toast.error(`Please select base/ADD variant for "${selectedItem?.name || "item"}".`);
                return;
            }
        }

        if (!userHasPermission(user, permissions, PERMISSION_SALES_WRITE)) {
            toast.error("You are not authorized to update store requests.");
            return;
        }

        let needsStockOutChange = false;
        for (const row of formData) {
            const prev = sale?.saleItems?.find((s) => s.id === row.id)?.status;
            const prevOut = prev === "Stocked-out";
            const nextOut = row.status === "Stocked-out";
            if (prevOut !== nextOut || (nextOut && prev === undefined)) {
                needsStockOutChange = true;
                break;
            }
        }
        if (!needsStockOutChange && sale?.saleItems) {
            const formIds = new Set(formData.map((r) => r.id).filter(Boolean));
            for (const orig of sale.saleItems) {
                if (orig.status === "Stocked-out" && orig.id && !formIds.has(orig.id)) {
                    needsStockOutChange = true;
                    break;
                }
            }
        }
        if (
            needsStockOutChange &&
            !userHasPermission(user, permissions, PERMISSION_STOCK_OPS_WRITE)
        ) {
            toast.error(
                "Changing stock-out (physical issue) requires stock_ops.write.",
            );
            return;
        }

        const payloadItems = formData.map((item) => {
            const bases = itemBasesMap[item.itemId] || [];
            const hasBases = bases.length > 0;
            return ({
            id: item.id,
            itemId: item.itemId,
            ...(hasBases ? { itemBaseId: item.itemBaseId } : {}),
            uomId: item.uomId,
            quantity: item.quantity,
            description: item.description,
            status: item.status,
            unit: item.unit,
            baseUomId: item.baseUomId,
            });
        });

        const data = {
            id: sale?.id,
            operatorId: user?.id,
            orderDate: new Date(orderDate),
            totalQuantity: totalQuantity,
            note: note,
            saleItems: payloadItems,
        };


        updateSale(data)
            .unwrap()
            .then(() => {
                toast.success("Sale updated successfully");
                navigate('/dashboard/inventory/store-request');
            })
            .catch((error) => {
                const fetchError = error as FetchBaseQueryError;
                const errorMessage = handleApiError(fetchError, "Failed to update the sale");
                toast.error(errorMessage);
            });
    };

    if (isLoading || isItemsLoading) return <Loader />
    if (itemsIsError) return <ErroPage error={itemsError.toString()} />;



    return (
        <>
            <Breadcrumb pageName="Store Request" />

            <div className="grid grid-cols-1 gap-9">
                <div className="flex flex-col gap-9">
                    {/* <!-- Contact Form --> */}
                    <form onSubmit={handleSubmit}>
                        <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
                            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                                <h3 className="font-medium text-black dark:text-white">
                                    Request Form
                                </h3>
                            </div>

                            <div className="p-6.5">
                                <div className="mb-4.5 grid sm:grid-cols-2 gap-6">
                                    <div className="">
                                        <label htmlFor="operators" className="mb-3 block text-black dark:text-white">
                                            Request By
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                name="operators"
                                                value={user?.first_name}
                                                readOnly
                                                id="operators"
                                                className="custom-input-date custom-input-date-1 w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="">
                                        <label htmlFor="orderDate" className="mb-3 block text-black dark:text-white">
                                            Order Date
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="date"
                                                name="orderDate"
                                                onChange={handleOrderDate}
                                                value={orderDate}
                                                required
                                                id="orderDate"
                                                placeholder="Select a date"
                                                className="custom-input-date custom-input-date-1 w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Tabs tabs={tabs} activeTabId={activeTabId} onTabChange={handleTabChange} />

                                {activeTabId === 'items' && (
                                    <>
                                        <div className="max-w-full">
                                            <table className="w-full">
                                                <thead>
                                                    <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                                        <th className="py-4 px-4 font-medium text-black dark:text-white">
                                                            Item name
                                                        </th>
                                                        <th className="py-4 px-4 font-medium text-black dark:text-white">
                                                            Description
                                                        </th>
                                                        <th className="py-4 px-4 font-medium text-black dark:text-white">
                                                            Quantity
                                                        </th>
                                                        <th className="py-4 px-4 font-medium text-black dark:text-white">
                                                            Variant (Base^ADD)
                                                        </th>
                                                        <th className="py-4 px-4 font-medium text-black dark:text-white">
                                                            UOM
                                                        </th>
                                                        <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                                                            Unit
                                                        </th>
                                                        <th className="py-4 px-4 font-medium text-black dark:text-white">
                                                            Action
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {formData &&
                                                        formData.map((data, index) => (
                                                            <tr key={index} className="">
                                                                <td className="min-w-[220px] relative border border-[#eee] dark:border-strokedark">
                                                                    <SelectOptions
                                                                        options={options}
                                                                        defaultOptionText=""
                                                                        selectedOption={formData[index].itemId}
                                                                        onOptionChange={(value) => handleItemChange(index, value)}
                                                                        containerMargin=""
                                                                        labelMargin=""
                                                                        border=""
                                                                        title="Select item"
                                                                    />
                                                                </td>
                                                                <td className="border border-[#eee] dark:border-strokedark">
                                                                    <input
                                                                        title="Description of the product"
                                                                        type="text"
                                                                        name="description"
                                                                        value={data.description}
                                                                        onChange={(e) => handleChange(e, index)}
                                                                        className="w-full rounded  bg-transparent px-2 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                                                    />
                                                                </td>
                                                                <td className="border border-[#eee] dark:border-strokedark">
                                                                    <input
                                                                        title="Quantity of the product"
                                                                        type="number"
                                                                        name="quantity"
                                                                        value={data.quantity}
                                                                        min={1}
                                                                        required
                                                                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                                                                        className="w-full rounded  bg-transparent px-2 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                                                    />
                                                                </td>
                                                                <td className="min-w-[240px] relative border border-[#eee] dark:border-strokedark">
                                                                    {(() => {
                                                                        const selectedItem = items?.find((it) => it.id === data.itemId);
                                    const bases =
                                      itemBasesMap[data.itemId] ||
                                      selectedItem?.itemBases ||
                                      [];
                                    const hasFetched =
                                      Object.prototype.hasOwnProperty.call(
                                        itemBasesMap,
                                        data.itemId,
                                      );

                                    if (bases.length === 0) {
                                      return data.itemId && !hasFetched ? (
                                        <span className="px-2 text-xs text-bodydark">
                                          Loading variants...
                                        </span>
                                      ) : (
                                        <span className="px-2 text-xs text-bodydark">
                                          No variant
                                        </span>
                                      );
                                    }
                                                                        return (
                                                                            <SelectOptions
                                                                                options={bases.map((b) => ({
                                                                                    value: b.id,
                                                                                    label: formatBaseLabel(b.baseCode, b.addPower, b.quantity),
                                                                                }))}
                                                                                defaultOptionText=""
                                                                                selectedOption={data.itemBaseId || ""}
                                                                                onOptionChange={(value) => handleItemBaseChange(index, value)}
                                                                                containerMargin=""
                                                                                labelMargin=""
                                                                                border=""
                                                                                title="Select item base"
                                                                                    isSearchable={false}
                                                                                    isClearable={false}
                                                                            />
                                                                        );
                                                                    })()}
                                                                </td>
                                                                <td className="min-w-[220px] relative border border-[#eee] dark:border-strokedark">
                                                                    <SelectOptions
                                                                        options={formData[index]?.uomsOptions?.map((uom) => ({
                                                                            value: uom.id,
                                                                            label: uom.abbreviation,
                                                                        })) || []}
                                                                        defaultOptionText=""
                                                                        selectedOption={formData[index].uomId}
                                                                        onOptionChange={(value) => handleUnitChange(index, value)}
                                                                        containerMargin=""
                                                                        labelMargin=""
                                                                        border=""
                                                                        title="Select units"
                                                                    />
                                                                </td>
                                                                <td className="border border-[#eee] dark:border-strokedark">
                                                                    <input
                                                                        title="unit"
                                                                        type="number"
                                                                        name="unit"
                                                                        value={data.unit}
                                                                        readOnly
                                                                        className="w-full rounded  bg-transparent px-2 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                                                    />
                                                                </td>
                                                                <td className="px-6 py-4 relative border border-[#eee]">
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
                                                                            className={`absolute z-99 right-14 mb-0 flex w-47.5 flex-col rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark ${dropdownOpen ? "block" : "hidden"
                                                                                }`}
                                                                        >
                                                                            <ul className=" flex flex-col gap-2 border-b border-stroke p-3 dark:border-strokedark">
                                                                                <li>
                                                                                    <Link
                                                                                        to={`/dashboard/store-request-notifications/${id}`}
                                                                                        className="flex items-center gap-3.5 text-sm font-medium duration-300 ease-in-out hover:text-primary lg:text-base"
                                                                                    >
                                                                                        <BsTicketDetailed />
                                                                                        Details
                                                                                    </Link>
                                                                                </li>
                                                                                <li>
                                                                                    <button
                                                                                        onClick={() => handleDeleteRow(index)}
                                                                                        type="button"
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
                                                        ))}
                                                </tbody>
                                            </table>
                                        </div>
                                        <div className="my-4">
                                            <button
                                                type="button"
                                                onClick={handleAddRow}
                                                className="flex items-center justify-center rounded border-[1.5px] border-stroke bg-transparent px-2 py-1 font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-primary dark:hover:text-primary transition-colors"
                                            >
                                                Add row
                                            </button>
                                        </div>

                                        <div className="flex justify-between border-t pt-4">
                                            <strong>Summary</strong>
                                            <div className="mb-4.5">
                                                <p className="mb-2.5 block text-black dark:text-white">
                                                    Total Quantity: {totalQuantity.toFixed(2)}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mb-6">
                                            <label className="mb-2.5 block text-black dark:text-white">
                                                Note
                                            </label>
                                            <textarea
                                                rows={4}
                                                name="note"
                                                onChange={handleNote}
                                                placeholder="Type your message"
                                                value={note}
                                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            ></textarea>
                                        </div>
                                    </>
                                )}


                                {activeTabId === 'other-information' && (
                                    <div className="my-4.5 grid sm:grid-cols-2 gap-6">
                                        <div className="w-full sm:col-span-2">
                                            <label
                                                htmlFor="operator"
                                                className="mb-2.5 block text-black dark:text-white">
                                                Request By
                                            </label>
                                            <input
                                                id="operator"
                                                name="operator"
                                                type="text"
                                                readOnly
                                                value={`${user?.first_name} ${user?.last_name} | ${user?.roles}`}
                                                className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                            />
                                        </div>
                                    </div>
                                )
                                }

                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="flex justify-center rounded bg-primary p-3 font-medium text-gray"
                                >
                                    Update
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

