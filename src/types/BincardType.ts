import { ItemBaseType } from "./ItemBaseType";
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
  /** When set, `balanceAfter` is for this base/ADD variant; when null, parent-item (legacy) balance */
  itemBaseId?: string | null;
  itemBase?: Pick<ItemBaseType, "id" | "baseCode" | "addPower">;
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
