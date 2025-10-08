import React from "react";

interface GridProps {
    children: React.ReactNode;
    columns?: 1 | 2 | 3 | 4;
    gap?: 2 | 4 | 6 | 8;
    className?: string;
}

export const Grid: React.FC<GridProps> = ({ 
    children, 
    columns = 3, 
    gap = 6,
    className = "" 
}) => {
    const gridCols = {
        1: "grid-cols-1",
        2: "grid-cols-1 md:grid-cols-2",
        3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
        4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
    };

    const gapClasses = {
        2: "gap-2",
        4: "gap-4",
        6: "gap-6",
        8: "gap-8",
    };

    return (
        <div className={`grid ${gridCols[columns]} ${gapClasses[gap]} ${className}`}>
            {children}
        </div>
    );
};

interface EmptyStateProps {
    message: string;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ message, className = "" }) => {
    return (
        <div className={`p-8 text-center ${className}`}>
            <p className="text-gray-500">{message}</p>
        </div>
    );
};
