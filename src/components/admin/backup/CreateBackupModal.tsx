import React, { useState } from "react";
import { useCreateBackupMutation } from "../../../api/api/apiBackupSlice";
import { Button, Input, Label } from "../../ui";
import { useToast } from "../../../contexts/ToastContext";
import type { BackupType } from "../../../types/backup";

interface CreateBackupModalProps {
    onClose: () => void;
    onSuccess: () => void;
}

const CreateBackupModal: React.FC<CreateBackupModalProps> = ({ onClose, onSuccess }) => {
    const toast = useToast();
    const [backupType, setBackupType] = useState<BackupType>("FULL_SYSTEM");
    const [metadata, setMetadata] = useState("");
    
    const [createBackup, { isLoading }] = useCreateBackupMutation();

    const handleSubmit = async () => {
        const currentUser = localStorage.getItem("userLogin") || "admin";

        try {
            await createBackup({
                backupType,
                initiatedBy: currentUser,
                metadata: metadata.trim() || undefined,
            }).unwrap();

            toast.success(`✅ Backup created successfully! Check the table below for details.`);
            onSuccess();
            onClose();
        } catch (error) {
            const errorMessage = error && typeof error === 'object' && 'data' in error
                ? (error.data as { message?: string })?.message || 'Failed to create backup'
                : 'Failed to create backup';
            toast.error(errorMessage);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        💾 Create Backup
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
                    {/* Backup Type Selection */}
                    <div>
                        <Label className="block mb-3 font-semibold text-gray-900">
                            Select Backup Type
                        </Label>
                        <div className="space-y-2">
                            {/* H2 Database */}
                            <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                backupType === "H2_DATABASE" 
                                    ? "border-blue-500 bg-blue-50" 
                                    : "border-gray-200 hover:border-blue-300"
                            }`}>
                                <input
                                    type="radio"
                                    name="backupType"
                                    value="H2_DATABASE"
                                    checked={backupType === "H2_DATABASE"}
                                    onChange={(e) => setBackupType(e.target.value as BackupType)}
                                />
                                <span className="text-2xl">🗄️</span>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">H2 Database</p>
                                    <p className="text-xs text-gray-600">SQL database (users, patients, EMR)</p>
                                </div>
                            </label>

                            {/* MongoDB */}
                            <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                backupType === "MONGODB" 
                                    ? "border-green-500 bg-green-50" 
                                    : "border-gray-200 hover:border-green-300"
                            }`}>
                                <input
                                    type="radio"
                                    name="backupType"
                                    value="MONGODB"
                                    checked={backupType === "MONGODB"}
                                    onChange={(e) => setBackupType(e.target.value as BackupType)}
                                />
                                <span className="text-2xl">🍃</span>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">MongoDB</p>
                                    <p className="text-xs text-gray-600">NoSQL collections (logs, analytics)</p>
                                </div>
                            </label>

                            {/* Full System */}
                            <label className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                                backupType === "FULL_SYSTEM" 
                                    ? "border-purple-500 bg-purple-50" 
                                    : "border-gray-200 hover:border-purple-300"
                            }`}>
                                <input
                                    type="radio"
                                    name="backupType"
                                    value="FULL_SYSTEM"
                                    checked={backupType === "FULL_SYSTEM"}
                                    onChange={(e) => setBackupType(e.target.value as BackupType)}
                                />
                                <span className="text-2xl">🌐</span>
                                <div className="flex-1">
                                    <p className="font-semibold text-gray-900">Full System Backup</p>
                                    <p className="text-xs text-gray-600">Complete backup of both databases</p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Metadata (Optional) */}
                    <div>
                        <Label htmlFor="metadata">
                            Notes (Optional)
                        </Label>
                        <Input
                            id="metadata"
                            type="text"
                            value={metadata}
                            onChange={(e) => setMetadata(e.target.value)}
                            placeholder="e.g., Before system update"
                            className="mt-1"
                        />
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-900 font-semibold mb-1">ℹ️ Info</p>
                        <ul className="text-xs text-blue-800 space-y-0.5">
                            <li>• Retention: 30 days (auto-cleanup)</li>
                            <li>• Storage: ./backups/ directory</li>
                            <li>• Full System = H2 + MongoDB</li>
                        </ul>
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 flex gap-3 justify-end">
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Cancel
                    </Button>
                    <Button 
                        variant="submit" 
                        onClick={handleSubmit}
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating..." : "💾 Create Backup"}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CreateBackupModal;
