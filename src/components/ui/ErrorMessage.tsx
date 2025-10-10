import React from 'react';
import { cn } from '../../utils/cn';

interface ErrorMessageProps {
    message: string;
    onClose?: () => void;
    className?: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onClose, className }) => {
    return (
        <div className={cn("bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4", className)}>
            {message}
            {onClose && (
                <button
                    onClick={onClose}
                    className="float-right ml-4 font-bold hover:text-red-900"
                >
                    ×
                </button>
            )}
        </div>
    );
};

interface SuccessMessageProps {
    message: string;
    onClose?: () => void;
    className?: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({ message, onClose, className }) => {
    return (
        <div className={cn("bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4", className)}>
            {message}
            {onClose && (
                <button
                    onClick={onClose}
                    className="float-right ml-4 font-bold hover:text-green-900"
                >
                    ×
                </button>
            )}
        </div>
    );
};
