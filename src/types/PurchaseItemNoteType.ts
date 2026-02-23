import { UserType } from "./UserType";

export interface PurchaseItemNoteType {
    id?: string;
    text: string;
    hour?: string;
    date?: string;
    userId: string;
    purchaseItemId: string;
    user?: UserType;
}