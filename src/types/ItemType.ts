import { ServiceType } from "./ServiceType";
import { UoMType } from "./UomType";
import { ItemBaseType } from "./ItemBaseType";
import type { BomType } from "./BomType";

export interface ItemType {
    id: string;
    itemCode?: string;
    name: string;
    description: string;
    reorder_level: number;
    createdAt: string;
    updatedAt: string;
    can_be_sold: boolean;
    can_be_purchased: boolean;
    purchase_price: number;
    selling_price: number
    quantity: number;
    purchaseUomId: string
    defaultUomId: string;
    services:ServiceType[];
    unitCategory: {
        constantValue: number;
        uoms: UoMType[];
        constant: boolean;
    },
    purchaseUom: UoMType;
    defaultUom: UoMType;
    itemBases?: ItemBaseType[];
    bomLines?: BomType[];
}