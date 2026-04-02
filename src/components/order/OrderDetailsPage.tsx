import ErroPage from "../common/ErroPage";
import { Link, useParams } from "react-router-dom";
import { useCallback, useEffect, useMemo, useRef, useState, Fragment } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-toastify";
import CustomerSearchInput from "../customer/CustomerSearchInput";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
import { CiMenuKebab, CiSettings } from "react-icons/ci";
import { SalesPartnerSearchInput } from "../commission/SalesPartnerSearchInput";
import { IoMdClose } from "react-icons/io";
import Loader from "@/common/Loader";
import Breadcrumb from "../Breadcrumb";
import {
  useGetOrderQuery,
  useUpdateOrderMutation,
  useUpdateOrderItemMutation,
} from "@/redux/order/orderApiSlice";
import { useGetAllItemsQuery, useLazyGetItemBasesQuery } from "@/redux/items/itemsApiSlice";
import { useGetAllCustomersQuery } from "@/redux/customer/customerApiSlice";
import { OrderItemType } from "@/types/OrderItemType";
import { OrderType } from "@/types/OrderType";
import { CustomerType } from "@/types/CustomerType";
import Tabs from "@/common/TabComponent";
import { SalesPartnerType } from "@/types/SalesPartnerType";
import SelectOptions from "@/common/SelectOptions";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/redux/authSlice";
import { useGetAllPricingsQuery } from "@/redux/pricing/pricingApiSlice";
import { useGetAllServicesQuery } from "@/redux/services/servicesApiSlice";
import { useGetAllNonStockServicesQuery } from "@/redux/services/nonStockServicesApiSlice";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ItemType } from "@/types/ItemType";
import { MdDelete } from "react-icons/md";
import { BsTicketDetailed } from "react-icons/bs";
import { PricingType } from "@/types/PricingType";
import { useGetAllDiscountsQuery } from "@/redux/discount/discountApiSlice";
import { FaPrint } from "react-icons/fa6";
import { useReactToPrint } from "react-to-print";
import { handleApiError } from "@/utils/errorHandling";
import { DeliveryNotePrint } from "./DeliveryNotePrint";
import { QcFailureModal } from "./QcFailureModal";
import { useCreateOrderItemNoteMutation } from "@/redux/order/orderItemNotesApiSlice";
import { PaymentTransactions as PaymentTransactionsType } from "@/types/PaymentTransactions";
import type { BomType } from "@/types/BomType";
import { useGetLabToolsQuery } from "@/redux/labTools/labToolsApiSlice";
import type { LabToolType } from "@/types/LabToolType";
import type { ItemBaseType } from "@/types/ItemBaseType";

const date = new Date();
const formattedDate = date.toISOString().split("T")[0];

type PaymentTransactionUI = Omit<PaymentTransactionsType, 'date'> & { date: string };

interface RxCalcRow {
  distanceSphereRight: string;
  nearSphereRight: string;
  distanceSphereLeft: string;
  nearSphereLeft: string;
}

// Minimal shape needed for lab tool calculation
interface OrderItemRxForToolsDetails {
  sphereRight?: number;
  sphereLeft?: number;
  cylinderRight?: number;
  cylinderLeft?: number;
}

// Convert a diopter or tool-style value into tool units (0.01 D steps).
// Examples:
//  - 1.25  -> 125
//  - 125   -> 125
const toToolUnitsDetails = (v: number | undefined): number | undefined => {
  if (typeof v !== "number" || Number.isNaN(v)) return undefined;
  // If magnitude is large (e.g. > 20 D), treat as already in tool units
  return Math.abs(v) > 20 ? v : v * 100;
};

type ToolValuesPerEyeDetails = { right: number[]; left: number[] };

const computeToolValuesDetails = (
  row: OrderItemRxForToolsDetails,
  base: ItemBaseType | undefined,
): ToolValuesPerEyeDetails => {
  const empty = { right: [], left: [] };
  if (!base) return empty;

  const baseNumeric = Number(base.baseCode);
  if (!Number.isFinite(baseNumeric)) return empty;

  const addTool =
    typeof base.addPower === "number" && !Number.isNaN(base.addPower)
      ? base.addPower * 10
      : 0;
  const baseTool = baseNumeric + addTool;
  const right: number[] = [];
  const left: number[] = [];

  const rawSphR = row.sphereRight;
  const rawCylR = row.cylinderRight;
  const rawSphL = row.sphereLeft;
  const rawCylL = row.cylinderLeft;

  const sphRToolMag = toToolUnitsDetails(
    typeof rawSphR === "number" ? Math.abs(rawSphR) : undefined,
  );
  const cylRToolMag = toToolUnitsDetails(
    typeof rawCylR === "number" ? Math.abs(rawCylR) : undefined,
  );
  const sphLToolMag = toToolUnitsDetails(
    typeof rawSphL === "number" ? Math.abs(rawSphL) : undefined,
  );
  const cylLToolMag = toToolUnitsDetails(
    typeof rawCylL === "number" ? Math.abs(rawCylL) : undefined,
  );

  if (typeof rawSphR === "number" && typeof sphRToolMag === "number") {
    const sphOffset = rawSphR < 0 ? sphRToolMag : -sphRToolMag;
    const rSph = Math.round(baseTool + sphOffset);
    right.push(rSph);
    if (typeof cylRToolMag === "number" && cylRToolMag !== 0) {
      right.push(Math.round(rSph + cylRToolMag));
    }
  }

  if (typeof rawSphL === "number" && typeof sphLToolMag === "number") {
    const sphOffset = rawSphL < 0 ? sphLToolMag : -sphLToolMag;
    const lSph = Math.round(baseTool + sphOffset);
    left.push(lSph);
    if (typeof cylLToolMag === "number" && cylLToolMag !== 0) {
      left.push(Math.round(lSph + cylLToolMag));
    }
  }

  return { right, left };
};

const findMissingToolValuesDetails = (
  toolValues: number[],
  labTools: LabToolType[],
): number[] => {
  const missing: number[] = [];

  toolValues.forEach((val) => {
    const hasTool = labTools.some(
      (tool) =>
        typeof tool.baseCurveMin === "number" &&
        typeof tool.baseCurveMax === "number" &&
        typeof tool.quantity === "number" &&
        val >= tool.baseCurveMin &&
        val <= tool.baseCurveMax &&
        tool.quantity > 0,
    );

    if (!hasTool) {
      missing.push(val);
    }
  });

  return Array.from(new Set(missing));
};

const tabs = [
  { id: "general", label: "General" },
  { id: "payment-terms", label: "Payment terms" },
  { id: "commissions", label: "Commissions" },
  { id: "other-information", label: "Other information" },
];

const LINE_CONTENT_LOCKED_MSG =
  "This line is locked: prescription, lens, quantity, pricing, and item/base cannot be changed after approval, during production, or while the order is in progress.";

export const OrderDetailsPage = () => {
  const user = useSelector(selectCurrentUser);
  const { id } = useParams();
  const {
    data: order,
    isLoading,
    error,
    isError,
  } = useGetOrderQuery(id ? id : "");
  const { data: items, isLoading: isItemsLoading } = useGetAllItemsQuery();
  const { data: customers, isLoading: isCustomersLoading } =
    useGetAllCustomersQuery({});
  const { data: pricings, isLoading: isPricingsLoading } =
    useGetAllPricingsQuery();
  const { data: services, isLoading: isServicesLoading } =
    useGetAllServicesQuery();
  const { data: nonStockServices, isLoading: isNonStockServicesLoading } =
    useGetAllNonStockServicesQuery();
  const { data: discounts, isLoading: isDiscountsLoading } =
    useGetAllDiscountsQuery();
  const { data: labToolsData } = useGetLabToolsQuery({ page: 1, limit: 1000 });
  const [fetchItemBases] = useLazyGetItemBasesQuery();

  const [updateOrder, { isLoading: isUpdating }] = useUpdateOrderMutation();
  const [updateOrderItem, { isLoading: isUpdatingItem }] = useUpdateOrderItemMutation();
  const [createOrderItemNote] = useCreateOrderItemNoteMutation();

  const [orderInfo, setOrderInfo] = useState<OrderType>({
    id: "",
    series: "NDS-ORD-YYYY-",
    customerId: "",
    status: "Pending",
    orderSource: "",
    orderDate: "",
    deliveryDate: "",
    totalAmount: 0,
    tax: 0,
    grandTotal: 0,
    totalQuantity: 0,
    internalNote: "",
    adminApproval: false,
    orderItems: [],
  });

  const [formData, setFormData] = useState<OrderItemType[]>([
    {
      id: "",
      itemId: "",
      serviceId: "",
      width: "",
      height: "",
      discount: 0,
      level: 0,
      totalAmount: 0,
      adminApproval: false,
      uomId: "",
      quantity: "",
      unitPrice: 0,
      description: "",
      isDiscounted: false,
      status: "Pending",
      servicesOptions: [],
      uomsOptions: [],
      orderId: order?.id || "",
      pricingId: "",
      constant: false,
      unit: 0,
      baseUomId: "",
    },
  ]);

  const [paymentTransactions, setPaymentTransactions] = useState<PaymentTransactionUI[]>([]);

  const [commissionTransactions, setCommissionTransactions] = useState([
    {
      commissionId: "",
      date: new Date().toISOString().split("T")[0],
      amount: 0,
      percentage: 0,
      paymentMethod: "cash",
      reference: "",
      description: "",
      status: "pending",
    },
  ]);

  const [customerSearch, setCustomerSearch] = useState({
    id: "",
    fullName: "",
  });

  const deliveryNoteCustomer = useMemo(() => {
    if (!orderInfo.customerId) return order?.customer ?? null;
    return (
      customers?.find((c) => c.id === orderInfo.customerId) ??
      order?.customer ??
      null
    );
  }, [customers, order?.customer, orderInfo.customerId]);

  const [salesPartnerSearch, setSalesPartnerSearch] = useState({
    id: "",
    fullName: "",
  });

  const [userInputDiscount, setUserInputDiscount] = useState("");
  const [collapseDisount, setCollapseDiscount] = useState(false);
  const [totaTransaction, setTotalTransaction] = useState(0);
  const [activeRxRow, setActiveRxRow] = useState<number | null>(null);
  const [itemBasesMap, setItemBasesMap] = useState<Record<string, ItemBaseType[]>>({});
  const [rxCalcRows, setRxCalcRows] = useState<RxCalcRow[]>([
    {
      distanceSphereRight: "",
      nearSphereRight: "",
      distanceSphereLeft: "",
      nearSphereLeft: "",
    },
  ]);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [forcePayment, setForcePayment] = useState(true);

  const [activeTabId, setActiveTabId] = useState<string>("general");
  const handleTabChange = (id: string) => {
    setActiveTabId(id);
  };

  const isOrderItemContentEditingLocked = useCallback(
    (row: OrderItemType) => {
      const os = orderInfo.status || "";
      if (os === "InProgress" || os === "Ready") return true;
      if (row.approvalStatus === "Approved") return true;
      const st = row.status || "";
      if (st === "InProgress" || st === "Ready") return true;
      return false;
    },
    [orderInfo.status],
  );

  const isOrderAddingProductLinesBlocked =
    orderInfo.status === "InProgress" || orderInfo.status === "Ready";

  useEffect(() => {
    if (order) {
      setOrderInfo({
        id: order.id,
        series: order.series,
        customerId: order.customerId,
        status: order.status,
        orderSource: order.orderSource,
        orderDate: new Date(order.orderDate).toISOString().split("T")[0],
        deliveryDate: new Date(order.deliveryDate).toISOString().split("T")[0],
        prescriptionDate: order.prescriptionDate ?? "",
        optometristName: order.optometristName ?? "",
        urgency: order.urgency ?? "",
        totalAmount: order.totalAmount,
        tax: 0,
        grandTotal: order.grandTotal,
        totalQuantity: order.totalQuantity,
        internalNote: order.internalNote,
        adminApproval: order.adminApproval,
        orderItems: order.orderItems,
      });
      setFormData(
        order.orderItems.map((item) => {
          const itemAny = item as OrderItemType & {
            sales?: number;
            pricing?: { sellingPrice?: number };
          };
          const qty = Number(item.quantity || 0);
          const unitPrice = Number(item.unitPrice || 0);
          const totalAmount = Number(item.totalAmount || 0);
          const sales = Number(itemAny.sales || 0);
          const pricingUnit = Number(itemAny.pricing?.sellingPrice || 0);

          // Backfill line fields when API line values are zeroed but pricing/sales exist.
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
            // Fallback for older payloads that only have total quantity.
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
            // Normalize serviceId to handle both stock and non-stock services
            serviceId: item.serviceId || item.nonStockServiceId || '',
            status: item.status || "Pending",
            constant:
              items?.find((i) => i.id === item.itemId)?.unitCategory?.constant ||
              false,
            uomsOptions:
              items?.find((i) => i.id === item.itemId)?.unitCategory?.uoms || [],
          };
        })
      );
      setRxCalcRows(
        order.orderItems.map(() => ({
          distanceSphereRight: "",
          nearSphereRight: "",
          distanceSphereLeft: "",
          nearSphereLeft: "",
        }))
      );
      setPaymentTransactions(
        (order.paymentTerm?.[0]?.transactions || []).map((transaction) => ({
          ...transaction,
          paymentTermId: order.paymentTerm?.[0]?.id || "",
          date: new Date(transaction.date).toISOString().split("T")[0],
        }))
      );
      setTotalTransaction(order.paymentTerm?.[0]?.totalAmount || 0);
      setRemainingAmount(order.paymentTerm?.[0]?.remainingAmount || 0);
      setForcePayment(order.paymentTerm?.[0]?.forcePayment || false);
      setCommissionTransactions(
        (order.commission?.[0]?.transactions || []).map((transaction) => ({
          ...transaction,
          commissionId: order.commission?.[0]?.id || "",
          date: new Date(transaction.date).toISOString().split("T")[0],
        }))
      );
      setTotalCommission(order.commission?.[0]?.totalAmount || 0);
      setCustomerSearch({
        id: order?.customer?.id || "",
        fullName: order?.customer?.fullName || "",
      });
      setSalesPartnerSearch({
        id: order?.commission?.[0]?.salesPartnerId || "",
        fullName: order?.commission?.[0]?.salesPartner?.fullName || "",
      });
      // Populate item bases for each order item (same as order form) so base dropdown is visible
      const nextBasesMap: Record<string, ItemBaseType[]> = {};
      order.orderItems.forEach((orderItem: { itemId: string; item?: { itemBases?: ItemBaseType[] } }) => {
        const itemId = orderItem.itemId;
        if (!itemId) return;
        const itemBases = orderItem.item?.itemBases;
        if (Array.isArray(itemBases) && itemBases.length > 0) {
          nextBasesMap[itemId] = itemBases;
        }
      });
      setItemBasesMap((prev) => ({ ...prev, ...nextBasesMap }));
      // Fetch bases for any item that didn't have itemBases in the order response (uses RTK Query so correct base URL + auth)
      order.orderItems.forEach((orderItem: { itemId: string; item?: { itemBases?: ItemBaseType[] } }) => {
        const itemId = orderItem.itemId;
        if (!itemId || nextBasesMap[itemId]) return;
        fetchItemBases(itemId)
          .unwrap()
          .then((bases) => {
            setItemBasesMap((prev) => ({ ...prev, [itemId]: bases }));
          })
          .catch(() => {});
      });
    }
  }, [order, items, fetchItemBases]);

  const handleCommissionPaymentMethod = (
    index: number,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (user?.roles !== "ADMIN" && user?.roles !== "FINANCE") {
      toast.error("You are not authorized to perform this action");
      return;
    }
    const { value, name } = e.target;
    setCommissionTransactions((prev) => {
      const updatedData = [...prev];
      updatedData[index] = {
        ...updatedData[index],
        [name]: value,
      };
      return updatedData;
    });
  };

  const handleCommissionChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (user?.roles !== "ADMIN" && user?.roles !== "FINANCE") {
      toast.error("You are not authorized to perform this action");
      return;
    }
    const { name, value } = e.target;

    setCommissionTransactions((prev) => {
      const updatedData = [...prev];
      updatedData[index] = {
        ...updatedData[index],
        [name]: value,
      };
      return updatedData;
    });

    if (name === "percentage") {
      const commission =
        (parseFloat(value) / 100) *
        parseFloat(formData[index]?.unitPrice?.toString() || "0");
      setCommissionTransactions((prev) => {
        const updatedData = [...prev];
        updatedData[index] = {
          ...updatedData[index],
          percentage: parseFloat(value),
          amount: commission,
        };
        return updatedData;
      });
    }
  };

  const handlePaymentMethod = (
    index: number,
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    if (user?.roles !== "ADMIN" && user?.roles !== "FINANCE") {
      toast.error("You are not authorized to perform this action");
      return;
    }
    setPaymentTransactions((prev) => {
      const updatedData = [...prev];
      updatedData[index] = {
        ...updatedData[index],
        paymentMethod: e.target.value,
      };
      return updatedData;
    });
  };

  useEffect(() => {
    const totalTransaction = paymentTransactions?.reduce(
      (acc, { amount }) => acc + Number(amount || 0),
      0
    );
    setTotalTransaction(totalTransaction);
    setRemainingAmount(orderInfo.grandTotal - totalTransaction);
  }, [paymentTransactions, orderInfo.grandTotal]);

  const handleFormChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPaymentTransactions((prev) => {
      const updatedData = [...prev];
      updatedData[index] = {
        ...updatedData[index],
        [name]: value,
      };
      return updatedData;
    });
  };

  const handleAddPaymentRow = () => {
    if (user?.roles !== "ADMIN" && user?.roles !== "FINANCE") {
      toast.error("You are not authorized to perform this action");
      return;
    }
    setPaymentTransactions((prev) => [
      ...prev,
      {
        paymentTermId: order?.paymentTerm?.[0]?.id || "",
        date: formattedDate,
        paymentMethod: "cash",
        reference: "",
        amount: 0,
        status: "pending",
        description: "",
      },
    ]);
  };

  const handleAddRow = () => {
    if (isOrderAddingProductLinesBlocked) {
      toast.error(
        "Cannot add product lines while the order is in production or ready for dispatch.",
      );
      return;
    }
    setFormData((prevFormData) => [
      ...prevFormData,
      {
        id: "",
        itemId: "",
        serviceId: "",
        width: "",
        height: "",
        discount: 0,
        level: 0,
        totalAmount: 0,
        adminApproval: false,
        uomId: "",
        quantity: "",
        unitPrice: 0,
        description: "",
        isDiscounted: false,
        status: "Pending",
        servicesOptions: [],
        uomsOptions: [],
        orderId: order?.id || "",
        pricingId: "",
        constant: false,
        unit: 0,
        baseUomId: "",
      },
    ]);

    setCommissionTransactions((prev) => [
      ...prev,
      {
        commissionId: order?.commission?.[0]?.id || "",
        date: new Date().toISOString().split("T")[0],
        amount: 0,
        percentage: 0,
        paymentMethod: "cash",
        reference: "",
        description: "",
        status: "pending",
      },
    ]);
    setRxCalcRows((prev) => [
      ...prev,
      {
        distanceSphereRight: "",
        nearSphereRight: "",
        distanceSphereLeft: "",
        nearSphereLeft: "",
      },
    ]);
  };

  // customer and order info handling
  const handleOrderInfo = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setOrderInfo((prevOrderInfo) => ({
      ...prevOrderInfo,
      [name]: value,
    }));
  };

  const handleOrderNote = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOrderInfo((prevOrderInfo) => ({
      ...prevOrderInfo,
      [name]: value,
    }));
  };

  const handleChangeForcePayment = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (user?.roles !== "ADMIN" && user?.roles !== "FINANCE") {
      toast.error("You are not authorized to perform this action");
      return;
    }
    const { checked } = e.target;
    if (checked) {
      setForcePayment(true);
    } else {
      setForcePayment(false);
    }
  };

  const handleCustomerSearch = (customer: CustomerType) => {
    setCustomerSearch((prevOrderInfo) => ({
      ...prevOrderInfo,
      id: customer.id,
      fullName: customer.fullName,
    }));
    setOrderInfo((prevOrderInfo) => ({
      ...prevOrderInfo,
      customerId: customer.id,
    }));
  };

  const handleSalesPersonSearch = (partner: SalesPartnerType) => {
    setSalesPartnerSearch((prevOrderInfo) => ({
      ...prevOrderInfo,
      id: partner.id,
      fullName: partner.fullName,
    }));
    setOrderInfo((prevOrderInfo) => ({
      ...prevOrderInfo,
      salesPartnersId: partner.id,
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setOrderInfo((prevOrderInfo) => ({
      ...prevOrderInfo,
      [name]: value,
    }));
  };

  const handleItemChange = (index: number, value: string) => {
    const item = formData[index];
    if (isOrderItemContentEditingLocked(item)) {
      toast.error(LINE_CONTENT_LOCKED_MSG);
      return;
    }

    const selectedItem = items?.find((item) => item.id === value);
    if (selectedItem) {
      const updatedFormData = [...formData];
      updatedFormData[index] = {
        ...updatedFormData[index],
        itemId: value,
        serviceId: "", // Reset service selection
        pricingId: "", // Reset pricing
        itemBaseId: undefined,
        width: '', // Reset width
        height: '', // Reset height
        quantity: '', // Reset quantity
        unitPrice: 0, // Reset unit price
        totalAmount: 0, // Reset total amount
        discount: 0, // Reset discount
        level: 0, // Reset level
        uomId: selectedItem.defaultUomId, // Set default UOM from item
        uomsOptions: selectedItem.unitCategory?.uoms || [], // Set UOM options from item
        constant: selectedItem.unitCategory?.constant || false, // Set constant from item
        baseUomId: selectedItem.defaultUomId, // Set base UOM
        unit: 0, // Reset unit
        description: "", // Reset description
        isDiscounted: false, // Reset discount flag
      };

      if (selectedItem.id && !(selectedItem.id in itemBasesMap)) {
        fetchItemBases(selectedItem.id)
          .unwrap()
          .then((bases) => {
            setItemBasesMap((prev) => ({ ...prev, [selectedItem.id]: bases }));
          })
          .catch(() => {});
      }

      setFormData(updatedFormData);
    }
  };


  const calculateUnitPrice = (
    formDataItem: OrderItemType,
    selectedItem: ItemType,
    index: number
  ) => {
    const { width, height, quantity, uomId, itemId, serviceId } = formDataItem;
    const foundUom = selectedItem?.unitCategory?.uoms?.find(
      (uom) => uom.id === uomId
    );
    const unitCategory = items?.find(
      (item) => item.id === itemId.toString()
    )?.unitCategory;
    const filterSellingPrice = pricings?.find(
      (pricing) => pricing.itemId === itemId && 
      (pricing.serviceId === serviceId || pricing.nonStockServiceId === serviceId)
    );

    if (
      filterSellingPrice &&
      foundUom &&
      unitCategory?.constant &&
      width &&
      height &&
      quantity
    ) {
      const baseUnit = unitCategory.uoms.find((unit) => unit.baseUnit === true);
      const servicePrice = filterSellingPrice.sellingPrice;
      const convertedWidth =
        parseFloat(width) *
        parseFloat(foundUom.conversionRate?.toString() || "0");
      const convertedHeight =
        parseFloat(height) *
        parseFloat(foundUom.conversionRate?.toString() || "0");

      // Calculate unit and total amounts
      const combination =
        convertedWidth *
        convertedHeight *
        parseFloat(quantity.toString()) *
        parseFloat(servicePrice.toString() || "0");

      setFormData((prevFormData) => {
        const updatedFormData = [...prevFormData];
        updatedFormData[index] = {
          ...updatedFormData[index],
          pricingId: filterSellingPrice?.id,
          unit:
            convertedWidth * convertedHeight * parseFloat(quantity.toString()),
          baseUomId: baseUnit?.id || "",
        };
        return updatedFormData;
      });

      const devider =
        parseFloat(filterSellingPrice.width?.toString() || "0") *
        parseFloat(filterSellingPrice.height?.toString() || "0");
      return (
        parseFloat(combination.toString()) / parseFloat(devider.toString())
      ).toFixed(2);
    }
    return 0;
  };

  const calculateUnitPriceForNonAreaItems = (
    formDataItem: OrderItemType,
    selectedItem: ItemType,
    index: number
  ) => {
    const { quantity, uomId, itemId, serviceId } = formDataItem;
    const foundUom = selectedItem?.unitCategory?.uoms?.find(
      (uom) => uom.id === uomId
    );
    const unitCategory = items?.find(
      (item) => item.id === itemId.toString()
    )?.unitCategory;
    const filterSellingPrice = pricings?.find(
      (pricing: PricingType) =>
        pricing.itemId === itemId && 
        (pricing.serviceId === serviceId || pricing.nonStockServiceId === serviceId)
    );

    if (filterSellingPrice) {
      if (!unitCategory?.constant && filterSellingPrice.sellingPrice > 0) {
        const convertedQuantity =
          parseFloat(quantity.toString()) *
          parseFloat(foundUom?.conversionRate?.toString() || "0");
        const baseUnit = unitCategory?.uoms.find(
          (unit) => unit.baseUnit === true
        );

        setFormData((prevFormData) => {
          const updatedFormData = [...prevFormData];
          updatedFormData[index] = {
            ...updatedFormData[index],
            pricingId: filterSellingPrice?.id,
            unit: convertedQuantity,
            baseUomId: baseUnit?.id || "",
          };
          return updatedFormData;
        });

        const combination =
          convertedQuantity *
          parseFloat(filterSellingPrice?.sellingPrice?.toString() || "0");
        return combination.toFixed(2);
      }
    }

    return 0;
  };

  const handleUnitChange = (index: number, value: string) => {
    const item = formData[index];
    if (isOrderItemContentEditingLocked(item)) {
      toast.error(LINE_CONTENT_LOCKED_MSG);
      return;
    }
    setFormData((prevFormData) => {
      const updatedFormData = [...prevFormData];
      const selectedItem = items?.find(
        (item) => item.id === updatedFormData[index].itemId
      );
      if (selectedItem) {
        updatedFormData[index] = {
          ...updatedFormData[index],
          uomId: value,
        };

        const quantity = parseFloat(updatedFormData[index].quantity.toString());
        const constant = updatedFormData[index].constant;

        updatedFormData[index].unitPrice = parseFloat(
          calculateUnitPrice(
            updatedFormData[index],
            selectedItem,
            index
          )?.toString() || "0"
        );
        updatedFormData[index].totalAmount = parseFloat(
          calculateUnitPrice(
            updatedFormData[index],
            selectedItem,
            index
          )?.toString() || "0"
        );

        if (!isNaN(quantity) && !constant) {
          const selectedItem = items?.find(
            (item) => item.id === updatedFormData[index].itemId
          );
          if (selectedItem) {
            updatedFormData[index].unitPrice = parseFloat(
              calculateUnitPriceForNonAreaItems(
                updatedFormData[index],
                selectedItem,
                index
              )?.toString() || "0"
            );
            updatedFormData[index].totalAmount = parseFloat(
              calculateUnitPriceForNonAreaItems(
                updatedFormData[index],
                selectedItem,
                index
              )?.toString() || "0"
            );
          }
        }
      }
      return updatedFormData;
    });
  };

  const handleQuantityChange = (index: number, value: string) => {
    const item = formData[index];
    if (isOrderItemContentEditingLocked(item)) {
      toast.error(LINE_CONTENT_LOCKED_MSG);
      return;
    }
    const quantity = value || "";

    setFormData((prevFormData) => {
      const updatedFormData = [...prevFormData];
      updatedFormData[index] = {
        ...updatedFormData[index],
        quantity,
      };

      const width = parseFloat(updatedFormData[index].width);
      const height = parseFloat(updatedFormData[index].height);
      const quantityy = parseFloat(updatedFormData[index].quantity.toString());
      const constant = updatedFormData[index].constant;

      // Ensure width, height, and quantity are valid numbers
      if (!isNaN(width) && !isNaN(height) && parseFloat(quantity) > 0) {
        const selectedItem = items?.find(
          (item) => item.id === updatedFormData[index].itemId
        );

        // Pass formDataItem and selectedItem to calculateUnitPrice
        if (selectedItem) {
          updatedFormData[index].unitPrice = parseFloat(
            calculateUnitPrice(
              updatedFormData[index],
              selectedItem,
              index
            )?.toString() || "0"
          );
          updatedFormData[index].totalAmount = parseFloat(
            calculateUnitPrice(
              updatedFormData[index],
              selectedItem,
              index
            )?.toString() || "0"
          );
        }
      }

      if (!isNaN(quantityy) && !constant) {
        const selectedItem = items?.find(
          (item) => item.id === updatedFormData[index].itemId
        );
        if (selectedItem) {
          updatedFormData[index].unitPrice = parseFloat(
            calculateUnitPriceForNonAreaItems(
              updatedFormData[index],
              selectedItem,
              index
            )?.toString() || "0"
          );
          updatedFormData[index].totalAmount = parseFloat(
            calculateUnitPriceForNonAreaItems(
              updatedFormData[index],
              selectedItem,
              index
            )?.toString() || "0"
          );
        }
      }

      // Always update line total from quantity × unit price (e.g. for lens items with fixed unit price)
      const qty = parseFloat(updatedFormData[index].quantity?.toString() || "0");
      const unit = parseFloat(updatedFormData[index].unitPrice?.toString() || "0");
      updatedFormData[index].totalAmount = Math.round((qty * unit) * 100) / 100;

      return updatedFormData;
    });
  };

  const handleQuantityPerEyeChange = (
    index: number,
    side: 'quantityRight' | 'quantityLeft',
    value: string,
  ) => {
    const row = formData[index];
    if (row && isOrderItemContentEditingLocked(row)) {
      toast.error(LINE_CONTENT_LOCKED_MSG);
      return;
    }
    const num = value === '' ? undefined : parseFloat(value);
    if (num !== undefined && Number.isNaN(num)) return;

    setFormData((prevFormData) => {
      const updatedFormData = [...prevFormData];
      const row = updatedFormData[index];
      const legacyR = parseFloat(row.quantity?.toString() || '0') || 0;
      const nextRight = side === 'quantityRight' ? num : (row.quantityRight ?? legacyR);
      const nextLeft = side === 'quantityLeft' ? num : (row.quantityLeft ?? 0);
      const r = typeof nextRight === 'number' ? nextRight : 0;
      const l = typeof nextLeft === 'number' ? nextLeft : 0;
      updatedFormData[index] = {
        ...row,
        [side]: num,
        quantity: String(r + l),
      };
      const qty = r + l;
      const unit = parseFloat(updatedFormData[index].unitPrice?.toString() || "0");
      updatedFormData[index].totalAmount = Math.round((qty * unit) * 100) / 100;
      return updatedFormData;
    });
  };

  const handleQuantityPerEyeStep = (
    index: number,
    side: 'quantityRight' | 'quantityLeft',
    delta: number,
  ) => {
    const row = formData[index];
    if (row && isOrderItemContentEditingLocked(row)) {
      toast.error(LINE_CONTENT_LOCKED_MSG);
      return;
    }
    const legacyR = parseFloat(row.quantity?.toString() || '0') || 0;
    const current = side === 'quantityRight'
      ? (row.quantityRight ?? legacyR)
      : (row.quantityLeft ?? 0);
    const num = typeof current === 'number' ? current : 0;
    const next = Math.max(0, num + delta);
    handleQuantityPerEyeChange(index, side, String(next));
  };

  const handleRxNumberChange = (
    index: number,
    field: keyof OrderItemType,
    value: string,
  ) => {
    if (isOrderItemContentEditingLocked(formData[index])) {
      toast.error(LINE_CONTENT_LOCKED_MSG);
      return;
    }
    setFormData((prevFormData) => {
      const updatedFormData = [...prevFormData];
      updatedFormData[index] = {
        ...updatedFormData[index],
        [field]: value === "" ? undefined : Number(value),
      };
      return updatedFormData;
    });
  };

  const handleRxTextChange = (
    index: number,
    field: keyof OrderItemType,
    value: string,
  ) => {
    if (isOrderItemContentEditingLocked(formData[index])) {
      toast.error(LINE_CONTENT_LOCKED_MSG);
      return;
    }
    setFormData((prevFormData) => {
      const updatedFormData = [...prevFormData];
      updatedFormData[index] = {
        ...updatedFormData[index],
        [field]: value || undefined,
      };
      return updatedFormData;
    });
  };

  const handleRxCalcChange = (
    index: number,
    field: keyof RxCalcRow,
    value: string,
  ) => {
    if (isOrderItemContentEditingLocked(formData[index])) {
      toast.error(LINE_CONTENT_LOCKED_MSG);
      return;
    }
    setRxCalcRows((prev) => {
      const next = [...prev];
      next[index] = {
        ...(next[index] || {
          distanceSphereRight: "",
          nearSphereRight: "",
          distanceSphereLeft: "",
          nearSphereLeft: "",
        }),
        [field]: value,
      };
      return next;
    });

    setFormData((prevFormData) => {
      const updatedFormData = [...prevFormData];
      const row = rxCalcRows[index] || {
        distanceSphereRight: "",
        nearSphereRight: "",
        distanceSphereLeft: "",
        nearSphereLeft: "",
      };
      const updatedRow = {
        ...row,
        [field]: value,
      };

      const parse = (v: string) => {
        const n = parseFloat(v);
        return isNaN(n) ? undefined : n;
      };

      const distR = parse(updatedRow.distanceSphereRight);
      const nearR = parse(updatedRow.nearSphereRight);
      if (distR !== undefined && nearR !== undefined) {
        const addR = nearR - distR;
        updatedFormData[index] = {
          ...updatedFormData[index],
          addRight: Number(addR.toFixed(2)),
        };
      }

      const distL = parse(updatedRow.distanceSphereLeft);
      const nearL = parse(updatedRow.nearSphereLeft);
      if (distL !== undefined && nearL !== undefined) {
        const addL = nearL - distL;
        updatedFormData[index] = {
          ...updatedFormData[index],
          addLeft: Number(addL.toFixed(2)),
        };
      }

      return updatedFormData;
    });
  };

  const updatedFormData = useMemo(() => {
    return formData.map((item) => ({
      ...item,
      totalAmount: (
        parseFloat(item.quantity?.toString() || "0") *
        parseFloat(item.unitPrice?.toString() || "0")
      ).toFixed(2),
    }));
  }, [formData]);

  const handleCancel = (index: number) => {
    const item = formData[index];
    if (isOrderItemContentEditingLocked(item)) {
      toast.error(LINE_CONTENT_LOCKED_MSG);
      return;
    }
    const updatedFormData = [...formData];
    const filteredData = updatedFormData.filter((_, i) => i !== index);
    setFormData(filteredData);
    const updatedCommission = [...commissionTransactions];
    const filteredCommission = updatedCommission.filter((_, i) => i !== index);
    setCommissionTransactions(filteredCommission);
    setRxCalcRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancelPayment = (index: number) => {
    if (user?.roles !== "ADMIN" && user?.roles !== "FINANCE") {
      toast.error("You are not authorized to perform this action");
      return;
    }
    const updatedData = [...paymentTransactions];
    const filteredData = updatedData.filter((_, i) => i !== index);
    setPaymentTransactions(filteredData);
  };

  useEffect(() => {
    const totalAmount = formData.reduce((acc, c) => {
      const qty = parseFloat(c.quantity?.toString() || "0");
      const unit = parseFloat(c.unitPrice?.toString() || "0");
      const totalPrice = qty * unit;
      return acc + totalPrice;
    }, 0);

    const totalQuantity = formData.reduce((acc, c) => {
      return acc + parseFloat(c.quantity?.toString() || "0");
    }, 0);

    // No separate tax/VAT: backend recalculates totals from line items.
    let grandTotal = totalAmount;
    if (
      parseFloat(userInputDiscount) > 0 &&
      parseFloat(userInputDiscount) <= grandTotal
    ) {
      grandTotal = grandTotal - parseFloat(userInputDiscount);
    }

    setOrderInfo((prevOrderInfo) => ({
      ...prevOrderInfo,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      totalQuantity: parseFloat(totalQuantity.toFixed(2)),
      tax: 0,
      grandTotal: parseFloat(grandTotal.toFixed(2)),
    }));

    if (commissionTransactions.length > 0) {
      const totalCommission = commissionTransactions.reduce((acc, c) => {
        return acc + parseFloat(c.amount?.toString() || "0");
      }, 0);
      setTotalCommission(parseFloat(totalCommission.toFixed(2)));
    }

  }, [
    formData,
    orderInfo.customerId,
    items,
    customers,
    commissionTransactions,
    userInputDiscount,
    order
  ]);

  const handleUserInputDiscount = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (user?.roles !== "ADMIN") {
      toast.error("You are not authorized to perform this action");
      return;
    }
    const { value } = e.target;
    const discount = parseFloat(value) || "";
    setUserInputDiscount(discount.toString());
  };

  const handleDiscountChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (user?.roles !== "ADMIN") {
      toast.error("You are not authorized to perform this action");
      return;
    }
    if (isOrderItemContentEditingLocked(formData[index])) {
      toast.error(LINE_CONTENT_LOCKED_MSG);
      return;
    }
    const { checked } = e.target;
    setFormData((prevFormData) => {
      const updatedData = [...prevFormData];
      updatedData[index] = {
        ...updatedData[index],
        isDiscounted: checked,
      };

      // Calculate discount if the checkbox is checked
      if (checked) {
        const unit = updatedData[index].unit;
        const selectedItem = items?.find(
          (item) => item.id === updatedFormData[index].itemId
        );
        const discountItem = discounts?.filter(
          (discount) => discount.items.id === selectedItem?.id
        );
        // Find the appropriate discount data based on the unit's range

        if (discountItem) {
          const discountData = discountItem.find((discount) => {
            const minQuantity = parseInt(discount.unit.toString());
            const nextDiscount = discounts?.find(
              (d) => d.unit > parseFloat(minQuantity.toString())
            );
            const maxQuantity = nextDiscount ? nextDiscount.unit : Infinity;
            return unit >= minQuantity && unit < maxQuantity;
          });

          // If discount data is found, apply the discount
          if (discountData) {
            updatedData[index].level = parseFloat(
              discountData.level.toString()
            );
            const discountPercentage =
              parseFloat(discountData.percentage.toString()) / 100;
            updatedData[index].discount =
              discountPercentage *
              parseFloat(updatedData[index].unitPrice.toString());
            updatedData[index].totalAmount =
              updatedData[index].unitPrice - updatedData[index].discount;
          } else {
            // If no discount data is found, reset level and discount
            updatedData[index].level = 0;
            updatedData[index].discount = 0;
            updatedData[index].totalAmount = updatedData[index].unitPrice;
          }
        }
      } else {
        // If checkbox is not checked, reset level, discount, and total
        updatedData[index].level = 0;
        updatedData[index].discount = 0;
        updatedData[index].totalAmount = updatedData[index].unitPrice;
      }

      return updatedData;
    });
  };

  const handleCollapseDiscount = () => {
    setCollapseDiscount((prev) => !prev);
  };

  const options = useMemo(() => {
    const selectedItemIds = new Set(
      (formData || []).map((row) => row.itemId).filter((id) => Boolean(id))
    );
    return (
      items
        ?.filter((item) => item.can_be_sold || selectedItemIds.has(item.id))
        .map((item) => ({ value: item.id, label: item.name })) || []
    );
  }, [items, formData]);

  const [showPopover, setShowPopover] = useState<number | null>(null);
  const [qcFailLineIndex, setQcFailLineIndex] = useState<number | null>(null);
  const [qcFailSubmitting, setQcFailSubmitting] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0, isAbove: false });
  const triggerRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const clickHandler = ({ target }: MouseEvent) => {
      if (!dropdownRef.current) return;
      
      // Check if click is on any trigger button
      const isOnTrigger = triggerRefs.current.some(ref => ref?.contains(target as Node));
      
      if (
        !dropdownOpen ||
        dropdownRef.current.contains(target as Node) ||
        isOnTrigger
      )
        return;
      setDropdownOpen(false);
      setShowPopover(null);
    };
    document.addEventListener("click", clickHandler);
    return () => document.removeEventListener("click", clickHandler);
  });

  // close if the esc key is pressed
  useEffect(() => {
    const keyHandler = ({ keyCode }: KeyboardEvent) => {
      if (!dropdownOpen || keyCode !== 27) return;
      setDropdownOpen(false);
      setShowPopover(null);
    };
    document.addEventListener("keydown", keyHandler);
    return () => document.removeEventListener("keydown", keyHandler);
  });

  const handleAction = (index: number) => {
    if (showPopover === index) {
      setShowPopover(null);
      setDropdownOpen(false);
    } else {
      setShowPopover(index);
      setDropdownOpen(true);
      
      // Calculate dropdown position
      const currentTriggerRef = triggerRefs.current[index];
      if (currentTriggerRef) {
        const rect = currentTriggerRef.getBoundingClientRect();
        
        console.log('Button rect:', rect);
        console.log('Button index:', index);
        console.log('Button position - top:', rect.top, 'bottom:', rect.bottom, 'left:', rect.left);
        
        // Use the actual button position relative to viewport
        let top = rect.bottom + 8; // 8px gap from button
        let left = rect.left + (rect.width / 2); // Center horizontally on the button
        
        console.log('Calculated dropdown position - top:', top, 'left:', left);
        
        // Ensure dropdown doesn't go off-screen
        const dropdownWidth = 200; // minWidth from the dropdown
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Adjust horizontal position if it would go off-screen
        if (left + dropdownWidth / 2 > viewportWidth) {
          left = viewportWidth - dropdownWidth / 2 - 10;
        } else if (left - dropdownWidth / 2 < 0) {
          left = dropdownWidth / 2 + 10;
        }
        
        // Adjust vertical position if it would go off-screen
        const dropdownHeight = 120; // Approximate height of dropdown
        let isAbove = false;
        if (top + dropdownHeight > viewportHeight) {
          // Position above the button instead
          top = rect.top - dropdownHeight - 8;
          isAbove = true;
        }
        
        console.log('Final dropdown position - top:', top, 'left:', left, 'isAbove:', isAbove);
        
        setDropdownPosition({ top, left, isAbove });
      }
    }
  };

  const handleUpdateItemStatus = async (index: number, newStatus: string) => {
    const item = formData[index];
    if (!item?.id || !order?.id) return;
    // Enforce QC pass before delivery
    if (newStatus === "Delivered" && item.qualityControlStatus !== "Passed") {
      toast.error("Quality control must be Passed before delivery.");
      return;
    }
    setDropdownOpen(false);
    setShowPopover(null);
    try {
      const payload: Partial<OrderItemType> & { id: string; orderId: string; status: string } = {
        id: item.id,
        orderId: order.id,
        status: newStatus,
      };

      if (newStatus === "InProgress") {
        if (item.approvalStatus !== "Approved") {
          toast.error("This line must be approved before starting production.");
          return;
        }
        if (item.storeRequestStatus !== "Issued") {
          toast.error(
            "Start production is blocked until the store has issued materials (store request must be Issued).",
          );
          return;
        }
      }

      await updateOrderItem(payload).unwrap();
      setFormData((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = {
            ...next[index],
            status: newStatus,
            ...(payload.approvalStatus ? { approvalStatus: payload.approvalStatus } : {}),
          };
        }
        return next;
      });
      toast.success(`Item status set to ${newStatus}`);
    } catch (err) {
      const fetchError = err as FetchBaseQueryError;
      const message = handleApiError(fetchError, "Failed to update item status");
      toast.error(message);
    }
  };

  const canPerformQc = ["ADMIN", "LAB_TECHNICIAN"].includes(user?.roles || "");

  const handleQcPassLine = async (index: number) => {
    const item = formData[index];
    if (!item?.id || !order?.id) return;
    if (item.status !== "Ready") {
      toast.error("Only Ready lines can be quality checked.");
      return;
    }
    setDropdownOpen(false);
    setShowPopover(null);
    try {
      await updateOrderItem({
        id: item.id,
        orderId: order.id,
        qualityControlStatus: "Passed",
      }).unwrap();
      setFormData((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = { ...next[index], qualityControlStatus: "Passed" };
        }
        return next;
      });
      toast.success("QC marked as Passed.");
    } catch (err) {
      const fetchError = err as FetchBaseQueryError;
      toast.error(handleApiError(fetchError, "Failed to update QC"));
    }
  };

  const handleOrderDetailsQcFailConfirm = async (
    reason: string,
    requestStoreWithOperator: boolean,
  ) => {
    const lineIndex = qcFailLineIndex;
    if (lineIndex === null || !user?.id || !order?.id) return;
    if (!canPerformQc) {
      toast.error("You are not authorized to perform QC.");
      return;
    }
    const item = formData[lineIndex];
    if (!item?.id) {
      setQcFailLineIndex(null);
      return;
    }
    if (item.status !== "Ready") {
      toast.error("Only Ready lines can be quality checked.");
      setQcFailLineIndex(null);
      return;
    }
    if (item.qualityControlStatus === "Failed") {
      toast.error("This line is already marked QC Failed.");
      setQcFailLineIndex(null);
      return;
    }

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
        orderId: order.id,
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
      setQcFailLineIndex(null);
      setDropdownOpen(false);
      setShowPopover(null);
      setFormData((prev) => {
        const next = [...prev];
        if (next[lineIndex]) {
          next[lineIndex] = {
            ...next[lineIndex],
            status: "Pending",
            approvalStatus: "Approved",
            qualityControlStatus: "Pending",
            storeRequestStatus: requestStoreWithOperator ? "Requested" : "None",
          };
        }
        return next;
      });
    } catch (err) {
      const fetchError = err as FetchBaseQueryError;
      toast.error(handleApiError(fetchError, "Failed to record QC failure"));
    } finally {
      setQcFailSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate customer
    if (!orderInfo.customerId) {
      toast.error("Please select a customer before submitting the order.");
      return;
    }

    // Prepare order items
    const ordeItemData = formData.map((data) => {
      if (isOrderItemContentEditingLocked(data)) {
        const workflowOnly: Record<string, unknown> = {
          id: data.id,
          orderId: order?.id,
          status: data.status,
          approvalStatus: data.approvalStatus,
          qualityControlStatus: data.qualityControlStatus,
          storeRequestStatus: data.storeRequestStatus,
          adminApproval: data.adminApproval,
        };
        if (data.operatorId) {
          workflowOnly.operatorId = data.operatorId;
        }
        return workflowOnly as unknown as OrderItemType;
      }

      // Check if the service is a non-stock service
      const isNonStockService = nonStockServices?.some(service => service.id === data.serviceId);

      const r = data.quantityRight;
      const l = data.quantityLeft;
      const usePerEye =
        typeof r === 'number' && !Number.isNaN(r) && typeof l === 'number' && !Number.isNaN(l);
      const qty = usePerEye ? r + l : parseFloat(data.quantity?.toString() || "0");
      const unit = parseFloat(data.unitPrice?.toString() || "0");
      const lineTotal = Math.round((qty * unit) * 100) / 100;

      const quantityPayload = usePerEye
        ? { quantityRight: r, quantityLeft: l, quantity: String(qty) }
        : { quantity: data.quantity };

      return {
        itemId: data.itemId,
        ...(isNonStockService 
          ? { nonStockServiceId: data.serviceId, isNonStockService: true }
          : { serviceId: data.serviceId, isNonStockService: false }
        ),
        width: data.width,
        height: data.height,
        discount: data.discount,
        level: data.level,
        totalAmount: lineTotal,
        adminApproval: data.adminApproval,
        uomId: data.uomId,
        ...quantityPayload,
        unitPrice: data.unitPrice,
        description: data.description,
        isDiscounted: data.isDiscounted,
        status: data.status,
        approvalStatus: data.approvalStatus,
        qualityControlStatus: data.qualityControlStatus,
        storeRequestStatus: data.storeRequestStatus,
        id: data.id,
        orderId: order?.id,
        unit: data.unit,
        pricingId: data.pricingId,
        baseUomId: data.baseUomId,
        // Rx / prescription fields
        sphereRight: data.sphereRight,
        sphereLeft: data.sphereLeft,
        cylinderRight: data.cylinderRight,
        cylinderLeft: data.cylinderLeft,
        axisRight: data.axisRight,
        axisLeft: data.axisLeft,
        addRight: data.addRight,
        addLeft: data.addLeft,
        pd: data.pd,
        pdMonocularRight: data.pdMonocularRight,
        pdMonocularLeft: data.pdMonocularLeft,
        prismRight: data.prismRight,
        prismLeft: data.prismLeft,
        lensType: data.lensType,
        lensMaterial: data.lensMaterial,
        lensCoating: data.lensCoating,
        lensIndex: data.lensIndex,
        baseCurve: data.baseCurve,
        diameter: data.diameter,
        tintColor: data.tintColor,
        itemBaseId: data.itemBaseId,
      };
    });

    // Prepare payment data
    const paymentTermStatus = remainingAmount <= 0
      ? "Paid"
      : (totaTransaction > 0 ? "Partially Paid" : "Pending");

    const paymentData = {
      id: order?.paymentTerm?.[0]?.id,
      orderId: order?.id,
      totalAmount: totaTransaction,
      remainingAmount: remainingAmount,
      status: paymentTermStatus,
      forcePayment: forcePayment,
      transactions: paymentTransactions.map((transaction) => ({
        ...transaction,
        paymentTermId: order?.paymentTerm?.[0]?.id,
        date: new Date(transaction.date),
        status:
          (transaction.status && transaction.status.toLowerCase() === "paid")
            ? "Paid"
            : "Pending",
      })),
    };

    // Validate payment
    if (paymentData.totalAmount > orderInfo.grandTotal) {
      toast.error("Total payment amount cannot exceed the grand total.");
      return;
    }

    // Prepare commission data
    const commissionData = {
      salesPartnerId: salesPartnerSearch.id,
      totalAmount: totalCommission,
      paidAmount: order?.commission?.[0]?.paidAmount || 0,
      id: order?.commission?.[0]?.id,
      orderId: order?.id,
      transactions: commissionTransactions.map((transaction) => ({
        ...transaction,
        paymentMethod: transaction.paymentMethod ?? "cash",
        description: transaction.description,
        amount: transaction.amount,
        reference: transaction.reference,
        status:
          (transaction.status && transaction.status.toLowerCase() === "paid")
            ? "Paid"
            : "Pending",
        date: new Date(transaction.date),
      })),
    };

    // Commission validations
    if (commissionData.totalAmount > 0) {
      if (!salesPartnerSearch.id) {
        toast.error(
          "A sales partner must be selected if there is a commission."
        );
        return;
      }
      if (commissionData.transactions.some((t) => t.amount === 0)) {
        toast.error("All commission transactions must have a non-zero amount.");
        return;
      }
      if (commissionData.transactions.some((t) => !t.paymentMethod)) {
        toast.error("All commission transactions must have a payment method.");
        return;
      }
      if (commissionData.transactions.some((t) => !t.reference)) {
        toast.error(
          "All commission transactions must have a reference number."
        );
        return;
      }
    }

    // Compose final data
    const data = {
      ...orderInfo,
      orderItems: ordeItemData,
      paymentTerm: [paymentData],
      commission: commissionData.totalAmount > 0 ? [commissionData] : undefined,
      id: order?.id,
    };

    // Submit
    try {
      await updateOrder(data).unwrap();
      toast.success("Order updated successfully.");
    } catch (error) {
      const fetchError = error as FetchBaseQueryError;
      const errorMessage = handleApiError(fetchError, "Order update failed");
      toast.error(errorMessage);
    }
  };

  // Helper to compute effective parent quantity for a line (per-eye or total)
  const getLineQuantity = (data: {
    quantity?: string | number;
    quantityRight?: number;
    quantityLeft?: number;
  }): number => {
    const r = data.quantityRight;
    const l = data.quantityLeft;
    const usePerEye =
      typeof r === "number" &&
      !Number.isNaN(r) &&
      typeof l === "number" &&
      !Number.isNaN(l);
    if (usePerEye) return r + l;
    const q = parseFloat(data.quantity?.toString() || "0");
    return Number.isNaN(q) ? 0 : q;
  };

  const componentRef = useRef(null);
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
    documentTitle: "Order document",
    onAfterPrint: () => toast.success("Printing completed successfully"),
    removeAfterPrint: true,
  });

  const deliveryNoteRef = useRef<HTMLDivElement>(null);
  const handlePrintDeliveryNote = useReactToPrint({
    content: () => deliveryNoteRef.current,
    documentTitle: `Delivery note — ${orderInfo.series || "order"}`,
    onAfterPrint: () => toast.success("Delivery note sent to print"),
    removeAfterPrint: false,
  });

  // Print-specific table component
  const PrintTable = () => (
    <div className="print-only">
      <div className="max-w-full overflow-x-auto">
        <div className="max-w-full px-4">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  No
                </th>
                <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                  Item
                </th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                  Qty
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Unit Price
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {formData && formData.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-black dark:text-white">
                    No data found
                  </td>
                </tr>
              )}
              {formData &&
                updatedFormData.map((data, index) => (
                  <tr key={index}>
                    <td className="border-b text-graydark dark:text-white border-stroke py-2 px-4 dark:border-strokedark">
                      {index + 1}
                    </td>
                    <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                      {items?.find((item) => item.id === data.itemId)?.name || ""}
                    </td>
                    <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                      {data.quantity}
                    </td>
                    <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                      {Number(data.unitPrice || 0).toFixed(2)}
                    </td>
                    <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                      {Number(data.totalAmount || 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  if (isError) return <ErroPage error={error.toString()} />;
  if (
    isItemsLoading ||
    isCustomersLoading ||
    isLoading ||
    isServicesLoading ||
    isNonStockServicesLoading ||
    isPricingsLoading ||
    isDiscountsLoading
  )
    return <Loader />;

  return (
    <>
      <QcFailureModal
        open={qcFailLineIndex !== null}
        onClose={() => !qcFailSubmitting && setQcFailLineIndex(null)}
        onConfirm={handleOrderDetailsQcFailConfirm}
        isSubmitting={qcFailSubmitting}
      />
      <div
        className="fixed -left-[9999px] top-0 z-0 pointer-events-none"
        aria-hidden
      >
        <DeliveryNotePrint
          ref={deliveryNoteRef}
          orderInfo={orderInfo}
          customer={deliveryNoteCustomer}
          lines={formData}
          items={items}
          services={services}
          nonStockServices={nonStockServices}
          discountAmount={parseFloat(userInputDiscount) || 0}
          paymentTransactions={paymentTransactions}
          totalPaid={totaTransaction}
          remainingBalance={remainingAmount}
          salesPartnerName={salesPartnerSearch.fullName}
          totalCommission={totalCommission}
        />
      </div>
      <Breadcrumb pageName="Order details" />
      <div className="flex justify-end gap-2 mb-4 flex-wrap">
        <button
          type="button"
          className="flex items-center justify-center rounded border-[1.5px] border-stroke bg-white px-2 py-1 font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-primary dark:hover:text-primary transition-colors"
          onClick={handlePrintDeliveryNote}
        >
          <FaPrint className="mr-2 text-xl text-primary" />
          Print delivery note
        </button>
        <button
          type="button"
          className="flex items-center justify-center rounded border-[1.5px] border-stroke bg-white px-2 py-1 font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-primary dark:hover:text-primary transition-colors"
          onClick={handlePrint}
        >
          <FaPrint className="mr-2 text-xl text-primary" />
          Print Order
        </button>
      </div>
      <section className="bg-white dark:bg-boxdark" ref={componentRef}>
        <form onSubmit={handleSubmit}>
          <div>
            <div className="grid sm:grid-cols-3 sm:gap-6 mb-4 p-4 border border-stroke dark:border-strokedark rounded-lg">
              <div className="w-full">
                <label
                  htmlFor="series"
                  className="mb-3 block text-black dark:text-white"
                >
                  Series
                </label>
                <input
                  type="text"
                  name="series"
                  value={orderInfo.series}
                  readOnly
                  id="series"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                />
              </div>
              <div className="">
                <label
                  htmlFor="orderDate"
                  className="mb-3 block text-black dark:text-white"
                >
                  Order Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="orderDate"
                    onChange={handleDateChange}
                    value={orderInfo.orderDate}
                    required
                    id="orderDate"
                    placeholder="Select a date"
                    className="custom-input-date custom-input-date-1 w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
              </div>
              <div className="">
                <label
                  htmlFor="deliveryDate"
                  className="mb-3 block text-black dark:text-white"
                >
                  Delivery Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="deliveryDate"
                    onChange={handleDateChange}
                    value={orderInfo.deliveryDate}
                    required
                    id="deliveryDate"
                    placeholder="Select a date"
                    className="custom-input-date custom-input-date-1 w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
              </div>
              <div className="w-full relative">
                <CustomerSearchInput
                  handleCustomerInfo={handleCustomerSearch}
                  value={customerSearch.fullName}
                />
              </div>
              <div>
                <label
                  htmlFor="orderSource"
                  className="mb-3 block text-black dark:text-white"
                >
                  Order source
                </label>
                <select
                  defaultValue="telegram"
                  name="orderSource"
                  onChange={handleOrderInfo}
                  value={orderInfo.orderSource}
                  id="orderSource"
                  required
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="" className="text-body dark:text-bodydark bg-white dark:bg-form-input">Select order source</option>
                  <option value="telegram" className="text-body dark:text-bodydark bg-white dark:bg-form-input">Telegram</option>
                  <option value="phone" className="text-body dark:text-bodydark bg-white dark:bg-form-input">Phone</option>
                  <option value="In person" className="text-body dark:text-bodydark bg-white dark:bg-form-input">In person</option>
                  <option value="whatsapp" className="text-body dark:text-bodydark bg-white dark:bg-form-input">Whatsapp</option>
                </select>
              </div>
            </div>

            <div>
              <button
                type="button"
                className="text-black dark:text-white w-full py-2 px-4 border-t border-b border-stroke dark:border-strokedark mb-4 font-semibold flex items-center gap-4"
              >
                Orders List{" "}
              </button>
              
              {/* Print-only table */}
              <PrintTable />
              
              {/* Screen-only content */}
              <div className="screen-only">
                <Tabs
                  tabs={tabs}
                  activeTabId={activeTabId}
                  onTabChange={handleTabChange}
                />
                {activeTabId === "general" && (
                  <div className="rounded-sm border border-stroke bg-white dark:border-strokedark dark:bg-boxdark">
                    <div className="table-container max-w-full overflow-x-auto">
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
                              <th className="py-4 px-4 font-medium text-black dark:text-white">
                                UOM
                              </th>
                              <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                                Quantity
                              </th>
                              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                                U.Price
                              </th>
                              <th className="py-4 px-4 font-medium text-black dark:text-white">
                                Rx
                              </th>
                              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                                Status
                              </th>
                              <th className="py-4 px-4 font-medium text-black dark:text-white">
                                {/* Action */}
                                <span className="font-semibold flex justify-center items-center">
                                  <CiSettings className="text-xl font-bold" />
                                </span>
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData && formData.length === 0 && (
                              <tr>
                                <td colSpan={8} className="text-center text-black dark:text-white">
                                  No data found
                                </td>
                              </tr>
                            )}
                            {formData &&
                              updatedFormData.map((data, index) => {
                              const lineLocked = isOrderItemContentEditingLocked(formData[index]);
                              return (
                              <Fragment key={index}>
                                <tr>
                                  <td className="border-b text-graydark dark:text-white border-stroke py-2 px-4 dark:border-strokedark">
                                    {index + 1}
                                  </td>
                                  <td className="min-w-[220px] relative border border-stroke dark:border-strokedark">
                                    <SelectOptions
                                      options={options}
                                      defaultOptionText=""
                                      selectedOption={formData[index].itemId}
                                      onOptionChange={(value) =>
                                        handleItemChange(index, value)
                                      }
                                      containerMargin=""
                                      labelMargin=""
                                      border=""
                                      title="Select item"
                                      isDisabled={lineLocked}
                                    />
                                  </td>
                                  <td className="min-w-[220px] relative border border-stroke dark:border-strokedark">
                                    <SelectOptions
                                      options={
                                        formData[index]?.uomsOptions?.map(
                                          (uom) => ({
                                            value: uom.id,
                                            label: uom.abbreviation,
                                          })
                                        ) || []
                                      }
                                      defaultOptionText=""
                                      selectedOption={formData[index].uomId}
                                      onOptionChange={(value) =>
                                        handleUnitChange(index, value)
                                      }
                                      containerMargin=""
                                      labelMargin=""
                                      border=""
                                      title="Select units"
                                      isDisabled={lineLocked}
                                    />
                                  </td>
                                  <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark whitespace-nowrap">
                                    <div className="flex items-center gap-2 flex-nowrap">
                                      <div className="flex items-center gap-0.5 shrink-0">
                                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 w-8 shrink-0">R</span>
                                        <button
                                          type="button"
                                          title="Decrease right quantity"
                                          disabled={lineLocked}
                                          onClick={() => handleQuantityPerEyeStep(index, 'quantityRight', -1)}
                                          className="flex h-8 w-7 shrink-0 items-center justify-center rounded border border-stroke bg-gray-100 text-sm font-medium hover:bg-gray-200 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-3 disabled:opacity-50"
                                        >
                                          −
                                        </button>
                                        <input
                                          title="Quantity right eye"
                                          type="number"
                                          min={0}
                                          disabled={lineLocked}
                                          value={data.quantityRight ?? data.quantity ?? ''}
                                          onChange={(e) =>
                                            handleQuantityPerEyeChange(index, 'quantityRight', e.target.value)
                                          }
                                          className="h-8 w-10 rounded border border-stroke bg-transparent px-0.5 text-center text-sm font-medium outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white disabled:opacity-50"
                                        />
                                        <button
                                          type="button"
                                          title="Increase right quantity"
                                          disabled={lineLocked}
                                          onClick={() => handleQuantityPerEyeStep(index, 'quantityRight', 1)}
                                          className="flex h-8 w-7 shrink-0 items-center justify-center rounded border border-stroke bg-gray-100 text-sm font-medium hover:bg-gray-200 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-3 disabled:opacity-50"
                                        >
                                          +
                                        </button>
                                      </div>
                                      <div className="flex items-center gap-0.5 shrink-0">
                                        <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 w-8 shrink-0">L</span>
                                        <button
                                          type="button"
                                          title="Decrease left quantity"
                                          disabled={lineLocked}
                                          onClick={() => handleQuantityPerEyeStep(index, 'quantityLeft', -1)}
                                          className="flex h-8 w-7 shrink-0 items-center justify-center rounded border border-stroke bg-gray-100 text-sm font-medium hover:bg-gray-200 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-3 disabled:opacity-50"
                                        >
                                          −
                                        </button>
                                        <input
                                          title="Quantity left eye"
                                          type="number"
                                          min={0}
                                          disabled={lineLocked}
                                          value={data.quantityLeft ?? ''}
                                          onChange={(e) =>
                                            handleQuantityPerEyeChange(index, 'quantityLeft', e.target.value)
                                          }
                                          className="h-8 w-10 rounded border border-stroke bg-transparent px-0.5 text-center text-sm font-medium outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white disabled:opacity-50"
                                        />
                                        <button
                                          type="button"
                                          title="Increase left quantity"
                                          disabled={lineLocked}
                                          onClick={() => handleQuantityPerEyeStep(index, 'quantityLeft', 1)}
                                          className="flex h-8 w-7 shrink-0 items-center justify-center rounded border border-stroke bg-gray-100 text-sm font-medium hover:bg-gray-200 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-3 disabled:opacity-50"
                                        >
                                          +
                                        </button>
                                      </div>
                                      <div className="flex items-center gap-1 border-l border-stroke pl-2 dark:border-strokedark shrink-0">
                                        <span className="text-[10px] text-gray-500 dark:text-gray-400 shrink-0">Total</span>
                                        <input
                                          title="Quantity total (or single)"
                                          type="number"
                                          name="quantity"
                                          value={data.quantity}
                                          min={0}
                                          required
                                          disabled={lineLocked}
                                          onChange={(e) =>
                                            handleQuantityChange(index, e.target.value)
                                          }
                                          className="h-8 w-10 rounded border border-stroke bg-transparent px-0.5 text-center text-sm font-medium outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white disabled:opacity-50"
                                        />
                                      </div>
                                    </div>
                                  </td>
                                  <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                                    {Number(data.unitPrice || 0).toFixed(2)}
                                  </td>
                                  <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                                    <button
                                      type="button"
                                      title={
                                        lineLocked
                                          ? "View prescription and lens details (read-only)"
                                          : undefined
                                      }
                                      className="rounded border border-stroke px-2 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                                      onClick={() =>
                                        setActiveRxRow((prev) => (prev === index ? null : index))
                                      }
                                    >
                                      {activeRxRow === index
                                        ? "Hide Rx"
                                        : lineLocked
                                          ? "View Rx"
                                          : "Edit Rx"}
                                    </button>
                                  </td>
                                  <td className="px-4 py-2 border border-stroke dark:border-strokedark">
                                    {order && (
                                      <div className="flex items-center justify-center w-full relative">
                                        {data.status === "Pending" && (
                                          <span className="bg-primary text-white text-xs font-medium  px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                                            Pending
                                          </span>
                                        )}
                                        {data.status === "InProgress" && (
                                          <span className="text-white bg-gradient-to-br from-danger to-warning hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-pink-200 dark:focus:ring-pink-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                            In progress
                                          </span>
                                        )}
                                        {data.status === "Cancelled" && (
                                          <span className="bg-danger text-white text-xs font-medium px-2.5 py-0.5 rounded dark:danger dark:text-white">
                                            Cancelled
                                          </span>
                                        )}
                                        {data.status === "Approved" && (
                                          <span className="bg-success text-white text-xs font-medium px-2.5 py-0.5 rounded dark:bg-success dark:text-white">
                                            {data.status}
                                          </span>
                                        )}
                                        {data.status === "Paid" && (
                                          <span className="text-white bg-blend-hue hover:bg-sky-600 focus:ring-4 focus:outline-none focus:ring-sky-100 dark:bg-sky-400 dark:hover:bg-sky-500 dark:focus:ring-sky-600 text-xs font-medium px-2.5 py-0.5 rounded">
                                            {data.status}
                                          </span>
                                        )}
                                        {data.status === "Delivered" && (
                                          <span className="text-white bg-meta-5 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-meta-5 dark:hover:bg-blue-700 dark:focus:ring-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                            {data.status}
                                          </span>
                                        )}
                                        {data.status === "Ready" && (
                                          <span className="text-white bg-meta-3 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 dark:bg-meta-3 dark:hover:bg-blue-700 dark:focus:ring-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                            Ready
                                          </span>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                  <td className="px-6 py-4 relative">
                                    <Link
                                      to="#"
                                      onClick={(event) => {
                                        handleAction(index);
                                        event.stopPropagation();
                                      }}
                                      ref={(el) => {
                                        triggerRefs.current[index] = el;
                                      }}
                                      className="flex items-center gap-4"
                                    >
                                      <CiMenuKebab />
                                    </Link>

                                    {/* <!-- Dropdown Start --> */}
                                    {showPopover === index && dropdownOpen && createPortal(
                                      <div
                                        ref={dropdownRef}
                                        onFocus={() => setDropdownOpen(true)}
                                        onBlur={() => setDropdownOpen(false)}
                                        className="fixed z-[9999] flex w-47.5 flex-col rounded-lg border border-stroke bg-white shadow-lg dark:border-strokedark dark:bg-boxdark animate-in fade-in-0 zoom-in-95 duration-200"
                                        style={{
                                          top: `${dropdownPosition.top}px`,
                                          left: `${dropdownPosition.left}px`,
                                          minWidth: '200px',
                                          transform: 'translateX(-50%)'
                                        }}
                                      >
                                        {/* Visual connection triangle */}
                                        <div 
                                          className={`absolute left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 ${
                                            dropdownPosition.isAbove 
                                              ? 'border-t-4 border-transparent border-t-stroke dark:border-t-strokedark -bottom-2' 
                                              : 'border-b-4 border-transparent border-b-stroke dark:border-b-strokedark -top-2'
                                          }`}
                                          style={{ marginLeft: '-8px' }}
                                        ></div>
                                        <ul className="flex flex-col p-2 dark:border-strokedark">
                                          {/* Row indicator */}
                                          <li className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 border-b border-stroke dark:border-strokedark mb-1">
                                            Row {index + 1} - {items?.find((item) => item.id === formData[index]?.itemId)?.name || 'Item'}
                                          </li>
                                          <li>
                                            <Link
                                              to={`/dashboard/notifications/${id}`}
                                              className="flex items-center gap-3 text-sm font-medium px-3 py-2 rounded-md duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-meta-4 hover:text-primary lg:text-base"
                                            >
                                              <BsTicketDetailed className="text-lg" />
                                              Details
                                            </Link>
                                          </li>
                                          {!["InProgress", "Ready", "Delivered", "Cancelled"].includes(formData[index]?.status || "") && (
                                            <li>
                                              <button
                                                onClick={() => handleUpdateItemStatus(index, "InProgress")}
                                                type="button"
                                                disabled={
                                                  isUpdatingItem ||
                                                  formData[index]?.storeRequestStatus !== "Issued"
                                                }
                                                title={
                                                  formData[index]?.storeRequestStatus !== "Issued"
                                                    ? "Store must issue materials first (store request Issued)."
                                                    : undefined
                                                }
                                                className="flex items-center gap-3 text-sm font-medium px-3 py-2 rounded-md duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-meta-4 hover:text-primary lg:text-base w-full text-left disabled:opacity-50"
                                              >
                                                <FaPrint className="text-lg" />
                                                Start production
                                              </button>
                                            </li>
                                          )}
                                          {formData[index]?.status === "InProgress" && (
                                            <li>
                                              <button
                                                onClick={() => handleUpdateItemStatus(index, "Ready")}
                                                type="button"
                                                disabled={isUpdatingItem}
                                                className="flex items-center gap-3 text-sm font-medium px-3 py-2 rounded-md duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-meta-4 hover:text-primary lg:text-base w-full text-left disabled:opacity-50"
                                              >
                                                Mark as Ready
                                              </button>
                                            </li>
                                          )}
                                          {formData[index]?.status === "Ready" && canPerformQc && (
                                            <>
                                              <li>
                                                <button
                                                  onClick={() => handleQcPassLine(index)}
                                                  type="button"
                                                  disabled={isUpdatingItem}
                                                  className="flex items-center gap-3 text-sm font-medium px-3 py-2 rounded-md duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-meta-4 hover:text-primary lg:text-base w-full text-left disabled:opacity-50"
                                                >
                                                  QC Passed
                                                </button>
                                              </li>
                                              <li>
                                                <button
                                                  onClick={() => {
                                                    setDropdownOpen(false);
                                                    setShowPopover(null);
                                                    setQcFailLineIndex(index);
                                                  }}
                                                  type="button"
                                                  disabled={isUpdatingItem}
                                                  className="flex items-center gap-3 text-sm font-medium px-3 py-2 rounded-md duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-meta-4 hover:text-danger lg:text-base w-full text-left disabled:opacity-50"
                                                >
                                                  QC Failed (remake)…
                                                </button>
                                              </li>
                                            </>
                                          )}
                                          {formData[index]?.status === "Ready" && (
                                            <li>
                                              <button
                                                onClick={() => handleUpdateItemStatus(index, "Delivered")}
                                                type="button"
                                                disabled={
                                                  isUpdatingItem ||
                                                  formData[index]?.qualityControlStatus !== "Passed"
                                                }
                                                title={
                                                  formData[index]?.qualityControlStatus !== "Passed"
                                                    ? "QC must be Passed before delivery."
                                                    : undefined
                                                }
                                                className="flex items-center gap-3 text-sm font-medium px-3 py-2 rounded-md duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-meta-4 hover:text-primary lg:text-base w-full text-left disabled:opacity-50"
                                              >
                                                Mark as Delivered
                                              </button>
                                            </li>
                                          )}
                                          {!["Cancelled", "Delivered"].includes(formData[index]?.status || "") && (
                                            <li>
                                              <button
                                                onClick={() => handleUpdateItemStatus(index, "Cancelled")}
                                                type="button"
                                                disabled={isUpdatingItem}
                                                className="flex items-center gap-3 text-sm font-medium px-3 py-2 rounded-md duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-meta-4 hover:text-danger lg:text-base w-full text-left disabled:opacity-50"
                                              >
                                                Mark as Cancelled
                                              </button>
                                            </li>
                                          )}
                                          <li>
                                            <button
                                              onClick={() => handleCancel(index)}
                                              type="button"
                                              className="flex items-center gap-3 text-sm font-medium px-3 py-2 rounded-md duration-300 ease-in-out hover:bg-gray-100 dark:hover:bg-meta-4 hover:text-danger lg:text-base w-full text-left"
                                            >
                                              <MdDelete className="text-lg" />
                                              Delete
                                            </button>
                                          </li>
                                        </ul>
                                      </div>,
                                      document.body
                                    )}
                                    {/* <!-- Dropdown End --> */}
                                  </td>
                                </tr>
                              {activeRxRow === index && (
                                <tr>
                                  <td
                                    colSpan={8}
                                    className="bg-gray-50 dark:bg-boxdark p-4 border border-t-0 border-stroke dark:border-strokedark"
                                  >
                                    <fieldset
                                      disabled={lineLocked}
                                      className="min-w-0 border-0 p-0 m-0 disabled:[&_input]:cursor-default disabled:[&_select]:cursor-default"
                                    >
                                    {lineLocked && (
                                      <p className="mb-3 text-xs font-medium text-body dark:text-bodydark">
                                        Prescription and lens fields are read-only for this line.
                                      </p>
                                    )}
                                    <div className="grid gap-4 md:grid-cols-4">
                                      <div>
                                        <p className="mb-2 text-xs font-semibold text-black dark:text-white">
                                          Right eye (OD)
                                        </p>
                                        <div className="space-y-2">
                                          <div className="grid grid-cols-2 gap-2">
                                            <input
                                              type="number"
                                              step="0.01"
                                              placeholder="Distance SPH (for ADD)"
                                              className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                              value={rxCalcRows[index]?.distanceSphereRight ?? ""}
                                              onChange={(e) =>
                                                handleRxCalcChange(index, "distanceSphereRight", e.target.value)
                                              }
                                            />
                                            <input
                                              type="number"
                                              step="0.01"
                                              placeholder="Near SPH (for ADD)"
                                              className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                              value={rxCalcRows[index]?.nearSphereRight ?? ""}
                                              onChange={(e) =>
                                                handleRxCalcChange(index, "nearSphereRight", e.target.value)
                                              }
                                            />
                                          </div>
                                          <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Sphere (SPH)"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.sphereRight ?? ""}
                                            onChange={(e) =>
                                              handleRxNumberChange(index, "sphereRight", e.target.value)
                                            }
                                          />
                                          <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Cylinder (CYL)"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.cylinderRight ?? ""}
                                            onChange={(e) =>
                                              handleRxNumberChange(index, "cylinderRight", e.target.value)
                                            }
                                          />
                                          <input
                                            type="number"
                                            step="1"
                                            min={0}
                                            max={180}
                                            placeholder="Axis (AX)"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.axisRight ?? ""}
                                            onChange={(e) =>
                                              handleRxNumberChange(index, "axisRight", e.target.value)
                                            }
                                          />
                                          <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Add (ADD)"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.addRight ?? ""}
                                            onChange={(e) =>
                                              handleRxNumberChange(index, "addRight", e.target.value)
                                            }
                                          />
                                          <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Prism"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.prismRight ?? ""}
                                            onChange={(e) =>
                                              handleRxNumberChange(index, "prismRight", e.target.value)
                                            }
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <p className="mb-2 text-xs font-semibold text-black dark:text-white">
                                          Left eye (OS)
                                        </p>
                                        <div className="space-y-2">
                                          <div className="grid grid-cols-2 gap-2">
                                            <input
                                              type="number"
                                              step="0.01"
                                              placeholder="Distance SPH (for ADD)"
                                              className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                              value={rxCalcRows[index]?.distanceSphereLeft ?? ""}
                                              onChange={(e) =>
                                                handleRxCalcChange(index, "distanceSphereLeft", e.target.value)
                                              }
                                            />
                                            <input
                                              type="number"
                                              step="0.01"
                                              placeholder="Near SPH (for ADD)"
                                              className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                              value={rxCalcRows[index]?.nearSphereLeft ?? ""}
                                              onChange={(e) =>
                                                handleRxCalcChange(index, "nearSphereLeft", e.target.value)
                                              }
                                            />
                                          </div>
                                          <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Sphere (SPH)"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.sphereLeft ?? ""}
                                            onChange={(e) =>
                                              handleRxNumberChange(index, "sphereLeft", e.target.value)
                                            }
                                          />
                                          <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Cylinder (CYL)"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.cylinderLeft ?? ""}
                                            onChange={(e) =>
                                              handleRxNumberChange(index, "cylinderLeft", e.target.value)
                                            }
                                          />
                                          <input
                                            type="number"
                                            step="1"
                                            min={0}
                                            max={180}
                                            placeholder="Axis (AX)"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.axisLeft ?? ""}
                                            onChange={(e) =>
                                              handleRxNumberChange(index, "axisLeft", e.target.value)
                                            }
                                          />
                                          <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Add (ADD)"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.addLeft ?? ""}
                                            onChange={(e) =>
                                              handleRxNumberChange(index, "addLeft", e.target.value)
                                            }
                                          />
                                          <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Prism"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.prismLeft ?? ""}
                                            onChange={(e) =>
                                              handleRxNumberChange(index, "prismLeft", e.target.value)
                                            }
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <p className="mb-2 text-xs font-semibold text-black dark:text-white">
                                          PD
                                        </p>
                                        <div className="space-y-2">
                                          <input
                                            type="number"
                                            step="0.1"
                                            placeholder="Binocular PD"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.pd ?? ""}
                                            onChange={(e) =>
                                              handleRxNumberChange(index, "pd", e.target.value)
                                            }
                                          />
                                          <input
                                            type="number"
                                            step="0.1"
                                            placeholder="Monocular PD (Right)"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.pdMonocularRight ?? ""}
                                            onChange={(e) =>
                                              handleRxNumberChange(index, "pdMonocularRight", e.target.value)
                                            }
                                          />
                                          <input
                                            type="number"
                                            step="0.1"
                                            placeholder="Monocular PD (Left)"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.pdMonocularLeft ?? ""}
                                            onChange={(e) =>
                                              handleRxNumberChange(index, "pdMonocularLeft", e.target.value)
                                            }
                                          />
                                        </div>
                                      </div>
                                      <div>
                                        <p className="mb-2 text-xs font-semibold text-black dark:text-white">
                                          Lens details
                                        </p>
                                        <div className="space-y-2">
                                          {data.itemId && itemBasesMap[data.itemId] && itemBasesMap[data.itemId].length > 0 && (
                                            <select
                                              className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                              value={data.itemBaseId || ""}
                                              onChange={(e) =>
                                                setFormData((prevFormData) => {
                                                  const updatedFormData = [...prevFormData];
                                                  updatedFormData[index] = {
                                                    ...updatedFormData[index],
                                                    itemBaseId: e.target.value || undefined,
                                                  };
                                                  return updatedFormData;
                                                })
                                              }
                                            >
                                              <option value="">Select base / add</option>
                                              {itemBasesMap[data.itemId].map((base) => (
                                                <option key={base.id} value={base.id}>
                                                  {base.baseCode}
                                                  {base.addPower ? `^+${base.addPower}` : ""}
                                                </option>
                                              ))}
                                            </select>
                                          )}
                                          <input
                                            type="text"
                                            placeholder="Lens type"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.lensType || ""}
                                            onChange={(e) =>
                                              handleRxTextChange(index, "lensType", e.target.value)
                                            }
                                          />
                                          <input
                                            type="text"
                                            placeholder="Lens material"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.lensMaterial || ""}
                                            onChange={(e) =>
                                              handleRxTextChange(index, "lensMaterial", e.target.value)
                                            }
                                          />
                                          <input
                                            type="text"
                                            placeholder="Lens coating"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.lensCoating || ""}
                                            onChange={(e) =>
                                              handleRxTextChange(index, "lensCoating", e.target.value)
                                            }
                                          />
                                          <input
                                            type="number"
                                            step="0.01"
                                            placeholder="Lens index"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.lensIndex ?? ""}
                                            onChange={(e) =>
                                              handleRxNumberChange(index, "lensIndex", e.target.value)
                                            }
                                          />
                                          <input
                                            type="number"
                                            step="0.1"
                                            placeholder="Base curve"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.baseCurve ?? ""}
                                            onChange={(e) =>
                                              handleRxNumberChange(index, "baseCurve", e.target.value)
                                            }
                                          />
                                          <input
                                            type="number"
                                            step="0.1"
                                            placeholder="Diameter"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.diameter ?? ""}
                                            onChange={(e) =>
                                              handleRxNumberChange(index, "diameter", e.target.value)
                                            }
                                          />
                                          <input
                                            type="text"
                                            placeholder="Tint color"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.tintColor || ""}
                                            onChange={(e) =>
                                              handleRxTextChange(index, "tintColor", e.target.value)
                                            }
                                          />
                                          {data.itemId && data.itemBaseId && itemBasesMap[data.itemId] && (
                                            (() => {
                                              const basesForItem = itemBasesMap[data.itemId] || [];
                                              const baseForRow = basesForItem.find((b) => b.id === data.itemBaseId) as ItemBaseType | undefined;

                                              const { right: rightValues, left: leftValues } = computeToolValuesDetails(data, baseForRow);
                                              const labTools = labToolsData?.labTools ?? [];
                                              const hasAny = rightValues.length > 0 || leftValues.length > 0;
                                              if (!hasAny) return null;

                                              const missingRight = labTools.length
                                                ? findMissingToolValuesDetails(rightValues, labTools)
                                                : [];
                                              const missingLeft = labTools.length
                                                ? findMissingToolValuesDetails(leftValues, labTools)
                                                : [];

                                              const lineRight = rightValues.length > 0 ? `Right: ${rightValues.join(", ")}` : null;
                                              const lineLeft = leftValues.length > 0 ? `Left: ${leftValues.join(", ")}` : null;
                                              const calculatedLine = [lineRight, lineLeft].filter(Boolean).join(". ");

                                              return (
                                                <>
                                                  <p className="mt-1 text-[11px] font-medium text-black dark:text-white">
                                                    Calculated tools — {calculatedLine}
                                                  </p>
                                                  <div className="mt-0.5 space-y-0.5">
                                                    {labTools.length > 0 ? (
                                                      <>
                                                        {rightValues.length > 0 && (
                                                          missingRight.length === 0 ? (
                                                            <p className="text-[11px] font-medium text-success">
                                                              Right lens: lab tools available.
                                                            </p>
                                                          ) : (
                                                            <p className="text-[11px] font-medium text-danger">
                                                              Right lens: missing lab tools for values {missingRight.join(", ")}.
                                                            </p>
                                                          )
                                                        )}
                                                        {leftValues.length > 0 && (
                                                          missingLeft.length === 0 ? (
                                                            <p className="text-[11px] font-medium text-success">
                                                              Left lens: lab tools available.
                                                            </p>
                                                          ) : (
                                                            <p className="text-[11px] font-medium text-danger">
                                                              Left lens: missing lab tools for values {missingLeft.join(", ")}.
                                                            </p>
                                                          )
                                                        )}
                                                      </>
                                                    ) : (
                                                      <p className="text-[11px] text-bodydark dark:text-bodydark">
                                                        Lab tools not loaded or empty — cannot check producibility.
                                                      </p>
                                                    )}
                                                  </div>
                                                </>
                                              );
                                            })()
                                          )}
                                          {data.item?.bomLines && data.item.bomLines.length > 0 && (
                                            (() => {
                                              const qty = getLineQuantity(data);
                                              if (!qty || qty <= 0) return null;

                                              return (
                                                <div className="mt-3 rounded border border-dashed border-stroke bg-gray-50 p-2 text-[11px] dark:border-strokedark dark:bg-meta-4/30">
                                                  <p className="mb-1 font-semibold text-black dark:text-white">
                                                    Bill of materials for store request
                                                  </p>
                                                  <ul className="list-disc pl-4 space-y-0.5 text-bodydark dark:text-bodydark">
                                                    {data.item.bomLines.map((bom: BomType) => {
                                                      const componentName =
                                                        bom.componentItem?.name ||
                                                        bom.componentItem?.itemCode ||
                                                        bom.componentItemId;
                                                      const uomLabel =
                                                        bom.uom?.abbreviation || bom.uom?.name || "";
                                                      const required = (bom.quantity ?? 0) * qty;
                                                      if (!componentName || !required) return null;
                                                      return (
                                                        <li key={bom.id}>
                                                          {required} × {componentName}
                                                          {uomLabel ? ` (${uomLabel})` : ""}
                                                        </li>
                                                      );
                                                    })}
                                                  </ul>
                                                </div>
                                              );
                                            })()
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                    </fieldset>
                                  </td>
                                </tr>
                              )}
                              </Fragment>
                            );})}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    <div className="p-4 flex items-center justify-between">
                      <button
                        onClick={handleAddRow}
                        type="button"
                        className="flex items-center justify-center rounded border-[1.5px] border-stroke bg-transparent px-2 py-1 font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-primary dark:hover:text-primary transition-colors"
                      >
                        Add row
                      </button>
                    </div>
                  </div>
                )}

              {activeTabId === "payment-terms" && (
                <div
                  className={`${
                    user?.roles !== "ADMIN" && user?.roles !== "FINANCE"
                      ? "hidden"
                      : ""
                  }`}
                >
                  {/* transactions */}

                  <div className="max-w-full overflow-x-auto p-4">
                    <div className="w-full flex items-center mb-4">
                      <div className="relative items-center text-black dark:text-white w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary">
                        <label
                          htmlFor="forcePayment"
                          className="flex cursor-pointer select-none items-center"
                        >
                          <div className="relative">
                            <input
                              title="Force Payment"
                              type="checkbox"
                              id="forcePayment"
                              className="sr-only"
                              checked={forcePayment}
                              onChange={handleChangeForcePayment}
                            />
                            <div
                              className={`mr-4 flex h-5 w-5 items-center justify-center rounded border border-graydark ${
                                forcePayment === true
                                  ? "border-primary bg-gray dark:bg-transparent"
                                  : "border-gray dark:border-strokedark bg-transparent"
                              }`}
                            >
                              <span
                                className={`h-2.5 w-2.5 rounded-sm ${
                                  forcePayment === true
                                    ? "bg-primary"
                                    : "bg-transparent"
                                }`}
                              ></span>
                            </div>
                          </div>
                        </label>
                        <span className="absolute left-12 top-1.5">
                          Force payment
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-between p-4">
                      <strong className="text-graydark dark:text-white">Payment Totals</strong>
                      <div className="text-graydark dark:text-white">
                        <p className="flex gap-4 justify-between">
                          <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Grand total :
                          </span>
                          <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            {orderInfo.grandTotal.toLocaleString()}
                          </span>
                        </p>
                        <p className="flex gap-4 justify-between">
                          <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Total payment :
                          </span>
                          <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            {totaTransaction.toLocaleString()}
                          </span>
                        </p>
                        <p className="flex gap-4 justify-between">
                          <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Remaining amount :
                          </span>
                          <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            {remainingAmount.toLocaleString()}
                          </span>
                        </p>
                      </div>
                    </div>
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-gray-2 text-left dark:bg-meta-4">
                          <th className="py-2 px-4 font-medium text-black dark:text-white">
                            No
                          </th>
                          <th className="min-w-[150px] p-4 font-medium text-black dark:text-white">
                            Date
                          </th>
                          <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                            Payment method
                          </th>
                          <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                            Description
                          </th>
                          <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                            Amount
                          </th>
                          <th className="py-4 px-4 font-medium text-black dark:text-white">
                            Reference
                          </th>
                          <th className="py-4 px-4 font-medium text-black dark:text-white">
                            Status
                          </th>
                          <th className="py-4 px-4 font-medium text-black dark:text-white">
                            {/* Action */}
                            <span className="font-semibold flex justify-center items-center">
                              <CiSettings className="text-xl font-bold" />
                            </span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {paymentTransactions &&
                          paymentTransactions.length === 0 && (
                            <tr>
                              <td colSpan={7} className="text-center text-black dark:text-white">
                                No data found
                              </td>
                            </tr>
                          )}
                        {paymentTransactions &&
                          paymentTransactions.map((data, index) => (
                            <tr key={index}>
                              <td className="py-2 px-4 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                                {index + 1}
                              </td>
                              <td className="py-2 px-4 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                                {data.date}
                              </td>

                              <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                                <label
                                  htmlFor={`${data.paymentMethod}s-${index}`}
                                  className="sr-only peer"
                                >
                                  Select an option
                                </label>
                                <select
                                  title="paymentMethod"
                                  onChange={(e) =>
                                    handlePaymentMethod(index, e)
                                  }
                                  name="paymentMethod"
                                  value={data.paymentMethod}
                                  className="w-full rounded bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                >
                                  <option value="cash" className="text-body dark:text-bodydark bg-white dark:bg-form-input">Cash</option>
                                  <option value="bank-transfer" className="text-body dark:text-bodydark bg-white dark:bg-form-input">
                                    Bank Transfer
                                  </option>
                                  <option value="mobile-banking" className="text-body dark:text-bodydark bg-white dark:bg-form-input">
                                    Mobile Banking
                                  </option>
                                  <option value="check" className="text-body dark:text-bodydark bg-white dark:bg-form-input">Check</option>
                                </select>
                              </td>

                              <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                                <label
                                  htmlFor={`${data.description}-${index}`}
                                  className="sr-only peer"
                                >
                                  Description
                                </label>
                                <input
                                  type="text"
                                  name="description"
                                  value={data.description}
                                  title="description"
                                  className="w-full rounded bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                  onChange={(e) => handleFormChange(index, e)}
                                />
                              </td>
                              <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                                <label
                                  htmlFor={`${data.amount}-${index}`}
                                  className="sr-only peer"
                                >
                                  Payment amount
                                </label>
                                <input
                                  type="number"
                                  name="amount"
                                  value={data.amount}
                                  title="amount"
                                  className="w-full rounded bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                  onChange={(e) => handleFormChange(index, e)}
                                />
                              </td>
                              <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                                <label
                                  htmlFor={`${data.reference}-${index}`}
                                  className="sr-only peer"
                                >
                                  Reference
                                </label>
                                <input
                                  type="text"
                                  name="reference"
                                  value={data.reference}
                                  title="reference"
                                  className="w-full rounded bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                  onChange={(e) => handleFormChange(index, e)}
                                />
                              </td>
                              <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                                <span
                                  className={`${
                                    data?.status === "paid"
                                      ? "bg-success/10 text-success/80 font-medium me-2 px-2.5 py-0.5 rounded dark:bg-success/90 dark:text-success/30"
                                      : "bg-primary/10 text-primary/80 font-medium me-2 px-2.5 py-0.5 rounded dark:bg-primary/90 dark:text-primary/30"
                                  }`}
                                >
                                  {data?.status}
                                </span>
                              </td>
                              <td className="px-4 py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                                <button
                                  onClick={() => handleCancelPayment(index)}
                                  title="action"
                                  type="button"
                                  className="text-black dark:text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                                >
                                  <IoMdClose />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="p-4 flex items-center justify-between">
                    <button
                      onClick={handleAddPaymentRow}
                      type="button"
                      className="flex items-center justify-center rounded border-[1.5px] border-stroke bg-transparent px-2 py-1 font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                      Add row
                    </button>
                    <button
                      type="button"
                      className="flex items-center justify-center rounded border-[1.5px] border-stroke bg-transparent px-2 py-1 font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </div>
              )}

              {activeTabId === "commissions" && (
                <div
                  className={`${
                    user?.roles !== "ADMIN" && user?.roles !== "FINANCE"
                      ? "hidden"
                      : ""
                  }`}
                >
                  <div className={`grid grid-cols-2 gap-4 px-4 mb-4`}>
                    <div className="w-full relative">
                      <SalesPartnerSearchInput
                        handleSalesPartnerInfo={handleSalesPersonSearch}
                        value={salesPartnerSearch.fullName}
                      />
                    </div>
                    <div className="">
                      <label
                        htmlFor="totalCommission"
                        className="mb-3 block text-black dark:text-white"
                      >
                        Total Commission
                      </label>
                      <input
                        value={totalCommission?.toFixed(2) || ""}
                        readOnly
                        type="number"
                        name="totalCommission"
                        id="totalCommission"
                        className="text-black dark:text-white w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        placeholder="0"
                      />
                    </div>
                  </div>
                  <div className="max-w-full overflow-x-auto px-4">
                    <table className="w-full table-auto">
                      <thead>
                        <tr className="bg-gray-2 text-left dark:bg-meta-4">
                          <th className="py-4 px-4 font-medium text-black dark:text-white">
                            No
                          </th>
                          <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                            Date
                          </th>
                          <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                            Item
                          </th>
                          <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                            Services
                          </th>
                          <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                            Description
                          </th>
                          <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                            Payment Method
                          </th>
                          <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                            Commission %
                          </th>
                          <th className="min-w-[200px] py-4 px-4 font-medium text-black dark:text-white">
                            Reference
                          </th>
                          <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                            Amount
                          </th>
                          <th className="py-4 px-4 font-medium text-black dark:text-white">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {formData && formData.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center text-black dark:text-white">
                              No data found
                            </td>
                          </tr>
                        )}
                        {updatedFormData.map((data, index) => (
                          <tr key={index}>
                            <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                              {index + 1}
                            </td>
                            <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                              {commissionTransactions[index]?.date ||
                                new Date().toLocaleDateString()}
                            </td>
                            <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                              {
                                items?.find((item) => item.id === data.itemId)
                                  ?.name
                              }
                            </td>
                            <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                              {
                                services?.find(
                                  (service) => service.id === data.serviceId
                                )?.name
                              }
                            </td>
                            <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                              <input
                                title="description"
                                type="text"
                                name="description"
                                id="description"
                                className="w-full rounded bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                value={
                                  commissionTransactions[index]?.description
                                }
                                onChange={(e) =>
                                  handleCommissionChange(index, e)
                                }
                              />
                            </td>
                            <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                              <label
                                htmlFor={`${commissionTransactions[index]?.paymentMethod}-${index}`}
                                className="sr-only peer"
                              >
                                Select an option
                              </label>
                              <select
                                title="paymentMethod"
                                onChange={(e) =>
                                  handleCommissionPaymentMethod(index, e)
                                }
                                name="paymentMethod"
                                value={
                                  commissionTransactions[index]?.paymentMethod
                                }
                                defaultValue="cash"
                                className="w-full rounded bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                              >
                                <option value="cash" className="text-body dark:text-bodydark bg-white dark:bg-form-input">Cash</option>
                                <option value="bank-transfer" className="text-body dark:text-bodydark bg-white dark:bg-form-input">
                                  Bank Transfer
                                </option>
                                <option value="mobile-banking" className="text-body dark:text-bodydark bg-white dark:bg-form-input">
                                  Mobile Banking
                                </option>
                                <option value="check" className="text-body dark:text-bodydark bg-white dark:bg-form-input">Check</option>
                              </select>
                            </td>
                            <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                              <input
                                title="percentage"
                                type="number"
                                name="percentage"
                                className="w-full rounded bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                min={0}
                                value={
                                  commissionTransactions[index]?.percentage
                                }
                                onChange={(e) =>
                                  handleCommissionChange(index, e)
                                }
                              />
                            </td>
                            <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                              <input
                                title="reference"
                                type="text"
                                name="reference"
                                id="description"
                                className="w-full rounded bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                min={0}
                                value={commissionTransactions[index]?.reference}
                                onChange={(e) =>
                                  handleCommissionChange(index, e)
                                }
                              />
                            </td>
                            <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                              {Number(
                                commissionTransactions[index]?.amount || 0
                              ).toFixed(2)}
                            </td>
                            <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                              {commissionTransactions[index]?.status}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeTabId === "other-information" && (
                <>
                  {user?.roles === "ADMIN" && (
                    <>
                      <div className="max-w-full overflow-x-auto px-4">
                        <table className="w-full table-auto">
                          <thead>
                            <tr className="bg-gray-2 text-left dark:bg-meta-4">
                              <th className="py-4 px-4 font-medium text-black dark:text-white">
                                No
                              </th>
                              <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                                Item
                              </th>
                              <th className="py-4 px-4 font-medium text-black dark:text-white">
                                discount
                              </th>
                              <th className="py-4 px-4 font-medium text-black dark:text-white">
                                Level
                              </th>
                              <th className="py-4 px-4 font-medium text-black dark:text-white">
                                T.Unit
                              </th>
                              <th className="py-4 px-4 font-medium text-black dark:text-white">
                                U.Price
                              </th>
                              <th className="py-4 px-4 font-medium text-black dark:text-white">
                                Total
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData && formData.length === 0 && (
                              <tr>
                                <td colSpan={7} className="text-center text-black dark:text-white">
                                  No data found
                                </td>
                              </tr>
                            )}
                            {updatedFormData.map((data, index) => (
                              <tr key={index}>
                                <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                                  {index + 1}
                                </td>
                                <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                                  {
                                    items?.find(
                                      (item) => item.id === data.itemId
                                    )?.name
                                  }
                                </td>
                                <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                                  <div className="flex items-center gap-2 relative">
                                    <span className="flex-1 px-2">
                                      {data.discount}
                                    </span>
                                    <label
                                      key={index}
                                      className="inline-flex items-center cursor-pointer w-1/4"
                                      htmlFor={`isDiscounted-${index}`}
                                    >
                                      <input
                                        onChange={(e) =>
                                          handleDiscountChange(index, e)
                                        }
                                        type="checkbox"
                                        name="isDiscounted"
                                        id={`isDiscounted-${index}`}
                                        checked={data.isDiscounted}
                                        className="sr-only peer"
                                      />
                                      <div className="relative w-8 h-4 bg-bodydark1 peer-focus:outline-none rounded-full peer dark:bg-graydark peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[1px] after:start-[2px] after:bg-white after:border-gray-3 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all dark:border-graydark peer-checked:bg-primary"></div>
                                    </label>
                                  </div>
                                </td>
                                <td className="px-4 py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                                  {data.level}
                                </td>
                                <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                                  {data.unit}
                                </td>
                                <td className="px-4 py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                                  {Number(data.unitPrice || 0).toFixed(2)}
                                </td>
                                <td className="py-2 border-b text-graydark dark:text-white border-stroke dark:border-strokedark">
                                  {Number(data.totalAmount || 0).toFixed(2)}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="pt-4">
                        <button
                          onClick={handleCollapseDiscount}
                          type="button"
                          className="text-black dark:text-white w-full py-2 px-4 border-t border-stroke border-b mb-4 font-semibold flex items-center gap-4"
                        >
                          Additional Discount{" "}
                          <span className="font-thin">
                            {collapseDisount ? (
                              <FaChevronUp />
                            ) : (
                              <FaChevronDown />
                            )}{" "}
                          </span>{" "}
                        </button>
                      </div>
                      <div className="flex justify-end items-center gap-4 pb-4">
                        <div
                          className={`${
                            collapseDisount ? "hidden" : ""
                          } px-4 md:w-1/2`}
                        >
                          <label
                            htmlFor="userInputDiscount"
                            className="mb-3 block text-black dark:text-white"
                          >
                            Discount
                          </label>
                          <input
                            type="number"
                            name="userInputDiscount"
                            value={parseFloat(userInputDiscount).toFixed(2)}
                            id="userInputDiscount"
                            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                            onChange={handleUserInputDiscount}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
              </div>

              <div className="flex justify-between pt-4 px-4">
                <strong className="text-graydark dark:text-white">Totals</strong>
                <div className="text-graydark dark:text-white">
                  <p className="flex gap-4 justify-between">
                    <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Total quantity
                    </span>
                    <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      {orderInfo.totalQuantity}
                    </span>
                  </p>
                  <p className="flex gap-4 justify-between">
                    <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Total amount
                    </span>
                    <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      {orderInfo.totalAmount.toLocaleString()}
                    </span>
                  </p>
                  <p className="flex gap-4 justify-between">
                    <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      Grand total
                    </span>
                    <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      {orderInfo.grandTotal.toLocaleString()}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="p-4 flex justify-between gap-10 items-center">
            <div className="w-full">
              <label
                htmlFor="message"
                className="mb-3 block text-black dark:text-white"
              >
                Your message
              </label>
              <textarea
                onChange={handleOrderNote}
                value={orderInfo.internalNote}
                name="internalNote"
                id="message"
                rows={4}
                className="text-black dark:text-white w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                placeholder="Leave a comment..."
              ></textarea>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="flex justify-center rounded bg-primary p-3 font-medium text-gray"
            >
              Update
            </button>
          </div>
        </form>
      </section>
    </>
  );
};
