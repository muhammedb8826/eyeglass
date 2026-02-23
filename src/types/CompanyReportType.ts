export interface ReportDataItem {
    date: string;
    customerName: string;
    unit: number;
    quantity: number;
    metersquare: number;
    costPrice: number;
    totalCost: number;
    sellingPrice: number;
    sales: number;
    commission: number;
    dailyFixedCost: number;
    profit: number;
    orderId: string;
    itemName: string;
    serviceName: string;
}

export interface CompanyReportTotals {
    totalQuantity: number;
    totalMetersquare: number;
    totalCost: number;
    totalSales: number;
    totalCommission: number;
    totalDailyFixedCost: number;
    constantDailyFixedCost: number;
    totalProfit: number;
    numberOfDays: number;
    ordersCount: number;
}