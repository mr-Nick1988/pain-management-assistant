import React from 'react';
import { Card, CardContent, CardHeader } from './Card';
import { Button } from './Button';

interface FormCardProps {
    title: string;
    children: React.ReactNode;
    onSubmit: (e: React.FormEvent) => void;
    onCancel: () => void;
    submitText?: string;
    cancelText?: string;
    isLoading?: boolean;
    error?: React.ReactNode;
}

export const FormCard: React.FC<FormCardProps> = ({ 
    title, 
    children, 
    onSubmit, 
    onCancel,
    submitText = "Submit",
    cancelText = "Cancel",
    isLoading = false,
    error
}) => {
    return (
        <Card>
            <CardHeader>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                </div>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-6">
                    {children}
                    {error && <div>{error}</div>}
                    <div className="flex gap-4">
                        <Button type="button" variant="cancel" onClick={onCancel}>
                            {cancelText}
                        </Button>
                        <Button type="submit" variant="approve" disabled={isLoading}>
                            {isLoading ? "Saving..." : submitText}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
};

interface FormGridProps {
    children: React.ReactNode;
    columns?: 1 | 2;
}

export const FormGrid: React.FC<FormGridProps> = ({ children, columns = 2 }) => {
    const gridClass = columns === 1 ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2";
    return <div className={`grid ${gridClass} gap-6`}>{children}</div>;
};

interface FormFieldWrapperProps {
    label: string;
    required?: boolean;
    hint?: string;
    error?: string;
    children: React.ReactNode;
}

export const FormFieldWrapper: React.FC<FormFieldWrapperProps> = ({ 
    label, 
    required, 
    hint, 
    error, 
    children 
}) => {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
                {label} {required && "*"}
            </label>
            {children}
            {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};
