import { PaymentTerm } from './PaymentTerm';
import { OrderItemType } from "./OrderItemType";
import { CommissionType } from './CommissionType';
import { CustomerType } from './CustomerType';

export interface OrderType {
    id:string;
    series: string;
    customerId: string,
    status: string,
    orderSource: string,
    orderDate: string,
    deliveryDate: string,
    prescriptionDate?: string;
    optometristName?: string;
    urgency?: string;
    totalAmount: number,
    tax: number,
    grandTotal: number,
    totalQuantity: number,
    internalNote: string
    adminApproval: boolean,
    orderItems: OrderItemType[],
    paymentTerm?: PaymentTerm[],
    commission?: CommissionType[],
    customer?: CustomerType,
}