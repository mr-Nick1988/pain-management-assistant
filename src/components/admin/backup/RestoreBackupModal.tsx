import React, { useState } from "react";
import { format } from "date-fns";
import { useRestoreBackupMutation } from "../../../api/api/apiBackupSlice";
import { Button } from "../../ui";
import { useToast } from "../../../contexts/ToastContext";
import type { BackupResponseDTO } from "../../../types/backup";

interface RestoreBackupModalProps {
    backup: BackupResponseDTO;
    onClose: () => void;
    onSuccess: () => void;
}

const RestoreBackupModal: React.FC<RestoreBackupModalProps> = ({ backup, onClose, onSuccess }) => {
    const toast = useToast();
    const [confirmed, setConfirmed] = useState(false);
    
    const [restoreBackup, { isLoading }] = useRestoreBackupMutation();

    const handleRestore = async () => {
        if (!confirmed) {
            toast.error("Please confirm that you understand the risks");
            return;
        }

        const currentUser = localStorage.getItem("userLogin") || "admin";

        try {
            const message = await restoreBackup({
                backupId: backup.id,
                initiatedBy: currentUser,
                confirmed: true,
            }).unwrap();

            toast.success(message);
            onSuccess();
            onClose();
        } catch (error) {
            const errorMessage = error && typeof error === 'object' && 'data' in error
                ? (error.data as { message?: string })?.message || 'Failed to restore backup'
                : 'Failed to restore backup';
            toast.error(errorMessage);
        }
    };

    const isH2Backup = backup.backupType === "H2_DATABASE" || backup.backupType === "FULL_SYSTEM";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        🔄 Restore Backup
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Backup Details */}
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-3">📋 Backup Details</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-gray-600">Type:</p>
                                <p className="font-semibold text-gray-900">{backup.backupType}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Size:</p>
                                <p className="font-semibold text-gray-900">{backup.fileSizeMB}</p>
                            </div>
                            <div>
                                <p className="text-gray-600">Created:</p>
                                <p className="font-semibold text-gray-900">
                                    {format(new Date(backup.startTime), "MMM dd, yyyy HH:mm")}
                                </p>
                            </div>
                            <div>
                                <p className="text-gray-600">Initiated By:</p>
                                <p className="font-semibold text-gray-900">{backup.initiatedBy}</p>
                            </div>
                        </div>
                    </div>

                    {/* Warning for H2 */}
                    {isH2Backup && (
                        <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-3xl">⚠️</span>
                                <div>
                                    <h3 className="font-bold text-red-900 mb-2">
                                        CRITICAL: H2 Database Restore Warning
                                    </h3>
                                    <p className="text-sm text-red-800 mb-3">
                                        H2 database restore requires <strong>manual steps</strong> and <strong>application restart</strong>:
                                    </p>
                                    <ol className="text-sm text-red-800 space-y-2 list-decimal list-inside">
                                        <li>Stop the application completely</li>
                                        <li>Extract the backup ZIP file</li>
                                        <li>Replace database files in data directory</li>
                                        <li>Restart the application</li>
                                        <li>Verify data integrity</li>
                                    </ol>
                                    <p className="text-xs text-red-700 mt-3 font-semibold">
                                        ⚠️ This operation will overwrite current database files!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Warning for MongoDB */}
                    {backup.backupType === "MONGODB" && (
                        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <span className="text-3xl">⚠️</span>
                                <div>
                                    <h3 className="font-bold text-yellow-900 mb-2">
                                        MongoDB Restore Warning
                                    </h3>
                                    <p className="text-sm text-yellow-800 mb-2">
                                        This will restore MongoDB collections from the backup:
                                    </p>
                                    <ul className="text-sm text-yellow-800 space-y-1 list-disc list-inside">
                                        <li>Existing data will be replaced</li>
                                        <li>Uses mongorestore utility</li>
                                        <li>May take several minutes</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Confirmation Checkbox */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={confirmed}
                                onChange={(e) => setConfirmed(e.target.checked)}
                                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <p className="font-semibold text-blue-900 mb-1">
                                    I understand the risks and consequences
                                </p>
                                <p className="text-sm text-blue-800">
                                    I confirm that I want to restore this backup and understand that:
                                </p>
                                <ul className="text-xs text-blue-700 mt-2 space-y-1 list-disc list-inside">
                                    <li>Current data will be replaced with backup data</li>
                                    <li>This operation cannot be undone</li>
                                    <li>I have read and understood all warnings above</li>
                                    {isH2Backup && <li>I will follow manual steps for H2 restore</li>}
                                </ul>
                            </div>
                        </label>
                    </div>

                    {/* Additional Info */}
                    <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                        <p className="font-semibold mb-1">📝 Backup File Path:</p>
                        <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                            {backup.backupFilePath}
                        </code>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button 
                        variant="cancel" 
                        onClick={handleRestore}
                        disabled={isLoading || !confirmed}
                    >
                        {isLoading ? "Restoring..." : "🔄 Restore Backup"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default RestoreBackupModal;
