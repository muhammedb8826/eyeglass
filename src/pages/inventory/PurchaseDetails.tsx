import { VendorSearchInput } from "./VendorSearchInput";
import Breadcrumb from "@/components/Breadcrumb";
import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useGetPurchaseQuery, useUpdatePurchaseMutation } from "@/redux/purchase/purchaseApiSlice";
import { VendorType } from "@/types/VendorType";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import Loader from "@/common/Loader";
import Tabs from "@/common/TabComponent";
import SelectOptions from "@/common/SelectOptions";
import ErroPage from "@/components/common/ErroPage";
import { useGetAllItemsQuery, useLazyGetItemBasesQuery } from "@/redux/items/itemsApiSlice";
import { toast } from "react-toastify";
import { PurchaseItem } from "@/types/PurchaseItem";
import { ItemType } from "@/types/ItemType";
import { ItemBaseType } from "@/types/ItemBaseType";
import { CiMenuKebab } from "react-icons/ci";
import { BsTicketDetailed } from "react-icons/bs";
import { MdDelete } from "react-icons/md";
import { handleApiError } from "@/utils/errorHandling";
import { useSelector } from "react-redux";
import { selectCurrentUser, selectPermissions } from "@/redux/authSlice";
import { userHasPermission } from "@/utils/permissions";
import {
  PERMISSION_PURCHASES_WRITE,
  PERMISSION_STOCK_OPS_WRITE,
} from "@/constants/permissions";



const tabs = [
  { id: 'items', label: 'Items' },
  { id: 'other-information', label: 'Other information' },
];

const formatBaseLabel = (baseCode?: string, addPower?: number, quantity?: number) => {
  const add = typeof addPower === "number" ? `^+${addPower}` : "";
  const stock = typeof quantity === "number" ? ` (stock: ${quantity})` : "";
  return `${baseCode || "Base"}${add}${stock}`;
};

export const PurchaseDetails = () => {
  const { id } = useParams();
  const user = useSelector(selectCurrentUser);
  const permissions = useSelector(selectPermissions);
  const { data: purchase, isLoading: isItemsLoading, error: itemsError, isError: itemsIsError } = useGetPurchaseQuery(id || '');
  const { data: items, isLoading } = useGetAllItemsQuery();
  const [updatePurchase, { isLoading: isUpdating }] = useUpdatePurchaseMutation();
  const [activeTabId, setActiveTabId] = useState<string>('items');

  const [formData, setFormData] = useState<PurchaseItem[]>([]);

  const [fetchItemBases] = useLazyGetItemBasesQuery();
  const [itemBasesMap, setItemBasesMap] = useState<
    Record<string, ItemBaseType[]>
  >({});

  const [paymentInfo, setPaymentInfo] = useState({
    paymentMethod: "cash",
    amount: "",
    reference: "",
  });


  const [orderDate, setOrderDate] = useState("");
  const [note, setNote] = useState("");
  const [grandTotal, setGrandTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalQuantity, setTotalQuantity] = useState(0);
  const [tax, setTax] = useState(0);

  const [vendorSearch, setVendorSearch] = useState({
    id: "",
    fullName: "",
    reference: "",
  });


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

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });


  const handleAction = (index: number) => {
    setDropdownOpen(!dropdownOpen);
    setShowPopover(index);
  };


  useEffect(() => {
    console.log(purchase);

    if (purchase) {
      setVendorSearch({
        id: purchase.vendorId,
        fullName: purchase.vendor.fullName,
        reference: purchase.vendor.reference,
      });
      setOrderDate(new Date(purchase.orderDate).toISOString().split('T')[0]);
      setPaymentInfo({
        paymentMethod: purchase.paymentMethod,
        amount: purchase.amount.toString(),
        reference: purchase.reference,
      });
      setNote(purchase.note);
      setTotalAmount(purchase.totalAmount);
      setTotalQuantity(purchase.totalQuantity);
      setGrandTotal(purchase.amount);
      setFormData(purchase.purchaseItems?.map((item) => ({
        id: item.id,
        purchaseId: item.purchaseId,
        itemId: item.itemId,
        itemBaseId: item.itemBaseId || "",
        uomId: item.uomId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        amount: item.amount,
        description: item.description || '',
        status: item.status,
        unit: item.unit,
        baseUomId: item.baseUomId,
        uomsOptions: items?.find((i) => i.id === item.itemId)?.unitCategory?.uoms || [],
      })) || []);

      // Preload item bases for variant selector dropdowns.
      const itemIds = Array.from(
        new Set(
          (purchase.purchaseItems || [])
            .map((pi) => pi.itemId)
            .filter((v): v is string => Boolean(v)),
        ),
      );

      Promise.all(
        itemIds.map(async (itemId) => {
          try {
            const bases = await fetchItemBases(itemId).unwrap();
            setItemBasesMap((prev) => ({ ...prev, [itemId]: bases || [] }));
          } catch {
            setItemBasesMap((prev) => ({ ...prev, [itemId]: [] }));
          }
        }),
      );
    }
  }, [purchase, items]);

  const handleTabChange = (id: string) => {
    setActiveTabId(id);
  };

  const handleVendorSearch = (vendor: VendorType) => {
    setVendorSearch((prevOrderInfo) => ({
      ...prevOrderInfo,
      id: vendor.id,
      fullName: vendor.fullName,
      reference: vendor.reference,
    }));
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



  const calculateUnit = (item: PurchaseItem, selectedItem: ItemType) => {
    const selectedUom = selectedItem.unitCategory?.uoms?.find((u) => u.id === item.uomId);
    const baseUom = selectedItem.unitCategory?.uoms?.find((u) => u.baseUnit === true);
    const unitCategory = selectedItem.unitCategory;
    if (!unitCategory?.constant && selectedUom && baseUom) {
      const unit = (baseUom.conversionRate * selectedUom.conversionRate * item.quantity) / baseUom.conversionRate;
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
        // itemBaseId comes from /items/:id/bases (itemBases isn't present on /items/all)
        itemBaseId: "",
        uomId: selectedItem.purchaseUomId,
        uomsOptions: selectedItem.unitCategory?.uoms || [],
        baseUomId: selectedItem.unitCategory?.uoms ? selectedItem.unitCategory.uoms.find((u) => u.baseUnit === true)?.id : "",

      };
      updatedFormData[index].unit = calculateUnit(updatedFormData[index], selectedItem);
      setFormData(updatedFormData);

      fetchItemBases(value)
        .unwrap()
        .then((bases) => {
          setItemBasesMap((prev) => ({ ...prev, [value]: bases }));
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
    const item = formData[index];
    if (item.status === 'Received') {
      toast.error("Cannot update quantity of received items");
      return;
    }
    const quantity = parseFloat(value) || 0;
    const updatedFormData = [...formData];
    updatedFormData[index] = {
      ...updatedFormData[index],
      quantity,
    };
    const selectedItem = items?.find((item) => item.id === updatedFormData[index].itemId);
    if (selectedItem) {
      updatedFormData[index].unit = calculateUnit(updatedFormData[index], selectedItem);
    }
    setFormData(updatedFormData);
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

  const handleUnitPriceChange = (index: number, value: string) => {
    const updatedFormData = [...formData];
    updatedFormData[index] = {
      ...updatedFormData[index],
      unitPrice: parseFloat(value.toString() || '0'),
    };
    setFormData(updatedFormData);
  };


  const updatedFormData = useMemo(() => {
    return formData.map(item => ({
      ...item,
      amount: (
        (parseFloat(item.quantity?.toString() || '0') *
          parseFloat(item.unitPrice?.toString() || '0'))
      ).toFixed(2),
    }));
  }, [formData]);

  const handleAddRow = () => {
    setFormData([
      ...formData,
      {
        id: '',
        purchaseId: '',
        uomId: '',
        itemId: '',
        itemBaseId: '',
        quantity: 1,
        unitPrice: 0,
        amount: 0,
        description: '',
        status: 'Purchased',
        baseUomId: '',
        unit: 0,
      }
    ]);
  };

  const handleNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNote(e.target.value)
  }

  const handleOrderDate = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOrderDate(e.target.value);
  };

  useEffect(() => {
    const total = updatedFormData.reduce((acc, item) => acc + parseFloat(item.amount), 0);
    setTotalAmount(total);
    const totalQuantity = updatedFormData.reduce((acc, item) => acc + parseFloat(item.quantity?.toString() || '0'), 0);
    setTotalQuantity(totalQuantity);
    const taxAmount = total * 0.15;
    setTax(taxAmount);
    const grandTotal = (total + taxAmount);
    setGrandTotal(grandTotal);
  }, [updatedFormData]);

  const handlePaymentMethod = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setPaymentInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDeleteRow = (index: number) => {
    const item = formData[index];
    if (item.status === "Received") {
      if (!userHasPermission(user, permissions, PERMISSION_PURCHASES_WRITE)) {
        toast.error("You are not authorized to change this purchase.");
        return;
      }
      if (!userHasPermission(user, permissions, PERMISSION_STOCK_OPS_WRITE)) {
        toast.error("Deleting a received line requires stock_ops.write.");
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
    if (!vendorSearch.id) {
      toast.error("Please select a supplier");
      return;
    }

    if (!orderDate) {
      toast.error("Please select an order date");
      return;
    }

    if (formData.length > 0 && totalAmount === 0) {
      toast.error("Please add items to the purchase or check the unit price");
      return;
    }

    for (const row of updatedFormData) {
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
        toast.error(
          `Please select base/ADD variant for "${selectedItem?.name || "item"}".`,
        );
        return;
      }
    }

    if (!userHasPermission(user, permissions, PERMISSION_PURCHASES_WRITE)) {
      toast.error("You are not authorized to update purchases.");
      return;
    }

    let needsReceiptChange = false;
    for (const row of updatedFormData) {
      const prev = purchase?.purchaseItems?.find((p) => p.id === row.id)?.status;
      const prevRec = prev === "Received";
      const nextRec = row.status === "Received";
      if (prevRec !== nextRec || (nextRec && prev === undefined)) {
        needsReceiptChange = true;
        break;
      }
    }
    if (!needsReceiptChange && purchase?.purchaseItems) {
      const formIds = new Set(updatedFormData.map((r) => r.id).filter(Boolean));
      for (const orig of purchase.purchaseItems) {
        if (orig.status === "Received" && orig.id && !formIds.has(orig.id)) {
          needsReceiptChange = true;
          break;
        }
      }
    }
    if (
      needsReceiptChange &&
      !userHasPermission(user, permissions, PERMISSION_STOCK_OPS_WRITE)
    ) {
      toast.error(
        "Changing received inventory requires stock_ops.write.",
      );
      return;
    }

    const payloadItems = updatedFormData.map((item) => {
      const bases = itemBasesMap[item.itemId] || [];
      const hasBases = bases.length > 0;
      return {
        id: item.id,
        itemId: item.itemId,
        ...(hasBases ? { itemBaseId: item.itemBaseId } : {}),
        uomId: item.uomId,
        quantity: item.quantity,
        unitPrice: parseFloat(item.unitPrice.toString()),
        amount: parseFloat(item.amount),
        description: item.description,
        status: item.status,
        unit: item.unit,
        baseUomId: item.baseUomId,
      };
    });


    const data = {
      id: purchase?.id,
      vendorId: vendorSearch.id,
      orderDate: new Date(orderDate),
      paymentMethod: paymentInfo.paymentMethod,
      amount: grandTotal,
      reference: paymentInfo.reference,
      totalAmount: totalAmount,
      totalQuantity: totalQuantity,
      note: note,
      purchaseItems: payloadItems,
    };

    try {
      await updatePurchase(data).unwrap();
      toast.success("Purchase updated successfully");
    } catch (error) {
      const fetchError = error as FetchBaseQueryError;
      const errorMessage = handleApiError(fetchError, "An error occurred while updating the purchase");
      toast.error(errorMessage);
    }
  };

  if (isLoading || isItemsLoading) return <Loader />
  if (itemsIsError) return <ErroPage error={itemsError.toString()} />;

  return isItemsLoading ? (<Loader />) : (
    <>
      <Breadcrumb pageName="Purchase Order Edit" />

      <div className="grid grid-cols-1 gap-9">
        <div className="flex flex-col gap-9">
          {/* <!-- Contact Form --> */}
          <form onSubmit={handleSubmit}>
            <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
              <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
                <h3 className="font-medium text-black dark:text-white">
                  Purchase Form
                </h3>
              </div>

              <div className="p-6.5">
                <div className="mb-4.5 grid sm:grid-cols-2 gap-6">
                  <div className="w-full relative">
                    <VendorSearchInput
                      handleSupplierInfo={handleVendorSearch}
                      value={vendorSearch.fullName}
                    />
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

                  <div className="w-full">
                    <label
                      htmlFor="vendorReference"
                      className="mb-2.5 block text-black dark:text-white">
                      Vendor Reference
                    </label>
                    <input
                      title="Vendor reference"
                      id="vendorReference"
                      readOnly
                      type="text"
                      value={vendorSearch.reference}
                      className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                </div>

                <Tabs tabs={tabs} activeTabId={activeTabId} onTabChange={handleTabChange} />

                {activeTabId === 'items' && (
                  <>
                    <div className="rounded-sm border border-stroke border-t-0 bg-white dark:border-strokedark dark:bg-boxdark">
                      <div className="max-w-full overflow-x-auto">
                        <div className="max-w-full px-4">
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
                                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                                  Unit price
                                </th>
                                <th className="py-4 px-4 font-medium text-black dark:text-white">
                                  UOM
                                </th>
                                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                                  Amount
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
                                updatedFormData.map((data, index) => (
                                  <tr key={index} className="">
                                    <td className="min-w-[220px] relative">
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
                                    <td className="border border-[#eee] dark:border-strokedark">
                                      <input
                                        title="Unit price of the product"
                                        type="number"
                                        name="unitPrice"
                                        value={data.unitPrice}
                                        required
                                        onChange={(e) => handleUnitPriceChange(index, e.target.value)}
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
                                        title="Total price of the product"
                                        type="number"
                                        name="amount"
                                        readOnly
                                        value={data.amount}
                                        className="w-full rounded  bg-transparent px-2 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
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
                                                to={`/dashboard/purchase-notifications/${id}`}
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
                          <div className="my-4">
                            <button
                              type="button"
                              onClick={handleAddRow}
                              className="flex items-center justify-center rounded border-[1.5px] border-stroke bg-transparent px-2 py-1 font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-primary dark:hover:text-primary transition-colors"
                            >
                              Add row
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>


                    <div className="flex justify-between border-t pt-4">
                      <strong>Totals</strong>
                      <div className="mb-4.5">
                        <p className="mb-2.5 block text-black dark:text-white">
                          Total Quantity: {totalQuantity.toFixed(2)}
                        </p>
                        <p className="mb-2.5 block text-black dark:text-white">
                          Total Amount: {totalAmount.toFixed(2)}
                        </p>
                        <p className="mb-2.5 block text-black dark:text-white">
                          Tax: {tax.toFixed(2)}
                        </p>
                        <p className="mb-2.5 block text-black dark:text-white">
                          Grand Total: {grandTotal.toFixed(2)}
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
                        value={note}
                        placeholder="Type your message"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      ></textarea>
                    </div>
                  </>
                )}

                {activeTabId === 'other-information' && (
                  <div className="my-4.5 grid sm:grid-cols-2 gap-6">
                    <div className="w-full sm:col-span-2">
                      <label
                        htmlFor="buyer"
                        className="mb-2.5 block text-black dark:text-white">
                        Purchaser
                      </label>
                      <input
                        id="buyer"
                        name="buyer"
                        type="text"
                        readOnly
                        value={`${purchase?.purchaser?.first_name} ${purchase?.purchaser?.last_name} | ${purchase?.purchaser?.roles}`}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      />
                    </div>

                    <div className="">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Payment method
                      </label>
                      <div className="relative z-20 bg-transparent dark:bg-form-input">
                        <select
                          name="paymentMethod"
                          onChange={handlePaymentMethod}
                          defaultValue="cash"
                          value={paymentInfo.paymentMethod}
                          title="Select payment method" className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-2 px-4 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
                          <option value="cash">Cash</option>
                          <option value="mobile-banking">Mobile banking</option>
                          <option value="check">Check</option>
                          <option value="bank">Bank</option>
                        </select>
                        <span className="absolute top-1/2 right-4 z-30 -translate-y-1/2">
                          <svg
                            className="fill-current"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g opacity="0.8">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                fill=""
                              ></path>
                            </g>
                          </svg>
                        </span>
                      </div>
                    </div>

                    <div className="w-full">
                      <label className="mb-2.5 block text-black dark:text-white">
                        Reference
                      </label>
                      <input
                        onChange={(e) => setPaymentInfo((prev) => ({ ...prev, reference: e.target.value }))}
                        title="reference"
                        name="reference"
                        type="text"
                        value={paymentInfo.reference}
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      />
                    </div>
                  </div>
                )
                }

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="flex justify-center rounded bg-primary p-3 font-medium text-gray">
                  {isUpdating ? 'Updating...' : 'Update'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};
