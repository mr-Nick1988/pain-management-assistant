import React from 'react';

interface PageContainerProps {
    children: React.ReactNode;
    className?: string;
}

export const PageContainer: React.FC<PageContainerProps> = ({ children, className = '' }) => {
    return (
        <div className={`min-h-screen flex items-center justify-center p-8 ${className}`}>
            {children}
        </div>
    );
};
