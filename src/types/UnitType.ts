import { ItemType } from "./ItemType";
import { UoMType } from "./UomType";

export interface UnitType {
    id: string;
    name: string;
    description: string;
    constant: boolean;
    constantValue: number;
    items: ItemType[];
    uoms: UoMType[];
}