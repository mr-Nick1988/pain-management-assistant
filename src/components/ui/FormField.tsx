import React from 'react';

interface FormFieldProps {
    label: string;
    id: string;
    type?: string;
    placeholder?: string;
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    required?: boolean;
    disabled?: boolean;
    error?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
    label,
    id,
    type = "text",
    placeholder,
    value,
    onChange,
    required,
    disabled,
    error
}) => {
    return (
        <div>
            <label 
                htmlFor={id} 
                className="block text-sm font-semibold text-gray-700 mb-2"
            >
                {label}
            </label>
            <input
                id={id}
                name={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={onChange}
                required={required}
                disabled={disabled}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-900 bg-white shadow-sm hover:shadow-md focus:shadow-lg focus:-translate-y-0.5 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
        </div>
    );
};
