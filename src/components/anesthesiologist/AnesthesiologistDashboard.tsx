import React, {useState} from "react";
import {useGetEscalationsQuery} from "../../api/api/apiAnesthesiologistSlice.ts";
import {EscalationStatus} from "../../types/anesthesiologist.ts";
import {EscalationsList, ProtocolEditor} from "../../exports/exports.ts";
import { Button, Card, CardContent, CardHeader, CardTitle } from "../ui";

const AnesthesiologistDashboard: React.FC = () => {
    const {data: escalations, isLoading, error} = useGetEscalationsQuery();
    const [selectedEscalationId, setSelectedEscalationId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "escalations" | "protocols">("overview");

    //СТАТИСТИКА ЭСКАЛАЦИЙ БРО
    const pendingCount = escalations?.filter(e => e.status === EscalationStatus.PENDING).length || 0;
    const inReviewCount = escalations?.filter(e => e.status === EscalationStatus.IN_REVIEW).length || 0;
    const criticalCount = escalations?.filter(e => e.priority === "CRITICAL").length || 0;
    const highPriorityCount = escalations?.filter(e => e.priority === "HIGH").length || 0;

    const handleEscalationSelect = (escalationId: string) => {
        setSelectedEscalationId(escalationId);
        setActiveTab("protocols");
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2">Loading anesthesiologist dashboard...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                    Error loading data: {JSON.stringify(error)}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Anesthesiologist Dashboard</CardTitle>
                    <p className="text-gray-600 mt-2">
                        Welcome, {localStorage.getItem("userFirstName") || "Anesthesiologist"}
                    </p>
                </CardHeader>

                <CardContent>
                    {/* Navigation Tabs */}
                    <nav className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg">
                        <Button
                            variant={activeTab === "overview" ? "default" : "ghost"}
                            onClick={() => setActiveTab("overview")}
                            className="flex-1"
                        >
                            Overview
                        </Button>
                        <Button
                            variant={activeTab === "escalations" ? "default" : "ghost"}
                            onClick={() => setActiveTab("escalations")}
                            className="flex-1"
                        >
                            Escalations
                        </Button>
                        <Button
                            variant={activeTab === "protocols" ? "default" : "ghost"}
                            onClick={() => setActiveTab("protocols")}
                            className="flex-1"
                        >
                            Protocols
                        </Button>
                    </nav>

                    {/* Tab Content */}
                    {activeTab === "overview" && (
                        <div className="space-y-6">
                            {/* Statistics Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                                                    <span className="text-yellow-600 text-sm font-medium">P</span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-sm font-medium text-gray-900">Pending Escalations</h3>
                                                <div className="text-2xl font-bold text-gray-900">{pendingCount}</div>
                                                <p className="text-sm text-gray-500">Awaiting review</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                                                    <span className="text-red-600 text-sm font-medium">C</span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-sm font-medium text-gray-900">Critical Escalations</h3>
                                                <div className="text-2xl font-bold text-gray-900">{criticalCount}</div>
                                                <p className="text-sm text-gray-500">Need immediate attention</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                                    <span className="text-orange-600 text-sm font-medium">H</span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-sm font-medium text-gray-900">High Priority</h3>
                                                <div className="text-2xl font-bold text-gray-900">{highPriorityCount}</div>
                                                <p className="text-sm text-gray-500">Important escalations</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardContent className="p-6">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0">
                                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 text-sm font-medium">R</span>
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-sm font-medium text-gray-900">In Review</h3>
                                                <div className="text-2xl font-bold text-gray-900">{inReviewCount}</div>
                                                <p className="text-sm text-gray-500">Escalations under review</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Quick Actions */}
                            <div className="flex justify-center">
                                <Button
                                    variant="submit"
                                    onClick={() => setActiveTab("escalations")}
                                    className="px-8"
                                >
                                    View All Escalations
                                </Button>
                            </div>

                            {/* Recent Escalations */}
                            <div className="mt-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Escalations</h3>
                                {escalations && escalations.length > 0 ? (
                                    <div className="space-y-3">
                                        {escalations.slice(0, 5).map((escalation) => (
                                            <Card key={escalation.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleEscalationSelect(escalation.id)}>
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-900">{escalation.patientName}</h4>
                                                            <p className="text-sm text-gray-600">Doctor: {escalation.doctorName}</p>
                                                            <p className="text-sm text-gray-600">Reason: {escalation.rejectedReason}</p>
                                                        </div>
                                                        <div className="flex flex-col items-end space-y-2">
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                escalation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                                escalation.status === 'IN_REVIEW' ? 'bg-blue-100 text-blue-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {escalation.status}
                                                            </span>
                                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                                escalation.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                                                escalation.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                                                escalation.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {escalation.priority}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card>
                                        <CardContent className="p-8 text-center">
                                            <p className="text-gray-500">No active escalations at the moment.</p>
                                        </CardContent>
                                    </Card>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === "escalations" && (
                        <div className="mt-6">
                            <EscalationsList
                                escalations={escalations || []}
                                onEscalationSelect={handleEscalationSelect}
                            />
                        </div>
                    )}

                    {activeTab === "protocols" && (
                        <div className="mt-6">
                            <ProtocolEditor
                                selectedEscalationId={selectedEscalationId}
                            />
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AnesthesiologistDashboard;