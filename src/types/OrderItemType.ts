import { ItemType } from "./ItemType";
import { OrderItemNotes } from "./OrderItemNotes";
import { OrderType } from "./OrderType";
import { ServiceType } from "./ServiceType";
import { UoMType } from "./UomType";

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
}