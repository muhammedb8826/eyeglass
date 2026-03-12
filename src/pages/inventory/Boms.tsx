import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import Breadcrumb from "@/components/Breadcrumb";
import Loader from "@/common/Loader";
import ErroPage from "@/components/common/ErroPage";
import Pagination from "@/common/Pagination";
import { selectCurrentUser } from "@/redux/authSlice";
import { useGetAllItemsQuery } from "@/redux/items/itemsApiSlice";
import { useGetAllUnitsQuery } from "@/redux/unit/unitApiSlice";
import {
  useGetBomsQuery,
  useCreateBomMutation,
  useUpdateBomMutation,
  useDeleteBomMutation,
} from "@/redux/bom/bomApiSlice";
import type { BomType } from "@/types/BomType";
import type { ItemType } from "@/types/ItemType";
import type { UoMType } from "@/types/UomType";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface ErrorData {
  message?: string;
}

const emptyForm = {
  parentItemId: "",
  componentItemId: "",
  quantity: "",
  uomId: "",
};

export const Boms = () => {
  const user = useSelector(selectCurrentUser);

  const [page, setPage] = useState(1);
  const limit = 20;

  const { data: allItems } = useGetAllItemsQuery();
  const { data: allUnits } = useGetAllUnitsQuery();

  const [selectedParentItemId, setSelectedParentItemId] = useState<string>("");
  const {
    data: boms,
    isLoading,
    isError,
    error,
  } = useGetBomsQuery(
    selectedParentItemId ? { parentItemId: selectedParentItemId } : undefined,
  );

  const [createBom, { isLoading: isCreating }] = useCreateBomMutation();
  const [updateBom, { isLoading: isUpdating }] = useUpdateBomMutation();
  const [deleteBom, { isLoading: isDeleting }] = useDeleteBomMutation();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const parentOptions: ItemType[] = allItems ?? [];
  const uomOptions = allUnits ?? [];

  const handleOpenAdd = () => {
    if (!selectedParentItemId) {
      toast.error("Select a parent item first.");
      return;
    }
    setFormData({
      parentItemId: selectedParentItemId,
      componentItemId: "",
      quantity: "",
      uomId: "",
    });
    setAddModalOpen(true);
  };

  const handleOpenEdit = (bom: BomType) => {
    setEditingId(bom.id);
    setFormData({
      parentItemId: bom.parentItemId,
      componentItemId: bom.componentItemId,
      quantity: String(bom.quantity),
      uomId: bom.uomId,
    });
    setEditModalOpen(true);
  };

  const handleCloseAdd = () => setAddModalOpen(false);
  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setEditingId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const qtyNum = Number(formData.quantity);
    if (!formData.parentItemId || !formData.componentItemId || !formData.uomId) {
      toast.error("Parent item, component item, and UOM are required.");
      return;
    }
    if (formData.parentItemId === formData.componentItemId) {
      toast.error("Parent and component items must be different.");
      return;
    }
    if (Number.isNaN(qtyNum) || qtyNum <= 0) {
      toast.error("Quantity must be a positive number.");
      return;
    }
    try {
      await createBom({
        parentItemId: formData.parentItemId,
        componentItemId: formData.componentItemId,
        quantity: qtyNum,
        uomId: formData.uomId,
      }).unwrap();
      toast.success("BOM line added successfully");
      handleCloseAdd();
    } catch (err) {
      const fetchError = err as FetchBaseQueryError;
      const errorData = fetchError.data as ErrorData | undefined;
      toast.error(errorData?.message ?? "Failed to add BOM line");
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const qtyNum = Number(formData.quantity);
    if (!formData.parentItemId || !formData.componentItemId || !formData.uomId) {
      toast.error("Parent item, component item, and UOM are required.");
      return;
    }
    if (formData.parentItemId === formData.componentItemId) {
      toast.error("Parent and component items must be different.");
      return;
    }
    if (Number.isNaN(qtyNum) || qtyNum <= 0) {
      toast.error("Quantity must be a positive number.");
      return;
    }
    try {
      await updateBom({
        id: editingId,
        parentItemId: formData.parentItemId,
        componentItemId: formData.componentItemId,
        quantity: qtyNum,
        uomId: formData.uomId,
      }).unwrap();
      toast.success("BOM line updated successfully");
      handleCloseEdit();
    } catch (err) {
      const fetchError = err as FetchBaseQueryError;
      const errorData = fetchError.data as ErrorData | undefined;
      toast.error(errorData?.message ?? "Failed to update BOM line");
    }
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this BOM line?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteBom(id).unwrap();
          toast.success("BOM line deleted successfully");
        } catch (err) {
          const fetchError = err as FetchBaseQueryError;
          const errorData = fetchError.data as ErrorData | undefined;
          toast.error(errorData?.message ?? "Failed to delete BOM line");
        }
      }
    });
  };

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedParentItemId(e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  if (isError) return <ErroPage error={String(error)} />;
  if (isLoading) return <Loader />;

  const list = boms ?? [];
  const totalPages = Math.max(1, Math.ceil(list.length / limit));
  const paginated = list.slice((page - 1) * limit, page * limit);

  const parentItemName =
    parentOptions.find((it) => it.id === selectedParentItemId)?.name || "—";

  return (
    <>
      <Breadcrumb pageName="Bill of Materials (BOM)" />

      <div className="mb-4 flex flex-wrap items-end gap-4">
        <div>
          <label className="mb-2 block text-sm font-medium text-black dark:text-white">
            Parent item
          </label>
          <select
            name="parentItemId"
            value={selectedParentItemId}
            onChange={handleParentChange}
            className="min-w-[260px] rounded border border-stroke bg-transparent py-2 px-3 text-sm font-medium outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
          >
            <option value="">Select parent item</option>
            {parentOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.itemCode ? `${item.itemCode} – ${item.name}` : item.name}
              </option>
            ))}
          </select>
        </div>

        {user?.roles === "ADMIN" && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center rounded bg-primary py-2 px-4 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60"
            disabled={isCreating || !selectedParentItemId}
          >
            Add BOM line
          </button>
        )}
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] py-3 px-4 text-sm font-medium text-black dark:text-white">
                  Parent item
                </th>
                <th className="min-w-[220px] py-3 px-4 text-sm font-medium text-black dark:text-white">
                  Component item
                </th>
                <th className="min-w-[120px] py-3 px-4 text-sm font-medium text-black dark:text-white">
                  Quantity
                </th>
                <th className="min-w-[120px] py-3 px-4 text-sm font-medium text-black dark:text-white">
                  UOM
                </th>
                <th className="py-3 px-4 text-sm font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {!paginated.length ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    {selectedParentItemId
                      ? "No BOM lines for this parent item."
                      : "Select a parent item to see its BOM."}
                  </td>
                </tr>
              ) : (
                paginated.map((bom) => {
                  const componentName =
                    bom.componentItem?.name ||
                    bom.componentItem?.itemCode ||
                    bom.componentItemId;
                  const uomLabel =
                    bom.uom?.abbreviation || bom.uom?.name || bom.uomId;
                  return (
                    <tr key={bom.id}>
                      <td className="border-b border-[#eee] py-3 px-4 text-sm dark:border-strokedark">
                        {parentItemName}
                      </td>
                      <td className="border-b border-[#eee] py-3 px-4 text-sm dark:border-strokedark">
                        {componentName}
                      </td>
                      <td className="border-b border-[#eee] py-3 px-4 text-sm dark:border-strokedark">
                        {bom.quantity}
                      </td>
                      <td className="border-b border-[#eee] py-3 px-4 text-sm dark:border-strokedark">
                        {uomLabel}
                      </td>
                      <td className="border-b border-[#eee] py-3 px-4 text-sm dark:border-strokedark">
                        {user?.roles === "ADMIN" && (
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(bom)}
                              className="text-primary hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => handleDelete(bom.id)}
                              className="text-danger hover:underline disabled:opacity-60"
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-end px-4 py-3">
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Add modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-lg dark:bg-boxdark">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
              Add BOM line
            </h3>
            <form onSubmit={handleSubmitAdd} className="space-y-4 text-sm">
              <div>
                <label className="mb-1 block font-medium text-black dark:text-white">
                  Parent item
                </label>
                <select
                  name="parentItemId"
                  value={formData.parentItemId}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  disabled
                >
                  <option value="">Select parent item</option>
                  {parentOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemCode ? `${item.itemCode} – ${item.name}` : item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block font-medium text-black dark:text-white">
                  Component item
                </label>
                <select
                  name="componentItemId"
                  value={formData.componentItemId}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="">Select component item</option>
                  {parentOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemCode ? `${item.itemCode} – ${item.name}` : item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-black dark:text-white">
                    Quantity (per 1 parent)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.001}
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-black dark:text-white">
                    UOM
                  </label>
                  <select
                    name="uomId"
                    value={formData.uomId}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="">Select UOM</option>
                    {uomOptions.flatMap((cat) =>
                      cat.uoms.map((u: UoMType) => (
                        <option key={u.id} value={u.id}>
                          {u.abbreviation || u.name}
                        </option>
                      )),
                    )}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseAdd}
                  className="rounded border border-stroke px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-strokedark dark:text-gray-200 dark:hover:bg-meta-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded bg-white p-6 shadow-lg dark:bg-boxdark">
            <h3 className="mb-4 text-lg font-semibold text-black dark:text-white">
              Edit BOM line
            </h3>
            <form onSubmit={handleSubmitEdit} className="space-y-4 text-sm">
              <div>
                <label className="mb-1 block font-medium text-black dark:text-white">
                  Parent item
                </label>
                <select
                  name="parentItemId"
                  value={formData.parentItemId}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="">Select parent item</option>
                  {parentOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemCode ? `${item.itemCode} – ${item.name}` : item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block font-medium text-black dark:text-white">
                  Component item
                </label>
                <select
                  name="componentItemId"
                  value={formData.componentItemId}
                  onChange={handleChange}
                  className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                >
                  <option value="">Select component item</option>
                  {parentOptions.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.itemCode ? `${item.itemCode} – ${item.name}` : item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block font-medium text-black dark:text-white">
                    Quantity (per 1 parent)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={0.001}
                    name="quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-medium text-black dark:text-white">
                    UOM
                  </label>
                  <select
                    name="uomId"
                    value={formData.uomId}
                    onChange={handleChange}
                    className="w-full rounded border border-stroke bg-transparent py-2 px-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="">Select UOM</option>
                    {uomOptions.flatMap((cat) =>
                      cat.uoms.map((u: UoMType) => (
                        <option key={u.id} value={u.id}>
                          {u.abbreviation || u.name}
                        </option>
                      )),
                    )}
                  </select>
                </div>
              </div>
              <div className="mt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="rounded border border-stroke px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-strokedark dark:text-gray-200 dark:hover:bg-meta-4"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-opacity-90 disabled:opacity-60"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

