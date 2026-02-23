interface CheckboxOneProps {
    isChecked: boolean;
    setIsChecked: (value: boolean) => void;
    text: {label: string, id: string};
    }

const CheckboxOne = ({isChecked, setIsChecked, text}: CheckboxOneProps) => {


  return (
    <div>
      <label
        htmlFor={text.id}
        className="flex cursor-pointer select-none items-center mb-3 text-sm font-medium text-black dark:text-white"
      >
        <div className="relative">
          <input
            type="checkbox"
            id={text.id}
            className="sr-only"
            checked={isChecked}
            onChange={() => {
              setIsChecked(!isChecked);
            }}
          />
          <div
            className={`mr-4 flex h-5 w-5 items-center justify-center rounded border ${
              isChecked && 'border-primary bg-gray dark:bg-transparent'
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-sm ${isChecked && 'bg-primary'}`}
            ></span>
          </div>
        </div>
       {text.label}
      </label>
    </div>
  );
};

export default CheckboxOne;