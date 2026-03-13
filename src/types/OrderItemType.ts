import { ItemType } from "./ItemType";
import { OrderItemNotes } from "./OrderItemNotes";
import { OrderType } from "./OrderType";
import { ServiceType } from "./ServiceType";
import { UoMType } from "./UomType";
import { ItemBaseType } from "./ItemBaseType";

export interface OrderItemType {
    id: string;
    itemId: string;
    serviceId?: string;
    nonStockServiceId?: string;
    isNonStockService?: boolean;
    pricingId: string;
    width: string;
    height: string;
    discount: number,
    level: number,
    totalAmount: number,
    adminApproval: false,
    uomId: string,
    quantity: string,
    quantityRight?: number,
    quantityLeft?: number,
    unitPrice: number,
    description: "",
    isDiscounted: boolean,
    status: string,
    servicesOptions?: ServiceType[],
    uomsOptions?: UoMType[],
    orderId?: string
    orderItemNotes?: OrderItemNotes[]
    item?: ItemType,
    constant?: boolean,
    baseUomId: string,
    unit: number
    order?: OrderType
    service?: ServiceType
    nonStockService?: ServiceType
    uom?: UoMType

    // Operational workflow fields
    approvalStatus?: string;
    qualityControlStatus?: string;

    // Eyeglass prescription fields
    sphereRight?: number;
    sphereLeft?: number;
    cylinderRight?: number;
    cylinderLeft?: number;
    axisRight?: number;
    axisLeft?: number;
    addRight?: number;
    addLeft?: number;

    pd?: number;
    pdMonocularRight?: number;
    pdMonocularLeft?: number;

    lensType?: string;
    lensMaterial?: string;
    lensCoating?: string;
    lensIndex?: number;
    baseCurve?: number;
    diameter?: number;
    tintColor?: string | null;

    prismRight?: number;
    prismLeft?: number;

    itemBaseId?: string;
    itemBase?: ItemBaseType;

    // Store request / issue tracking
    storeRequestStatus?: "None" | "Requested" | "Issued";
    operatorId?: string;
}