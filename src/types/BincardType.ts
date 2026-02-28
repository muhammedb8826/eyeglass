import { ItemType } from "./ItemType";
import { UoMType } from "./UomType";

/** IN = stock in, OUT = stock out */
export type BincardMovementType = "IN" | "OUT";

/** Source of the movement */
export type BincardReferenceType =
  | "OPENING"
  | "ORDER"
  | "SALE"
  | "PURCHASE"
  | "ADJUSTMENT";

export interface BincardEntryType {
  id: string;
  itemId: string;
  movementType: BincardMovementType;
  quantity: number;
  balanceAfter: number;
  referenceType: BincardReferenceType;
  referenceId?: string;
  description?: string;
  uomId: string;
  createdAt: string;
  item?: ItemType;
  uom?: UoMType;
}

export interface BincardByItemResponse {
  entries: BincardEntryType[];
  total: number;
}
