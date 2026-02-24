import { MachineType } from "./MachineType";
import { ServiceType } from "./ServiceType";
import { UoMType } from "./UomType";

export interface ItemType {
    id: string;
    itemCode?: string;
    name: string;
    description: string;
    initial_stock: number;
    reorder_level: number;
    updated_initial_stock: number;
    machineId: string;
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
    machine: MachineType;
    purchaseUom: UoMType;
    defaultUom: UoMType;

    // Lens metadata for eyeglass blanks
    lensMaterial?: string;
    lensIndex?: number;
    lensType?: string;
}