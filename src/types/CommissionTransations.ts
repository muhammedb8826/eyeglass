export interface CommissionTransations {
    id?: string,
    date: Date,
    amount: number,
    percentage: number,
    paymentMethod: string,
    reference: string,
    description: string,
    status: string,
    commissionId?: string,
}