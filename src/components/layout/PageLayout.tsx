import React from 'react';
import { PageNavigation } from '../ui/PageNavigation';

interface PageLayoutProps {
    children: React.ReactNode;
    showNavigation?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ 
    children, 
    showNavigation = true 
}) => {
    return (
        <>
            {children}
            {showNavigation && <PageNavigation />}
        </>
    );
};
