import { SaleItem } from "./SaleItem";
import { UserType } from "./UserType";

export interface SaleType {
    id: string;
    series: string;
    vendorId: string;
    purchaseRepresentativeId?: string;
    status: string;
    orderDate: Date; // Use Date if you convert it to Date object in your app
    paymentMethod: string;
    amount: number;
    reference: string;
    totalAmount: number;
    totalQuantity: number;
    note: string;
    saleItems: SaleItem[];
    operator: UserType;
}