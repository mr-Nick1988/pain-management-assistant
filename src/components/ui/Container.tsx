import React from 'react';

interface ContainerProps {
    children: React.ReactNode;
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl';
    className?: string;
}

const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '4xl': 'max-w-4xl'
};

export const Container: React.FC<ContainerProps> = ({ 
    children, 
    maxWidth = 'md',
    className = ''
}) => {
    return (
        <div className={`${maxWidthClasses[maxWidth]} mx-auto mt-16 bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-white/20 ${className}`}>
            {children}
        </div>
    );
};
