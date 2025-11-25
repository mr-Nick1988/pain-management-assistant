import React from "react";
import { useCleanupOldBackupsMutation } from "../../../api/api/apiBackupSlice";
import { Button } from "../../ui";
import { useToast } from "../../../contexts/ToastContext";
import { Trash2, AlertTriangle, ClipboardList, Info } from "lucide-react";

interface CleanupConfirmModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CleanupConfirmModal: React.FC<CleanupConfirmModalProps> = ({ onClose, onSuccess }) => {
    const toast = useToast();
    const [cleanupOldBackups, { isLoading }] = useCleanupOldBackupsMutation();

    const handleCleanup = async () => {
        try {
            const message = await cleanupOldBackups().unwrap();
            toast.success(message);
            onSuccess();
            onClose();
        } catch (error) {
            const errorMessage = error && typeof error === 'object' && 'data' in error
                ? (error.data as { message?: string })?.message || 'Failed to cleanup backups'
                : 'Failed to cleanup backups';
            toast.error(errorMessage);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900">
                        <span className="inline-flex items-center gap-2"><Trash2 className="w-5 h-5"/> Cleanup Old Backups</span>
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <AlertTriangle className="w-6 h-6 text-yellow-700"/>
                            <div>
                                <h3 className="font-semibold text-yellow-900 mb-2">
                                    Cleanup Confirmation
                                </h3>
                                <p className="text-sm text-yellow-800 mb-3">
                                    This operation will permanently delete all backups older than <strong>30 days</strong>.
                                </p>
                                <p className="text-sm text-yellow-800">
                                    Deleted backups:
                                </p>
                                <ul className="text-sm text-yellow-800 mt-2 space-y-1 list-disc list-inside">
                                    <li>Will be removed from the database</li>
                                    <li>Files will be deleted from disk</li>
                                    <li>Cannot be recovered</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2 inline-flex items-center gap-2"><ClipboardList className="w-4 h-4"/> Retention Policy</h3>
                        <div className="text-sm text-blue-800 space-y-1">
                            <p>• <strong>Retention Period:</strong> 30 days</p>
                            <p>• <strong>Automatic Cleanup:</strong> Daily at 04:00</p>
                            <p>• <strong>Manual Cleanup:</strong> Available anytime</p>
                        </div>
                    </div>

                    <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded">
                        <p className="font-semibold mb-1 inline-flex items-center gap-1"><Info className="w-3.5 h-3.5"/> Note:</p>
                        <p>
                            This is a safe operation that follows the configured retention policy. 
                            Recent backups (less than 30 days old) will not be affected.
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button 
                        variant="cancel" 
                        onClick={handleCleanup}
                        disabled={isLoading}
                    >
                        {isLoading ? "Cleaning up..." : (<span className="inline-flex items-center"><Trash2 className="w-4 h-4 mr-2"/> Cleanup Old Backups</span>)}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CleanupConfirmModal;
