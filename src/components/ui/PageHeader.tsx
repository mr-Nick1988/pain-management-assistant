import React from 'react';

interface PageHeaderProps {
    title: string;
    description?: string;
    actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, description, actions }) => {
    return (
        <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 bg-clip-text text-transparent animate-gradient drop-shadow-lg">
                {title}
            </h1>
            {description && (
                <p className="text-lg font-medium bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-md">
                    {description}
                </p>
            )}
            {actions && <div className="mt-4">{actions}</div>}
        </div>
    );
};
