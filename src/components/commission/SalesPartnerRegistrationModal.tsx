import { ChangeEvent, useState } from "react";
import { toast } from "react-toastify";
import { IoMdClose } from "react-icons/io";
import { useCreateSalesPartnerMutation } from "@/redux/sales-partner/salesPartnersApiSlice";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { handleApiError } from "@/utils/errorHandling";

type SalesPartnerRegistrationProps = {
  handleModalOpen: (value: boolean) => void;
}


export const SalesPartnerRegistration = ({ handleModalOpen }: SalesPartnerRegistrationProps) => {
     const [createSalesPartner, {isLoading}] = useCreateSalesPartnerMutation();


  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    company: "",
    address: "",
    description: "",
  });


  
  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!formData.phone ||!formData.fullName){
        return toast.error("Please fill all the required fields")
    }

    try {
      await createSalesPartner(formData).unwrap();
      toast.success('Partner added successfully');
      handleModalOpen(false);
    } catch (error) {
      const fetchError = error as FetchBaseQueryError;
      const errorMessage = handleApiError(fetchError, 'Partner creation failed');
      toast.error(errorMessage);
    }

  };

  return (
    <>
      <div className="justify-center items-center flex overflow-x-hidden overflow-y-auto fixed inset-0 z-999 bg-black/50 outline-none focus:outline-none">
        <div className="relative w-auto my-6 mx-auto max-w-3xl ">
          {/*content*/}
          <div className="border-0 rounded-lg relative flex flex-col w-full bg-white shadow-default dark:border-strokedark dark:bg-boxdark outline-none focus:outline-none">
            {/*header*/}
            <div className="flex items-start justify-between border-b border-stroke py-4 px-6.5 dark:border-strokedark rounded-t">
              <h3 className="text-3xl text-black dark:text-white font-semibold text">Add supplier</h3>
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
            {/* <form onSubmit={handleSubmit}> */}
              <div className="relative p-6 flex-auto">
                <div className="grid gap-6 mb-6 md:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label
                      htmlFor="fullName"
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                    >
                      Full Name
                    </label>
                    <input
                      onChange={handleChange}
                      value={formData.fullName}
                      type="text"
                      id="fullName"
                      name="fullName"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="phone"
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                    >
                      Phone number
                    </label>
                    <input
                      onChange={handleChange}
                      value={formData.phone}
                      name="phone"
                      type="tel"
                      id="phone"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="email"
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                    >
                      Email address
                    </label>
                    <input
                      onChange={handleChange}
                      value={formData.email}
                      name="email"
                      type="email"
                      id="email"
                      required
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="company"
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                    >
                      Company
                    </label>
                    <input
                      onChange={handleChange}
                      value={formData.company}
                      type="text"
                      id="company"
                      name="company"
                      className="w-full rounded-lg border-[1.5px] border-stroke bg-transparent py-2 px-5 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="address"
                      className="mb-3 block text-sm font-medium text-black dark:text-white"
                    >
                      Address
                    </label>
                    <input
                      onChange={handleChange}
                      value={formData.address}
                      type="text"
                      id="address"
                      name="address"
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
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  Save
                </button>
              </div>
            {/* </form> */}
          </div>
        </div>
      </div>
      <div className="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </>
  );
};
