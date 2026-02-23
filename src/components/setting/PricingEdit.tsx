import Loader from "@/common/Loader";
import ErroPage from "@/components/common/ErroPage";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { IoMdClose } from "react-icons/io";
import { useGetPricingQuery, useUpdatePricingMutation } from "@/redux/pricing/pricingApiSlice";
import { useGetAllItemsQuery } from "@/redux/items/itemsApiSlice";
import { useGetAllServicesQuery } from "@/redux/services/servicesApiSlice";
import { useGetAllNonStockServicesQuery } from "@/redux/services/nonStockServicesApiSlice";
import SelectOptions from "@/common/SelectOptions";
import { selectCurrentUser } from "@/redux/authSlice";
import { useSelector } from "react-redux";

interface ErrorData {
  message: string;
}

export default function PricingEditModal({ handleModalOpen, id }: { handleModalOpen: (isOpen: boolean) => void; id: string }) {
  const user = useSelector(selectCurrentUser);
  const { data, isLoading, error, isError, refetch } = useGetPricingQuery(id);
  const [updatePricing, { isLoading: isUpdating }] = useUpdatePricingMutation();
  const {data: items, isLoading: isItemsLoading} = useGetAllItemsQuery();
  const {data: services, isLoading: isServicesLoading} = useGetAllServicesQuery();
  const {data: nonStockServices, isLoading: isNonStockServicesLoading} = useGetAllNonStockServicesQuery();


  const [itemId, setItemId] = useState<string>('');
  const [serviceId, setServiceId] = useState<string>('');

  const [formData, setFormData] = useState({
    sellingPrice: 0,
    costPrice: 0,
    width: 1,
    height: 1,
    baseUomId: '',
    constant: false
  });

  
  useEffect(() => {
    if (data) {
      setFormData(data);
      setItemId(data.itemId);
      // Handle both stock and non-stock services
      setServiceId(data.serviceId || data.nonStockServiceId || '');
    }
  }, [data]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(user?.roles === 'ADMIN'){
    setFormData({ ...formData, [e.target.name]: e.target.value });
  } else {
    toast.error('You are not authorized to update pricing');
  }
  };

const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(user?.roles === 'ADMIN'){
    
    // Check if the selected service is a non-stock service
    const isNonStockService = nonStockServices?.some(service => service.id === serviceId);
    
    const data = {
      itemId,
      ...(isNonStockService 
        ? { nonStockServiceId: serviceId }
        : { serviceId }
      ),
      sellingPrice: parseFloat(formData.sellingPrice.toString()),
      costPrice: parseFloat(formData.costPrice.toString()),
      baseUomId: formData.baseUomId,
      width: parseFloat(formData.width.toString()),
      height: parseFloat(formData.height.toString()),
      id: id
    }

    try {
      await updatePricing(data).unwrap();
      toast.success("Pricing updated successfully");
      refetch();
      handleModalOpen(false);
    } catch (error) {
      const fetchError = error as FetchBaseQueryError;
      if (fetchError.status === 409) {
        const errorData = fetchError.data as ErrorData;
        toast.error(errorData.message);
      } else {
        toast.error("Pricing update failed");
      }
    }
  } else {
    toast.error('You are not authorized to update pricing');
  }
  };

  const handleItemChange = (value: string) => {
    setItemId(value);
  };

  const handleServiceChange = (value: string) => {
    setServiceId(value);
  };


  const options = useMemo(
    () => (items?.map((item) => ({
      value: item.id,
      label: item.name
    })) || []),
    [items]
  );


  const servicesOptions = useMemo(
    () => {
      const stockServices = services?.map((service) => ({
        value: service.id,
        label: service.name
      })) || [];
      
      const nonStockServicesList = nonStockServices?.map((service: { id: string; name: string }) => ({
        value: service.id,
        label: service.name
      })) || [];
      
      return [...stockServices, ...nonStockServicesList];
    },
    [services, nonStockServices]
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

  if(isError) return <ErroPage error={error.toString()} />

  if(isLoading || isItemsLoading || isServicesLoading || isNonStockServicesLoading) return <Loader/>

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
                 Edit Pricing
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
                  <SelectOptions
                    options={servicesOptions}
                    defaultOptionText="Select service"
                    selectedOption={serviceId}
                    onOptionChange={handleServiceChange}
                    containerMargin="mb-4.5"
                    labelMargin="mb-3"
                    border="border-stroke"
                    title="Select service"
                  />
                  <div>
                    <label
                      htmlFor="baseUomId"
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                    >
                      Base UOM
                    </label>
                    <input
                      // onChange={handleChange}
                      value={items?.find((item) => item.id === itemId)?.unitCategory?.uoms?.find((uom) => uom.baseUnit === true)?.abbreviation || ''}
                      type="string"
                      id="baseUomId"
                      name="baseUomId"
                      readOnly
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="sellingPrice"
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                    >
                      Selling price
                    </label>
                    <input
                      onChange={handleChange}
                      value={formData.sellingPrice}
                      type="number"
                      id="sellingPrice"
                      name="sellingPrice"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="costPrice"
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                    >
                      Cost price
                    </label>
                    <input
                      onChange={handleChange}
                      value={formData.costPrice}
                      type="number"
                      id="costPrice"
                      name="costPrice"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  {formData.constant && (
                    <>
                      <div>
                        <label
                          htmlFor="width"
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                        >
                          Width
                        </label>
                        <input
                          onChange={handleChange}
                          value={formData.width}
                          type="number"
                          id="width"
                          name="width"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="height"
                          className="mb-3 block text-sm font-medium text-black dark:text-white"
                        >
                          Height
                        </label>
                        <input
                          onChange={handleChange}
                          value={formData.height}
                          type="number"
                          id="height"
                          name="height"
                          className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        />
                      </div>
                    </>  )}
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
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
}
