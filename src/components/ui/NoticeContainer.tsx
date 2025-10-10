import React from 'react';

interface NoticeContainerProps {
    children: React.ReactNode;
}

export const NoticeContainer: React.FC<NoticeContainerProps> = ({ children }) => {
    return (
        <div className="max-w-3xl mx-auto px-4 py-8 sm:px-3 sm:py-6 max-[480px]:px-2 max-[480px]:py-4">
            {children}
        </div>
    );
};

interface NoticeBoxProps {
    children: React.ReactNode;
}

export const NoticeBox: React.FC<NoticeBoxProps> = ({ children }) => {
    return (
        <div className="bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border-2 border-yellow-400 sm:p-6 max-[480px]:p-4">
            {children}
        </div>
    );
};

interface NoticeTitleProps {
    children: React.ReactNode;
    icon?: string;
}

export const NoticeTitle: React.FC<NoticeTitleProps> = ({ children, icon }) => {
    return (
        <h2 className="text-3xl font-bold text-center mb-6 bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent sm:text-2xl max-[480px]:text-xl">
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </h2>
    );
};

interface NoticeTextProps {
    children: React.ReactNode;
}

export const NoticeText: React.FC<NoticeTextProps> = ({ children }) => {
    return (
        <p className="text-gray-700 text-lg mb-6 leading-relaxed sm:text-base">
            {children}
        </p>
    );
};

interface NoticeDetailsProps {
    title: string;
    children: React.ReactNode;
}

export const NoticeDetails: React.FC<NoticeDetailsProps> = ({ title, children }) => {
    return (
        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-6 mb-6 rounded-r-lg">
            <p className="font-semibold text-gray-800 mb-3 text-lg">
                {title}
            </p>
            {children}
        </div>
    );
};

interface NoticeListProps {
    items: string[];
}

export const NoticeList: React.FC<NoticeListProps> = ({ items }) => {
    return (
        <ul className="list-disc list-inside space-y-2 text-gray-700">
            {items.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    );
};

interface NoticeActionsProps {
    children: React.ReactNode;
}

export const NoticeActions: React.FC<NoticeActionsProps> = ({ children }) => {
    return (
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
            {children}
        </div>
    );
};

interface NoticeButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary';
}

export const NoticeButton: React.FC<NoticeButtonProps> = ({ 
    children, 
    onClick, 
    variant = 'primary' 
}) => {
    const primaryClasses = "flex-1 px-6 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 sm:py-3 sm:text-sm";
    const secondaryClasses = "flex-1 px-6 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 sm:py-3 sm:text-sm";
    
    return (
        <button 
            onClick={onClick}
            className={variant === 'primary' ? primaryClasses : secondaryClasses}
        >
            {children}
        </button>
    );
};

interface NoticeFooterProps {
    children: React.ReactNode;
}

export const NoticeFooter: React.FC<NoticeFooterProps> = ({ children }) => {
    return (
        <div className="text-center pt-4 border-t border-gray-200">
            <small className="text-gray-600 italic">
                {children}
            </small>
        </div>
    );
};
