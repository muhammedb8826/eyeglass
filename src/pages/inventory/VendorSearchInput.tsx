import { ChangeEvent, useEffect, useState } from "react";
import { FaProductHunt } from "react-icons/fa6";
import { VendorRegistration } from "./VendorRegistration";
import { useGetAllVendorsQuery } from "@/redux/vendor/vendorApiSlice";
import Loader from "@/common/Loader";
import { VendorType } from "@/types/VendorType";

interface VendorSearchInputProps {
    handleSupplierInfo: (vendor: VendorType) => void;
    value?: string;
}

export const VendorSearchInput = ({ handleSupplierInfo, value }: VendorSearchInputProps) => {
    
    const [searchInput, setSearchInput] = useState(value || "");
    const [selectedVendorId, setSelectedVendorId] = useState<string | null>(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    
    const { data: vendors, isLoading } = useGetAllVendorsQuery({ search: searchInput });
    
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

    if (isLoading) return <Loader />;
  
    const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
        setSearchInput(e.target.value);
        setIsDropdownOpen(true);
    };

    const handleInputFocus = () => {
        setIsDropdownOpen(true);
    };
  
    const handleSelectVendor = (vendor: VendorType) => {
        setSearchInput(vendor.fullName);
        setSelectedVendorId(vendor.id);
        setIsDropdownOpen(false);
        handleSupplierInfo(vendor);
    };
  
    const handleModalOpen = () => {
        setModalOpen((prev) => !prev);
    };

    return (
        <>
            <div className="relative gap-4">
                <label
                    htmlFor="input-group-search"
                    className="mb-3 block text-black dark:text-white"
                >
                    Vendor
                </label>
                <div className="relative flex-1">
                    <input
                        value={searchInput}
                        onChange={handleSearchChange}
                        onFocus={handleInputFocus}
                        type="text"
                        id="input-group-search"
                        className="w-full rounded border-[1.5px] border-stroke bg-transparent py-2 px-4 font-medium outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-white dark:border-form-stroke dark:bg-form-input dark:focus:border-primary"
                        placeholder="Type vendor"
                    />
                </div>
            </div>
  
            <div
                id="dropdownSearch"
                className={`z-50 ${isDropdownOpen ? "" : "hidden"} bg-white rounded-lg rounded-t-none border-stroke shadow dark:bg-gray-700 w-full absolute top-19.5`}
            >
                <ul
                    className="max-h-48 px-3 pb-3 overflow-y-auto text-sm text-black dark:text-white"
                    aria-labelledby="dropdownSearchButton"
                >
                    {vendors && vendors.length > 0 ? (
                        vendors.map((vendor) => (
                            <li key={vendor.id}>
                                <div className="flex items-center ps-2 rounded hover:bg-gray-100 dark:hover:bg-gray-600">
                                    <input
                                        onChange={() => handleSelectVendor(vendor)}
                                        checked={selectedVendorId === vendor.id}
                                        id={`checkbox-item-${vendor.id}`}
                                        type="radio"
                                        name="vendor"
                                        value={vendor.id}
                                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-full focus:ring-blue-500 dark:focus:ring-blue-600 dark:bg-gray-600 dark:border-gray-500"
                                    />
                                    <label
                                        htmlFor={`checkbox-item-${vendor.id}`}
                                        className="w-full py-2 ms-2 text-sm font-medium text-gray-900 dark:text-gray-300"
                                    >
                                        {vendor.fullName}
                                    </label>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="py-2 ms-2 text-sm font-medium">No vendor found</li>
                    )}
                </ul>
                <button
                    onClick={handleModalOpen}
                    type="button"
                    className="w-full flex items-center p-3 text-sm font-medium text-primary border-[1.5px] border-stroke border-t border-gray-200 rounded-b-lg bg-gray-50 dark:border-gray-600 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-blue-500 hover:underline"
                >
                    <FaProductHunt className="w-5 h-5 me-2" />
                    Add new vendor
                </button>
            </div>
            {modalOpen && <VendorRegistration handleModalOpen={handleModalOpen} />}
        </>
    );
};
