import React from 'react';

interface ProgressBarProps {
    value: number; // 0-100
    label?: string;
    showPercentage?: boolean;
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'orange';
    height?: 'sm' | 'md' | 'lg';
    className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    label,
    showPercentage = true,
    color = 'blue',
    height = 'md',
    className = ''
}) => {
    const colorClasses = {
        blue: 'bg-gradient-to-r from-blue-400 to-blue-600',
        green: 'bg-gradient-to-r from-green-400 to-green-600',
        yellow: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
        red: 'bg-gradient-to-r from-red-400 to-red-600',
        purple: 'bg-gradient-to-r from-purple-400 to-purple-600',
        orange: 'bg-gradient-to-r from-orange-400 to-orange-600'
    };

    const heightClasses = {
        sm: 'h-2',
        md: 'h-3',
        lg: 'h-4'
    };

    const percentage = Math.min(Math.max(value, 0), 100);

    return (
        <div className={className}>
            {label && (
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">{label}</span>
                    {showPercentage && (
                        <span className="text-sm font-bold text-gray-900">
                            {percentage.toFixed(1)}%
                        </span>
                    )}
                </div>
            )}
            <div className="w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                    className={`${heightClasses[height]} ${colorClasses[color]} rounded-full transition-all duration-500 ease-out`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};
