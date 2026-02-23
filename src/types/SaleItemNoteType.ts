import { UserType } from "./UserType";

export interface SaleItemNoteType {
    id?: string;
    text: string;
    hour?: string;
    date?: string;
    userId: string;
    saleItemId: string;
    user?: UserType;
}