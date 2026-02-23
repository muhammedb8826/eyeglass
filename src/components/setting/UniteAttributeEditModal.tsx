import Loader from "@/common/Loader";
import { useGetAllItemsQuery } from "@/redux/items/itemsApiSlice";
import { useGetAllUnitsQuery } from "@/redux/unit/unitApiSlice";
import { useGetUnitAttributeQuery, useUpdateUnitAttributeMutation } from "@/redux/unit/unitAttributeSlice";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ChangeEvent, useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";

interface ErrorData {
    message: string;
}

const UniteAttributeEditModal = ({ handleModalOpen, id }: { handleModalOpen: (isOpen: boolean) => void; id: string }) => {
    const { data, isLoading, refetch } = useGetUnitAttributeQuery(id);
    const [updateUnitAttribute, { isLoading: isUpdating }] = useUpdateUnitAttributeMutation();
    const { data: units } = useGetAllUnitsQuery();
    const { data: items } = useGetAllItemsQuery();
    const [formData, setFormData] = useState({
        id: "",
        itemId: "",
        unitId: "",
        quantity: 0,
        attribute: "",
        attributeValue: ""
    });

    useEffect(() => {
        if (data) {
            setFormData({
                id: data.id,
                itemId: data.itemId,
                unitId: data.unitId,
                quantity: data.quantity,
                attribute: data.attribute,
                attributeValue: data.attribute_value
            });
        }
    }, [data]);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData, [name]: value
        });
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const data = {
            id: formData.id,
            itemId: formData.itemId,
            unitId: formData.unitId,
            quantity: Number(formData.quantity),
            attribute: formData.attribute,
            attribute_value: formData.attributeValue
        }

        try {
            await updateUnitAttribute(data).unwrap();
            toast.success('Unit attribute updated successfully')
            refetch();
            handleModalOpen(false);
        } catch (error) {
            const fetchError = error as FetchBaseQueryError;
            if (fetchError.status === 409) {
                const errorData = fetchError.data as ErrorData;
                toast.error(errorData.message);
            } else {
                toast.error('Unit attribute update failed')
            }
        }
    }


    return isLoading ? (<Loader />) : (
        <>
            <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-999 bg-black/50 outline-none focus:outline-none">
                {/* <form onSubmit={handleSubmit} className="w-full"> */}
                <div className="relative w-auto my-6 mx-auto max-w-3xl ">
                    {/*content*/}
                    <div className="border-0 rounded-lg relative flex flex-col w-full bg-white shadow-default dark:border-strokedark dark:bg-boxdark outline-none focus:outline-none">
                        {/*header*/}
                        <div className="flex items-start justify-between border-b border-stroke py-4 px-6.5 dark:border-strokedark rounded-t">
                            <h3 className="text-3xl text-black dark:text-white font-semibold text">Edit Unit Attribute</h3>
                            <button
                                title="close"
                                type="button"
                                className="p-1 ml-auto bg-transparent border-0 text-black float-right text-3xl leading-none font-semibold outline-none focus:outline-none"
                                onClick={() => handleModalOpen(false)}
                            >
                                <span className="bg-transparent text-black dark:text-white h-6 w-6 text-2xl block outline-none focus:outline-none">
                                    <IoMdClose />
                                </span>
                            </button>
                        </div>
                        {/*body*/}
                        <div className="relative p-6 flex-auto">
                            <div className="grid gap-6 mb-6 md:grid-cols-2">

                                <div>
                                    <label
                                        htmlFor="item"
                                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    >
                                        Items
                                    </label>
                                    <select
                                        title="Select Items"
                                        onChange={handleSelectChange}
                                        value={formData.itemId}
                                        id="itemId"
                                        name="itemId"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                        required
                                    >
                                        <option value="" disabled hidden>Select Items</option>
                                        {items?.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="item"
                                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    >
                                        Units
                                    </label>
                                    <select
                                        title="Select units"
                                        onChange={handleSelectChange}
                                        value={formData.unitId}
                                        id="unitId"
                                        name="unitId"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                        required
                                    >
                                        <option value="" disabled hidden>Select Units</option>
                                        {units?.map((unit) => (
                                            <option key={unit.id} value={unit.id}>
                                                {unit.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label
                                        htmlFor="attribute"
                                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    >
                                        Attribte
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        value={formData.attribute}
                                        type="text"
                                        id="attribute"
                                        name="attribute"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="attributeValue"
                                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    >
                                        Attribute value
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        value={formData.attributeValue}
                                        type="text"
                                        id="attributeValue"
                                        name="attributeValue"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                        required
                                    />
                                </div>

                                <div>
                                    <label
                                        htmlFor="quantity"
                                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    >
                                        Quantity
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        value={formData.quantity}
                                        type="number"
                                        id="quantity"
                                        name="quantity"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                        required
                                        min={0}
                                    />
                                </div>
                            </div>
                        </div>
                        {/*footer*/}
                        <div className="flex items-center justify-end gap-4.5 border-t border-stroke py-4 px-6.5 dark:border-strokedark rounded-b">
                            <button
                                className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
                                type="button"
                                onClick={() => handleModalOpen(false)}
                            >
                                Close
                            </button>
                            <button
                                className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-70"
                                type="submit"
                                onClick={handleSubmit}
                                disabled={isUpdating}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
                {/* </form> */}
            </div>
            <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
        </>
    )
}

export default UniteAttributeEditModal
