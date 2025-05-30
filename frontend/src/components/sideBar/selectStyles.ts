import type { StylesConfig, GroupBase } from 'react-select';

interface OptionType {
    label: string;
    value: string;
}

export const customStyles: StylesConfig<OptionType, false, GroupBase<OptionType>> = {
    control: (provided, state) => ({
        ...provided,
        backgroundColor: '#1f1f1f',
        borderColor: state.isFocused ? '#555' : '#444',
        boxShadow: state.isFocused ? '0 0 0 1px #888' : 'none',
        color: '#eee',
        '&:hover': {
            borderColor: '#666',
        },
    }),
    singleValue: (provided) => ({
        ...provided,
        color: '#eee',
    }),
    placeholder: (provided) => ({
        ...provided,
        color: '#aaa',
    }),
    menu: (provided) => ({
        ...provided,
        backgroundColor: '#1f1f1f',
        color: '#eee',
        zIndex: 9999, 
    }),
    option: (provided, state) => ({
        ...provided,
        backgroundColor: state.isFocused ? '#333' : 'transparent',
        color: '#eee',
        '&:active': {
            backgroundColor: '#444',
        },
    }),
    menuPortal: (base) => ({
        ...base,
        zIndex: 9999,
    }),
};
  