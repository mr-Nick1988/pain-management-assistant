import React, { useEffect } from 'react';
import type { ToastType } from '../../contexts/ToastContext';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 4000 }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const typeStyles = {
        success: 'bg-gradient-to-r from-green-500 to-emerald-600 text-white',
        error: 'bg-gradient-to-r from-red-500 to-rose-600 text-white',
        warning: 'bg-gradient-to-r from-yellow-500 to-amber-600 text-white',
        info: 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white',
    };

    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ',
    };

    return (
        <div
            className={`
                fixed top-4 right-4 z-50 
                min-w-[300px] max-w-md
                ${typeStyles[type]}
                rounded-lg shadow-2xl
                px-6 py-4
                flex items-center gap-3
                animate-slide-in-right
                backdrop-blur-sm
            `}
        >
            <span className="text-2xl font-bold">{icons[type]}</span>
            <p className="flex-1 font-medium">{message}</p>
            <button
                onClick={onClose}
                className="text-white/80 hover:text-white transition-colors text-xl font-bold"
                aria-label="Close"
            >
                ×
            </button>
        </div>
    );
};
