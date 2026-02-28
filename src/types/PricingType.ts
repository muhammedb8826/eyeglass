import { ItemType } from "./ItemType";
import { ServiceType } from "./ServiceType";
import { ItemBaseType } from "./ItemBaseType";

export interface PricingType {
    id: string;
    itemId: string;
    itemBaseId?: string | null;
    serviceId?: string | null;
    nonStockServiceId?: string | null;
    isNonStockService?: boolean;
    sellingPrice: number;
    costPrice: number;
    baseUomId: string;
    constant: boolean;
    height?: number;
    width?: number;
    item: ItemType;
    itemBase?: ItemBaseType | null;
    service?: ServiceType;
    nonStockService?: ServiceType;
    createdAt?: string;
    updatedAt?: string;
}