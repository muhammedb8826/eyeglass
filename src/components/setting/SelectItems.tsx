import Loader from "@/common/Loader";
import { useGetAllItemsQuery } from "@/redux/items/itemsApiSlice";
import { useEffect, useRef, useState } from "react";

interface Option {
    value: string;
    text: string;
    selected: boolean;
    element?: HTMLElement;
  }
  
  interface DropdownProps {
    id: string;
    selectedIds: string[];
    setSelectedIds: (ids: string[]) => void;
  }

const SelectItems: React.FC<DropdownProps> = ({id, selectedIds, setSelectedIds}) => {

const {data: items, isLoading} = useGetAllItemsQuery()

    const [options, setOptions] = useState<Option[]>([]);
    const [selected, setSelected] = useState<number[]>([]);
    const [show, setShow] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLDivElement>(null);
  
    useEffect(() => {
      if (items) {
        const newOptions: Option[] = items.map((item) => ({
          value: item.id,
          text: item.name,
          selected: selectedIds.includes(item.id),
        }));
        setOptions(newOptions);
        const selectedIndices = newOptions
        .map((option, index) => (option.selected ? index : -1))
        .filter((index) => index !== -1);
      setSelected(selectedIndices);
      }
    }, [items, selectedIds]);
  
     const open = () => {
       setShow(true);
     };
  
   const select = (index: number, event: React.MouseEvent) => {
     const newOptions = [...options];
  
     if (!newOptions[index].selected) {
       newOptions[index].selected = true;
       newOptions[index].element = event.currentTarget as HTMLElement;
       setSelected([...selected, index]);
     } else {
       const selectedIndex = selected.indexOf(index);
       if (selectedIndex !== -1) {
         newOptions[index].selected = false;
         setSelected(selected.filter((i) => i !== index));
       }
     }
     setOptions(newOptions);
     const selectedId = newOptions.filter((option) => option.selected).map((option) => option.value);
      setSelectedIds(selectedId);
   };
  
    const remove = (index: number) => {
      const newOptions = [...options];
      const selectedIndex = selected.indexOf(index);
  
      if (selectedIndex !== -1) {
        newOptions[index].selected = false;
        setSelected(selected.filter((i) => i !== index));
        setSelectedIds(selectedIds.filter((id) => id !== newOptions[index].value));
        setOptions(newOptions);
      }
    };
  
    const selectedValues = () => {
      return selected.map((option) => options[option].value);
    };
  
      useEffect(() => {
        const clickHandler = ({ target }: MouseEvent) => {
          if (!dropdownRef.current || !trigger.current) return;
          if (
            !show ||
            dropdownRef.current.contains(target as Node) ||
            trigger.current.contains(target as Node)
          )
            return;
          setShow(false);
        };
        document.addEventListener('click', clickHandler);
        return () => document.removeEventListener('click', clickHandler);
      });

      if (isLoading) {
        return <Loader />;
      }
  
    return (
      <div className="relative z-50">
        <label className="mb-3 block text-sm font-medium text-black dark:text-white">
          Select items
        </label>
        <div>
          <select title="select items" className="hidden" id={id}>
            {items?.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
  
          <div className="flex flex-col items-center">
            <input name="values" type="hidden" defaultValue={selectedValues()} />
            <div className="relative z-20 inline-block w-full">
              <div className="relative flex flex-col items-center">
                <div ref={trigger} onClick={open} className="w-full">
                  <div className="mb-2 flex rounded border border-stroke py-2 pl-3 pr-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input">
                    <div className="flex flex-auto flex-wrap gap-3">
                      {selected.map((index) => (
                        <div
                          key={index}
                          className="my-1.5 flex items-center justify-center rounded border-[.5px] border-stroke bg-gray px-2.5 py-1.5 text-sm font-medium dark:border-strokedark dark:bg-white/30"
                        >
                          <div className="max-w-full flex-initial">
                            {options[index].text}
                          </div>
                          <div className="flex flex-auto flex-row-reverse">
                            <div
                              onClick={() => remove(index)}
                              className="cursor-pointer pl-2 hover:text-danger"
                            >
                              <svg
                                className="fill-current"
                                role="button"
                                width="12"
                                height="12"
                                viewBox="0 0 12 12"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  fillRule="evenodd"
                                  clipRule="evenodd"
                                  d="M9.35355 3.35355C9.54882 3.15829 9.54882 2.84171 9.35355 2.64645C9.15829 2.45118 8.84171 2.45118 8.64645 2.64645L6 5.29289L3.35355 2.64645C3.15829 2.45118 2.84171 2.45118 2.64645 2.64645C2.45118 2.84171 2.45118 3.15829 2.64645 3.35355L5.29289 6L2.64645 8.64645C2.45118 8.84171 2.45118 9.15829 2.64645 9.35355C2.84171 9.54882 3.15829 9.54882 3.35355 9.35355L6 6.70711L8.64645 9.35355C8.84171 9.54882 9.15829 9.54882 9.35355 9.35355C9.54882 9.15829 9.54882 8.84171 9.35355 8.64645L6.70711 6L9.35355 3.35355Z"
                                  fill="currentColor"
                                ></path>
                              </svg>
                            </div>
                          </div>
                        </div>
                      ))}
                      {selected.length === 0 && (
                        <div className="flex-1">
                          <input
                            placeholder="Select an option"
                            className="h-full w-full appearance-none bg-transparent p-1 px-2 outline-none"
                            defaultValue={selectedValues()}
                          />
                        </div>
                      )}
                    </div>
                    <div className="flex w-8 items-center py-1 pl-1 pr-1">
                      <button
                      title="open"
                        type="button"
                        onClick={open}
                        className="h-6 w-6 cursor-pointer outline-none focus:outline-none"
                      >
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
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-full">
                {show && (
                  <div
                    ref={dropdownRef}
                    className="scrollbar absolute left-0 top-0 mt-2 max-h-64 w-full overflow-y-scroll rounded-md border border-stroke bg-white py-2 shadow-md dark:border-strokedark dark:bg-boxdark"
                  >
                    {options.map((option, index) => (
                      <div
                        className="relative w-full cursor-pointer p-2.5 hover:bg-gray dark:hover:bg-meta-4"
                        key={index}
                        onClick={(e) => select(index, e)}
                      >
                        {option.selected ? (
                          <div className="inline-flex items-center gap-2">
                            <span className="text-primary">
                              <svg
                                className="fill-current"
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                              >
                                <path
                                  d="M17.2 5.80005C17.5388 5.46132 17.5388 4.90015 17.2 4.56142C16.8613 4.22268 16.3001 4.22268 15.9613 4.56142L8.19592 12.3268L4.0387 8.16957C3.69996 7.83083 3.1388 7.83083 2.80005 8.16957C2.46132 8.50832 2.46132 9.06947 2.80005 9.40822L7.63005 14.2382C7.9688 14.5769 8.53004 14.5769 8.8688 14.2382L17.2 5.80005Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </span>
                            {option.text}
                          </div>
                        ) : (
                          <div>{option.text}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
                </div>
              </div>
            </div>
          </div>
    );
}

export default SelectItems;