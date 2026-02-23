import { useMemo } from 'react';
import Loader from '@/common/Loader';
import { useGetAllOrdersQuery } from '@/redux/order/orderApiSlice';
import { OrderType } from '@/types/OrderType';

interface CustomerStats {
  customerId: string;
  customerName: string;
  customerPhone: string;
  orderCount: number;
  totalRevenue: number;
}

const ChatCard = () => {
  const { data: orders, isLoading } = useGetAllOrdersQuery();

  const topCustomers = useMemo(() => {
    if (!orders || orders.length === 0) return [];

    // Calculate customer statistics
    const customerMap = new Map<string, CustomerStats>();

    orders.forEach((order: OrderType) => {
      if (!order.customer) return;

      const customerId = order.customerId || order.customer.id;
      const existing = customerMap.get(customerId);

      if (existing) {
        existing.orderCount += 1;
        existing.totalRevenue += order.grandTotal || 0;
      } else {
        customerMap.set(customerId, {
          customerId,
          customerName: order.customer.fullName || 'N/A',
          customerPhone: order.customer.phone || 'N/A',
          orderCount: 1,
          totalRevenue: order.grandTotal || 0,
        });
      }
    });

    // Convert to array, sort by order count (descending), and take top 10
    return Array.from(customerMap.values())
      .sort((a, b) => b.orderCount - a.orderCount)
      .slice(0, 10);
  }, [orders]);

  if (isLoading) {
    return (
      <div className="col-span-12 rounded-sm border border-stroke bg-white py-6 shadow-default dark:border-strokedark dark:bg-boxdark xl:col-span-4">
        <Loader />
      </div>
    );
  }

  return (
    <div className="col-span-12 rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:col-span-4 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Top 10 Customers
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Customer
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Orders
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Revenue
            </h5>
          </div>
        </div>

        {topCustomers.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No customer data available
          </div>
        ) : (
          topCustomers.map((customer, index) => (
            <div
              key={customer.customerId}
              className={`grid grid-cols-3 border-stroke dark:border-strokedark ${
                index < topCustomers.length - 1 ? 'border-b' : ''
              }`}
            >
              <div className="flex items-center gap-3 p-2.5 xl:p-5">
                <div>
                  <p className="text-black dark:text-white text-sm font-semibold">
                    {customer.customerName}
                  </p>
                  {customer.customerPhone && (
                    <p className="text-gray-500 dark:text-gray-400 text-xs">
                      {customer.customerPhone}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-black dark:text-white text-sm font-semibold">
                  {customer.orderCount}
                </p>
              </div>

              <div className="flex items-center justify-center p-2.5 xl:p-5">
                <p className="text-meta-3 font-semibold text-sm">
                  {customer.totalRevenue.toLocaleString()}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatCard;
