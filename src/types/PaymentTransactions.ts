export interface PaymentTransactions {
        date: Date,
        paymentMethod: string,
        reference: string,
        amount: number,
        status: string,
        description: string,
        paymentTermId?: string,
}