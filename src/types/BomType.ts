import type { UoMType } from "./UomType";
import type { ItemType } from "./ItemType";

export interface BomType {
  id: string;
  parentItemId: string;
  componentItemId: string;
  quantity: number;
  uomId: string;

  // Expanded relations (optional)
  componentItem?: ItemType;
  uom?: UoMType;
}

