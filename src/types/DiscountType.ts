import { ItemType } from "./ItemType";

export interface DiscountType {
    id: string;
    itemId: string;
    level: number;
    percentage: number;
    unit: number;
    items: ItemType;
    description: string;
    createdAt: string;
    updatedAt: string;
    }