import { ChangeEvent, useEffect, useState } from "react";
import { SalesPartnerRegistration } from "./SalesPartnerRegistrationModal";
import Loader from "@/common/Loader";
import { SalesPartnerType } from "@/types/SalesPartnerType";
import { useGetAllSalesPartnersQuery } from "@/redux/sales-partner/salesPartnersApiSlice";
import { FaProductHunt } from "react-icons/fa6";

interface SalesPartnerSearchInputProps {
  handleSalesPartnerInfo: (salesPartner: SalesPartnerType) => void;
  value?: string;
}

export const SalesPartnerSearchInput = ({ handleSalesPartnerInfo, value }: SalesPartnerSearchInputProps) => {
  const [searchInput, setSearchInput] = useState(value || "");
  const [selectedSalesPartnerId, setSelectedSalesPartnerId] = useState<string | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
   
  const {data: salesPartners, isLoading} = useGetAllSalesPartnersQuery({search: searchInput});

    useEffect(() => {
      setSearchInput(value || "");
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Element;
      if (!target.closest("#input-group-search")) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    setIsDropdownOpen(true);
  };

  const handleInputFocus = () => {
    setIsDropdownOpen(true);
  };

  const handleSelectPartner = (partner: SalesPartnerType) => {
    setSearchInput(partner.fullName);
    setSelectedSalesPartnerId(partner.id);
    setIsDropdownOpen(false);
    handleSalesPartnerInfo(partner);
  };

  const handleModalOpen = () => {
    setModalOpen((prev) => !prev);
  };

  if (isLoading) return <Loader />;
 
    return (
    <>
<div className="relative gap-4">
        <label
          htmlFor="input-group-search"
          className="mb-3 block text-black dark:text-white"
        >
          Sales Partner
        </label>
        <div className="relative flex-1">
          <input
            value={searchInput}
            onChange={handleSearchChange}
            onFocus={handleInputFocus}
            type="text"
            id="input-group-search"
            className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            placeholder="Type sales partner"
          />
        </div>
      </div>

            {/* <!-- Dropdown menu --> */}
            <div
        id="dropdownSearch"
        className={`z-50 ${isDropdownOpen ? "" : "hidden"} bg-white dark:bg-gray-700 rounded-lg rounded-t-none border border-stroke dark:border-strokedark shadow w-full absolute top-19.5`}
      >
        <ul
          className="max-h-48 px-3 pb-3 overflow-y-auto text-sm text-black dark:text-white"
          aria-labelledby="dropdownSearchButton"
        >

          {salesPartners && salesPartners.length > 0 ? (
            salesPartners.map((partner) => (
              <li key={partner.id}>
                <div className="flex items-center ps-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-white">
                  <input
                    onChange={() => handleSelectPartner(partner)}
                    checked={selectedSalesPartnerId === partner.id}
                    id={`checkbox-item-${partner.id}`}
                    type="radio"
                    name="partner"
                    value={partner.id}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-full focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-600 dark:border-gray-500"
                  />
                  <label
                    htmlFor={`checkbox-item-${partner.id}`}
                    className="w-full py-2 ms-2 text-sm font-medium text-gray-900 dark:text-white"
                  >
                    {partner.fullName}
                  </label>
                </div>
              </li>
            ))
          ) : (
            <li className="py-2 ms-2 text-sm font-medium text-black dark:text-white">No partner found</li>
          )}
        </ul>
        <button
          onClick={handleModalOpen}
          type="button"
          className="w-full flex items-center p-3 text-sm font-medium text-primary border-[1.5px] border-stroke border-t border-stroke dark:border-strokedark rounded-b-lg bg-gray-50 dark:border-strokedark dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-blue-500 hover:underline"
        >
          <FaProductHunt className="w-5 h-5 me-2" />
          Add new partner
        </button>
      </div>
            {modalOpen && <SalesPartnerRegistration handleModalOpen={handleModalOpen} />}
    </>
  )
}
