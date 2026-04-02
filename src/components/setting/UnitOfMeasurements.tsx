import { useParams } from "react-router-dom";
import Breadcrumb from "../Breadcrumb";
import Loader from "@/common/Loader";
import { useCreateUomMutation, useDeleteUomMutation, useGetUomsQuery, useUpdateUomMutation } from "@/redux/unit/uomApiSlice";
import ErroPage from "../common/ErroPage";
import { UoMType } from "@/types/UomType";
import { useGetUnitQuery } from "@/redux/unit/unitApiSlice";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import Swal from "sweetalert2";

interface ErrorData {
  message: string;
}

const UnitOfMeasurements = () => {
  const { id } = useParams();
  const { data: unitCategory } = useGetUnitQuery(id ? id : '');
  const { data: existingData, error, isLoading, isError, refetch } = useGetUomsQuery({ categoryId: id ? id : '' });
  const [createUom, { isLoading: isCreating }] = useCreateUomMutation();
  const [deleteUom, { isLoading: isDeleting }] = useDeleteUomMutation();
  const [updateUom, { isLoading: isUpdating }] = useUpdateUomMutation();
  const [formData, setFormData] = useState<UoMType[]>(existingData || []);

  useEffect(() => {
    if (existingData) {
      setFormData(existingData);
    }
  }, [existingData]);

  useEffect(() => {
    if (id) {
      refetch();
    }
  }, [id, refetch]);

  const handleAddRow = () => {
    setFormData(prevFormData => [
      ...prevFormData,
      {
        id: '',
        name: '',
        abbreviation: '',
        conversionRate: 1,
        baseUnit: false,
        unitCategoryId: id || ''
      }
    ]);
  };


  const handleUpdate = async (id: string) => {
   try {
      const unitToUpdate = formData.find(unit => unit.id === id);
      if (unitToUpdate) {
        await updateUom(unitToUpdate).unwrap();
        toast.success("Unit updated successfully");
      }
    } catch (error) {
      const fetchError = error as FetchBaseQueryError;
      if (fetchError.status === 409) {
        const errorData = fetchError.data as ErrorData;
        toast.error(errorData.message);
      } else {
        toast.error("Unit update failed");
      }
    }
  };


  const handleCancel = (index: number) => {
    const unitToCancel = formData[index];

    if (unitToCancel.id) {
      // If the unit has an id, it means it's an existing unit in the backend
      Swal.fire({
        title: "Are you sure?",
        text: "You want to delete this unit!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          try {
            await deleteUom(unitToCancel.id).unwrap();
            toast.success("Unit deleted successfully");

            // Remove the unit from the local state after successful deletion
            setFormData(prevFormData => prevFormData.filter((_, i) => i !== index));
          } catch (error) {
            const fetchError = error as FetchBaseQueryError;
            if (fetchError.status === 409) {
              const errorData = fetchError.data as ErrorData;
              toast.error(errorData.message || "Conflict error occurred");
            } else if (fetchError.status === 404) {
              toast.error("Resource not found");
            } else {
              const errorData = fetchError.data as ErrorData;
              toast.error("Uom update failed: " + (errorData || "Unknown error"));
            }
          }
        }
      });
    } else {
      // For new units that don’t have an ID, just remove from local state
      setFormData(prevFormData => prevFormData.filter((_, i) => i !== index));
    }
  };


  const handleChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevFormData => {
      const newFormData = prevFormData.map((item, i) => {
        if (name === 'baseUnit' && type === 'checkbox') {
          return { ...item, baseUnit: i === index ? checked : false };
        } else if (i === index) {
          return { ...item, [name]: type === 'checkbox' ? checked : value };
        }
        return item;
      });
      return newFormData;
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure only one unit is set as the base unit
    const baseUnits = formData.filter(unit => unit.baseUnit === true);

    if (baseUnits.length !== 1) {
        toast.error("Please ensure exactly one unit is selected as the base unit.");
        return;
    }


    formData.forEach(async (unit) => {
      try {
        const result = await createUom(unit).unwrap();
        if (result) {
          toast.success("New units added successfully");
        }
      } catch (error) {
        const fetchError = error as FetchBaseQueryError;
        const errorData = fetchError.data as ErrorData;
        if (fetchError.status === 409) {
          toast.error(errorData.message);
        } else if (fetchError.status === 400) {
          toast.error(errorData.message || "Failed to add new unit");
        } else {
          toast.error("Failed to add new unit");
        }
      }
    });
  };


  const handleFocus = (index: number) => {
    setFormData(prevFormData => {
      const newFormData = prevFormData.map((unit, idx) =>
        idx === index ? { ...unit, isFocused: true } : unit
      );
      return newFormData;
    });
  };

  const handleBlur = (index: number) => {
    setFormData(prevFormData => {
      const newFormData = prevFormData.map((unit, idx) =>
        idx === index ? { ...unit, isFocused: false } : unit
      );
      return newFormData;
    });
  };

  if (isError) {
    return <ErroPage error={error} />
  }

  return isLoading ? (<Loader />) : (
    <>
      <Breadcrumb pageName="Uoms" />

      <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4">
        <div>
          <h2 className="text-lg font-bold text-black dark:text-white">Manage unit of measurements for ( {unitCategory?.name} )</h2>
        </div>

        <label htmlFor="table-search" className="sr-only">
          Search
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
            <svg
              className="w-4 h-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </div>
          <input
            type="text"
            id="table-search-products"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 ps-10 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
            placeholder="Search for products"
          />
        </div>
      </div>

      <form onSubmit={handleSave} className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="max-w-full overflow-x-auto">
          <table className="w-full table-auto">
            <thead>
              <tr className="bg-gray-2 text-left dark:bg-meta-4">
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white xl:pl-11">
                  Unit name
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Abbreviation
                </th>
                <th className="min-w-[220px] py-4 px-4 font-medium text-black dark:text-white">
                  Conversion rate(/Base)
                </th>
                <th className="min-w-[150px] py-4 px-4 font-medium text-black dark:text-white">
                  Base unit
                </th>
                <th className="py-4 px-4 font-medium text-black dark:text-white">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {formData.map((unit, index) => (
                <tr key={unit.id || index}
                  className={`border py-2 px-4 ${unit.isFocused ? 'border-primary' : 'border-stroke'} dark:${unit.isFocused ? 'border-primary' : 'border-strokedark'}  ${index % 2 === 0 ? 'bg-white dark:bg-boxdark' : 'bg-gray-2 dark:bg-meta-4'}`}
                >
                  <td>
                    <input
                      onFocus={() => handleFocus(index)}
                      onBlur={() => handleBlur(index)}
                      title="name"
                      type="text" name="name" value={unit.name} onChange={(e) => handleChange(index, e)}
                      className={`w-full border-r-[1.5px] border-stroke bg-transparent px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary`}
                      required
                    />
                  </td>
                  <td>
                    <input
                      onFocus={() => handleFocus(index)}
                      onBlur={() => handleBlur(index)}
                      title="abbreviation"
                      type="text"
                      name="abbreviation"
                      value={unit.abbreviation} onChange={(e) => handleChange(index, e)}
                      className="w-full border-r-[1.5px] border-stroke bg-transparent px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      required
                    />
                  </td>
                  <td>
                    <input
                      onFocus={() => handleFocus(index)}
                      onBlur={() => handleBlur(index)}
                      title="conversionRate"
                      type="number"
                      min={1}
                      name="conversionRate" value={unit.conversionRate !== null ? unit.conversionRate : ''} onChange={(e) => handleChange(index, e)}
                      className="w-full border-r-[1.5px] border-stroke bg-transparent px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      required
                    />
                  </td>
                  <td>
                    <input
                      onFocus={() => handleFocus(index)}
                      onBlur={() => handleBlur(index)}
                      title="baseUnit"
                      type="checkbox"
                      name="baseUnit"
                      checked={unit.baseUnit}
                      onChange={(e) => handleChange(index, e)}
                      className="w-full border-r-[1.5px] border-stroke bg-transparent px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </td>
                  <td>
                    <div className="flex gap-4">
                      <button
                        onFocus={() => handleFocus(index)}
                        onBlur={() => handleBlur(index)}
                        title="Edit"
                        type="button"
                        className="text-primary hover:underline border-s-[1.5px] border-stroke bg-transparent px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                        onClick={() => handleUpdate(unit.id)}
                        disabled={isUpdating}
                      >
                        Edit
                      </button>
                      <button
                        onFocus={() => handleFocus(index)}
                        onBlur={() => handleBlur(index)}
                        onClick={() => handleCancel(index)}
                        title="cancel"
                        type="button"
                        className="text-danger hover:underline border-s-[1.5px] border-stroke bg-transparent px-4 font-medium outline-none transition focus:border-danger active:border-danger disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-danger"
                        disabled={isDeleting}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="py-4 flex items-center gap-6">
            <button
              onClick={handleAddRow}
              type="button"
              className="flex items-center justify-center rounded border-[1.5px] border-stroke bg-transparent px-4 font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 hover:text-primary dark:hover:text-primary transition-colors"
            >
              Add row
            </button>
            <button
              disabled={isCreating}
              type="submit"
              className="flex items-center justify-center rounded bg-success px-4  font-medium text-white hover:bg-opacity-90"
            >
              Save
            </button>
          </div>
        </div>
      </form>
    </>
  )
}

export default UnitOfMeasurements
