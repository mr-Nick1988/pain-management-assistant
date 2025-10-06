import React from 'react';
import { cn } from '../../utils/cn';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    children: React.ReactNode;
    className?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children, className }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
            <div className={cn("bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto", className)} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

interface ModalHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const ModalHeader: React.FC<ModalHeaderProps> = ({ children, className }) => {
    return (
        <div className={cn("p-6 border-b border-gray-200", className)}>
            {children}
        </div>
    );
};

interface ModalBodyProps {
    children: React.ReactNode;
    className?: string;
}

export const ModalBody: React.FC<ModalBodyProps> = ({ children, className }) => {
    return (
        <div className={cn("p-6", className)}>
            {children}
        </div>
    );
};

interface ModalFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => {
    return (
        <div className={cn("p-6 border-t border-gray-200 flex justify-end gap-3", className)}>
            {children}
        </div>
    );
};
