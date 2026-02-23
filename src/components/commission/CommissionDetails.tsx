import { useParams } from "react-router-dom";
import Breadcrumb from "../Breadcrumb";
import { useSelector } from "react-redux";
import { selectCurrentUser } from "@/redux/authSlice";
import { useGetCommissionQuery, useUpdateCommissionMutation } from "@/redux/commission/commissionApiSlice";
import Loader from "@/common/Loader";
import ErroPage from "../common/ErroPage";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface ErrorData {
    message: string;
}

export const CommissionDetails = () => {
    const user = useSelector(selectCurrentUser)
    const { id } = useParams();
    const { data: commission, isLoading, error, isError } = useGetCommissionQuery(id ? id : '');
    const [updateCommission] = useUpdateCommissionMutation();
    
    const [formData, setFormData] = useState({
        paidAmount: commission?.paidAmount || 0
    });

    useEffect(() => {
        if (commission) {
            setFormData({
                paidAmount: commission?.paidAmount || 0,
            });
        }
    }, [commission]);

    const handlePayment = async (transactionId: string, amount: number) => {
        if (user?.roles !== 'ADMIN') {
            toast.error('You are not authorized to perform this action');
            return;
        }
    
       // Calculate new paid amount and update commission transactions
       const updatedTransactions = commission?.transactions.map((transaction: any) => {
        if (transaction.id === transactionId) {
            return { ...transaction, status: 'paid' };
        }
        return transaction;
    });

    const updatedData = {
        ...commission,
        paidAmount: formData.paidAmount + amount,
        transactions: updatedTransactions,
    };

        try {
            await updateCommission(updatedData).unwrap();
            toast.success('Commission updated successfully');
            setFormData((prevState) => ({
                ...prevState,
                paidAmount: prevState.paidAmount + amount,
            }));
        } catch (error) {
            const fetchError = error as FetchBaseQueryError;
            if (fetchError.status === 409) {
                const errorData = fetchError.data as ErrorData;
                toast.error(errorData.message);
            } else {
                toast.error('An error occurred');
            }
        }

    }

    if (isError) return <ErroPage error={error.toString()} />

    return isLoading ? (<Loader />) : (
        <>
            <Breadcrumb pageName="Order details" />
            <section className="bg-white">
                <form>
                    <>
                        <div className="grid sm:grid-cols-2 sm:gap-6 mb-4 p-4">
                            <div className="w-full">
                                <label
                                    htmlFor="name"
                                    className="mb-3 block text-black dark:text-white"
                                >
                                    Partner name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={commission?.salesPartner?.fullName}
                                    readOnly
                                    id="name"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                />
                            </div>
                            <div className="">
                                <label htmlFor="orderDate" className="mb-3 block text-black dark:text-white">
                                    Order Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        name="orderDate"
                                        value={commission?.order?.orderDate ? new Date(commission?.order?.orderDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}
                                        readOnly
                                        id="orderDate"
                                        className="custom-input-date custom-input-date-1 w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    />
                                </div>
                            </div>

                            <div className="w-full">
                                <label
                                    htmlFor="totalAmount"
                                    className="mb-3 block text-black dark:text-white"
                                >
                                    Total earned
                                </label>
                                <input
                                    type="text"
                                    name="totalAmount"
                                    value={commission?.totalAmount}
                                    readOnly
                                    id="totalAmount"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                />
                            </div>

                            <div className="w-full">
                                <label
                                    htmlFor="paidAmount"
                                    className="mb-3 block text-black dark:text-white"
                                >
                                    Total paid
                                </label>
                                <input
                                    type="number"
                                    name="paidAmount"
                                    value={formData.paidAmount}
                                    readOnly
                                    id="paidAmount"
                                    className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                />
                            </div>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white px-4">
                                Transactions
                            </h3>
                            <div className="max-w-full overflow-x-auto px-4">
                                <table className="w-full table-auto">
                                    <thead>
                                        <tr className="bg-gray-2 text-left dark:bg-meta-4">
                                            <th className="p-4 font-medium text-black dark:text-white">
                                                No
                                            </th>
                                            <th className="min-w-[150px] p-4 font-medium text-black dark:text-white">
                                                Date
                                            </th>
                                            <th className="min-w-[150px] p-4 font-medium text-black dark:text-white">
                                                Description
                                            </th>
                                            <th className="min-w-[200px] p-4 font-medium text-black dark:text-white">
                                                Payment Method
                                            </th>
                                            <th className="p-4 font-medium text-black dark:text-white">
                                                Commission %
                                            </th>
                                            <th className="min-w-[150px] p-4 font-medium text-black dark:text-white">
                                                Reference
                                            </th>
                                            <th className="p-4 font-medium text-black dark:text-white">
                                                Amount
                                            </th>
                                            <th className="p-4 font-medium text-black dark:text-white">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                    {commission?.transactions.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center">No transactions found</td>
                                        </tr>
                                    ) : (
                                        commission?.transactions.map((transaction: any, index: number) => (
                                            <tr key={transaction.id}>
                                                <td className="p-4 border-b text-graydark border-[#eee] dark:border-strokedark">{index + 1}</td>
                                                <td className="p-4 border-b text-graydark border-[#eee] dark:border-strokedark">
                                                    {new Date(transaction.date).toISOString().split('T')[0]}
                                                </td>
                                                <td className="p-4 border-b text-graydark border-[#eee] dark:border-strokedark">{transaction.description}</td>
                                                <td className="p-4 border-b text-graydark border-[#eee] dark:border-strokedark">{transaction.paymentMethod}</td>
                                                <td className="p-4 border-b text-graydark border-[#eee] dark:border-strokedark">{transaction.percentage}</td>
                                                <td className="p-4 border-b text-graydark border-[#eee] dark:border-strokedark">{transaction.reference}</td>
                                                <td className="p-4 border-b text-graydark border-[#eee] dark:border-strokedark">{transaction.amount}</td>
                                                <td className="p-4 border-b text-graydark border-[#eee] dark:border-strokedark">
                                                    {transaction.status === 'pending' ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => handlePayment(transaction.id ? transaction.id : '', transaction.amount)}
                                                            className="inline-flex rounded-full bg-primary py-1 px-3 text-sm font-medium text-white"
                                                        >
                                                            Pay
                                                        </button>
                                                    ) : (
                                                        <span className="inline-flex rounded-full bg-success bg-opacity-10 py-1 px-3 text-sm font-medium text-success">
                                                            {transaction.status}
                                                        </span>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                </form>
            </section>
        </>
    );
}
