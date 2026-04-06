import CheckboxOne from "@/common/CheckBox";
import Loader from "@/common/Loader";
import SelectOptions from "@/common/SelectOptions";
import Breadcrumb from "@/components/Breadcrumb";
import ErroPage from "@/components/common/ErroPage";
import { selectCurrentUser } from "@/redux/authSlice";
import { useGetItemQuery, useUpdateItemMutation, useGetItemBasesQuery, useCreateItemBaseMutation, useUpdateItemBaseMutation, useDeleteItemBaseMutation } from "@/redux/items/itemsApiSlice";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import userImage from "../../assets/images/avatar.jpg";
import Tabs from "@/common/TabComponent";
import { useGetAllUnitsQuery } from "@/redux/unit/unitApiSlice";
import { UoMType } from "@/types/UomType";
import { ItemBaseType } from "@/types/ItemBaseType";
import { BincardTable } from "@/components/bincard/BincardTable";
import Swal from "sweetalert2";

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

function ItemBasesTab({ itemId, itemName }: { itemId: string; itemName?: string }) {
  const { data: bases, isLoading } = useGetItemBasesQuery(itemId);
  const [createBase, { isLoading: isAdding }] = useCreateItemBaseMutation();
  const [updateBase, { isLoading: isUpdatingBase }] = useUpdateItemBaseMutation();
  const [deleteBase] = useDeleteItemBaseMutation();
  const [baseCode, setBaseCode] = useState("");
  const [addPower, setAddPower] = useState("");
  const [editingBaseId, setEditingBaseId] = useState<string | null>(null);
  const [editBaseCode, setEditBaseCode] = useState("");
  const [editAddPower, setEditAddPower] = useState("");

  const handleAdd = async () => {
    const addNum = parseFloat(addPower);
    if (!baseCode.trim()) {
      toast.error("Base code is required");
      return;
    }
    if (Number.isNaN(addNum)) {
      toast.error("Add power must be a number (diopters, e.g. 2.5 for +2.50 D)");
      return;
    }
    try {
      await createBase({ itemId, baseCode: baseCode.trim(), addPower: addNum }).unwrap();
      toast.success("Base added");
      setBaseCode("");
      setAddPower("");
    } catch (err) {
      const fetchError = err as FetchBaseQueryError;
      const msg = (fetchError.data as { message?: string })?.message ?? "Failed to add base";
      toast.error(msg);
    }
  };

  const startEdit = (b: ItemBaseType) => {
    setEditingBaseId(b.id);
    setEditBaseCode(b.baseCode);
    setEditAddPower(String(b.addPower));
  };

  const cancelEdit = () => {
    setEditingBaseId(null);
    setEditBaseCode("");
    setEditAddPower("");
  };

  const handleSaveEdit = async () => {
    if (!editingBaseId) return;
    const addNum = parseFloat(editAddPower);
    if (!editBaseCode.trim()) {
      toast.error("Base code is required");
      return;
    }
    if (Number.isNaN(addNum)) {
      toast.error("Add power must be a number (diopters)");
      return;
    }
    try {
      await updateBase({ itemId, baseId: editingBaseId, baseCode: editBaseCode.trim(), addPower: addNum }).unwrap();
      toast.success("Base updated");
      cancelEdit();
    } catch (err) {
      const fetchError = err as FetchBaseQueryError;
      const msg = (fetchError.data as { message?: string })?.message ?? "Failed to update base";
      toast.error(msg);
    }
  };

  const handleDelete = async (b: ItemBaseType) => {
    const result = await Swal.fire({
      title: "Remove base?",
      text: `Base ${b.baseCode} (+${b.addPower} D) will be removed. This fails if pricing or orders still use it.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, remove it",
    });
    if (!result.isConfirmed) return;
    try {
      await deleteBase({ itemId, baseId: b.id }).unwrap();
      toast.success("Base removed");
    } catch (err) {
      const fetchError = err as FetchBaseQueryError;
      const msg = (fetchError.data as { message?: string })?.message ?? "Failed to remove base (e.g. still in use)";
      toast.error(msg);
    }
  };

  const list = (bases as ItemBaseType[] | undefined) ?? [];

  return (
    <div className="p-7">
      <p className="mb-4 text-sm text-gray-600 dark:text-gray-400">
        {itemName && <span className="font-medium text-black dark:text-white">{itemName}</span>}
        {" "}
        — Each <strong className="text-black dark:text-white">variant</strong> is one{" "}
        <strong className="text-black dark:text-white">base code</strong> (supplier curve / tool scale,
        e.g. 350, 575) plus <strong className="text-black dark:text-white">blank add power</strong> in{" "}
        <strong className="text-black dark:text-white">diopters</strong> on the lens SKU (e.g. 2.5 =
        +2.50&nbsp;D). That matches API <code className="text-xs">ItemBase.baseCode</code> +{" "}
        <code className="text-xs">ItemBase.addPower</code>. Patient reading <strong>ADD</strong> on a
        prescription is entered on <strong>order lines</strong>, not here.
      </p>
      <div className="mb-6 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">Base code</label>
          <input
            type="text"
            value={baseCode}
            onChange={(e) => setBaseCode(e.target.value)}
            placeholder="e.g. 350, 575, 800"
            className="w-32 rounded border border-stroke bg-transparent py-2 px-3 dark:border-strokedark dark:bg-form-input dark:text-white"
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-black dark:text-white">Add power (D)</label>
          <input
            type="number"
            step="0.25"
            value={addPower}
            onChange={(e) => setAddPower(e.target.value)}
            placeholder="e.g. 2.5, 7.5"
            className="w-32 rounded border border-stroke bg-transparent py-2 px-3 dark:border-strokedark dark:bg-form-input dark:text-white"
          />
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={isAdding}
          className="rounded bg-primary py-2 px-4 text-white hover:bg-opacity-90 disabled:opacity-60"
        >
          {isAdding ? "Adding…" : "Add base"}
        </button>
      </div>
      {isLoading ? (
        <Loader />
      ) : (
        <div className="overflow-x-auto rounded border border-stroke dark:border-strokedark">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="py-3 px-4 font-medium text-black dark:text-white">Base code</th>
                <th className="py-3 px-4 font-medium text-black dark:text-white">Add power (D)</th>
                <th className="py-3 px-4 font-medium text-black dark:text-white">Variant label</th>
                <th className="py-3 px-4 font-medium text-black dark:text-white">Actions</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-6 text-center text-gray-500 dark:text-gray-400">
                    No bases yet. Add base variants above.
                  </td>
                </tr>
              ) : (
                list.map((b) => (
                  <tr key={b.id} className="border-b border-stroke dark:border-strokedark">
                    {editingBaseId === b.id ? (
                      <>
                        <td className="py-2 px-4">
                          <input
                            type="text"
                            value={editBaseCode}
                            onChange={(e) => setEditBaseCode(e.target.value)}
                            className="w-24 rounded border border-stroke bg-transparent py-1 px-2 dark:border-strokedark dark:bg-form-input dark:text-white"
                          />
                        </td>
                        <td className="py-2 px-4">
                          <input
                            type="number"
                            step="0.25"
                            value={editAddPower}
                            onChange={(e) => setEditAddPower(e.target.value)}
                            className="w-20 rounded border border-stroke bg-transparent py-1 px-2 dark:border-strokedark dark:bg-form-input dark:text-white"
                          />
                        </td>
                        <td className="py-2 px-4 text-gray-500 dark:text-gray-400">—</td>
                        <td className="py-2 px-4">
                          <button
                            type="button"
                            onClick={handleSaveEdit}
                            disabled={isUpdatingBase}
                            className="mr-2 text-primary hover:underline disabled:opacity-60"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            className="text-gray-600 hover:underline dark:text-gray-400"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="py-2 px-4 text-black dark:text-white">{b.baseCode}</td>
                        <td className="py-2 px-4 text-black dark:text-white">{b.addPower}</td>
                        <td className="py-2 px-4 text-gray-600 dark:text-gray-400">
                          {b.baseCode}
                          {typeof b.addPower === "number" && !Number.isNaN(b.addPower)
                            ? `^+${b.addPower}`
                            : ""}
                        </td>
                        <td className="py-2 px-4">
                          <button
                            type="button"
                            onClick={() => startEdit(b)}
                            className="mr-3 text-primary hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(b)}
                            className="text-red-600 hover:underline dark:text-red-400"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const tabs = [
  { id: 'general', label: 'General' },
  { id: 'bases', label: 'Bases' },
  { id: 'bincard', label: 'Bincard' },
];

export const ItemEdit = () => {
  const { id } = useParams();
  const user = useSelector(selectCurrentUser);
  const { data, isLoading, isError, error, refetch } = useGetItemQuery(id)
  const [updateItem, { isLoading: isUpdating }] = useUpdateItemMutation();
  const {data: uniteCategories} = useGetAllUnitsQuery();
  const [formData, setFormData] = useState({
    itemCode: "",
    name: "",
    description: "",
    reorderLevel: 0,
    unitCategoryId: '',
    id: "",
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
        itemCode: data.itemCode || "",
        name: data.name || "",
        description: data.description || "",
        reorderLevel: data.reorder_level || 0,
        id: data.id || "",
        unitCategoryId: data.unitCategoryId || '',
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

    const updatedData = {
      ...formData,
      reorder_level: Number(formData.reorderLevel) || 0,
      can_be_sold: canBeSold,
      can_be_purchased: canBePurchased,
      defaultUomId: salesUom,
      purchaseUomId: purchaseUom,
      itemCode: formData.itemCode || undefined,
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

  if (isError) return <ErroPage error={error} />;
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
                    htmlFor="itemCode"
                    className="mb-3 block text-sm font-medium text-black dark:text-white"
                  >
                    Item code
                  </label>
                  <input
                    onChange={handleChange}
                    value={formData.itemCode}
                    type="text"
                    id="itemCode"
                    name="itemCode"
                    className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    placeholder="e.g. 1123"
                  />
                </div>
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

            {activeTabId === 'bases' && id && (
              <ItemBasesTab itemId={id} itemName={data?.name} />
            )}

            {activeTabId === 'bincard' && id && (
              <div className="p-7">
                <BincardTable
                  itemId={id}
                  itemName={data?.name}
                  itemBases={data?.itemBases}
                  pageSize={20}
                />
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
