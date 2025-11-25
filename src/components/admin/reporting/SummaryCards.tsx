import React from "react";
import { Card, CardContent } from "../../ui";
import type { SummaryStatistics } from "../../../types/reporting";
import { Users, ClipboardList, AlertTriangle, User as UserIcon } from "lucide-react";

interface SummaryCardsProps {
    summary: SummaryStatistics | undefined;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ summary }) => {
    if (!summary) {
        return null;
    }

    const totalLogins = summary.users?.totalLogins ?? 0;
    const successfulLogins = summary.users?.successfulLogins ?? 0;
    const failedLogins = summary.users?.failedLogins ?? 0;

    const cards = [
        {
            title: "Patients",
            icon: <Users className="w-6 h-6 text-gray-700" />,
            stats: [
                { label: "Registered", value: summary.patients?.totalRegistered ?? 0 },
                { label: "VAS Records", value: summary.patients?.totalVasRecords ?? 0 },
                { label: "Avg VAS", value: (summary.patients?.averageVasLevel ?? 0).toFixed(1) },
            ],
            color: "from-blue-500 to-cyan-500",
        },
        {
            title: "Recommendations",
            icon: <ClipboardList className="w-6 h-6 text-gray-700" />,
            stats: [
                { label: "Total", value: summary.recommendations?.total ?? 0 },
                { label: "Approved", value: summary.recommendations?.approved ?? 0 },
                { label: "Approval Rate", value: `${(summary.recommendations?.approvalRate ?? 0).toFixed(1)}%` },
            ],
            color: "from-green-500 to-emerald-500",
        },
        {
            title: "Escalations",
            icon: <AlertTriangle className="w-6 h-6 text-gray-700" />,
            stats: [
                { label: "Total", value: summary.escalations?.total ?? 0 },
                { label: "Resolved", value: summary.escalations?.resolved ?? 0 },
                { label: "Pending", value: summary.escalations?.pending ?? 0 },
            ],
            color: "from-orange-500 to-red-500",
        },
        {
            title: "User Activity",
            icon: <UserIcon className="w-6 h-6 text-gray-700" />,
            stats: [
                { label: "Logins", value: `${totalLogins} (${successfulLogins}/${failedLogins})` },
                { label: "Active Users", value: summary.users?.uniqueActiveUsers ?? 0 },
                { label: "Period", value: `${summary.period?.daysCount ?? 0} days` },
            ],
            color: "from-indigo-500 to-blue-500",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, index) => (
                <Card key={index} className="overflow-hidden">
                    <div className={`h-2 bg-gradient-to-r ${card.color}`} />
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-800">{card.title}</h3>
                            <span>{card.icon}</span>
                        </div>
                        <div className="space-y-2">
                            {card.stats.map((stat, idx) => (
                                <div key={idx} className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">{stat.label}</span>
                                    <span className="text-sm font-bold text-gray-900">{stat.value}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
};

export default SummaryCards;
