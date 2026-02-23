import { CommissionTransations } from "./CommissionTransations";
import { OrderType } from "./OrderType";
import { SalesPartnerType } from "./SalesPartnerType";

export interface CommissionType {
    salesPartnerId : string,
    totalAmount: number,
    paidAmount: number,
    transactions: CommissionTransations[]
    id?: string
    orderId?: string
    salesPartner?: SalesPartnerType
    order?: OrderType
}  