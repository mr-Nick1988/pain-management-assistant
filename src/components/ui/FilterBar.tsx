import React from "react";
import { Label } from "./Input";


interface FilterBarProps {
    children: React.ReactNode;
    className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({ children, className = "" }) => {
    return (
        <div className={`bg-gray-50 p-4 rounded-lg space-y-4 ${className}`}>
            {children}
        </div>
    );
};

interface FilterRowProps {
    children: React.ReactNode;
    className?: string;
}

export const FilterRow: React.FC<FilterRowProps> = ({ children, className = "" }) => {
    return (
        <div className={`flex flex-col sm:flex-row gap-4 ${className}`}>
            {children}
        </div>
    );
};

interface FilterGridProps {
    children: React.ReactNode;
    columns?: 2 | 3 | 4;
    className?: string;
}

export const FilterGrid: React.FC<FilterGridProps> = ({ children, columns = 3, className = "" }) => {
    const gridCols = {
        2: "grid-cols-1 sm:grid-cols-2",
        3: "grid-cols-1 sm:grid-cols-3",
        4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
    };

    return (
        <div className={`grid ${gridCols[columns]} gap-4 ${className}`}>
            {children}
        </div>
    );
};

interface FilterFieldProps {
    label: string;
    children: React.ReactNode;
    className?: string;
}

export const FilterField: React.FC<FilterFieldProps> = ({ label, children, className = "" }) => {
    return (
        <div className={className}>
            <Label>{label}</Label>
            <div className="mt-1">
                {children}
            </div>
        </div>
    );
};
