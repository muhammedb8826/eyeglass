import { PurchaseItem } from "./PurchaseItem";
import { UserType } from "./UserType";
import { VendorType } from "./VendorType";

export interface PurchaseType {
  id: string;
  series: string;
  vendorId: string;
  purchaserId?: string;
  status: string;
  orderDate: Date; // Use Date if you convert it to Date object in your app
  paymentMethod: string;
  amount: number;
  reference: string;
  totalAmount: number;
  totalQuantity: number;
  note: string;
  purchaseItems: PurchaseItem[];
  vendor: VendorType;
  purchaser: UserType;
}