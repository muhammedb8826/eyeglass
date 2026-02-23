import CheckboxOne from "@/common/CheckBox";
import Loader from "@/common/Loader";
import SelectOptions from "@/common/SelectOptions";
import Breadcrumb from "@/components/Breadcrumb";
import ErroPage from "@/components/common/ErroPage";
import { selectCurrentUser } from "@/redux/authSlice";
import { useGetItemQuery, useUpdateItemMutation } from "@/redux/items/itemsApiSlice";
import { useGetAllMachinesQuery } from "@/redux/machines/machinesApiSlice";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import userImage from "../../assets/images/avatar.jpg";
import Tabs from "@/common/TabComponent";
import { useGetAllUnitsQuery } from "@/redux/unit/unitApiSlice";
import { UoMType } from "@/types/UomType";

interface ErrorData {
  message: string;
}

const canBeSoldText = {
  label: "Can be sold",
  id: "canBeSold"
};
const canBePurchasedText = {
  label: "Can be purchased",
  id: "canBePurchased"
}

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'sales', label: 'Sales' },
];

export const ItemEdit = () => {
  const { id } = useParams();
  const user = useSelector(selectCurrentUser);
  const { data, isLoading, isError, error, refetch } = useGetItemQuery(id)
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
  const {data: uniteCategories} = useGetAllUnitsQuery();
  const { data: machines } = useGetAllMachinesQuery();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    machineId: '',
    reorderLevel: 0,
    initialStock: 0,
    updatedInitialStock: 0,
    unitCategoryId: '',
    id: ""
  });

  const [uoms, setUoms] = useState<UoMType[]>([]);

  const [activeTabId, setActiveTabId] = useState<string>('general');
  const handleTabChange = (id: string) => {
    setActiveTabId(id);
  };

  const [salesUom, setSalesUom] = useState<string>('');
  const [purchaseUom, setPurchaseUom] = useState<string>('');

  const [canBeSold, setCanBeSold] = useState<boolean>(false);
  const [canBePurchased, setCanBePurchased] = useState<boolean>(false);


  useEffect(() => {
    if (data) {
      setFormData({
        name: data.name || "",
        description: data.description || "",
        machineId: data.machineId || "",
        reorderLevel: data.reorder_level || 0,
        initialStock: data.initial_stock || 0,
        updatedInitialStock: 0,
        id: data.id || "",
        unitCategoryId: data.unitCategoryId || ''
      });
      setSalesUom(data.defaultUomId || '');
      setPurchaseUom(data.purchaseUomId || '');
      setCanBeSold(data.can_be_sold ?? false);
      setCanBePurchased(data.can_be_purchased ?? false);
      if(uniteCategories) {
        const selectedCategory = uniteCategories.find((category) => category.id === data.unitCategoryId);
        if (selectedCategory) {
          setUoms(selectedCategory.uoms || []);
        }
      }
    }
  }, [data, uniteCategories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (e: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
  
    // Update form data
    const updatedFormData = {
      ...formData,
      [name]: value
    };
    setFormData(updatedFormData);
  
    // Update UOMs if the unitCategoryId is changed
    if (name === 'unitCategoryId') {
      const selectedCategory = uniteCategories?.find((category) => category.id === value);
      if (selectedCategory) {
        setUoms(selectedCategory.uoms || []);
      } else {
        setUoms([]); // Clear UOMs if no category is found
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedFormData = { ...formData };

    if (data.initial_stock !== formData.initialStock) {
      updatedFormData.updatedInitialStock = data.initial_stock;
      updatedFormData.initialStock = formData.initialStock;
    }

    const updatedData = {
      ...updatedFormData,
      initial_stock: Number(updatedFormData.initialStock) || 0,
      updated_initial_stock: Number(updatedFormData.updatedInitialStock) || 0,
      reorder_level: Number(updatedFormData.reorderLevel) || 0,
      can_be_sold: canBeSold,
      can_be_purchased: canBePurchased,
      defaultUomId: salesUom,
      purchaseUomId: purchaseUom,
    };

    try {
      await updateItem(updatedData).unwrap();
      toast.success("Item updated successfully");
      refetch();
    } catch (error) {
      const fetchError = error as FetchBaseQueryError;
      if (fetchError.status === 409) {
        const errorData = fetchError.data as ErrorData;
        toast.error(errorData.message || "Conflict error occurred");
      } else if (fetchError.status === 404) {
        toast.error("Resource not found");
      } else {
        const errorData = fetchError.data as ErrorData;
        toast.error("Item update failed: " + (errorData || "Unknown error"));
      }
    }
  };

  const options = useMemo(
    () => (uoms?.map((uom) => ({
      value: uom.id,
      label: uom.abbreviation
    })) || []),
    [uoms]
  );

  const handleSalesUomChange = (value: string) => {
    setSalesUom(value);
    if (!purchaseUom) {
      setPurchaseUom(value);
    }
  };

  const handlePurchaseUomChange = (value: string) => {
    setPurchaseUom(value);
  };

  if (isError) return <ErroPage error={error.toString()} />;
  if (isLoading) return <Loader />;

  return (
    <div className="mx-auto max-w-270">
      <Breadcrumb pageName="Register item" />
      <form onSubmit={handleSubmit} className="grid grid-cols-5 gap-8">
        <div className="col-span-5 xl:col-span-3">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <Tabs tabs={tabs} activeTabId={activeTabId} onTabChange={handleTabChange} />

            {/* <div className="border-b border-stroke py-4 px-7 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Item Information
              </h3>
            </div> */}
            {activeTabId === 'general' && (
            <div className="p-7">
              <div className="grid gap-6 mb-6 md:grid-cols-2">
                <div className="col-span-2">
                  <label
                    htmlFor="name"
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                  >
                    Item name
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
                      htmlFor="unitCategoryId"
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                    >
                      Unit Category
                    </label>
                    <select
                      title="Select unit category"
                      onChange={handleSelectChange}
                      value={formData.unitCategoryId}
                      id="unitCategoryId"
                      name="unitCategoryId"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    >
                      <option value="" disabled>Select unit category</option>
                      {uniteCategories && uniteCategories.length > 0 ? (
                        uniteCategories.map((unit) => (
                          <option key={unit.id} value={unit.id}>
                            {unit.name}
                          </option>
                        ))
                      ) : (
                        <option value="" disabled>No units available</option>
                      )}
                    </select>
                  </div>
                  <div>
                    <label
                      htmlFor="machine"
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                    >
                      Machine
                    </label>
                    <select
                      title="Select Machine"
                      onChange={handleSelectChange}
                      value={formData.machineId}
                      id="machine"
                      name="machineId"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    >
                      {machines && machines.length > 0 ? (
                        <>
                          <option value="" disabled>Select machine</option>
                          {machines.map((machine) => (
                            <option key={machine.id} value={machine.id}>
                              {machine.name}
                            </option>
                          ))}
                        </>
                      ) : (
                        <option value="" disabled>No machines available</option>
                      )}
                    </select>
                  </div>
                <CheckboxOne isChecked={canBeSold} setIsChecked={setCanBeSold} text={canBeSoldText} />
                <CheckboxOne isChecked={canBePurchased} setIsChecked={setCanBePurchased} text={canBePurchasedText} />
                <SelectOptions
                  options={options}
                  defaultOptionText="Unit of Measure"
                  selectedOption={salesUom}
                  onOptionChange={handleSalesUomChange}
                  containerMargin="mb-4.5"
                  labelMargin="mb-3"
                  border="border-stroke"
                  title="Select UoM"
                />
                <SelectOptions
                  options={options}
                  defaultOptionText="Purchase UoM"
                  selectedOption={purchaseUom}
                  onOptionChange={handlePurchaseUomChange}
                  containerMargin="mb-4.5"
                  labelMargin="mb-3"
                  border="border-stroke"
                  title="Select UoM"
                />
                <div>
                  <label
                    htmlFor="reorderLevel"
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                  >
                    Reorder Stock Level
                  </label>
                  <input
                    onChange={handleChange}
                    value={formData.reorderLevel}
                    type="number"
                    id="reorderLevel"
                    name="reorderLevel"
                    min={0}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>
                <div>
                  <label
                    htmlFor="initialStock"
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                  >
                    Initial Stock
                  </label>
                  <input
                    readOnly
                    value={formData.initialStock}
                    type="number"
                    id="initialStock"
                    name="initialStock"
                    min={0}
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  />
                </div>
              </div>
              <div className="mb-6">
                <label className="mb-2.5 block text-black dark:text-white">
                  Internal Note
                </label>
                <textarea
                  rows={6}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  value={formData.description}
                  id="description"
                  name="description"
                  placeholder="Type your message"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                ></textarea>
              </div>
            </div>
             )}

            <div className="flex items-center justify-end gap-4.5 border-t border-stroke py-4 px-6.5 dark:border-strokedark rounded-b">
              <button
                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
                type="submit"
                onClick={handleSubmit}
                disabled={isUpdating}
              >
                Update
              </button>
            </div>
          </div>
        </div>
        <div className="col-span-5 xl:col-span-2">
          <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
            <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
              <h3 className="font-medium text-black dark:text-white">
                Additional Information
              </h3>
            </div>
            <div className="border-b flex items-center border-[#eee] py-5 px-4 pl-9 dark:border-strokedark xl:pl-11">
              <img
                className="w-10 h-10 rounded-full"
                src={user?.profile || userImage}
                alt={`${user?.first_name}'s profile`}
              />
              <div className="ps-3"> 
                <div className="text-base font-semibold text-black dark:text-white">
                  {user?.first_name} {user?.middle_name} {user?.last_name}
                </div>
                <div className="font-normal text-gray-500">Item created</div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
