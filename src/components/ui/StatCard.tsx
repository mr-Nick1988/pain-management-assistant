import React from 'react';
import { cn } from '../../utils/cn';
import { Card, CardContent } from './Card';

interface StatCardProps {
    title: string;
    value: number | string;
    description?: string;
    icon?: string;
    iconNode?: React.ReactNode;
    iconBgColor?: string;
    iconTextColor?: string;
    className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    description,
    icon,
    iconNode,
    iconBgColor = 'bg-blue-100',
    iconTextColor = 'text-blue-600',
    className
}) => {
    return (
        <Card className={className}>
            <CardContent className="p-6">
                <div className="flex items-center">
                    {(iconNode || icon) && (
                        <div className="flex-shrink-0">
                            <div className={cn("w-8 h-8 rounded-full flex items-center justify-center", iconBgColor)}>
                                {iconNode ? (
                                    <span className={cn(iconTextColor)}>{iconNode}</span>
                                ) : (
                                    <span className={cn("text-sm font-medium", iconTextColor)}>{icon}</span>
                                )}
                            </div>
                        </div>
                    )}
                    <div className={cn(icon ? "ml-4" : "")}>
                        <h3 className="text-sm font-medium text-gray-900">{title}</h3>
                        <div className="text-2xl font-bold text-gray-900">{value}</div>
                        {description && <p className="text-sm text-gray-500">{description}</p>}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};
