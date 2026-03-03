import { useState } from "react";
import { IoMdClose } from "react-icons/io";
import { CiEdit } from "react-icons/ci";
import { MdScience } from "react-icons/md";
import Loader from "@/common/Loader";
import Breadcrumb from "@/components/Breadcrumb";
import ErroPage from "@/components/common/ErroPage";
import Pagination from "@/common/Pagination";
import Swal from "sweetalert2";
import { toast } from "react-toastify";
import {
  useGetLabToolsQuery,
  useCreateLabToolMutation,
  useUpdateLabToolMutation,
  useDeleteLabToolMutation,
} from "@/redux/labTools/labToolsApiSlice";
import { selectCurrentUser } from "@/redux/authSlice";
import { useSelector } from "react-redux";
import type { LabToolType } from "@/types/LabToolType";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface ErrorData {
  message?: string;
}

const emptyForm = {
  code: "",
  baseCurveMin: "",
  baseCurveMax: "",
  quantity: "",
};

export const LabTools = () => {
  const user = useSelector(selectCurrentUser);
  const [page, setPage] = useState(1);
  const limit = 20;
  const { data, isLoading, isError, error } = useGetLabToolsQuery({
    page,
    limit,
  });
  const [createLabTool, { isLoading: isCreating }] = useCreateLabToolMutation();
  const [updateLabTool, { isLoading: isUpdating }] = useUpdateLabToolMutation();
  const [deleteLabTool, { isLoading: isDeleting }] = useDeleteLabToolMutation();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState(emptyForm);

  const handleOpenAdd = () => {
    setFormData(emptyForm);
    setAddModalOpen(true);
  };

  const handleOpenEdit = (tool: LabToolType) => {
    setEditingId(tool.id);
    setFormData({
      code: tool.code ?? "",
      baseCurveMin: String(tool.baseCurveMin),
      baseCurveMax: String(tool.baseCurveMax),
      quantity: String(tool.quantity),
    });
    setEditModalOpen(true);
  };

  const handleCloseAdd = () => setAddModalOpen(false);
  const handleCloseEdit = () => {
    setEditModalOpen(false);
    setEditingId(null);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const min = Number(formData.baseCurveMin);
    const max = Number(formData.baseCurveMax);
    const qty = Number(formData.quantity);
    if (Number.isNaN(min) || Number.isNaN(max) || min > max) {
      toast.error("Base curve min must be ≤ max.");
      return;
    }
    if (Number.isNaN(qty) || qty < 0) {
      toast.error("Quantity must be ≥ 0.");
      return;
    }
    try {
      await createLabTool({
        code: formData.code || undefined,
        baseCurveMin: min,
        baseCurveMax: max,
        quantity: qty,
      }).unwrap();
      toast.success("Lab tool added successfully");
      handleCloseAdd();
    } catch (err) {
      const fetchError = err as FetchBaseQueryError;
      const errorData = fetchError.data as ErrorData | undefined;
      toast.error(errorData?.message ?? "Failed to add lab tool");
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    const min = Number(formData.baseCurveMin);
    const max = Number(formData.baseCurveMax);
    const qty = Number(formData.quantity);
    if (Number.isNaN(min) || Number.isNaN(max) || min > max) {
      toast.error("Base curve min must be ≤ max.");
      return;
    }
    if (Number.isNaN(qty) || qty < 0) {
      toast.error("Quantity must be ≥ 0.");
      return;
    }
    try {
      await updateLabTool({
        id: editingId,
        code: formData.code || undefined,
        baseCurveMin: min,
        baseCurveMax: max,
        quantity: qty,
      }).unwrap();
      toast.success("Lab tool updated successfully");
      handleCloseEdit();
    } catch (err) {
      const fetchError = err as FetchBaseQueryError;
      const errorData = fetchError.data as ErrorData | undefined;
      toast.error(errorData?.message ?? "Failed to update lab tool");
    }
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You want to delete this lab tool?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteLabTool(id).unwrap();
          toast.success("Lab tool deleted successfully");
        } catch (err) {
          const fetchError = err as FetchBaseQueryError;
          const errorData = fetchError.data as ErrorData | undefined;
          toast.error(errorData?.message ?? "Failed to delete lab tool");
        }
      }
    });
  };

  if (isError) return <ErroPage error={String(error)} />;
  if (isLoading) return <Loader />;
  if (!data) return <div>No data available</div>;

  const { labTools, total } = data;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <>
      <Breadcrumb pageName="Lab Tools (Base Curve)" />

      <div className="flex items-center justify-between flex-wrap gap-4 pb-4">
        {user?.roles === "ADMIN" && (
          <button
            type="button"
            onClick={handleOpenAdd}
            className="inline-flex items-center justify-center rounded bg-primary py-2 px-4 font-medium text-white hover:bg-opacity-90"
          >
            <MdScience className="mr-2 text-xl" />
            Add lab tool
          </button>
        )}
      </div>

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Code
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Base curve min
                </th>
                <th className="min-w-[120px] py-4 px-4 font-medium text-black dark:text-white">
                  Base curve max
                </th>
                <th className="min-w-[100px] py-4 px-4 font-medium text-black dark:text-white">
                  Quantity
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {!labTools?.length ? (
                <tr>
                  <td
                    colSpan={5}
                    className="py-8 text-center text-gray-500 dark:text-gray-400"
                  >
                    No lab tools. Add tools to cover base curve ranges for order items.
                  </td>
                </tr>
              ) : (
                labTools.map((tool) => (
                  <tr
                    key={tool.id}
                    className="border-b border-stroke dark:border-strokedark"
                  >
                    <td className="border-b border-[#eee] py-5 px-4 pl-9 dark:border-strokedark">
                      {tool.code ?? "–"}
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      {tool.baseCurveMin}
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      {tool.baseCurveMax}
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      {tool.quantity}
                    </td>
                    <td className="border-b border-[#eee] py-5 px-4 dark:border-strokedark">
                      <div className="flex items-center gap-2">
                        {user?.roles === "ADMIN" && (
                          <>
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(tool)}
                              disabled={isUpdating}
                              className="hover:text-primary"
                              title="Edit"
                            >
                              <CiEdit className="text-xl" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(tool.id)}
                              disabled={isDeleting}
                              className="hover:text-danger"
                              title="Delete"
                            >
                              <svg
                                className="fill-current"
                                width="18"
                                height="18"
                                viewBox="0 0 18 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M13.7535 2.47502H11.5879V1.9969C11.5879 1.15315 10.9129 0.478149 10.0691 0.478149H7.90352C7.05977 0.478149 6.38477 1.15315 6.38477 1.9969V2.47502H4.21914C3.40352 2.47502 2.72852 3.15002 2.72852 3.96565V4.8094C2.72852 5.42815 3.09414 5.9344 3.62852 6.1594L4.07852 15.4688C4.13477 16.6219 5.09102 17.5219 6.24414 17.5219H11.7004C12.8535 17.5219 13.8098 16.6219 13.866 15.4688L14.3441 6.13127C14.8785 5.90627 15.2441 5.3719 15.2441 4.78127V3.93752C15.2441 3.15002 14.5691 2.47502 13.7535 2.47502Z"
                                  fill=""
                                />
                              </svg>
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Add modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 outline-none">
          <form onSubmit={handleSubmitAdd} className="w-full max-w-md">
            <div className="relative my-6 mx-auto rounded-lg border-0 bg-white shadow-default dark:bg-boxdark">
              <div className="flex items-start justify-between border-b border-stroke py-4 px-6 dark:border-strokedark">
                <h3 className="text-xl font-semibold text-black dark:text-white">
                  Add lab tool
                </h3>
                <button
                  type="button"
                  onClick={handleCloseAdd}
                  className="p-1 text-3xl leading-none text-black dark:text-white"
                >
                  <IoMdClose />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      Code (optional)
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={(e) => handleChange(e)}
                      placeholder="e.g. 250-450"
                      className="w-full rounded border border-stroke bg-transparent py-2 px-4 dark:border-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      Base curve min *
                    </label>
                    <input
                      type="number"
                      name="baseCurveMin"
                      value={formData.baseCurveMin}
                      onChange={(e) => handleChange(e)}
                      required
                      step="0.01"
                      className="w-full rounded border border-stroke bg-transparent py-2 px-4 dark:border-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      Base curve max *
                    </label>
                    <input
                      type="number"
                      name="baseCurveMax"
                      value={formData.baseCurveMax}
                      onChange={(e) => handleChange(e)}
                      required
                      step="0.01"
                      className="w-full rounded border border-stroke bg-transparent py-2 px-4 dark:border-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={(e) => handleChange(e)}
                      required
                      min={0}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-4 dark:border-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-stroke py-4 px-6 dark:border-strokedark">
                <button
                  type="button"
                  onClick={handleCloseAdd}
                  className="rounded border border-stroke py-2 px-4 dark:border-strokedark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="rounded bg-primary py-2 px-4 text-white hover:bg-opacity-90 disabled:opacity-60"
                >
                  {isCreating ? "Adding…" : "Add"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Edit modal */}
      {editModalOpen && editingId && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center overflow-y-auto overflow-x-hidden bg-black/50 outline-none">
          <form onSubmit={handleSubmitEdit} className="w-full max-w-md">
            <div className="relative my-6 mx-auto rounded-lg border-0 bg-white shadow-default dark:bg-boxdark">
              <div className="flex items-start justify-between border-b border-stroke py-4 px-6 dark:border-strokedark">
                <h3 className="text-xl font-semibold text-black dark:text-white">
                  Edit lab tool
                </h3>
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="p-1 text-3xl leading-none text-black dark:text-white"
                >
                  <IoMdClose />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      Code (optional)
                    </label>
                    <input
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={(e) => handleChange(e)}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-4 dark:border-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      Base curve min *
                    </label>
                    <input
                      type="number"
                      name="baseCurveMin"
                      value={formData.baseCurveMin}
                      onChange={(e) => handleChange(e)}
                      required
                      step="0.01"
                      className="w-full rounded border border-stroke bg-transparent py-2 px-4 dark:border-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      Base curve max *
                    </label>
                    <input
                      type="number"
                      name="baseCurveMax"
                      value={formData.baseCurveMax}
                      onChange={(e) => handleChange(e)}
                      required
                      step="0.01"
                      className="w-full rounded border border-stroke bg-transparent py-2 px-4 dark:border-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="mb-2 block text-sm font-medium text-black dark:text-white">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={(e) => handleChange(e)}
                      required
                      min={0}
                      className="w-full rounded border border-stroke bg-transparent py-2 px-4 dark:border-strokedark dark:bg-form-input dark:text-white"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 border-t border-stroke py-4 px-6 dark:border-strokedark">
                <button
                  type="button"
                  onClick={handleCloseEdit}
                  className="rounded border border-stroke py-2 px-4 dark:border-strokedark"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="rounded bg-primary py-2 px-4 text-white hover:bg-opacity-90 disabled:opacity-60"
                >
                  {isUpdating ? "Saving…" : "Save"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </>
  );
};
