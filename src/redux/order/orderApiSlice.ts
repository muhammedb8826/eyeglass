import { OrderType } from "@/types/OrderType";
import { apiSlice } from "../api/apiSlice";
import { OrderItemType } from "@/types/OrderItemType";
import { CompanyReportTotals, ReportDataItem } from "@/types/CompanyReportType";

interface OrderResponse {
    orders: OrderType[];
    total: number;
    grandTotalSum: number;
}

interface OrderItemResponse {
    orderItems: OrderItemType[];
    total: number;
    totalAmountSum: number;
}

interface ProfitResponse {
    profit: number;
    totalRevenue: number;
    totalCost: number;
    orderCount: number;
}

interface CompanyReportResponse {
    reportData: ReportDataItem[];
    totals: CompanyReportTotals;
}

export const orderApiSlice = apiSlice.injectEndpoints({
    endpoints: builder => ({
        getOrders: builder.query<OrderResponse, { page: number; limit: number; search?: string; startDate?: string; endDate?: string; deliveryDate?: string; item1?: string; item2?: string; item3?: string }>({
            query: ({ page, limit, search, startDate, endDate, deliveryDate, item1, item2, item3 }) => {

                const params: Record<string, string | number> = { page, limit };

                if (search) params.search = search;
                if (startDate) params.startDate = startDate;
                if (endDate) params.endDate = endDate;
                if (deliveryDate) params.deliveryDate = deliveryDate;
                if (item1) params.item1 = item1;
                if (item2) params.item2 = item2;
                if (item3) params.item3 = item3;
                return {
                    url: `/orders`,
                    params,
                    method: 'GET'
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.orders.map((order) => ({ type: 'Orders' as const, id: order.id })),
                        { type: 'Orders', id: 'LIST' },
                    ]
                    : [{ type: 'Orders', id: 'LIST' }],
        }),
        getAllOrders: builder.query<OrderType[], void>({
            query: () => '/orders/all',
            providesTags: ['Orders']
        }),
        getOrder: builder.query<OrderType, string>({
            query: (id) => ({
                url: `/orders/${id}`,
                method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{ type: 'Orders', id }]
        }),
        createOrder: builder.mutation<OrderType, Partial<OrderType>>({
            query: (formData) => ({
                url: '/orders',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['Orders']
        }),
        updateOrder: builder.mutation({
            query: (formData) => ({
                url: `/orders/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [{ type: 'Orders', id: formData.id }]
        }),
        deleteOrder: builder.mutation<OrderType, string>({
            query: (id) => ({
                url: `/orders/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Orders', id }, { type: 'Orders', id: 'LIST' }]
        }),
        getOrderItems: builder.query<OrderItemType[], string>({
            query: (orderId) => ({
                url: `/order-items/${orderId}`,
                method: 'GET'
            }),
            providesTags: (_result, _error, id) => [{ type: 'Orders', id }]
        }),
        getAllorderItems: builder.query<OrderItemResponse, { page: number; limit: number; search?: string; startDate?: string; endDate?: string; item?: string; status?: string;}>({
            query: ({ page, limit, search, startDate, endDate, item, status }) => {
                const params: Record<string, string | number> = { page, limit };

                if (search) params.search = search;
                if (startDate) params.startDate = startDate;
                if (endDate) params.endDate = endDate;
                if (item) params.item = item;
                if (status) params.status = status;
                return {
                url: `/order-items/all`,
                params,
                method: 'GET'
                };
            },
            providesTags: (result) =>
                result
                    ? [
                        ...result.orderItems.map((orderItem) => ({ type: 'Orders' as const, id: orderItem.id })),
                        { type: 'Orders', id: 'LIST' },
                    ]
                    : [{ type: 'Orders', id: 'LIST' }],
        }),
        createOrderItem: builder.mutation<OrderItemType, Partial<OrderType>>({
            query: (formData) => ({
                url: '/order-items',
                method: 'POST',
                body: formData
            }),
            invalidatesTags: ['Orders']
        }),
        updateOrderItem: builder.mutation({
            query: (formData) => ({
                url: `/order-items/${formData.id}`,
                method: 'PATCH',
                body: formData
            }),
            invalidatesTags: (_result, _error, formData) => [
                { type: 'Orders', id: formData.orderId }, // Invalidate the related Order
                { type: 'Orders', id: formData.id },      // Invalidate the updated OrderItem
            ],
        }),
        deleteOrderItem: builder.mutation<OrderItemType, string>({
            query: (id) => ({
                url: `/order-items/${id}`,
                method: 'DELETE'
            }),
            invalidatesTags: (_result, _error, id) => [{ type: 'Orders', id }, { type: 'Orders', id: 'LIST' }]
        }),
        calculateFilteredProfit: builder.query<ProfitResponse, { startDate?: string; endDate?: string; search?: string; item1?: string; item2?: string; item3?: string }>({
            query: ({ startDate, endDate, search, item1, item2, item3 }) => {
                const params: Record<string, string> = {};

                if (startDate) params.startDate = startDate;
                if (endDate) params.endDate = endDate;
                if (search) params.search = search;
                if (item1) params.item1 = item1;
                if (item2) params.item2 = item2;
                if (item3) params.item3 = item3;

                return {
                    url: '/orders/profit/filtered',
                    params,
                    method: 'GET'
                };
            },
            providesTags: ['Orders']
        }),

        companyReport: builder.query<CompanyReportResponse, { page: number; limit: number; startDate?: string; endDate?: string; search?: string; item1?: string; item2?: string; item3?: string }>({
            query: ({ page, limit, startDate, endDate, search, item1, item2, item3 }) => {
                const params: Record<string, string | number> = { page, limit };

                if (startDate) params.startDate = startDate;
                if (endDate) params.endDate = endDate;
                if (search) params.search = search;
                if (item1) params.item1 = item1;
                if (item2) params.item2 = item2;
                if (item3) params.item3 = item3;

                return {
                    url: '/orders/report/company',
                    params,
                    method: 'GET'
                };
            },
            providesTags: ['Orders']
        }),
    })
})

export const {
    useGetOrdersQuery,
    useGetAllOrdersQuery,
    useGetOrderQuery,
    useCreateOrderMutation,
    useUpdateOrderMutation,
    useDeleteOrderMutation,
    useGetOrderItemsQuery,
    useGetAllorderItemsQuery,
    useCreateOrderItemMutation,
    useUpdateOrderItemMutation,
    useDeleteOrderItemMutation,
    useCalculateFilteredProfitQuery,
    useCompanyReportQuery
} = orderApiSlice;