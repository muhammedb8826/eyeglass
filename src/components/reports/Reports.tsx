import CardOne from "../CardOne"
import { useGetAllOrdersQuery } from "@/redux/order/orderApiSlice"
import ErroPage from "../common/ErroPage"
import Loader from "@/common/Loader"
import { FaBorderAll } from "react-icons/fa6"
import { BiPurchaseTag } from "react-icons/bi"
import CardTwo from "../CardTwo"
import { useGetAllPurchasesQuery } from "@/redux/purchase/purchaseApiSlice"

export const Reports = () => {
  const { data: orders, isLoading, isError, error } = useGetAllOrdersQuery();
  const { data: purchases, isLoading: isPurchaseLoading, isError: isPurchasesError, error: purchasesError } = useGetAllPurchasesQuery();

  if (isError || isPurchasesError) {
    if (error) {
      return <ErroPage error={error} />
    }
    if (purchasesError) {
      return <ErroPage error={purchasesError} />
    }
  }

  if (isLoading || isPurchaseLoading) return <Loader />

  return (
    <>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-4 2xl:gap-7.5">
        <CardOne icons={<FaBorderAll />} text="Total Orders" count={orders ? orders.length : 0} url='/dashboard/reports/orders-report' />
        <CardTwo icons={<BiPurchaseTag />} text="Total Purchases" count={purchases ? purchases?.length : 0} url='/dashboard/reports/purchases-report' />
      </div>
    </>
  )
}
