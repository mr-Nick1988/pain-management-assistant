import React from 'react';
import { cn } from '../../utils/cn';

interface LoadingSpinnerProps {
    message?: string;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
};

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Loading...', className, size = 'md' }) => {
    return (
        <div className={cn("flex justify-center items-center py-8", className)}>
            <div className={cn("animate-spin rounded-full border-b-2 border-blue-600", sizeClasses[size])}></div>
            {message && <span className="ml-2 text-gray-700">{message}</span>}
        </div>
    );
};
