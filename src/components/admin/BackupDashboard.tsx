import React, { useState } from "react";
import { useGetBackupStatisticsQuery, useGetBackupHistoryQuery } from "../../api/api/apiBackupSlice";
import { Card, CardContent, CardHeader, CardTitle, LoadingSpinner, PageNavigation, Button } from "../ui";
import BackupStatisticsCards from "./backup/BackupStatisticsCards";
import BackupHistoryTable from "./backup/BackupHistoryTable";
import CreateBackupModal from "./backup/CreateBackupModal";
import RestoreBackupModal from "./backup/RestoreBackupModal";
import CleanupConfirmModal from "./backup/CleanupConfirmModal";
import type { BackupResponseDTO } from "../../types/backup";
import { HardDrive, RefreshCw, Plus, Trash2, Settings, ScrollText } from "lucide-react";

const BackupDashboard: React.FC = () => {
    const [createModalOpen, setCreateModalOpen] = useState(false);
    const [restoreModalOpen, setRestoreModalOpen] = useState(false);
    const [cleanupModalOpen, setCleanupModalOpen] = useState(false);
    const [selectedBackup, setSelectedBackup] = useState<BackupResponseDTO | null>(null);

    // API queries with polling disabled and manual refetch
    const { data: statistics, isLoading: statsLoading, refetch: refetchStats } = useGetBackupStatisticsQuery(undefined, {
        pollingInterval: 0,
        refetchOnMountOrArgChange: true,
    });
    const { data: history, isLoading: historyLoading, refetch: refetchHistory } = useGetBackupHistoryQuery(undefined, {
        pollingInterval: 0,
        refetchOnMountOrArgChange: true,
    });

    const handleRefresh = () => {
        console.log("Refreshing backup data...");
        // Force refetch - returns promises
        Promise.all([refetchStats(), refetchHistory()])
            .then(() => console.log("Refresh completed"))
            .catch((err) => console.error("Refresh failed:", err));
    };

    const handleRestoreClick = (backup: BackupResponseDTO) => {
        setSelectedBackup(backup);
        setRestoreModalOpen(true);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center gap-2">
                        <HardDrive className="w-8 h-8"/> Backup & Restore
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Automated backup management and data recovery system
                    </p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={handleRefresh}>
                        <RefreshCw className="w-4 h-4 mr-2"/> Refresh
                    </Button>
                    <Button variant="default" onClick={() => setCreateModalOpen(true)}>
                        <Plus className="w-4 h-4 mr-2"/> Create Backup
                    </Button>
                    <Button variant="cancel" onClick={() => setCleanupModalOpen(true)}>
                        <Trash2 className="w-4 h-4 mr-2"/> Cleanup Old
                    </Button>
                </div>
            </div>

            {/* Statistics Cards */}
            {statsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Card key={i}>
                            <CardContent className="p-6 text-center">
                                <LoadingSpinner />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : statistics ? (
                <BackupStatisticsCards statistics={statistics} />
            ) : (
                <Card className="bg-yellow-50 border-yellow-200">
                    <CardContent className="p-4 text-center text-yellow-800">
                        No statistics available
                    </CardContent>
                </Card>
            )}

            {/* Backup Configuration Info */}
            <Card className="bg-blue-50 border-blue-200">
                <CardHeader>
                    <CardTitle className="text-blue-900 flex items-center gap-2"><Settings className="w-5 h-5"/> Backup Configuration & Requirements</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="font-semibold text-blue-900 mb-1">Schedule</p>
                            <p className="text-blue-700">H2: Daily at 02:00</p>
                            <p className="text-blue-700">MongoDB: Daily at 03:00</p>
                            <p className="text-blue-700">Cleanup: Daily at 04:00</p>
                        </div>
                        <div>
                            <p className="font-semibold text-blue-900 mb-1">Retention Policy</p>
                            <p className="text-blue-700">30 days automatic retention</p>
                            <p className="text-blue-700">Old backups auto-deleted</p>
                        </div>
                        <div>
                            <p className="font-semibold text-blue-900 mb-1">Storage Locations</p>
                            <p className="text-blue-700">H2: ./backups/h2/</p>
                            <p className="text-blue-700">MongoDB: ./backups/mongodb/</p>
                        </div>
                        <div>
                            <p className="font-semibold text-blue-900 mb-1">MongoDB Requirements</p>
                            <p className="text-blue-700">mongodump utility required</p>
                            <p className="text-blue-700">Install: MongoDB Database Tools</p>
                            <p className="text-blue-700">Check: mongodump --version</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Backup History Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><ScrollText className="w-5 h-5"/> Backup History</CardTitle>
                </CardHeader>
                <CardContent>
                    {historyLoading ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : !history || history.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p className="text-lg font-semibold mb-2">No backups found</p>
                            <p className="text-sm">Create your first backup to get started</p>
                        </div>
                    ) : (
                        <BackupHistoryTable 
                            backups={history} 
                            onRestoreClick={handleRestoreClick}
                        />
                    )}
                </CardContent>
            </Card>

            {/* Modals */}
            {createModalOpen && (
                <CreateBackupModal
                    onClose={() => setCreateModalOpen(false)}
                    onSuccess={handleRefresh}
                />
            )}

            {restoreModalOpen && selectedBackup && (
                <RestoreBackupModal
                    backup={selectedBackup}
                    onClose={() => {
                        setRestoreModalOpen(false);
                        setSelectedBackup(null);
                    }}
                    onSuccess={handleRefresh}
                />
            )}

            {cleanupModalOpen && (
                <CleanupConfirmModal
                    onClose={() => setCleanupModalOpen(false)}
                    onSuccess={handleRefresh}
                />
            )}

            <PageNavigation />
        </div>
    );
};

export default BackupDashboard;
