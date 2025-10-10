import React from 'react';

interface GradientTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const GradientTitle: React.FC<GradientTitleProps> = ({ children, className = '' }) => {
    return (
        <h2 className={`text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent text-center mb-8 ${className}`}>
            {children}
        </h2>
    );
};
