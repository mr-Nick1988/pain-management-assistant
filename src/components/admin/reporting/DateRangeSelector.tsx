import React from "react";
import { format, subDays } from "date-fns";
import { Card, CardContent, Button } from "../../ui";

interface DateRangeSelectorProps {
    startDate: string;
    endDate: string;
    onChange: (startDate: string, endDate: string) => void;
}

const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({ startDate, endDate, onChange }) => {
    const handleQuickFilter = (days: number) => {
        const end = format(new Date(), "yyyy-MM-dd");
        const start = format(subDays(new Date(), days), "yyyy-MM-dd");
        onChange(start, end);
    };

    return (
        <Card>
            <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                    {/* Date Inputs */}
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => onChange(e.target.value, endDate)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                End Date
                            </label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => onChange(startDate, e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="flex gap-2 flex-wrap">
                        <Button
                            variant="outline"
                            onClick={() => handleQuickFilter(7)}
                            className="text-sm"
                        >
                            Last 7 Days
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleQuickFilter(30)}
                            className="text-sm"
                        >
                            Last 30 Days
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => handleQuickFilter(90)}
                            className="text-sm"
                        >
                            Last 90 Days
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default DateRangeSelector;
