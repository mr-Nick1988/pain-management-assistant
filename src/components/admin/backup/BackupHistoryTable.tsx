import React from "react";
import { format } from "date-fns";
import type { BackupResponseDTO, BackupType, BackupStatus, BackupTrigger } from "../../../types/backup";
import { Button } from "../../ui";
import { HardDrive, Leaf, Globe, Loader2, CheckCircle2, XCircle, AlertTriangle, Clock, User, RefreshCw } from "lucide-react";

interface BackupHistoryTableProps {
    backups: BackupResponseDTO[];
    onRestoreClick: (backup: BackupResponseDTO) => void;
}

const BackupHistoryTable: React.FC<BackupHistoryTableProps> = ({ backups, onRestoreClick }) => {
    const getTypeBadge = (type: BackupType) => {
        const badges = {
            H2_DATABASE: { color: "bg-blue-100 text-blue-800", icon: <HardDrive className="w-3.5 h-3.5"/>, label: "H2 DB" },
            MONGODB: { color: "bg-green-100 text-green-800", icon: <Leaf className="w-3.5 h-3.5"/>, label: "MongoDB" },
            FULL_SYSTEM: { color: "bg-purple-100 text-purple-800", icon: <Globe className="w-3.5 h-3.5"/>, label: "Full System" },
        } as const;
        const badge = badges[type];
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                {badge.icon} {badge.label}
            </span>
        );
    };

    const getStatusBadge = (status: BackupStatus) => {
        const badges = {
            IN_PROGRESS: { color: "bg-yellow-100 text-yellow-800", icon: <Loader2 className="w-3.5 h-3.5 animate-spin"/>, label: "In Progress" },
            SUCCESS: { color: "bg-green-100 text-green-800", icon: <CheckCircle2 className="w-3.5 h-3.5"/>, label: "Success" },
            FAILED: { color: "bg-red-100 text-red-800", icon: <XCircle className="w-3.5 h-3.5"/>, label: "Failed" },
        } as const;
        const badge = badges[status];
        return (
            <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
                {badge.icon} {badge.label}
            </span>
        );
    };

    const getTriggerBadge = (trigger: BackupTrigger) => {
        const badges = {
            SCHEDULED: { color: "bg-indigo-100 text-indigo-800", icon: <Clock className="w-3.5 h-3.5"/>, label: "Scheduled" },
            MANUAL: { color: "bg-orange-100 text-orange-800", icon: <User className="w-3.5 h-3.5"/>, label: "Manual" },
            PRE_OPERATION: { color: "bg-pink-100 text-pink-800", icon: <AlertTriangle className="w-3.5 h-3.5"/>, label: "Pre-Op" },
        } as const;
        const badge = badges[trigger];
        return (
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${badge.color}`}>
                {badge.icon} {badge.label}
            </span>
        );
    };

    const formatDuration = (ms: number) => {
        if (ms < 1000) return `${ms}ms`;
        const seconds = (ms / 1000).toFixed(1);
        return `${seconds}s`;
    };

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), "MMM dd, yyyy HH:mm:ss");
        } catch {
            return dateString;
        }
    };

    // Sort by startTime descending (newest first)
    const sortedBackups = [...backups].sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );

    return (
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Type</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Status</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Size</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Duration</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Started At</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Trigger</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Initiated By</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Expires</th>
                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {sortedBackups.map((backup) => (
                        <tr key={backup.id} className="hover:bg-gray-50">
                            <td className="p-3">
                                {getTypeBadge(backup.backupType)}
                            </td>
                            <td className="p-3">
                                {getStatusBadge(backup.status)}
                            </td>
                            <td className="p-3 text-sm font-medium text-gray-900">
                                {backup.fileSizeMB}
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                                {formatDuration(backup.durationMs)}
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                                {formatDate(backup.startTime)}
                            </td>
                            <td className="p-3">
                                {getTriggerBadge(backup.trigger)}
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                                {backup.initiatedBy}
                            </td>
                            <td className="p-3 text-sm text-gray-600">
                                {formatDate(backup.expirationDate)}
                            </td>
                            <td className="p-3">
                                <div className="flex flex-col gap-2">
                                    {backup.status === "SUCCESS" && (
                                        <Button
                                            variant="default"
                                            size="sm"
                                            onClick={() => onRestoreClick(backup)}
                                        >
                                            <RefreshCw className="w-4 h-4 mr-2"/> Restore
                                        </Button>
                                    )}
                                    {backup.errorMessage && (
                                        <div className="text-xs text-red-600 max-w-xs">
                                            <p className="font-semibold inline-flex items-center gap-1"><XCircle className="w-3.5 h-3.5"/> Error:</p>
                                            <p className="break-words">{backup.errorMessage}</p>
                                        </div>
                                    )}
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default BackupHistoryTable;
