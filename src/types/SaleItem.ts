import { ItemType } from "./ItemType";
import { SaleItemNoteType } from "./SaleItemNoteType";
import { UoMType } from "./UomType";

export interface SaleItem {
    id: string;
    saleId?: string;
    itemId: string;
    uomId: string;
    quantity: number;
    description?: string;
    status?: string;
    item?: ItemType;
    unit: number;
    baseUomId?: string;
    saleItemNotes?: SaleItemNoteType[]
    uomsOptions?: UoMType[]
}