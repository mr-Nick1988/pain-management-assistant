import React from 'react';

interface NavigationContainerProps {
    children: React.ReactNode;
}

export const NavigationContainer: React.FC<NavigationContainerProps> = ({ children }) => {
    return (
        <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200">
            {children}
        </nav>
    );
};

interface NavigationListProps {
    children: React.ReactNode;
}

export const NavigationList: React.FC<NavigationListProps> = ({ children }) => {
    return (
        <ul className="flex flex-wrap items-center justify-center gap-2 p-4 max-w-7xl mx-auto sm:gap-1 sm:p-2 max-[480px]:flex-col max-[480px]:w-full">
            {children}
        </ul>
    );
};

interface NavigationItemProps {
    children: React.ReactNode;
}

export const NavigationItem: React.FC<NavigationItemProps> = ({ children }) => {
    return (
        <li className="list-none">
            {children}
        </li>
    );
};

interface NavigationLinkProps {
    children: React.ReactNode;
    onClick?: () => void;
    href?: string;
    isButton?: boolean;
}

export const NavigationLink: React.FC<NavigationLinkProps> = ({ 
    children, 
    onClick, 
    href,
    isButton = false 
}) => {
    const baseClasses = "px-4 py-2 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:px-3 sm:py-2 sm:text-sm max-[480px]:w-full max-[480px]:text-center";
    
    const linkClasses = `${baseClasses} text-gray-700 hover:text-blue-600 hover:bg-blue-50`;
    const buttonClasses = `${baseClasses} bg-red-500 text-white hover:bg-red-600`;
    
    if (isButton) {
        return (
            <button onClick={onClick} className={buttonClasses}>
                {children}
            </button>
        );
    }
    
    if (href) {
        return (
            <a href={href} className={linkClasses}>
                {children}
            </a>
        );
    }
    
    return (
        <span className={linkClasses}>
            {children}
        </span>
    );
};
