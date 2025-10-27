import React, { useState } from "react";
import { useRecordExternalVasMutation } from "../../api/api/apiExternalVasSlice";
import type { ExternalVasRecordRequest, VasSource } from "../../types/externalVas";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "../ui";
import { useToast } from "../../contexts/ToastContext";

const VasDeviceSimulator: React.FC = () => {
    const toast = useToast();

    // State
    const [apiKey, setApiKey] = useState("pma_test_simulator_key");
    const [patientMrn, setPatientMrn] = useState("");
    const [vasLevel, setVasLevel] = useState(5);
    const [deviceId, setDeviceId] = useState("SIMULATOR-001");
    const [location, setLocation] = useState("Test Ward, Bed 1");
    const [notes, setNotes] = useState("");
    const [source, setSource] = useState<VasSource>("VAS_MONITOR");
    const [response, setResponse] = useState<any>(null);

    // API hook
    const [recordVas, { isLoading }] = useRecordExternalVasMutation();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!patientMrn.trim()) {
            toast.error("Patient MRN is required");
            return;
        }

        const request: ExternalVasRecordRequest = {
            patientMrn: patientMrn.trim(),
            vasLevel,
            deviceId: deviceId.trim(),
            location: location.trim(),
            timestamp: new Date().toISOString(),
            notes: notes.trim() || undefined,
            source,
        };

        try {
            const result = await recordVas({ apiKey, data: request }).unwrap();
            setResponse({ success: true, data: result });
            toast.success("VAS record sent successfully!");
        } catch (error: any) {
            console.error("Failed to send VAS record:", error);
            setResponse({ success: false, error: error.data || error.message || "Unknown error" });
            toast.error("Failed to send VAS record");
        }
    };

    const handleRandomize = () => {
        setVasLevel(Math.floor(Math.random() * 11)); // 0-10
        setDeviceId(`SIMULATOR-${String(Math.floor(Math.random() * 100)).padStart(3, "0")}`);
        const wards = ["Ward A", "Ward B", "ICU", "Emergency"];
        const beds = Math.floor(Math.random() * 20) + 1;
        setLocation(`${wards[Math.floor(Math.random() * wards.length)]}, Bed ${beds}`);
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>🧪 VAS Device Simulator</CardTitle>
                    <p className="text-sm text-gray-600 mt-2">
                        Simulate sending VAS data from an external device for testing purposes
                    </p>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* API Key */}
                        <div>
                            <Label htmlFor="apiKey">API Key</Label>
                            <Input
                                id="apiKey"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="pma_live_..."
                                className="font-mono text-sm"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Use a test API key or generate one in API Key Management
                            </p>
                        </div>

                        {/* Patient MRN */}
                        <div>
                            <Label htmlFor="patientMrn">Patient MRN *</Label>
                            <Input
                                id="patientMrn"
                                value={patientMrn}
                                onChange={(e) => setPatientMrn(e.target.value)}
                                placeholder="MRN-42"
                                required
                            />
                        </div>

                        {/* VAS Level Slider */}
                        <div>
                            <Label htmlFor="vasLevel">VAS Level: {vasLevel}</Label>
                            <div className="flex items-center gap-4">
                                <input
                                    id="vasLevel"
                                    type="range"
                                    min="0"
                                    max="10"
                                    value={vasLevel}
                                    onChange={(e) => setVasLevel(Number(e.target.value))}
                                    className="flex-1"
                                />
                                <div className={`px-4 py-2 rounded-full font-bold ${
                                    vasLevel <= 3 ? "bg-green-100 text-green-800" :
                                    vasLevel <= 6 ? "bg-yellow-100 text-yellow-800" :
                                    "bg-red-100 text-red-800"
                                }`}>
                                    {vasLevel <= 3 ? "🟢" : vasLevel <= 6 ? "🟡" : "🔴"} {vasLevel}
                                </div>
                            </div>
                        </div>

                        {/* Device ID */}
                        <div>
                            <Label htmlFor="deviceId">Device ID</Label>
                            <Input
                                id="deviceId"
                                value={deviceId}
                                onChange={(e) => setDeviceId(e.target.value)}
                                placeholder="MONITOR-001"
                            />
                        </div>

                        {/* Location */}
                        <div>
                            <Label htmlFor="location">Location</Label>
                            <Input
                                id="location"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Ward A, Bed 12"
                            />
                        </div>

                        {/* Source */}
                        <div>
                            <Label htmlFor="source">Source</Label>
                            <select
                                id="source"
                                value={source}
                                onChange={(e) => setSource(e.target.value as VasSource)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="VAS_MONITOR">VAS Monitor</option>
                                <option value="MANUAL_ENTRY">Manual Entry</option>
                                <option value="EMR_SYSTEM">EMR System</option>
                                <option value="MOBILE_APP">Mobile App</option>
                                <option value="TABLET">Tablet</option>
                            </select>
                        </div>

                        {/* Notes */}
                        <div>
                            <Label htmlFor="notes">Notes (Optional)</Label>
                            <textarea
                                id="notes"
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Patient reported sharp pain in lower back"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                rows={3}
                            />
                        </div>

                        {/* Buttons */}
                        <div className="flex gap-2">
                            <Button
                                type="submit"
                                variant="approve"
                                disabled={isLoading}
                                className="flex-1"
                            >
                                {isLoading ? "Sending..." : "📡 Send VAS Record"}
                            </Button>
                            <Button
                                type="button"
                                variant="update"
                                onClick={handleRandomize}
                            >
                                🎲 Randomize
                            </Button>
                        </div>
                    </form>

                    {/* Response Display */}
                    {response && (
                        <div className="mt-6">
                            <Label>Response:</Label>
                            <div className={`p-4 rounded border-2 ${
                                response.success
                                    ? "bg-green-50 border-green-300"
                                    : "bg-red-50 border-red-300"
                            }`}>
                                <p className={`font-bold mb-2 ${
                                    response.success ? "text-green-800" : "text-red-800"
                                }`}>
                                    {response.success ? "✅ Success" : "❌ Error"}
                                </p>
                                <pre className="text-sm overflow-x-auto">
                                    {JSON.stringify(response.success ? response.data : response.error, null, 2)}
                                </pre>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Quick Test Scenarios */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Test Scenarios</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setPatientMrn("MRN-42");
                            setVasLevel(8);
                            setDeviceId("MONITOR-001");
                            setLocation("Ward A, Bed 12");
                            setNotes("High pain alert - patient needs attention");
                            setSource("VAS_MONITOR");
                        }}
                        className="w-full text-left justify-start"
                    >
                        🔴 High Pain Alert (VAS 8)
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setPatientMrn("MRN-43");
                            setVasLevel(3);
                            setDeviceId("TABLET-005");
                            setLocation("Ward B, Bed 5");
                            setNotes("Patient comfortable, pain managed");
                            setSource("TABLET");
                        }}
                        className="w-full text-left justify-start"
                    >
                        🟢 Low Pain (VAS 3)
                    </Button>
                    <Button
                        variant="outline"
                        onClick={() => {
                            setPatientMrn("MRN-44");
                            setVasLevel(5);
                            setDeviceId("MOBILE-APP");
                            setLocation("Home Care");
                            setNotes("Patient self-reported via mobile app");
                            setSource("MOBILE_APP");
                        }}
                        className="w-full text-left justify-start"
                    >
                        🟡 Moderate Pain (VAS 5) - Mobile App
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default VasDeviceSimulator;
