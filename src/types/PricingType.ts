import { ItemType } from "./ItemType";
import { ServiceType } from "./ServiceType";

export interface PricingType {
    id: string;
    itemId: string;
    serviceId?: string;
    nonStockServiceId?: string;
    sellingPrice: number;
    costPrice: number;
    service?: ServiceType;
    nonStockService?: ServiceType;
    item: ItemType;
    baseUomId: string;
    constant: boolean;
    height: number;
    width: number;
    isNonStockService?: boolean;
    createdAt?: string;
    updatedAt?: string;
}