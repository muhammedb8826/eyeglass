import CheckboxOne from "@/common/CheckBox";
import Loader from "@/common/Loader";
import { useGetUnitQuery, useUpdateUnitMutation } from "@/redux/unit/unitApiSlice";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useEffect, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { toast } from "react-toastify";

interface ErrorData {
    message: string;
}

const constantText = {
    label: "Constant",
    id: "constant",
}

const UnitCategoryEditModal = ({ handleModalOpen, id }: { handleModalOpen: (isOpen: boolean) => void; id: string }) => {
    const { data, isLoading } = useGetUnitQuery(id);
    const [constant, setConstant] = useState<boolean>(false);
    const [updateUnit, { isLoading: isUpdating }] = useUpdateUnitMutation();
    const [formData, setFormData] = useState({
        id: "",
        name: "",
        description: "",
        constantValue: 1
    });

    useEffect(() => {
        if (data) {
            setFormData(data);
            setConstant(data.constant);
        }
    }, [data]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const data = {
            ...formData,
            constantValue: parseFloat(formData.constantValue.toString()),
            constant,
        }

        try {
            await updateUnit(data).unwrap();
            toast.success("Unit updated successfully");
            handleModalOpen(false);
        } catch (error) {
            const fetchError = error as FetchBaseQueryError;
            if (fetchError.status === 409) {
                const errorData = fetchError.data as ErrorData;
                toast.error(errorData.message);
            } else {
                toast.error("Unit update failed");
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
                            <h3 className="text-3xl text-black dark:text-white font-semibold text">Add Products</h3>
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
                                        htmlFor="name"
                                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    >
                                        Unit name
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        value={formData.name}
                                        type="text"
                                        id="name"
                                        name="name"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                        required
                                    />
                                </div>
                                <div>
                                    <label
                                        htmlFor="description"
                                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    >
                                        Description
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        value={formData.description}
                                        type="text"
                                        id="description"
                                        name="description"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    />
                                </div>
                                <CheckboxOne isChecked={constant} setIsChecked={setConstant} text={constantText} />
                                {constant && (
                                <div>
                                    <label
                                        htmlFor="constantValue"
                                        className="mb-3 block text-sm font-medium text-black dark:text-white"
                                    >
                                        Value (Width)
                                    </label>
                                    <input
                                        onChange={handleChange}
                                        value={formData.constantValue}
                                        type="number"
                                        id="constantValue"
                                        name="constantValue"
                                        className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                                    />
                                </div>
                                )}
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
                                disabled={isUpdating}
                                onClick={handleSubmit}
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
    );
}

export default UnitCategoryEditModal;
