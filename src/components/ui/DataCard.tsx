import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';

interface DataCardProps {
    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    className?: string;
}

export const DataCard: React.FC<DataCardProps> = ({ title, children, actions, className = "" }) => {
    return (
        <Card className={className}>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle>{title}</CardTitle>
                    {actions && <div>{actions}</div>}
                </div>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
        </Card>
    );
};
