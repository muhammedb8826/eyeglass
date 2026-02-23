import { useEffect, useState } from "react";

interface SelectRolesProps {
    selectedRoles: string;
    onRolesChange: (role: string) => void;
}

const SelectRoles: React.FC<SelectRolesProps> = ({ selectedRoles, onRolesChange }) => {
    const [isOptionSelected, setIsOptionSelected] = useState<boolean>(false);

    useEffect(() => {
        if (selectedRoles) {
            setIsOptionSelected(true);
        }
    }, [selectedRoles]);

    return (
        <div>
            <label className="mb-3 block text-sm font-medium text-black dark:text-white">
                Select roles
            </label>

            <div className="relative z-20 bg-white dark:bg-form-input">
                <select
                    title="roles"
                    id="roles"
                    name="roles"
                    value={selectedRoles}
                    onChange={(e) => {
                        onRolesChange(e.target.value);
                        setIsOptionSelected(true);
                    }}
                    className={`relative z-20 w-full appearance-none rounded border border-stroke bg-transparent py-3 px-12 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input ${isOptionSelected ? 'text-black dark:text-white' : ''
                        }`}
                >
                    <option value="USER" className="text-body dark:text-bodydark">
                        User
                    </option>
                    <option value="GRAPHIC_DESIGNER" className="text-body dark:text-bodydark">
                        Graphic designer
                    </option>
                    <option value="OPERATOR" className="text-body dark:text-bodydark">
                        Operator
                    </option>
                    <option value="FINANCE" className="text-body dark:text-bodydark">
                        Finance
                    </option>
                    <option value="STORE_REPRESENTATIVE" className="text-body dark:text-bodydark">
                        Store representative
                    </option>
                    <option value="RECEPTION" className="text-body dark:text-bodydark">
                        Reception
                    </option>
                    <option value="PURCHASER" className="text-body dark:text-bodydark">
                        Purchaser
                    </option>
                </select>

                <span className="absolute top-1/2 right-4 z-10 -translate-y-1/2">
                    <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <g opacity="0.8">
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M5.29289 8.29289C5.68342 7.90237 6.31658 7.90237 6.70711 8.29289L12 13.5858L17.2929 8.29289C17.6834 7.90237 18.3166 7.90237 18.7071 8.29289C19.0976 8.68342 19.0976 9.31658 18.7071 9.70711L12.7071 15.7071C12.3166 16.0976 11.6834 16.0976 11.2929 15.7071L5.29289 9.70711C4.90237 9.31658 4.90237 8.68342 5.29289 8.29289Z"
                                fill="#637381"
                            ></path>
                        </g>
                    </svg>
                </span>
            </div>
        </div>
    )
}

export default SelectRoles