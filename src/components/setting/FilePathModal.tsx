import { selectCurrentUser } from "@/redux/authSlice";
import { useCreateFilePathMutation } from "@/redux/file-path/filePathApiSlice";
import { useState } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import Loader from "@/common/Loader";
import { IoMdClose } from "react-icons/io";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

interface BackendErrorResponse {
  message: {
    message: string;
    error: string;
    statusCode: number;
  };
}

type FilePathModalProps = {
  handleModalOpen: (value: boolean) => void;
};

const fileTypeOptions = [
  { value: ".tif", label: ".tif" },
  { value: ".png", label: ".png" },
  { value: ".jpeg", label: ".jpeg" },
  { value: ".jpg", label: ".jpg" },
];

const FilePathModal = ({ handleModalOpen }: FilePathModalProps) => {
  const user = useSelector(selectCurrentUser);
  const [createFilePath, { isLoading: isCreating }] =
    useCreateFilePathMutation();
  const [formData, setFormData] = useState({
    filePath: "",
    description: "",
    fileType: "",
  });

  const handleChange = (
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (user?.roles === "ADMIN") {
      const data = {
        filePath: formData.filePath,
        description: formData.description,
        fileType: formData.fileType,
      };
      try {
        await createFilePath(data).unwrap();
        toast.success("File path created successfully");
        handleModalOpen(false);
      } catch (error) {
        const fetchError = error as FetchBaseQueryError;
        if (fetchError.status === 409) {
          const errorData = fetchError.data as BackendErrorResponse;
          // Extract the message from the nested structure
          const errorMessage =
            errorData?.message?.message ||
            "A file path with this description already exists.";
          toast.error(errorMessage);
          handleModalOpen(false);
        } else {
          toast.error("Failed to create file path");
        }
      }
    } else {
      toast.error("You are not authorized to create file path");
      handleModalOpen(false);
    }
  };
  if (isCreating) {
    return <Loader />;
  }

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
                  Add File Path
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

              {/*body*/}
              <div className="relative p-6 flex-auto">
                <div className="grid gap-6 mb-6 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="description"
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                    >
                      Description
                    </label>
                    <input
                      type="text"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      placeholder="Enter description"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="filePath"
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                    >
                      File Path
                    </label>
                    <input
                      type="text"
                      name="filePath"
                      value={formData.filePath}
                      onChange={handleChange}
                      placeholder="Enter file path"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="fileType"
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                    >
                      File Type
                    </label>
                    <select
                      name="fileType"
                      value={formData.fileType}
                      onChange={handleChange}
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      required
                    >
                      <option value="" disabled>
                        Select file type
                      </option>
                      {fileTypeOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
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
                  Add
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

export default FilePathModal;
