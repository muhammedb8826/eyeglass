import { ItemType } from "./ItemType";
import { PurchaseItemNoteType } from "./PurchaseItemNoteType";
import { PurchaseType } from "./PurchaseType";
import { UoMType } from "./UomType";
import { VendorType } from "./VendorType";

export interface PurchaseItem {
    id: string;
    purchaseId?: string;
    itemId: string;
    uomId: string,
    quantity: number;
    unitPrice: number;
    amount: number;
    description?: string;
    status?: string;
    item?: ItemType;
    unit: number;
    baseUomId?: string;
    purchaseItemNotes?: PurchaseItemNoteType[]
    uomsOptions?: UoMType[],
    purchase?: PurchaseType;
    uoms?: UoMType
    vendor?: VendorType
  }