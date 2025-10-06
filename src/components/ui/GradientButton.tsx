import React from 'react';

interface GradientButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'blue' | 'gray' | 'green' | 'red';
    fullWidth?: boolean;
}

const variantClasses = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    gray: 'bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700',
    green: 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    red: 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
};

export const GradientButton: React.FC<GradientButtonProps> = ({
    children,
    variant = 'blue',
    fullWidth = false,
    className = '',
    ...props
}) => {
    return (
        <button
            {...props}
            className={`
                ${variantClasses[variant]}
                text-white px-6 py-3 rounded-xl font-semibold 
                transition-all duration-200 border-none 
                disabled:opacity-50 disabled:cursor-not-allowed 
                shadow-lg hover:shadow-xl hover:-translate-y-1
                ${fullWidth ? 'w-full' : ''}
                ${className}
            `}
        >
            {children}
        </button>
    );
};
