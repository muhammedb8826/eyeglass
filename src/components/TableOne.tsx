import { useState } from 'react';
import { useGetOrdersQuery } from '@/redux/order/orderApiSlice';
import Pagination from '@/common/Pagination';
import Loader from '@/common/Loader';
import { OrderType } from '@/types/OrderType';

const TableOne = () => {
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const { data, isLoading, error, isError } = useGetOrdersQuery({ page, limit });

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('TableOne - API Response:', { data, isLoading, error, isError });
    console.log('TableOne - API URL:', import.meta.env.VITE_NEST_BACKEND_URL);
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isLoading) {
    return (
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          Top Orders
        </h4>
        <div className="text-center py-8 text-red-500 dark:text-red-400">
          Error loading orders. Please check your connection and try again.
        </div>
      </div>
    );
  }

  if (!data || !data.orders || data.orders.length === 0) {
    return (
      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
          Top Orders
        </h4>
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          No orders found
        </div>
      </div>
    );
  }

  const { orders, total } = data;
  const totalPages = Math.ceil(total / limit);

  // Get first product name from order items for display
  const getProductName = (order: OrderType) => {
    if (order.orderItems && order.orderItems.length > 0) {
      const firstItem = order.orderItems[0];
      return firstItem.item?.name || firstItem.service?.name || firstItem.nonStockService?.name || firstItem.description || 'N/A';
    }
    return 'N/A';
  };

  return (
    <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
      <h4 className="mb-6 text-xl font-semibold text-black dark:text-white">
        Top Orders
      </h4>

      <div className="flex flex-col">
        <div className="grid grid-cols-3 rounded-sm bg-gray-2 dark:bg-meta-4 sm:grid-cols-4">
          <div className="p-2.5 xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Product
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Customer
            </h5>
          </div>
          <div className="p-2.5 text-center xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Revenues
            </h5>
          </div>
          <div className="hidden p-2.5 text-center sm:block xl:p-5">
            <h5 className="text-sm font-medium uppercase xsm:text-base">
              Delivery
            </h5>
          </div>
        </div>

        {orders.map((order, index) => (
          <div
            key={order.id}
            className={`grid grid-cols-3 border-stroke dark:border-strokedark sm:grid-cols-4 ${
              index < orders.length - 1 ? 'border-b' : ''
            }`}
          >
            <div className="flex items-center gap-3 p-2.5 xl:p-5">
              <p className="text-black dark:text-white text-sm">
                {getProductName(order)}
              </p>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <div className="text-center">
                <p className="text-black dark:text-white text-sm font-semibold">
                  {order.customer?.fullName || 'N/A'}
                </p>
                {order.customer?.phone && (
                  <p className="text-gray-500 dark:text-gray-400 text-xs">
                    {order.customer.phone}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-center p-2.5 xl:p-5">
              <p className="text-meta-3 font-semibold">
                {order.grandTotal?.toLocaleString() || '0'}
              </p>
            </div>

            <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
              <p className="text-black dark:text-white text-sm">
                {order.deliveryDate
                  ? new Date(order.deliveryDate).toISOString().split('T')[0].split('-').reverse().join('-')
                  : 'N/A'}
              </p>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
        </div>
      )}
    </div>
  );
};

export default TableOne;