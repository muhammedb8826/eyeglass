import { FaBorderStyle } from 'react-icons/fa';
import CardOne from '../../components/CardOne.tsx';
import ChatCard from '../../components/ChatCard.tsx';
import TableOne from '../../components/TableOne.tsx';
import Loader from '@/common/Loader/index.tsx';

import { useGetAllOrdersQuery } from '@/redux/order/orderApiSlice.ts';
import ErroPage from '@/components/common/ErroPage.tsx';

const ECommerce = () => {
  const { data: orders, isLoading, error } = useGetAllOrdersQuery();
  
if(error) return <ErroPage error={error.toString()}/>;

  return isLoading ? (<Loader/>):(
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardOne icons={<FaBorderStyle />} text="Total orders" count={orders ? orders.length : 0} url='/dashboard/orders'  />
      </div>

      <div className="mt-4 grid grid-cols-12 gap-4 md:mt-6 md:gap-6 2xl:mt-7.5 2xl:gap-7.5">
        {/* <ChartOne /> */}
        {/* <ChartTwo /> */}
        {/* <ChartThree /> */}
        {/* <MapOne /> */}
        <div className="col-span-12 xl:col-span-8">
          <TableOne />
        </div>
        <ChatCard />
      </div>
    </>
  );
};

export default ECommerce;
