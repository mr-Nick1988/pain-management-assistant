import React from 'react';
import { Card, CardContent } from './Card';

interface MetricCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon?: string;
    iconNode?: React.ReactNode;
    color?: 'blue' | 'green' | 'red' | 'yellow' | 'purple' | 'orange' | 'indigo';
    className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    iconNode,
    color = 'blue',
    className = ''
}) => {
    const colorClasses = {
        blue: 'bg-blue-50 border-blue-200',
        green: 'bg-green-50 border-green-200',
        red: 'bg-red-50 border-red-200',
        yellow: 'bg-yellow-50 border-yellow-200',
        purple: 'bg-purple-50 border-purple-200',
        orange: 'bg-orange-50 border-orange-200',
        indigo: 'bg-indigo-50 border-indigo-200'
    };

    const textColorClasses = {
        blue: 'text-blue-600',
        green: 'text-green-600',
        red: 'text-red-600',
        yellow: 'text-yellow-600',
        purple: 'text-purple-600',
        orange: 'text-orange-600',
        indigo: 'text-indigo-600'
    };

    return (
        <Card className={`${colorClasses[color]} border-2 ${className}`}>
            <CardContent className="p-6">
                <div className="text-center">
                    {iconNode ? (
                        <div className="mb-2 flex justify-center">{iconNode}</div>
                    ) : (
                        icon && <div className="text-4xl mb-2">{icon}</div>
                    )}
                    <p className="text-sm text-gray-600 mb-1">{title}</p>
                    <p className={`text-4xl font-bold ${textColorClasses[color]} mb-1`}>
                        {value}
                    </p>
                    {subtitle && (
                        <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
