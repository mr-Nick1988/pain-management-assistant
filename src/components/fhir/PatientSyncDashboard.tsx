import React, {useState, useEffect} from "react";
import {useSyncAllPatientsMutation, useSyncPatientMutation} from "../../api/api/apiFhirSlice";
import {useGetPatientsQuery} from "../../api/api/apiNurseSlice";
import type {EmrSyncResultDTO} from "../../types/fhir";
import {Button, Card, CardContent, CardHeader, CardTitle, LoadingSpinner, PageNavigation} from "../ui";
import {useToast} from "../../contexts/ToastContext";

const PatientSyncDashboard: React.FC = () => {
    const toast = useToast();

    const [syncResult, setSyncResult] = useState<EmrSyncResultDTO | null>(null);
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [syncingPatients, setSyncingPatients] = useState<Set<string>>(new Set());

    // API hooks
    const [syncAll, {isLoading: isSyncingAll}] = useSyncAllPatientsMutation();
    const [syncPatient] = useSyncPatientMutation();
    const {data: patients, refetch} = useGetPatientsQuery({});

    // Auto-refresh every 5 minutes
    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            refetch();
            toast.success("Patient list refreshed");
        }, 5 * 60 * 1000); // 5 minutes

        return () => clearInterval(interval);
    }, [autoRefresh, refetch, toast]);

    const handleSyncAll = async () => {
        try {
            const result = await syncAll().unwrap();
            setSyncResult(result);
            toast.success(`Synced ${result.successfulSyncs} of ${result.totalPatients} patients`);
            refetch();
        } catch (error) {
            console.error("Sync all failed:", error);
            toast.error("Failed to sync all patients");
        }
    };

    const handleSyncPatient = async (mrn: string) => {
        setSyncingPatients(prev => new Set(prev).add(mrn));
        try {
            const result = await syncPatient(mrn).unwrap();
            toast.success(result);
            refetch();
        } catch (error) {
            console.error(`Sync failed for ${mrn}:`, error);
            toast.error(`Failed to sync patient ${mrn}`);
        } finally {
            setSyncingPatients(prev => {
                const newSet = new Set(prev);
                newSet.delete(mrn);
                return newSet;
            });
        }
    };

    const formatTimeAgo = (dateString?: string) => {
        if (!dateString) return "Never";
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        if (diffHours < 1) return "Just now";
        if (diffHours === 1) return "1 hour ago";
        if (diffHours < 24) return `${diffHours} hours ago`;
        const diffDays = Math.floor(diffHours / 24);
        if (diffDays === 1) return "1 day ago";
        return `${diffDays} days ago`;
    };

    return (
        <div className="p-6 space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 bg-clip-text text-transparent">
                    🔄 Patient Synchronization Dashboard
                </h1>
                <p className="text-gray-600">
                    Sync patient data from external FHIR systems
                </p>
            </div>

            {/* Sync Controls */}
            <Card>
                <CardHeader>
                    <CardTitle>Sync Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4 items-center flex-wrap">
                        <Button
                            variant="approve"
                            onClick={handleSyncAll}
                            disabled={isSyncingAll}
                            className="flex-1 min-w-[200px]"
                        >
                            {isSyncingAll ? "Syncing..." : "🔄 Sync All Patients"}
                        </Button>
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="autoRefresh"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                className="h-4 w-4"
                            />
                            <label htmlFor="autoRefresh" className="text-sm text-gray-700">
                                Auto-refresh every 5 min
                            </label>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Loading State */}
            {isSyncingAll && (
                <Card>
                    <CardContent className="text-center py-8">
                        <LoadingSpinner />
                        <p className="mt-4 text-gray-600">Synchronizing all patients...</p>
                        <p className="text-sm text-gray-500 mt-2">This may take a few moments</p>
                    </CardContent>
                </Card>
            )}

            {/* Sync Result Summary */}
            {syncResult && (
                <Card>
                    <CardHeader>
                        <CardTitle>Last Sync Results</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="p-4 bg-gray-50 rounded">
                                <p className="text-sm text-gray-600">Total Patients</p>
                                <p className="text-2xl font-bold">{syncResult.totalPatients}</p>
                            </div>
                            <div className="p-4 bg-green-50 rounded">
                                <p className="text-sm text-green-600">✅ Successful</p>
                                <p className="text-2xl font-bold text-green-700">{syncResult.successfulSyncs}</p>
                            </div>
                            <div className="p-4 bg-red-50 rounded">
                                <p className="text-sm text-red-600">❌ Failed</p>
                                <p className="text-2xl font-bold text-red-700">{syncResult.failedSyncs}</p>
                            </div>
                            <div className="p-4 bg-yellow-50 rounded">
                                <p className="text-sm text-yellow-600">🟡 Changes Detected</p>
                                <p className="text-2xl font-bold text-yellow-700">{syncResult.patientsWithChanges}</p>
                            </div>
                        </div>

                        <div className="text-sm text-gray-600 space-y-1">
                            <p>
                                <span className="font-semibold">Started:</span>{" "}
                                {new Date(syncResult.syncStartedAt).toLocaleString()}
                            </p>
                            <p>
                                <span className="font-semibold">Completed:</span>{" "}
                                {new Date(syncResult.syncCompletedAt).toLocaleString()}
                            </p>
                            <p>
                                <span className="font-semibold">Duration:</span>{" "}
                                {Math.round(
                                    (new Date(syncResult.syncCompletedAt).getTime() -
                                        new Date(syncResult.syncStartedAt).getTime()) /
                                        1000
                                )}{" "}
                                seconds
                            </p>
                        </div>

                        {syncResult.errors.length > 0 && (
                            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded">
                                <p className="font-semibold text-red-800 mb-2">❌ Errors:</p>
                                <ul className="list-disc list-inside text-sm text-red-700">
                                    {syncResult.errors.map((error, idx) => (
                                        <li key={idx}>{error}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* Patients Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Patients ({patients?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {!patients || patients.length === 0 ? (
                        <div className="text-center py-8 text-gray-600">
                            No patients found
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left p-3 font-semibold">MRN</th>
                                        <th className="text-left p-3 font-semibold">Name</th>
                                        <th className="text-left p-3 font-semibold">Source Type</th>
                                        <th className="text-left p-3 font-semibold">Last Sync</th>
                                        <th className="text-left p-3 font-semibold">Status</th>
                                        <th className="text-left p-3 font-semibold">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {patients.map((patient) => (
                                        <tr key={patient.mrn} className="border-b hover:bg-gray-50">
                                            <td className="p-3 font-mono text-sm">{patient.mrn}</td>
                                            <td className="p-3">
                                                {patient.firstName} {patient.lastName}
                                            </td>
                                            <td className="p-3">
                                                <span className="px-2 py-1 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                                                    FHIR Server
                                                </span>
                                            </td>
                                            <td className="p-3 text-sm text-gray-600">
                                                {formatTimeAgo(patient.updatedAt || undefined)}
                                            </td>
                                            <td className="p-3">
                                                {patient.isActive ? (
                                                    <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">
                                                        Active
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-800">
                                                        Inactive
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3">
                                                <Button
                                                    variant="update"
                                                    onClick={() => handleSyncPatient(patient.mrn || "")}
                                                    disabled={syncingPatients.has(patient.mrn || "")}
                                                    className="text-sm"
                                                >
                                                    {syncingPatients.has(patient.mrn || "") ? "Syncing..." : "Sync"}
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <PageNavigation />
        </div>
    );
};

export default PatientSyncDashboard;
