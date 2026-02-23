import Loader from "@/common/Loader";
import SelectOptions from "@/common/SelectOptions";
import Tabs from "@/common/TabComponent";
import Breadcrumb from "@/components/Breadcrumb";
import ErroPage from "@/components/common/ErroPage";
import { selectCurrentUser } from "@/redux/authSlice";
import { useGetAllItemsQuery } from "@/redux/items/itemsApiSlice";
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




const tabs = [
    { id: 'items', label: 'Items' },
    { id: 'other-information', label: 'Other information' },
];

export const StoreRequestDetails = () => {
    const { id } = useParams();
    const { data: sale, isLoading: isItemsLoading, error: itemsError, isError: itemsIsError } = useGetSaleQuery(id || '');
    const { data: items, isLoading } = useGetAllItemsQuery();
    const user = useSelector(selectCurrentUser);
    const [updateSale, { isLoading: isUpdating }] = useUpdateSaleMutation();


    const [activeTabId, setActiveTabId] = useState<string>('items');

    const [formData, setFormData] = useState<SaleItem[]>([]);

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
                uomId: item.uomId,
                quantity: item.quantity,
                description: item.description || '',
                status: item.status,
                uomsOptions: items?.find((i) => i.id === item.itemId)?.unitCategory?.uoms || [],
                baseUomId: item.baseUomId,
                unit: item.unit
            })) || []);
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
                uomId: selectedItem.defaultUomId,
                uomsOptions: selectedItem.unitCategory?.uoms || [],
                baseUomId: selectedItem.unitCategory?.uoms ? selectedItem.unitCategory.uoms.find((u) => u.baseUnit === true)?.id : "",
            };
            updatedFormData[index].unit = calculateUnit(updatedFormData[index], selectedItem);
            setFormData(updatedFormData);
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
        const item = formData[index]; // Get the item at the specified index

        if (item.status === 'Stocked-out') {
            // Show an alert if the status is 'Stocked-out'
            toast.error("Cannot delete this item as it is 'Stocked-out'");
        } else {
            // If status is not 'Stocked-out', proceed with deletion
            const list = [...formData];
            list.splice(index, 1);
            setFormData(list);
        }
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

        const items = formData.map((item) => ({
            id: item.id,
            itemId: item.itemId,
            uomId: item.uomId,
            quantity: item.quantity,
            description: item.description,
            status: item.status,
            unit: item.unit,
            baseUomId: item.baseUomId,
        }));

        const data = {
            id: sale?.id,
            operatorId: user?.id,
            orderDate: new Date(orderDate),
            totalQuantity: totalQuantity,
            note: note,
            saleItems: items,
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

