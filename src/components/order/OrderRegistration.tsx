import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import CustomerSearchInput from "../customer/CustomerSearchInput";
import { CiSettings } from "react-icons/ci";
import { IoMdClose } from "react-icons/io";
import { SalesPartnerSearchInput } from "../commission/SalesPartnerSearchInput";
import { FaChevronDown, FaChevronUp } from "react-icons/fa6";
import Breadcrumb from "../Breadcrumb";
import { selectCurrentUser, selectCurrentToken } from "@/redux/authSlice";
import { useGetAllItemsQuery } from "@/redux/items/itemsApiSlice";
import { CustomerType } from "@/types/CustomerType";
import Tabs from "@/common/TabComponent";
import SelectOptions from "@/common/SelectOptions";
import { SalesPartnerType } from "@/types/SalesPartnerType";
import { useGetAllCustomersQuery } from "@/redux/customer/customerApiSlice";
import { ItemBaseType } from "@/types/ItemBaseType";
import { OrderItemType } from "@/types/OrderItemType";
import { OrderType } from "@/types/OrderType";
import { useCreateOrderMutation, useGetAllOrdersQuery } from "@/redux/order/orderApiSlice";
import ErroPage from "../common/ErroPage";
import Loader from "@/common/Loader";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useGetAllPricingsQuery } from "@/redux/pricing/pricingApiSlice";
import { useGetAllServicesQuery } from "@/redux/services/servicesApiSlice";
import { useGetAllNonStockServicesQuery } from "@/redux/services/nonStockServicesApiSlice";
import { useGetAllDiscountsQuery } from "@/redux/discount/discountApiSlice";
import { handleApiError } from "@/utils/errorHandling";
import { useGetLabToolsQuery } from "@/redux/labTools/labToolsApiSlice";
import type { LabToolType } from "@/types/LabToolType";
import type { ItemType } from "@/types/ItemType";

interface RxCalcRow {
  distanceSphereRight: string;
  nearSphereRight: string;
  distanceSphereLeft: string;
  nearSphereLeft: string;
}

// Minimal shape needed for lab tool calculation
interface OrderItemRxForTools {
  sphereRight?: number;
  sphereLeft?: number;
  cylinderRight?: number;
  cylinderLeft?: number;
}

// Convert a diopter or tool-style value into tool units (0.01 D steps).
// Examples:
//  - 1.25  -> 125
//  - 125   -> 125
const toToolUnits = (v: number | undefined): number | undefined => {
  if (typeof v !== "number" || Number.isNaN(v)) return undefined;
  // If magnitude is large (e.g. > 20 D), treat as already in tool units
  return Math.abs(v) > 20 ? v : v * 100;
};

type ToolValuesPerEye = { right: number[]; left: number[] };

const computeToolValues = (
  row: OrderItemRxForTools,
  base: ItemBaseType | undefined,
): ToolValuesPerEye => {
  const empty = { right: [], left: [] };
  if (!base) return empty;

  const baseNumeric = Number(base.baseCode);
  if (!Number.isFinite(baseNumeric)) return empty;

  // Base (tool units) = baseCode + ADD contribution (e.g. 350 + 25 for +2.50)
  const addTool = typeof base.addPower === "number" && !Number.isNaN(base.addPower)
    ? base.addPower * 10
    : 0;
  const baseTool = baseNumeric + addTool;
  const right: number[] = [];
  const left: number[] = [];

  const rawSphR = row.sphereRight;
  const rawCylR = row.cylinderRight;
  const rawSphL = row.sphereLeft;
  const rawCylL = row.cylinderLeft;

  const sphRToolMag = toToolUnits(
    typeof rawSphR === "number" ? Math.abs(rawSphR) : undefined,
  );
  const cylRToolMag = toToolUnits(
    typeof rawCylR === "number" ? Math.abs(rawCylR) : undefined,
  );
  const sphLToolMag = toToolUnits(
    typeof rawSphL === "number" ? Math.abs(rawSphL) : undefined,
  );
  const cylLToolMag = toToolUnits(
    typeof rawCylL === "number" ? Math.abs(rawCylL) : undefined,
  );

  // Right eye:
  if (typeof rawSphR === "number" && typeof sphRToolMag === "number") {
    const sphOffset = rawSphR < 0 ? sphRToolMag : -sphRToolMag;
    const rSph = Math.round(baseTool + sphOffset);
    right.push(rSph);
    if (typeof cylRToolMag === "number" && cylRToolMag !== 0) {
      right.push(Math.round(rSph + cylRToolMag));
    }
  }

  // Left eye:
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

const findMissingToolValues = (
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

interface ItemOrderInfoResponse {
  pricing?: {
    id: string;
    sellingPrice: number;
    baseUomId?: string;
  } | null;
  item?: {
    defaultUomId?: string;
  } | null;
}

const date = new Date();
const formattedDate = date.toISOString().split('T')[0];

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'payment-terms', label: 'Payment terms' },
  { id: 'commissions', label: 'Commissions' },
  { id: 'other-information', label: 'Other information' },
];


export const OrderRegistration = () => {
  const user = useSelector(selectCurrentUser);
  const accessToken = useSelector(selectCurrentToken);
  const { data: items, isLoading: isItemsLoading } = useGetAllItemsQuery();
  const { data: customers, isLoading: isCustomersLoading } = useGetAllCustomersQuery({});
  const { data: orders, isLoading, isError, error } = useGetAllOrdersQuery();
  const { isLoading: isPricingsLoading } = useGetAllPricingsQuery();
  const { isLoading: isServicesLoading } = useGetAllServicesQuery();
  const { data: nonStockServices, isLoading: isNonStockServicesLoading } = useGetAllNonStockServicesQuery();
  const { data: discounts, isLoading: isDiscountsLoading } = useGetAllDiscountsQuery();
  const { data: labToolsData } = useGetLabToolsQuery({ page: 1, limit: 1000 });
  const [createOrder, { isLoading: isCreating }] = useCreateOrderMutation();

  const navigate = useNavigate();

  const [orderInfo, setOrderInfo] = useState<OrderType>({
    id: "",
    series: "IAN-ORD-YYYY-",
    customerId: "",
    status: "Pending",
    orderSource: "",
    orderDate: formattedDate,
    deliveryDate: formattedDate,
    prescriptionDate: "",
    optometristName: "",
    urgency: "",
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
      itemId: "",
      serviceId: "",
      width: '',
      height: '',
      discount: 0,
      level: 0,
      totalAmount: 0,
      adminApproval: false,
      uomId: '',
      quantity: '',
      unitPrice: 0,
      description: "",
      isDiscounted: false,
      status: "Received",
      uomsOptions: [],
      id: "",
      orderId: "",
      pricingId: '',
      constant: false,
      unit: 0,
      baseUomId: '',
    }
  ]);

  const [paymentTransactions, setPaymentTransactions] = useState([
    {
      paymentTermId: '',
      date: formattedDate,
      paymentMethod: "cash",
      reference: "",
      amount: 0,
      status: "pending",
      description: "",
    }
  ]);

  const [commissionTransactions, setCommissionTransactions] = useState([
    {
      commissionId: '',
      date: formattedDate,
      amount: 0,
      percentage: 0,
      paymentMethod: "cash",
      reference: "",
      description: "",
      status: "pending",
    }
  ]);

  const [customerSearch, setCustomerSearch] = useState({
    id: "",
    fullName: "",
  });

  const [salesPartnerSearch, setSalesPartnerSearch] = useState({
    id: "",
    fullName: "",
  });

  const [fileName, setFileName] = useState<string[]>([]);
  const [userInputDiscount, setUserInputDiscount] = useState('');
  const [collapseDisount, setCollapseDiscount] = useState(false);
  const [totaTransaction, setTotalTransaction] = useState(0);
  const [remainingAmount, setRemainingAmount] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [forcePayment, setForcePayment] = useState(true);

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

  const API_BASE_URL =
    import.meta.env.VITE_NEST_BACKEND_URL || "https://api.ianprint.com/api/v1";

  const fetchOrderInfoForRow = (
    rowIndex: number,
    itemId: string,
    itemBaseId?: string,
  ) => {
    if (!itemId) return;

    const params = new URLSearchParams();
    if (itemBaseId) {
      params.set("itemBaseId", itemBaseId);
    }

    const query = params.toString();
    const url = `${API_BASE_URL}/items/${itemId}/order-info${
      query ? `?${query}` : ""
    }`;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    fetch(url, { headers })
      .then((res) => (res.ok ? res.json() : Promise.reject(res)))
      .then((response: ItemOrderInfoResponse & { data?: ItemOrderInfoResponse }) => {
        const info = response?.data ?? response;
        const pricing = info?.pricing;
        const item = info?.item as (ItemType & { itemBases?: ItemBaseType[] }) | undefined;

        // Populate bases map from order-info response when available
        if (item?.id && Array.isArray(item.itemBases) && item.itemBases.length > 0) {
          setItemBasesMap((prev) => ({
            ...prev,
            [item.id]: item.itemBases as ItemBaseType[],
          }));
        }

        if (!pricing) {
          toast.error("No pricing configured for the selected lens and base.");
          return;
        }

        setFormData((prevFormData) => {
          const updatedFormData = [...prevFormData];
          const row = updatedFormData[rowIndex];
          if (!row || row.itemId !== itemId) {
            return prevFormData;
          }

          updatedFormData[rowIndex] = {
            ...row,
            pricingId: pricing.id,
            unitPrice:
              typeof pricing.sellingPrice === "number"
                ? pricing.sellingPrice
                : row.unitPrice,
            baseUomId: pricing.baseUomId || row.baseUomId,
            uomId: row.uomId || info.item?.defaultUomId || row.uomId,
          };

          return updatedFormData;
        });
      })
      .catch(() => {
        // Ignore network / backend errors; user can still proceed with manual pricing
      });
  };

  const [activeTabId, setActiveTabId] = useState<string>('general');
  const handleTabChange = (id: string) => {
    setActiveTabId(id);
  };

  const handlePaymentMethod = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
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
    setPaymentTransactions((prev) => [
      ...prev,
      {
        date: formattedDate,
        paymentMethod: "cash",
        reference: "",
        amount: 0,
        status: "pending",
        description: "",
        paymentTermId: "",
      }
    ])
  };

  const handleAddRow = () => {
    setFormData((prevFormData) => [
      ...prevFormData,
      {
        id: "",
        itemId: "",
        serviceId: "",
        width: '',
        height: '',
        discount: 0,
        level: 0,
        totalAmount: 0,
        adminApproval: false,
        uomId: '',
        quantity: '',
        unitPrice: 0,
        description: "",
        isDiscounted: false,
        status: "Received",
        uomsOptions: [],
        orderId: "",
        pricingId: "",
        constant: false,
        unit: 0,
        baseUomId: "",
      }
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

    setCommissionTransactions((prev) => [
      ...prev,
      {
        orderId: "",
        date: formattedDate,
        amount: 0,
        percentage: 0,
        paymentMethod: "cash",
        reference: "",
        description: "",
        status: "pending",
        commissionId: "",
      }
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
    const { checked } = e.target;
    if (checked) {
      setForcePayment(true);
    }
    else {
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
      salesPartnersId: partner.id
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
    const selectedItem = items?.find(item => item.id === value);
    if (selectedItem) {
      const updatedFormData = [...formData];
      updatedFormData[index] = {
        ...updatedFormData[index],
        itemId: value,
        serviceId: "", // Reset service selection
        pricingId: "", // Reset pricing
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
        itemBaseId: undefined,
      };

      if (selectedItem.id && !(selectedItem.id in itemBasesMap)) {
        fetch(`/api/v1/items/${selectedItem.id}/bases`)
          .then((res) => (res.ok ? res.json() : Promise.reject(res)))
          .then((bases: ItemBaseType[]) => {
            setItemBasesMap((prev) => ({
              ...prev,
              [selectedItem.id]: bases,
            }));
          })
          .catch(() => {
            // Bases are optional; ignore errors
          });
      }

      // Fetch order info (pricing, tool) for item-only lines
      fetchOrderInfoForRow(index, selectedItem.id);

      setFormData(updatedFormData);
    }
  };

  const handleRxNumberChange = (
    index: number,
    field: keyof OrderItemType,
    value: string,
  ) => {
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
    setRxCalcRows((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
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

      // Right eye ADD
      const distR = parse(updatedRow.distanceSphereRight);
      const nearR = parse(updatedRow.nearSphereRight);
      if (distR !== undefined && nearR !== undefined) {
        const addR = nearR - distR;
        updatedFormData[index] = {
          ...updatedFormData[index],
          addRight: Number(addR.toFixed(2)),
        };
      }

      // Left eye ADD
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


  const handleUnitChange = (index: number, value: string) => {
    setFormData((prevFormData) => {
      const updatedFormData = [...prevFormData];
      const selectedItem = items?.find((item) => item.id === updatedFormData[index].itemId);
      if (selectedItem) {
        updatedFormData[index] = {
          ...updatedFormData[index],
          uomId: value,
        };
      }
      return updatedFormData;
    });
  };


  const handleQuantityChange = (index: number, value: string) => {
    const quantity = value || '';

    setFormData((prevFormData) => {
      const updatedFormData = [...prevFormData];
      updatedFormData[index] = {
        ...updatedFormData[index],
        quantity,
      };
      return updatedFormData;
    });
  };

  const handleQuantityPerEyeChange = (
    index: number,
    side: 'quantityRight' | 'quantityLeft',
    value: string,
  ) => {
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
      return updatedFormData;
    });
  };

  const handleQuantityPerEyeStep = (
    index: number,
    side: 'quantityRight' | 'quantityLeft',
    delta: number,
  ) => {
    const row = formData[index];
    const legacyR = parseFloat(row.quantity?.toString() || '0') || 0;
    const current = side === 'quantityRight'
      ? (row.quantityRight ?? legacyR)
      : (row.quantityLeft ?? 0);
    const num = typeof current === 'number' ? current : 0;
    const next = Math.max(0, num + delta);
    handleQuantityPerEyeChange(index, side, String(next));
  };

  const updatedFormData = useMemo(() => {
    return formData.map(item => ({
      ...item,
      totalAmount: (
        (parseFloat(item.quantity?.toString() || '0') *
          parseFloat(item.unitPrice?.toString() || '0'))
      ).toFixed(2),
    }));
  }, [formData]);


  const handleCancel = (index: number) => {
    const updatedFormData = [...formData];
    const filteredData = updatedFormData.filter((_, i) => i !== index);
    setFormData(filteredData);
    const updatedCommission = [...commissionTransactions];
    const filteredCommission = updatedCommission.filter((_, i) => i !== index);
    setCommissionTransactions(filteredCommission);
    setRxCalcRows((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCancelPayment = (index: number) => {
    const updatedData = [...paymentTransactions];
    const filteredData = updatedData.filter((_, i) => i !== index);
    setPaymentTransactions(filteredData);
  };


  useEffect(() => {
    const totalAmount = formData.reduce((acc, c) => {
      const totalPrice = parseFloat(c.totalAmount?.toString() || '0');
      return acc + totalPrice;
    }, 0);

    const totalQuantity = formData.reduce((acc, c) => {
      return acc + (parseFloat(c.quantity?.toString() || '0'));
    }, 0);

    const tax = totalAmount * 0.15;
    const grandTotal = totalAmount + tax;
    let grandTotalWithDiscount = grandTotal;

    if (parseFloat(userInputDiscount) > 0 && parseFloat(userInputDiscount) <= grandTotal) {
      grandTotalWithDiscount = grandTotal - parseFloat(userInputDiscount);
    }

    setOrderInfo((prevOrderInfo) => ({
      ...prevOrderInfo,
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      totalQuantity: parseFloat(totalQuantity.toFixed(2)),
      tax: parseFloat(tax.toFixed(2)),
      grandTotal: parseFloat(grandTotalWithDiscount.toFixed(2)),
    }));

    if (commissionTransactions.length > 0) {
      const totalCommission = commissionTransactions.reduce((acc, c) => {
        return acc + (parseFloat(c.amount?.toString() || '0'));
      }, 0);
      setTotalCommission(parseFloat(totalCommission.toFixed(2)));
    }

    const combination = formData.map((data, index) => {
      const customer = customers?.find((customer) => customer.id === orderInfo.customerId);
      const item = items?.find((item) => item.id === data.itemId);
      if (!customer || !item) return "";
      
      // Add sequence number with leading zero
      const sequenceNumber = String(index + 1).padStart(2, '0');
      return `${orderInfo.series}${sequenceNumber}-${customer.fullName}-${item.name}-${data.width}x${data.height}`;
    });

    setFileName(combination);
  }, [formData, orderInfo.customerId, items, customers, commissionTransactions, userInputDiscount, orderInfo.series]);


  const handleUserInputDiscount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    const discount = parseFloat(value) || '';
    setUserInputDiscount(discount.toString());
  };



  const handleDiscountChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
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
        const selectedItem = items?.find((item) => item.id === updatedFormData[index].itemId);
        const discountItem = discounts?.filter((discount) => discount.items.id === selectedItem?.id);
        // Find the appropriate discount data based on the unit's range

        if (discountItem) {
          const discountData = discountItem.find(discount => {
            const minQuantity = parseInt(discount.unit.toString());
            const nextDiscount = discounts?.find(d => d.unit > parseFloat(minQuantity.toString()));
            const maxQuantity = nextDiscount ? nextDiscount.unit : Infinity;
            return unit >= minQuantity && unit < maxQuantity;
          });

          // If discount data is found, apply the discount
          if (discountData) {
            updatedData[index].level = parseFloat(discountData.level.toString());
            const discountPercentage = parseFloat(discountData.percentage.toString()) / 100;
            updatedData[index].discount = discountPercentage * parseFloat(updatedData[index].unitPrice.toString());
            updatedData[index].totalAmount = updatedData[index].unitPrice - updatedData[index].discount;
          } else {
            // If no discount data is found, reset level and discount
            updatedData[index].level = 0;
            updatedData[index].discount = 0;
            updatedData[index].totalAmount = updatedData[index].unitPrice;
          }
        }
      }

      else {
        // If checkbox is not checked, reset level, discount, and total
        updatedData[index].level = 0;
        updatedData[index].discount = 0;
        updatedData[index].totalAmount = updatedData[index].unitPrice;
      }

      return updatedData;
    });
  };

  const handleCommissionPaymentMethod = (index: number, e: React.ChangeEvent<HTMLSelectElement>) => {
    if (user?.roles !== 'ADMIN') {
      toast.error('You are not authorized to perform this action');
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

  const handleCommissionChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (user?.roles !== 'ADMIN') {
      toast.error('You are not authorized to perform this action');
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

    if(name === 'percentage') {
      const commission = parseFloat(value) / 100 * parseFloat(formData[index]?.unitPrice?.toString() || '0');
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

  const handleCollapseDiscount = () => {
    setCollapseDiscount((prev) => !prev);
  };


  const options = useMemo(
    () => (
      items
        ?.filter((item) => item.can_be_sold === true)
        .map((item) => ({ value: item.id, label: item.name })) || []
    ),
    [items]
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderInfo.customerId) {
      const message = "Please select a customer";
      toast.error(message);
      return;
    }
    if (formData.length === 0) {
      const message = "Please add order items";
      toast.error(message);
      return;
    }
    const missingPricingLine = formData.find(
      (item) => item.itemId && !item.pricingId,
    );
    if (missingPricingLine) {
      toast.error(
        "Pricing is missing for one or more items. Please configure pricing for the selected lens (and base) before creating the order.",
      );
      return;
    }
    const date = new Date();
    const currentYear = date.getFullYear();

    // Get the series number
    const seriesNumber = String(orders?.length).padStart(4, '0'); // Pad with leading zeros if needed
    orderInfo.series = `IAN-O-${seriesNumber}-${currentYear}`;

    const ordeItemData = formData.map((data) => {
      // Check if the service is a non-stock service
      const hasService = !!data.serviceId;
      const isNonStockService =
        hasService && nonStockServices?.some((service) => service.id === data.serviceId);

      const r = data.quantityRight;
      const l = data.quantityLeft;
      const usePerEye =
        typeof r === 'number' && !Number.isNaN(r) && typeof l === 'number' && !Number.isNaN(l);
      const qty = usePerEye ? r + l : parseFloat(data.quantity?.toString() || "0");
      const unit = parseFloat(data.unitPrice?.toString() || "0");
      const lineTotal = Math.round(qty * unit * 100) / 100;

      const quantityPayload = usePerEye
        ? { quantityRight: r, quantityLeft: l, quantity: String(qty) }
        : { quantity: data.quantity };

      return {
        id: data.id,
        itemId: data.itemId,
        ...(hasService
          ? isNonStockService
            ? { nonStockServiceId: data.serviceId, isNonStockService: true }
            : { serviceId: data.serviceId, isNonStockService: false }
          : {}),
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
        orderId: data.orderId,
        // Eyeglass-specific fields: Rx, PD, lens params, base
        sphereRight: data.sphereRight,
        sphereLeft: data.sphereLeft,
        cylinderRight: data.cylinderRight,
        cylinderLeft: data.cylinderLeft,
        axisRight: data.axisRight,
        axisLeft: data.axisLeft,
        addRight: data.addRight,
        addLeft: data.addLeft,
        prismRight: data.prismRight,
        prismLeft: data.prismLeft,
        pd: data.pd,
        pdMonocularRight: data.pdMonocularRight,
        pdMonocularLeft: data.pdMonocularLeft,
        lensType: data.lensType,
        lensMaterial: data.lensMaterial,
        lensCoating: data.lensCoating,
        lensIndex: data.lensIndex,
        baseCurve: data.baseCurve,
        diameter: data.diameter,
        tintColor: data.tintColor,
        itemBaseId: data.itemBaseId,
        pricingId: data.pricingId,
        unit: data.unit,
        baseUomId: data.baseUomId,
      };
    });

    const paymentTermStatus = remainingAmount <= 0
      ? 'Paid'
      : (totaTransaction > 0 ? 'Partially Paid' : 'Pending');

    const paymentData = {
      totalAmount: totaTransaction,
      remainingAmount: remainingAmount,
      status: paymentTermStatus,
      forcePayment: forcePayment,
      transactions: paymentTransactions.map((transaction) => ({
        ...transaction,
        date: new Date(transaction.date),
        status: (transaction.status && transaction.status.toLowerCase() === 'paid') ? 'Paid' : 'Pending',
      })),
    }

    if(paymentData.totalAmount > orderInfo.grandTotal){
      toast.error("Payment amount cannot be greater than the grand total");
      return;
    }

    const commissionData = {
      salesPartnerId: salesPartnerSearch.id,
      totalAmount: totalCommission,
      paidAmount: 0,
      transactions: commissionTransactions.map((transaction) => ({
        ...transaction,
        status: (transaction.status && transaction.status.toLowerCase() === 'paid') ? 'Paid' : 'Pending',
        date: new Date(transaction.date),
      })),
    }

    if (commissionData.totalAmount > 0 && !salesPartnerSearch.id) {
      toast.error("Please select a sales partner if there is a commission");
      return;
    }

    const data = {
      ...orderInfo,
      fileNames: fileName,
      orderItems: ordeItemData,
      paymentTerm: [paymentData],
      commission: commissionData.totalAmount > 0 ? [commissionData] : undefined,
    }

    try {
      await createOrder(data).unwrap();
      toast.success("Order added successfully");
      navigate("/dashboard");
    } catch (error) {
      const fetchError = error as FetchBaseQueryError;
      const errorMessage = handleApiError(fetchError, "Order creation failed");
      toast.error(errorMessage);
    }

  };


  if (isError) return <ErroPage error={error.toString()} />;
  if (isItemsLoading || isCustomersLoading || isLoading || isPricingsLoading || isServicesLoading || isNonStockServicesLoading || isDiscountsLoading) return <Loader />;

  return (
    <>
      <Breadcrumb pageName="New Order" />
      <section className="bg-white dark:bg-boxdark">
        <form onSubmit={handleSubmit}>
          <>
            <div className="grid sm:grid-cols-3 sm:gap-6 mb-4 p-4">
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
                <label htmlFor="orderDate" className="mb-3 block text-black dark:text-white">
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
                <label htmlFor="deliveryDate" className="mb-3 block text-black dark:text-white">
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
              <div className="">
                <label htmlFor="prescriptionDate" className="mb-3 block text-black dark:text-white">
                  Prescription Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    name="prescriptionDate"
                    onChange={handleDateChange}
                    value={orderInfo.prescriptionDate || ""}
                    id="prescriptionDate"
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
                  <option value="">Select order source</option>
                  <option value="telegram">Telegram</option>
                  <option value="phone">Phone</option>
                  <option value="In person">In person</option>
                  <option value="whatsapp">Whatsapp</option>
                </select>
              </div>
              <div>
                <label
                  htmlFor="optometristName"
                  className="mb-3 block text-black dark:text-white"
                >
                  Optometrist name
                </label>
                <input
                  type="text"
                  name="optometristName"
                  id="optometristName"
                  value={orderInfo.optometristName || ""}
                  onChange={(e) =>
                    setOrderInfo((prev) => ({
                      ...prev,
                      optometristName: e.target.value,
                    }))
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="e.g. Dr. Smith"
                />
              </div>
              <div>
                <label
                  htmlFor="urgency"
                  className="mb-3 block text-black dark:text-white"
                >
                  Urgency
                </label>
                <select
                  id="urgency"
                  name="urgency"
                  value={orderInfo.urgency || ""}
                  onChange={(e) =>
                    setOrderInfo((prev) => ({
                      ...prev,
                      urgency: e.target.value,
                    }))
                  }
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="">Select urgency</option>
                  <option value="STANDARD">Standard</option>
                  <option value="RUSH">Rush</option>
                </select>
              </div>
            </div>


            <div>
              <button
                type="button"
                className="text-black dark:text-white w-full py-2 px-4 border-t border-b border-[#eee] mb-4 font-semibold flex items-center gap-4"
              >
                Orders List{" "}
              </button>
              <Tabs tabs={tabs} activeTabId={activeTabId} onTabChange={handleTabChange} />
              {activeTabId === 'general' && (
                <div className="rounded-sm border border-stroke border-t-0 bg-white dark:border-strokedark dark:bg-boxdark">
                  <div className="max-w-full overflow-x-auto">
                    <div className="max-w-full px-4">
                      <table className="w-full table-auto">
                        <thead>
                          <tr className="bg-gray-2 text-left dark:bg-meta-4">
                            <th className="py-4 px-4 font-medium text-black dark:text-white">
                              No
                            </th>
                            <th
                              className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white"
                            >
                              Item
                            </th>
                            <th
                              className="py-4 px-4 font-medium text-black dark:text-white"
                            >
                              UOM
                            </th>
                            <th
                              className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white"
                            >
                              Quantity
                            </th>
                            <th
                              className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white"
                            >
                              U.Price
                            </th>
                            <th className="py-4 px-4 font-medium text-black dark:text-white">
                              Rx
                            </th>
                            <th
                              className="py-4 px-4 font-medium text-black dark:text-white"
                            >
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
                              <td colSpan={7} className="text-center">
                                No data found
                              </td>
                            </tr>
                          )}
                          {formData &&
                            updatedFormData.map((data, index) => (
                              <>
                              <tr
                                key={index}
                              >
                                <td className="border-b text-graydark dark:text-white border-[#eee] py-2 px-4 dark:border-strokedark">
                                  {index + 1}
                                </td>
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
                                <td className="py-2 border-b text-graydark dark:text-white border-[#eee] dark:border-strokedark">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <div className="flex items-center gap-0.5">
                                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 w-8 shrink-0">R</span>
                                      <button
                                        type="button"
                                        title="Decrease right quantity"
                                        onClick={() => handleQuantityPerEyeStep(index, 'quantityRight', -1)}
                                        className="flex h-8 w-7 shrink-0 items-center justify-center rounded border border-stroke bg-gray-100 text-sm font-medium hover:bg-gray-200 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-3"
                                      >
                                        −
                                      </button>
                                      <input
                                        title="Quantity right eye"
                                        type="number"
                                        min={0}
                                        value={data.quantityRight ?? data.quantity ?? ''}
                                        onChange={(e) =>
                                          handleQuantityPerEyeChange(index, 'quantityRight', e.target.value)
                                        }
                                        className="h-8 w-10 rounded border border-stroke bg-transparent px-0.5 text-center text-sm font-medium outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                                      />
                                      <button
                                        type="button"
                                        title="Increase right quantity"
                                        onClick={() => handleQuantityPerEyeStep(index, 'quantityRight', 1)}
                                        className="flex h-8 w-7 shrink-0 items-center justify-center rounded border border-stroke bg-gray-100 text-sm font-medium hover:bg-gray-200 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-3"
                                      >
                                        +
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-0.5">
                                      <span className="text-[10px] font-medium text-gray-500 dark:text-gray-400 w-8 shrink-0">L</span>
                                      <button
                                        type="button"
                                        title="Decrease left quantity"
                                        onClick={() => handleQuantityPerEyeStep(index, 'quantityLeft', -1)}
                                        className="flex h-8 w-7 shrink-0 items-center justify-center rounded border border-stroke bg-gray-100 text-sm font-medium hover:bg-gray-200 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-3"
                                      >
                                        −
                                      </button>
                                      <input
                                        title="Quantity left eye"
                                        type="number"
                                        min={0}
                                        value={data.quantityLeft ?? ''}
                                        onChange={(e) =>
                                          handleQuantityPerEyeChange(index, 'quantityLeft', e.target.value)
                                        }
                                        className="h-8 w-10 rounded border border-stroke bg-transparent px-0.5 text-center text-sm font-medium outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                                      />
                                      <button
                                        type="button"
                                        title="Increase left quantity"
                                        onClick={() => handleQuantityPerEyeStep(index, 'quantityLeft', 1)}
                                        className="flex h-8 w-7 shrink-0 items-center justify-center rounded border border-stroke bg-gray-100 text-sm font-medium hover:bg-gray-200 dark:border-strokedark dark:bg-meta-4 dark:hover:bg-meta-3"
                                      >
                                        +
                                      </button>
                                    </div>
                                    <div className="flex items-center gap-1 border-l border-stroke pl-2 dark:border-strokedark">
                                      <span className="text-[10px] text-gray-500 dark:text-gray-400 shrink-0">Total</span>
                                      <input
                                        title="Quantity total (or single)"
                                        type="number"
                                        name="quantity"
                                        value={data.quantity}
                                        min={0}
                                        required
                                        onChange={(e) => handleQuantityChange(index, e.target.value)}
                                        className="h-8 w-10 rounded border border-stroke bg-transparent px-0.5 text-center text-sm font-medium outline-none transition focus:border-primary dark:border-strokedark dark:bg-form-input dark:text-white"
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="py-2 border-b text-graydark dark:text-white border-[#eee] dark:border-strokedark">
                                  {data.unitPrice}
                                </td>
                                <td className="py-2 border-b text-graydark dark:text-white border-[#eee] dark:border-strokedark">
                                  <button
                                    type="button"
                                    className="rounded border border-stroke px-2 py-1 text-xs font-medium hover:bg-gray-100 dark:hover:bg-gray-700"
                                    onClick={() =>
                                      setActiveRxRow((prev) => (prev === index ? null : index))
                                    }
                                  >
                                    {activeRxRow === index ? "Hide Rx" : "Edit Rx"}
                                  </button>
                                </td>
                                <td className="px-4 py-2 border-b text-graydark dark:text-white border-[#eee] dark:border-strokedark">
                                  <button
                                    onClick={() => handleCancel(index)}
                                    title="action"
                                    type="button"
                                    className="flex items-center justify-between gap-2 text-graydark dark:text-white font-medium rounded-lg text-lg px-2.5 py-2.5 text-center"
                                  >
                                    <IoMdClose />
                                  </button>
                                </td>
                              </tr>
                              {activeRxRow === index && (
                                <tr>
                                  <td
                                    colSpan={7}
                                    className="bg-gray-50 dark:bg-boxdark p-4 border border-t-0 border-[#eee] dark:border-strokedark"
                                  >
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
                                                handleRxCalcChange(
                                                  index,
                                                  "distanceSphereRight",
                                                  e.target.value,
                                                )
                                              }
                                            />
                                            <input
                                              type="number"
                                              step="0.01"
                                              placeholder="Near SPH (for ADD)"
                                              className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                              value={rxCalcRows[index]?.nearSphereRight ?? ""}
                                              onChange={(e) =>
                                                handleRxCalcChange(
                                                  index,
                                                  "nearSphereRight",
                                                  e.target.value,
                                                )
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
                                                handleRxCalcChange(
                                                  index,
                                                  "distanceSphereLeft",
                                                  e.target.value,
                                                )
                                              }
                                            />
                                            <input
                                              type="number"
                                              step="0.01"
                                              placeholder="Near SPH (for ADD)"
                                              className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                              value={rxCalcRows[index]?.nearSphereLeft ?? ""}
                                              onChange={(e) =>
                                                handleRxCalcChange(
                                                  index,
                                                  "nearSphereLeft",
                                                  e.target.value,
                                                )
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
                                              handleRxNumberChange(
                                                index,
                                                "pdMonocularRight",
                                                e.target.value,
                                              )
                                            }
                                          />
                                          <input
                                            type="number"
                                            step="0.1"
                                            placeholder="Monocular PD (Left)"
                                            className="w-full rounded border border-stroke bg-transparent py-1 px-2 text-xs font-medium outline-none dark:border-form-strokedark dark:bg-form-input dark:text-white"
                                            value={data.pdMonocularLeft ?? ""}
                                            onChange={(e) =>
                                              handleRxNumberChange(
                                                index,
                                                "pdMonocularLeft",
                                                e.target.value,
                                              )
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
                                                  // Update pricing info when base changes
                                                  fetchOrderInfoForRow(
                                                    index,
                                                    updatedFormData[index].itemId,
                                                    updatedFormData[index].itemBaseId,
                                                  );
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
                                          {data.itemId && data.itemBaseId && itemBasesMap[data.itemId] && (
                                            (() => {
                                              const basesForItem = itemBasesMap[data.itemId] || [];
                                              const baseForRow = basesForItem.find((b) => b.id === data.itemBaseId);
                                              const { right: rightValues, left: leftValues } = computeToolValues(data, baseForRow);
                                              const labTools = labToolsData?.labTools ?? [];
                                              const hasAny = rightValues.length > 0 || leftValues.length > 0;
                                              if (!hasAny) return null;

                                              const missingRight = labTools.length
                                                ? findMissingToolValues(rightValues, labTools)
                                                : [];
                                              const missingLeft = labTools.length
                                                ? findMissingToolValues(leftValues, labTools)
                                                : [];

                                              const lineRight =
                                                rightValues.length > 0
                                                  ? `Right: ${rightValues.join(", ")}`
                                                  : null;
                                              const lineLeft =
                                                leftValues.length > 0
                                                  ? `Left: ${leftValues.join(", ")}`
                                                  : null;
                                              const calculatedLine = [lineRight, lineLeft].filter(Boolean).join(". ");

                                              return (
                                                <>
                                                  <p className="mt-1 text-[11px] font-medium text-black dark:text-white">
                                                    Calculated tools — {calculatedLine}
                                                  </p>
                                                  {labTools.length > 0 && (
                                                    <div className="mt-0.5 space-y-0.5">
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
                                                    </div>
                                                  )}
                                                </>
                                              );
                                            })()
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
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                              </>
                            ))}
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
                    <button
                      type="button"
                      className="flex items-center justify-center rounded border-[1.5px] border-stroke bg-transparent px-2 py-1 font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-primary dark:hover:text-primary transition-colors"
                    >
                      Download
                    </button>
                  </div>
                </div>
              )}

              {activeTabId === "payment-terms" && (
                <div
                  className={`${user?.roles !== "ADMIN" && user?.roles !== "FINANCE"
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
                              className={`mr-4 flex h-5 w-5 items-center justify-center rounded border border-graydark ${forcePayment === true ? 'border-primary bg-gray dark:bg-transparent' : 'border-gray dark:border-strokedark bg-transparent'
                                }`}
                            >
                              <span
                                className={`h-2.5 w-2.5 rounded-sm ${forcePayment === true ? 'bg-primary' : 'bg-transparent'}`}
                              >
                              </span>
                            </div>
                          </div>
                        </label>
                        <span className="absolute left-12 top-1.5">Force payment</span>
                      </div>
                    </div>
                    <div className="flex justify-between p-4">
                      <strong className="text-graydark">
                        Payment Totals
                      </strong>
                      <div className="text-graydark">
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
                            {totaTransaction}
                          </span>
                        </p>
                        <p className="flex gap-4 justify-between">
                          <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            Remaining amount :
                          </span>
                          <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                            {remainingAmount}
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
                        {paymentTransactions && paymentTransactions.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center">
                              No data found
                            </td>
                          </tr>
                        )}
                        {paymentTransactions &&
                          paymentTransactions.map((data, index) => (
                            <tr key={index}>
                              <td className="py-2 px-4 border-b text-graydark border-[#eee] dark:border-strokedark">
                                {index + 1}
                              </td>
                              <td className="py-2 px-4 border-b text-graydark border-[#eee] dark:border-strokedark">
                                {data.date}
                              </td>

                              <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
                                <label
                                  htmlFor={`${data.paymentMethod}s-${index}`}
                                  className="sr-only peer"
                                >
                                  Select an option
                                </label>
                                <select
                                  title="paymentMethod"
                                  onChange={(e) => handlePaymentMethod(index, e)}
                                  name="paymentMethod"
                                  value={data.paymentMethod}
                                  required
                                  className="w-full rounded bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                >
                                  <option value="cash">Cash</option>
                                  <option value="bank-transfer">Bank Transfer</option>
                                  <option value="mobile-banking">Mobile Banking</option>
                                  <option value="check">Check</option>
                                </select>
                              </td>

                              <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
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
                                  className="w-full rounded bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                  onChange={(e) => handleFormChange(index, e)}
                                />
                              </td>
                              <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
                                <label
                                  htmlFor={`${data.amount}-${index}`}
                                  className="sr-only peer"
                                >
                                  Payment amount
                                </label>
                                <input
                                  type="number"
                                  name="amount"
                                  required
                                  value={data.amount}
                                  title="amount"
                                  className="w-full rounded bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                  onChange={(e) => handleFormChange(index, e)}
                                />
                              </td>
                              <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
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
                                  required
                                  className="w-full rounded bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                  onChange={(e) => handleFormChange(index, e)}
                                />
                              </td>
                              <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
                                <span
                                  className={`${data?.status === "paid"
                                    ? "bg-success/10 text-success/80 font-medium me-2 px-2.5 py-0.5 rounded dark:bg-success/90 dark:text-success/30"
                                    : "bg-primary/10 text-primary/80 font-medium me-2 px-2.5 py-0.5 rounded dark:bg-primary/90 dark:text-primary/30"
                                    }`}
                                >
                                  {data?.status}
                                </span>
                              </td>
                              <td className="px-4 py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
                                <button
                                  onClick={() => handleCancelPayment(index)}
                                  title="action"
                                  type="button"
                                  className="text-black font-medium rounded-lg text-sm px-5 py-2.5 text-center"
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
                  className={`${user?.roles !== "ADMIN" && user?.roles !== "FINANCE"
                    ? "hidden"
                    : ""
                    }`}
                >
                  <div
                    className={`grid grid-cols-2 gap-4 px-4 mb-4`}>
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
                        required
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
                            <td colSpan={9} className="text-center">
                              No data found
                            </td>
                          </tr>
                        )}
                        {
                          formData.map((data, index) => (
                            <tr key={index}>
                              <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
                                {index + 1}
                              </td>
                              <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
                                {commissionTransactions[index]?.date || new Date().toLocaleDateString()}
                              </td>
                              <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
                                {items?.find((item) => item.id === data.itemId)?.name}
                              </td>
                              <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
                                <input
                                  title="description"
                                  type="text"
                                  name="description"
                                  id="description"
                                  className="w-full rounded bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                  value={commissionTransactions[index]?.description}
                                  onChange={(e) => handleCommissionChange(index, e)}
                                />
                              </td>
                              <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
                                <label
                                  htmlFor={`${commissionTransactions[index]?.paymentMethod}-${index}`}
                                  className="sr-only peer"
                                >
                                  Select an option
                                </label>
                                <select
                                  title="paymentMethod"
                                  onChange={(e) => handleCommissionPaymentMethod(index, e)}
                                  name="paymentMethod"
                                  value={commissionTransactions[index]?.paymentMethod}
                                  defaultValue='cash'
                                  required
                                  className="w-full rounded bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                                >
                                  <option value="cash">Cash</option>
                                  <option value="bank-transfer">Bank Transfer</option>
                                  <option value="mobile-banking">Mobile Banking</option>
                                  <option value="check">Check</option>
                                </select>
                              </td>
                              <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
                                <input
                                  title="percentage"
                                  type="number"
                                  name="percentage"
                                  className="w-full rounded bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                  required
                                  min={0}
                                  value={commissionTransactions[index]?.percentage}
                                  onChange={(e) => handleCommissionChange(index, e)}
                                />
                              </td>
                              <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
                                <input
                                  title="reference"
                                  type="text"
                                  name="reference"
                                  id="reference"
                                  className="w-full rounded bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                  required
                                  min={0}
                                  value={commissionTransactions[index]?.reference}
                                  onChange={(e) => handleCommissionChange(index, e)}
                                />
                              </td>
                              <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
                                {commissionTransactions[index]?.amount}
                              </td>
                              <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
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
                                <td colSpan={7} className="text-center">
                                  No data found
                                </td>
                              </tr>
                            )}
                            {
                              formData.map((data, index) => (
                                <tr key={index}>
                                  <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
                                    {index + 1}
                                  </td>
                                  <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
                                    {items?.find((item) => item.id === data.itemId)?.name}
                                  </td>
                                  <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
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
                                          onChange={(e) => handleDiscountChange(index, e)}
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
                                  <td className="px-4 py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
                                    {data.level}
                                  </td>
                                  <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
                                    {data.unit}
                                  </td>
                                  <td className="px-4 py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
                                    {data.unitPrice.toFixed(2)}
                                  </td>
                                  <td className="py-2 border-b text-graydark border-[#eee] dark:border-strokedark">
                                    {data.totalAmount.toFixed(2)}
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
                          className="text-black dark:text-white w-full py-2 px-4 border-t border-[#eee] border-b mb-4 font-semibold flex items-center gap-4"
                        >
                          Additional Discount{" "}
                          <span className="font-thin">
                            {collapseDisount ? <FaChevronUp /> : <FaChevronDown />}{" "}
                          </span>{" "}
                        </button>
                      </div>
                      <div
                        className="flex justify-end items-center gap-4 pb-4"
                      >
                        <div
                          className={`${collapseDisount ? "hidden" : ""
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



              <div className="flex justify-between pt-4 px-4">
                <strong className="text-graydark">
                  Totals
                </strong>
                <div className="text-graydark">
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
                      Tax(15%)
                    </span>
                    <span className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                      {orderInfo.tax.toLocaleString()}
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
          </>
          <div className="p-4 flex justify-between">
            <div className="w-1/2">
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
            <div>
              <p className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
                File Names
              </p>
              <ul className="space-y-4 text-left text-gray-500 dark:text-gray-400">
                {fileName.map((item, index) => (
                  <li
                    key={index}
                    className="flex items-center space-x-3 rtl:space-x-reverse"
                  >
                    <svg
                      className="flex-shrink-0 w-3.5 h-3.5 text-green-500 dark:text-green-400"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 16 12"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5.917 5.724 10.5 15 1.5"
                      />
                    </svg>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <button
            type="submit"
            disabled={isCreating}
            className="flex justify-center rounded bg-primary p-3 font-medium text-gray">
            Submit
          </button>
        </form>
      </section>
    </>
  );
};
