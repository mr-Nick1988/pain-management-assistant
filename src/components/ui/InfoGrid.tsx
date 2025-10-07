import React from 'react';

interface InfoItemProps {
    label: string;
    value: string | number | React.ReactNode;
    valueClassName?: string;
}

export const InfoItem: React.FC<InfoItemProps> = ({ label, value, valueClassName = "text-gray-900" }) => {
    return (
        <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-600">{label}:</span>
            <span className={`text-sm ${valueClassName}`}>{value}</span>
        </div>
    );
};

interface InfoGridProps {
    children: React.ReactNode;
    columns?: 1 | 2 | 3 | 4;
}

export const InfoGrid: React.FC<InfoGridProps> = ({ children, columns = 2 }) => {
    const gridClass = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-2 md:grid-cols-4"
    }[columns];

    return (
        <div className={`grid ${gridClass} gap-4`}>
            {children}
        </div>
    );
};
