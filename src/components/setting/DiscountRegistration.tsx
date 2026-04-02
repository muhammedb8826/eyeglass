import { useMemo, useState } from "react";
import { IoMdClose } from "react-icons/io";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { toast } from "react-toastify";
import SelectOptions from "@/common/SelectOptions";
import ErroPage from "../common/ErroPage";
import Loader from "@/common/Loader";
import { useGetAllItemsQuery } from "@/redux/items/itemsApiSlice";
import { useCreateDiscountMutation } from "@/redux/discount/discountApiSlice";

interface ErrorData {
  message: string;
}

type PricingRegistrationProps = {
  handleModalOpen: (value: boolean) => void;
};

export const DiscountRegistration = ({ handleModalOpen }: PricingRegistrationProps) => {
  const [createDiscount, { isLoading: isCreating }] = useCreateDiscountMutation();
  const { data: items, isLoading: isItemsLoading, isError, error } = useGetAllItemsQuery();

  const [itemId, setItemId] = useState<string>('');

  const [formData, setFormData] = useState({
    level: 1,
    unit: 1,
    percentage: 0,
    description: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = {
      itemId,
      level: parseFloat(formData.level.toString()),
      unit: parseFloat(formData.unit.toString()),
      percentage: parseFloat(formData.percentage.toString()),
      description: formData.description
    }

    try {
      await createDiscount(data).unwrap();
      toast.success("Discount created successfully");
      handleModalOpen(false);
    } catch (error) {
      const fetchError = error as FetchBaseQueryError;
      if (fetchError.status === 409) {
        const errorData = fetchError.data as ErrorData;
        toast.error(errorData.message);
      } else {
        toast.error("Discount creation failed");
      }
    }
  };

  const handleItemChange = (value: string) => {
    setItemId(value);
  };

  const options = useMemo(
    () => (items?.map((item) => ({
      value: item.id,
      label: item.name
    })) || []),
    [items]
  );

  useMemo(() => {
    const selectedItem = items?.find(item => item.id === itemId);
    if (selectedItem) {
      const { unitCategory } = selectedItem;
      setFormData(prevState => ({
        ...prevState,
        constant: unitCategory?.constant || false,
        baseUomId: unitCategory?.uoms?.find(uom => uom.baseUnit)?.id || '',
      }));
    }
  }, [itemId, items]);

  if (isError) return <ErroPage error={error} />

  if (isItemsLoading) return <Loader />

  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-999 bg-black/50 outline-none focus:outline-none">
        <form onSubmit={handleSubmit} className="w-full">
          <div className="relative w-auto my-6 mx-auto max-w-3xl ">
            {/*content*/}
            <div className="border-0 rounded-lg relative flex flex-col w-full bg-white shadow-default dark:border-strokedark dark:bg-boxdark outline-none focus:outline-none">
              {/*header*/}
              <div className="flex items-start justify-between border-b border-stroke py-4 px-6.5 dark:border-strokedark rounded-t">
                <h3 className="text-3xl text-black dark:text-white font-semibold text">
                  Add Discount
                </h3>
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
              <div className="relative p-6 flex-auto">
                <div className="grid gap-6 mb-6 md:grid-cols-2">
                  <SelectOptions
                    options={options}
                    defaultOptionText="Select item"
                    selectedOption={itemId}
                    onOptionChange={handleItemChange}
                    containerMargin="mb-4.5"
                    labelMargin="mb-3"
                    border="border-stroke"
                    title="Select item"
                  />
                  <div>
                    <label
                      htmlFor="level"
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                    >
                      Level
                    </label>
                    <input
                      onChange={handleChange}
                      value={formData.level}
                      type="number"
                      id="level"
                      name="level"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="unit"
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                    >
                      Min unit
                    </label>
                    <input
                      onChange={handleChange}
                      value={formData.unit}
                      type="number"
                      id="unit"
                      name="unit"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="percentage"
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                    >
                      Percentage
                    </label>
                    <input
                      onChange={handleChange}
                      value={formData.percentage}
                      type="number"
                      id="percentage"
                      name="percentage"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
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
                  disabled={isCreating}
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
};
