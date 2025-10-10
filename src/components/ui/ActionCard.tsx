import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './Card';
import { Button } from './Button';

interface ActionCardProps {
    title: string;
    description?: string;
    icon?: string;
    onClick?: () => void;
    buttonText?: string;
    buttonVariant?: "default" | "approve" | "reject" | "update" | "delete" | "cancel";
}

export const ActionCard: React.FC<ActionCardProps> = ({ 
    title, 
    description, 
    icon, 
    onClick, 
    buttonText,
    buttonVariant = "default" 
}) => {
    return (
        <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
            <CardHeader>
                {icon && <div className="text-4xl mb-2">{icon}</div>}
                <CardTitle>{title}</CardTitle>
                {description && <CardDescription>{description}</CardDescription>}
            </CardHeader>
            {buttonText && (
                <CardContent>
                    <Button variant={buttonVariant} className="w-full">
                        {buttonText}
                    </Button>
                </CardContent>
            )}
        </Card>
    );
};
