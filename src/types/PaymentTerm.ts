import { PaymentTransactions } from "./PaymentTransactions";

export interface PaymentTerm {
    id?: string,
    totalAmount: number,
    remainingAmount: number,
    status: string,
    forcePayment: boolean,
    transactions: PaymentTransactions[]
    orderId?: string
}