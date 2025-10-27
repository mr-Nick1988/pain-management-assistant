import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useGetExternalVasRecordsQuery, useGetVasMonitorStatsQuery, useRecordExternalVasMutation } from "../../api/api/apiExternalVasSlice";
import type { VasMonitorFilters, ExternalVasRecord, ExternalVasRecordRequest } from "../../types/externalVas";
import { Card, CardContent, CardHeader, CardTitle, LoadingSpinner, PageNavigation, Button } from "../ui";
import { useToast } from "../../contexts/ToastContext";

const ExternalVasMonitor: React.FC = () => {
    const navigate = useNavigate();
    const { success, error } = useToast();

    // State
    const [activeTab, setActiveTab] = useState<"monitor" | "simulator">("monitor");
    const [autoRefresh, setAutoRefresh] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [filters, setFilters] = useState<VasMonitorFilters>({
        timeRange: "1h",
    });

    // Simulator state
    const [apiKey, setApiKey] = useState("");
    const [simulatorData, setSimulatorData] = useState<ExternalVasRecordRequest>({
        patientMrn: "",
        vasLevel: 5,
        deviceId: "MONITOR-001",
        location: "Ward A",
        timestamp: new Date().toISOString(),
        notes: "",
        source: "VAS_MONITOR",
    });

    // API hooks
    const { data: records, refetch, isFetching } = useGetExternalVasRecordsQuery(filters);
    const { data: stats, refetch: refetchStats } = useGetVasMonitorStatsQuery();
    const [recordVas, { isLoading: isSending }] = useRecordExternalVasMutation();

    // Auto-refresh effect
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(() => {
                refetch();
                refetchStats();
                setLastUpdate(new Date());
            }, 30000); // 30 seconds

            return () => clearInterval(interval);
        }
    }, [autoRefresh, refetch, refetchStats]);

    // Helpers
    const getVasLevelColor = (vasLevel: number) => {
        if (vasLevel <= 3) return "text-green-600 bg-green-50";
        if (vasLevel <= 6) return "text-yellow-600 bg-yellow-50";
        return "text-red-600 bg-red-50";
    };

    const getVasLevelIcon = (vasLevel: number) => {
        if (vasLevel <= 3) return "🟢";
        if (vasLevel <= 6) return "🟡";
        return "🔴";
    };

    const getSourceBadge = (source: string) => {
        const colors: Record<string, string> = {
            VAS_MONITOR: "bg-blue-100 text-blue-800",
            MANUAL_ENTRY: "bg-gray-100 text-gray-800",
            EMR_SYSTEM: "bg-purple-100 text-purple-800",
            MOBILE_APP: "bg-green-100 text-green-800",
            TABLET: "bg-orange-100 text-orange-800",
        };
        return colors[source] || "bg-gray-100 text-gray-800";
    };

    const formatTimeAgo = (timestamp: string) => {
        const now = new Date();
        const then = new Date(timestamp);
        const diffMs = now.getTime() - then.getTime();
        const diffMins = Math.floor(diffMs / 60000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHours = Math.floor(diffMins / 60);
        if (diffHours < 24) return `${diffHours}h ago`;
        const diffDays = Math.floor(diffHours / 24);
        return `${diffDays}d ago`;
    };

    const handleRecordClick = (record: ExternalVasRecord) => {
        // Если VAS >= 4, то рекомендация создалась автоматически
        if (record.vasLevel >= 4) {
            success(`🎯 VAS Level ${record.vasLevel} detected! Recommendation was generated automatically. Check "Show Last Recommendation" button.`);
        }
        // Переход к деталям пациента с флагом для автоматического показа рекомендации
        navigate(`/nurse/patient/${record.patientMrn}`, {
            state: { 
                autoShowRecommendation: record.vasLevel >= 4,
                fromExternalVas: true 
            }
        });
    };

    // Simulator: Send VAS
    const handleSendVas = async () => {
        if (!apiKey.trim()) {
            error("Please enter API Key");
            return;
        }
        if (!simulatorData.patientMrn.trim()) {
            error("Please enter Patient MRN");
            return;
        }

        try {
            const result = await recordVas({
                apiKey: apiKey.trim(),
                data: {
                    ...simulatorData,
                    timestamp: new Date().toISOString(),
                },
            }).unwrap();

            // Показываем уведомление с информацией о рекомендации
            if (simulatorData.vasLevel >= 4) {
                success(`✅ VAS Record Created! ID: ${result.vasId}. 🎯 Recommendation was generated automatically (VAS >= 4). Click on the record to view patient details.`);
            } else {
                success(`✅ VAS Record Created! ID: ${result.vasId}. No recommendation generated (VAS < 4).`);
            }
            
            // Refresh monitor data
            refetch();
            refetchStats();
            
            // Switch to monitor tab
            setActiveTab("monitor");
        } catch (err) {
            const errorMessage = err && typeof err === 'object' && 'data' in err 
                ? (err.data as { error?: string })?.error 
                : err instanceof Error 
                ? err.message 
                : "Failed to send VAS";
            
            // Проверяем специфичные ошибки
            if (errorMessage && errorMessage.includes("Previous recommendation is still unresolved")) {
                error(`❌ Cannot create VAS: Patient has unresolved recommendation. Doctor must approve/reject it first.`);
            } else if (errorMessage && (errorMessage.includes("Transaction") || errorMessage.includes("rollback"))) {
                error(`❌ Backend Error: VAS was not saved due to transaction rollback. Check if patient has pending recommendation.`);
            } else {
                error(`❌ Error: ${errorMessage || "Unknown error"}`);
            }
        }
    };

    // Get unique devices and locations for filters
    const uniqueDevices = Array.from(new Set(records?.map(r => r.deviceId) || []));
    const uniqueLocations = Array.from(new Set(records?.map(r => r.location) || []));

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        📡 External VAS Monitor
                    </h1>
                    <p className="text-gray-600 mt-2">
                        Real-time monitoring of VAS data from external devices
                    </p>
                </div>
            </div>

            {/* Tabs - Moved above statistics */}
            <div className="flex gap-3">
                <button
                    onClick={() => setActiveTab("monitor")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        activeTab === "monitor"
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                    }`}
                >
                    📊 Monitor
                </button>
                <button
                    onClick={() => setActiveTab("simulator")}
                    className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                        activeTab === "simulator"
                            ? "bg-blue-600 text-white shadow-lg"
                            : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                    }`}
                >
                    🧪 Device Simulator
                </button>
            </div>

            {/* Statistics Cards */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Total Records Today</p>
                            <p className="text-2xl font-bold text-blue-600">{stats.totalRecordsToday}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Average VAS</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.averageVas.toFixed(1)}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">High Pain Alerts</p>
                            <p className="text-2xl font-bold text-red-600">
                                🔴 {stats.highPainAlerts}
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-sm text-gray-600">Active Devices</p>
                            <p className="text-2xl font-bold text-green-600">{stats.activeDevices}</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Monitor Tab */}
            {activeTab === "monitor" && (
                <>
                    {/* Filters and Controls */}
                    <Card>
                <CardContent className="p-4 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="text-sm font-semibold text-gray-700">Device</label>
                            <select
                                value={filters.deviceId || ""}
                                onChange={(e) => setFilters({ ...filters, deviceId: e.target.value || undefined })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Devices</option>
                                {uniqueDevices.map((device) => (
                                    <option key={device} value={device}>
                                        {device}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700">Location</label>
                            <select
                                value={filters.location || ""}
                                onChange={(e) => setFilters({ ...filters, location: e.target.value || undefined })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Locations</option>
                                {uniqueLocations.map((location) => (
                                    <option key={location} value={location}>
                                        {location}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-gray-700">Time Range</label>
                            <select
                                value={filters.timeRange}
                                onChange={(e) => setFilters({ ...filters, timeRange: e.target.value as "1h" | "6h" | "24h" | "custom" })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="1h">Last 1 Hour</option>
                                <option value="6h">Last 6 Hours</option>
                                <option value="24h">Last 24 Hours</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <input
                                type="checkbox"
                                id="autoRefresh"
                                checked={autoRefresh}
                                onChange={(e) => setAutoRefresh(e.target.checked)}
                                className="h-4 w-4"
                            />
                            <label htmlFor="autoRefresh" className="text-sm text-gray-700">
                                Auto-refresh every 30 seconds
                            </label>
                        </div>
                        <div className="text-sm text-gray-600">
                            Last updated: {formatTimeAgo(lastUpdate.toISOString())}
                            {isFetching && <span className="ml-2">🔄</span>}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* VAS Records Table */}
            <Card>
                <CardHeader>
                    <CardTitle>VAS Records ({records?.length || 0})</CardTitle>
                </CardHeader>
                <CardContent>
                    {isFetching && !records ? (
                        <div className="flex justify-center py-8">
                            <LoadingSpinner />
                        </div>
                    ) : !records || records.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            <p>No VAS records found</p>
                            <p className="text-sm mt-2">Try adjusting the filters or wait for new data</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Time</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Patient</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">VAS Level</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Auto Rec.</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Device ID</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Location</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Source</th>
                                        <th className="p-3 text-left text-sm font-semibold text-gray-700">Notes</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {records.map((record) => (
                                        <tr
                                            key={record.id}
                                            onClick={() => handleRecordClick(record)}
                                            className="hover:bg-gray-50 cursor-pointer"
                                        >
                                            <td className="p-3 text-sm text-gray-600">
                                                {formatTimeAgo(record.timestamp)}
                                            </td>
                                            <td className="p-3">
                                                <div>
                                                    <p className="font-semibold text-sm">
                                                        {record.patientFirstName} {record.patientLastName}
                                                    </p>
                                                    <p className="text-xs text-gray-600 font-mono">{record.patientMrn}</p>
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-bold ${getVasLevelColor(record.vasLevel)}`}>
                                                    {getVasLevelIcon(record.vasLevel)} {record.vasLevel}
                                                </div>
                                            </td>
                                            <td className="p-3">
                                                {record.vasLevel >= 4 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-semibold">
                                                        ✅ Yes
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                        - No
                                                    </span>
                                                )}
                                            </td>
                                            <td className="p-3 text-sm font-mono">{record.deviceId}</td>
                                            <td className="p-3 text-sm">{record.location}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${getSourceBadge(record.source)}`}>
                                                    {record.source.replace(/_/g, " ")}
                                                </span>
                                            </td>
                                            <td className="p-3 text-sm text-gray-600">
                                                {record.notes || "-"}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>
                </>
            )}

            {/* Simulator Tab */}
            {activeTab === "simulator" && (
                <Card>
                    <CardHeader>
                        <CardTitle>🧪 VAS Device Simulator</CardTitle>
                        <p className="text-sm text-gray-600 mt-2">
                            Simulate sending VAS data from an external device (monitor, tablet, mobile app)
                        </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {/* API Key */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                🔑 API Key *
                            </label>
                            <input
                                type="text"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="pma_live_a1b2c3d4e5f6g7h8..."
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Get API key from Admin → API Key Management
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Patient MRN */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    👤 Patient MRN *
                                </label>
                                <input
                                    type="text"
                                    value={simulatorData.patientMrn}
                                    onChange={(e) => setSimulatorData({ ...simulatorData, patientMrn: e.target.value })}
                                    placeholder="MRN-42"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Device ID */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    🖥️ Device ID
                                </label>
                                <input
                                    type="text"
                                    value={simulatorData.deviceId}
                                    onChange={(e) => setSimulatorData({ ...simulatorData, deviceId: e.target.value })}
                                    placeholder="MONITOR-001"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* VAS Level Slider */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                📊 VAS Level: <span className={`font-bold ${
                                    simulatorData.vasLevel <= 3 ? "text-green-600" :
                                    simulatorData.vasLevel <= 6 ? "text-yellow-600" :
                                    "text-red-600"
                                }`}>{simulatorData.vasLevel}</span>
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="10"
                                value={simulatorData.vasLevel}
                                onChange={(e) => setSimulatorData({ ...simulatorData, vasLevel: parseInt(e.target.value) })}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>0 (No Pain)</span>
                                <span>10 (Worst Pain)</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Location */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    📍 Location
                                </label>
                                <input
                                    type="text"
                                    value={simulatorData.location}
                                    onChange={(e) => setSimulatorData({ ...simulatorData, location: e.target.value })}
                                    placeholder="Ward A, Bed 12"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            {/* Source */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    🔌 Source
                                </label>
                                <select
                                    value={simulatorData.source}
                                    onChange={(e) => setSimulatorData({ ...simulatorData, source: e.target.value as "VAS_MONITOR" | "MANUAL_ENTRY" | "EMR_SYSTEM" | "MOBILE_APP" | "TABLET" })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="VAS_MONITOR">VAS Monitor</option>
                                    <option value="MANUAL_ENTRY">Manual Entry</option>
                                    <option value="EMR_SYSTEM">EMR System</option>
                                    <option value="MOBILE_APP">Mobile App</option>
                                    <option value="TABLET">Tablet</option>
                                </select>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                📝 Notes (Optional)
                            </label>
                            <textarea
                                value={simulatorData.notes}
                                onChange={(e) => setSimulatorData({ ...simulatorData, notes: e.target.value })}
                                placeholder="Additional notes..."
                                rows={3}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        {/* Send Button */}
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="secondary"
                                onClick={() => {
                                    setSimulatorData({
                                        patientMrn: "",
                                        vasLevel: 5,
                                        deviceId: "MONITOR-001",
                                        location: "Ward A",
                                        timestamp: new Date().toISOString(),
                                        notes: "",
                                        source: "VAS_MONITOR",
                                    });
                                    setApiKey("");
                                }}
                            >
                                🔄 Reset
                            </Button>
                            <Button
                                variant="submit"
                                onClick={handleSendVas}
                                disabled={isSending}
                            >
                                {isSending ? "Sending..." : "📡 Send VAS Record"}
                            </Button>
                        </div>

                        {/* Info Box */}
                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
                            <p className="text-sm text-blue-800 font-semibold mb-2">ℹ️ How to use:</p>
                            <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                                <li>Get API Key from Admin → API Key Management</li>
                                <li>Enter Patient MRN (must exist in system)</li>
                                <li>Adjust VAS Level (0-10)</li>
                                <li>Click "Send VAS Record"</li>
                                <li>Check Monitor tab for the new record</li>
                            </ol>
                        </div>
                    </CardContent>
                </Card>
            )}

            <PageNavigation />
        </div>
    );
};

export default ExternalVasMonitor;
