import React from 'react';
import { Card, CardContent, CardHeader } from './Card';

interface SearchCardProps {
    title: string;
    description?: string;
    children: React.ReactNode;
}

export const SearchCard: React.FC<SearchCardProps> = ({ title, description, children }) => {
    return (
        <Card>
            <CardHeader>
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    {description && <p className="text-gray-600 mt-2">{description}</p>}
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {children}
            </CardContent>
        </Card>
    );
};

interface SearchFieldProps {
    label: string;
    children: React.ReactNode;
    error?: string;
}

export const SearchField: React.FC<SearchFieldProps> = ({ label, children, error }) => {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
            <div className="flex gap-2">
                {children}
            </div>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};
