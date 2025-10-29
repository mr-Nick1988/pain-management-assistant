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
    const [backupType, setBackupType] = useState<BackupType>("H2_DATABASE");
    const [metadata, setMetadata] = useState("");
    
    const [createBackup, { isLoading }] = useCreateBackupMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const currentUser = localStorage.getItem("userLogin") || "admin";

        try {
            const result = await createBackup({
                backupType,
                initiatedBy: currentUser,
                metadata: metadata.trim() || undefined,
            }).unwrap();

            toast.success(`Backup created successfully! Size: ${result.fileSizeMB}`);
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
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
                {/* Header */}
                <div className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-900">
                        ➕ Create Backup
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                    >
                        ×
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Backup Type Selection */}
                    <div>
                        <Label className="block mb-3 text-lg font-semibold">
                            Select Backup Type
                        </Label>
                        <div className="space-y-3">
                            {/* H2 Database */}
                            <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
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
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl">🗄️</span>
                                        <span className="font-semibold text-gray-900">H2 Database</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Backup H2 SQL database (users, patients, EMR, recommendations)
                                    </p>
                                    <p className="text-xs text-blue-600 mt-1">
                                        Creates ZIP archive using built-in H2 BACKUP command
                                    </p>
                                </div>
                            </label>

                            {/* MongoDB */}
                            <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
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
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl">🍃</span>
                                        <span className="font-semibold text-gray-900">MongoDB</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Backup MongoDB collections (backup history, logs, analytics)
                                    </p>
                                    <p className="text-xs text-green-600 mt-1">
                                        Uses mongodump utility to create BSON files
                                    </p>
                                </div>
                            </label>

                            {/* Full System */}
                            <label className={`flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all ${
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
                                    className="mt-1"
                                />
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-2xl">🌐</span>
                                        <span className="font-semibold text-gray-900">Full System</span>
                                    </div>
                                    <p className="text-sm text-gray-600">
                                        Complete backup of both H2 and MongoDB databases
                                    </p>
                                    <p className="text-xs text-purple-600 mt-1">
                                        Recommended for disaster recovery and system migration
                                    </p>
                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Metadata (Optional) */}
                    <div>
                        <Label htmlFor="metadata">
                            Metadata (Optional)
                        </Label>
                        <Input
                            id="metadata"
                            type="text"
                            value={metadata}
                            onChange={(e) => setMetadata(e.target.value)}
                            placeholder='e.g., {"reason": "before_update", "version": "1.0.0"}'
                            className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            JSON string with additional information about this backup
                        </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-900 font-semibold mb-2">ℹ️ Backup Information</p>
                        <ul className="text-xs text-blue-800 space-y-1">
                            <li>• Backups are stored in <code className="bg-blue-100 px-1 rounded">./backups/</code> directory</li>
                            <li>• Retention policy: 30 days (auto-cleanup)</li>
                            <li>• H2 backups create ZIP archives</li>
                            <li>• MongoDB backups create BSON dump directories</li>
                            <li>• Full system backups include both databases</li>
                        </ul>
                    </div>
                </form>

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
