import React from 'react';
import Select, { SingleValue, Theme, StylesConfig } from 'react-select';

interface Option {
  value: string;
  label: string;
}

interface SelectUomProps {
  options: Option[];
  defaultOptionText?: string;
  selectedOption: string;
  onOptionChange: (value: string) => void;
  containerMargin: string;
  labelMargin: string;
  border: string
  title: string
}

const SelectOptions: React.FC<SelectUomProps> = ({ options, defaultOptionText = 'Select your subject', selectedOption, onOptionChange, containerMargin, labelMargin, border, title }) => {
  const value = options.find((o) => o.value === selectedOption) || null;
  const portalTarget = typeof window !== 'undefined' ? document.body : null;
  const isDark = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');
  const borderColor = isDark ? '#3d4d60' /* form-strokedark */ : '#E2E8F0' /* stroke */;
  const controlBg = isDark ? '#1d2a39' /* form-input */ : 'transparent';
  const primary = '#3C50E0';

  const styles: StylesConfig<Option, false> = {
    control: (base, state) => ({
      ...base,
      backgroundColor: controlBg,
      borderColor: state.isFocused ? primary : borderColor,
      boxShadow: 'none',
      minHeight: '44px',
      borderWidth: '1.5px',
      '&:hover': {
        borderColor: primary,
      },
    }),
    valueContainer: (base) => ({
      ...base,
      padding: '0 12px',
    }),
    singleValue: (base) => ({ ...base, color: 'inherit' }),
    menu: (base) => ({ ...base, zIndex: 50 }),
    option: (base, state) => ({
      ...base,
      color: 'inherit',
      backgroundColor: state.isFocused ? (isDark ? '#24303F' /* boxdark */ : '#F7F9FC' /* gray-2 */) : 'transparent',
    }),
    indicatorsContainer: (base) => ({
      ...base,
      color: 'inherit',
    }),
    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  };

  return (
    <div className={`${containerMargin}`}>
      <label className={`${labelMargin} block text-sm font-medium text-black dark:text-white`}>
       {defaultOptionText}
      </label>

      <div className={`relative z-20 bg-transparent dark:bg-form-input ${border}`}>
        <Select<Option, false>
          inputId={title}
          isSearchable
          isClearable
          classNamePrefix="rs"
          placeholder={defaultOptionText}
          options={options}
          value={value}
          onChange={(opt: SingleValue<Option>) => onOptionChange(opt?.value ?? '')}
          styles={styles}
          menuPortalTarget={portalTarget}
          menuPosition="fixed"
          theme={(theme: Theme) => ({
            ...theme,
            colors: {
              ...theme.colors,
              primary: '#3C50E0',
            },
          })}
        />
      </div>
    </div>
  );
};


export default SelectOptions;