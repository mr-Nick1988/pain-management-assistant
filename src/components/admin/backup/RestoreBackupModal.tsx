import React, { useState } from "react";
import { format } from "date-fns";
import { useRestoreBackupMutation } from "../../../api/api/apiBackupSlice";
import { Button } from "../../ui";
import { useToast } from "../../../contexts/ToastContext";
import type { BackupResponseDTO } from "../../../types/backup";
import { RefreshCw, AlertTriangle, Info, Loader2, FileText } from "lucide-react";

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
            console.log("Starting restore for backup:", backup.id);
            const message = await restoreBackup({
                backupId: backup.id,
                initiatedBy: currentUser,
                confirmed: true,
            }).unwrap();

            console.log("Restore response:", message);
            toast.success(message || "Restore completed successfully! Refreshing backup history...");
            
            // Wait 2 seconds before refreshing to allow backend to update status
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 2000);
        } catch (error: any) {
            console.error("Restore error:", error);
            
            // Handle different error types
            let errorMessage = 'Failed to restore backup';
            
            if (error?.data?.message) {
                errorMessage = error.data.message;
            } else if (error?.message) {
                errorMessage = error.message;
            } else if (error?.status === 'FETCH_ERROR') {
                errorMessage = 'Network error - restore may still be in progress. Check logs.';
            } else if (error?.status === 'TIMEOUT_ERROR') {
                errorMessage = 'Request timeout - restore is still running. Check logs for status.';
            }
            
            toast.error(errorMessage);
        }
    };

    const isH2Backup = backup.backupType === "H2_DATABASE" || backup.backupType === "FULL_SYSTEM";

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                    <h2 className="text-2xl font-bold text-gray-900">
                        <span className="inline-flex items-center gap-2"><RefreshCw className="w-5 h-5"/> Restore Backup</span>
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
                        <h3 className="font-semibold text-gray-900 mb-3 inline-flex items-center gap-2"><FileText className="w-4 h-4"/> Backup Details</h3>
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
                                <AlertTriangle className="w-6 h-6 text-red-700"/>
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
                                    <p className="text-xs text-red-700 mt-3 font-semibold inline-flex items-center gap-1">
                                        <AlertTriangle className="w-3.5 h-3.5"/> This operation will overwrite current database files!
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Warning for MongoDB */}
                    {backup.backupType === "MONGODB" && (
                        <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
                            <div className="flex items-start gap-3">
                                <AlertTriangle className="w-6 h-6 text-yellow-700"/>
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
                    <div className={`border-2 rounded-lg p-4 transition-all ${
                        confirmed 
                            ? "bg-green-50 border-green-300" 
                            : "bg-blue-50 border-blue-300 animate-pulse"
                    }`}>
                        <label className="flex items-start gap-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={confirmed}
                                onChange={(e) => setConfirmed(e.target.checked)}
                                className="mt-1 w-5 h-5 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                            />
                            <div className="flex-1">
                                <p className={`font-bold mb-1 ${confirmed ? "text-green-900" : "text-blue-900"} inline-flex items-center gap-2`}>
                                    {!confirmed ? <AlertTriangle className="w-4 h-4"/> : <RefreshCw className="w-4 h-4"/>} I understand the risks and consequences
                                </p>
                                <p className={`text-sm ${confirmed ? "text-green-800" : "text-blue-800"}`}>
                                    I confirm that I want to restore this backup and understand that:
                                </p>
                                <ul className={`text-xs mt-2 space-y-1 list-disc list-inside ${confirmed ? "text-green-700" : "text-blue-700"}`}>
                                    <li>Current data will be replaced with backup data</li>
                                    <li>This operation cannot be undone</li>
                                    <li>I have read and understood all warnings above</li>
                                    {isH2Backup && <li>I will follow manual steps for H2 restore</li>}
                                </ul>
                                {!confirmed && (
                                    <p className="text-xs font-bold text-blue-900 mt-3 bg-blue-100 px-2 py-1 rounded inline-flex items-center gap-1">
                                        <Info className="w-3.5 h-3.5"/> Please check this box to enable the Restore button
                                    </p>
                                )}
                            </div>
                        </label>
                    </div>

                    {/* Additional Info */}
                    <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                        <p className="font-semibold mb-1 inline-flex items-center gap-1"><FileText className="w-3.5 h-3.5"/> Backup File Path:</p>
                        <code className="bg-gray-200 px-2 py-1 rounded text-xs">
                            {backup.backupFilePath}
                        </code>
                    </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 z-10">
                    {isLoading && (
                        <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-blue-900">Restore in progress...</p>
                                    <p className="text-xs text-blue-700">This may take 15-30 seconds. Please wait.</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="flex gap-3 justify-end">
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Cancel
                        </Button>
                        <Button 
                            variant="submit" 
                            onClick={handleRestore}
                            disabled={isLoading || !confirmed}
                            className={!confirmed ? "opacity-50 cursor-not-allowed" : ""}
                        >
                            {isLoading ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin"/> Restoring...</>) : (<><RefreshCw className="w-4 h-4 mr-2"/> Restore Backup</>)}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RestoreBackupModal;
