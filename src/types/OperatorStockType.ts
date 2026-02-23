import { ItemType } from "./ItemType";
import { UnitType } from "./UnitType";

export interface OperatorStockType {
    id: string;
    itemId: string;
    unitId: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    description?: string;
    status?: string;
    item?: ItemType;
    unit?: UnitType;
    baseUomId: string;
}