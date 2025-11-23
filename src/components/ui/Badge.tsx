import React from "react";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "success" | "warning" | "error" | "info" | "secondary";
    className?: string;
    title?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = "default", className = "", title }) => {
    const baseClasses = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
    
    const variantClasses = {
        default: "bg-gray-100 text-gray-800",
        success: "bg-green-100 text-green-800",
        warning: "bg-yellow-100 text-yellow-800",
        error: "bg-red-100 text-red-800",
        info: "bg-blue-100 text-blue-800",
        secondary: "bg-purple-100 text-purple-800",
    };

    return (
        <span className={`${baseClasses} ${variantClasses[variant]} ${className}`} title={title}>
            {children}
        </span>
    );
};

// Status Badge для эскалаций
interface StatusBadgeProps {
    status: string;
    className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, className = "" }) => {
    const getVariant = () => {
        switch (status) {
            case "PENDING":
                return "warning";
            case "IN_PROGRESS":
                return "info";
            case "RESOLVED":
                return "success";
            case "CANCELLED":
                return "default";
            default:
                return "default";
        }
    };

    return <Badge variant={getVariant()} className={className}>{status}</Badge>;
};

// Priority Badge для эскалаций
interface PriorityBadgeProps {
    priority: string;
    className?: string;
}

export const PriorityBadge: React.FC<PriorityBadgeProps> = ({ priority, className = "" }) => {
    const getVariant = () => {
        switch (priority) {
            case "HIGH":
                return "error";
            case "MEDIUM":
                return "warning";
            case "LOW":
                return "info";
            default:
                return "default";
        }
    };

    return <Badge variant={getVariant()} className={className}>{priority}</Badge>;
};
