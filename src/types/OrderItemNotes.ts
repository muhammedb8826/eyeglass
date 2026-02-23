import { UserType } from "./UserType";

export interface OrderItemNotes {
    id?: string;
    text: string;
    hour?: string;
    date?: string;
    userId: string;
    orderItemId: string;
    user?: UserType;
}