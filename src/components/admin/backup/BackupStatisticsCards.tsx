import React from "react";
import { Card, CardContent } from "../../ui";
import type { BackupStatisticsDTO } from "../../../types/backup";

interface BackupStatisticsCardsProps {
    statistics: BackupStatisticsDTO;
}

const BackupStatisticsCards: React.FC<BackupStatisticsCardsProps> = ({ statistics }) => {
    const successRate = statistics.totalBackups > 0
        ? ((statistics.successfulBackups / statistics.totalBackups) * 100).toFixed(1)
        : "0.0";

    const avgDurationSec = (statistics.averageBackupDurationMs / 1000).toFixed(1);

    const cards = [
        {
            title: "Total Backups",
            icon: "💾",
            value: statistics.totalBackups,
            subtitle: `${statistics.successfulBackups} successful, ${statistics.failedBackups} failed`,
            color: "from-blue-500 to-cyan-500",
        },
        {
            title: "Success Rate",
            icon: "✅",
            value: `${successRate}%`,
            subtitle: `${statistics.successfulBackups} out of ${statistics.totalBackups}`,
            color: "from-green-500 to-emerald-500",
        },
        {
            title: "Total Storage",
            icon: "📦",
            value: statistics.totalSizeGB,
            subtitle: statistics.totalSizeMB,
            color: "from-purple-500 to-pink-500",
        },
        {
            title: "Avg Duration",
            icon: "⏱️",
            value: `${avgDurationSec}s`,
            subtitle: `${statistics.averageBackupDurationMs.toFixed(0)}ms`,
            color: "from-orange-500 to-red-500",
        },
    ];

    return (
        <>
            {/* Main Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {cards.map((card, index) => (
                    <Card key={index} className="overflow-hidden">
                        <div className={`h-2 bg-gradient-to-r ${card.color}`} />
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="text-sm font-semibold text-gray-700">{card.title}</h3>
                                <span className="text-3xl">{card.icon}</span>
                            </div>
                            <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
                            <p className="text-xs text-gray-600">{card.subtitle}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Backup Types Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                    <CardContent className="p-4 text-center">
                        <p className="text-4xl mb-2">🗄️</p>
                        <p className="text-2xl font-bold text-blue-900">{statistics.h2BackupsCount}</p>
                        <p className="text-sm text-blue-700">H2 Database Backups</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                    <CardContent className="p-4 text-center">
                        <p className="text-4xl mb-2">🍃</p>
                        <p className="text-2xl font-bold text-green-900">{statistics.mongoBackupsCount}</p>
                        <p className="text-sm text-green-700">MongoDB Backups</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                    <CardContent className="p-4 text-center">
                        <p className="text-4xl mb-2">🌐</p>
                        <p className="text-2xl font-bold text-purple-900">{statistics.fullSystemBackupsCount}</p>
                        <p className="text-sm text-purple-700">Full System Backups</p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
};

export default BackupStatisticsCards;
