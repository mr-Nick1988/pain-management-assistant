import React, {useState} from "react";
import {useGetAllEscalationsQuery, useGetEscalationStatsQuery} from "../../api/api/apiAnesthesiologistSlice.ts";
import {EscalationStatus, EscalationPriority} from "../../types/anesthesiologist.ts";
import {EscalationsList, ProtocolEditor} from "../../exports/exports.ts";
import {Button, Card, CardContent, CardHeader, LoadingSpinner, ErrorMessage, StatCard, PageNavigation } from "../ui";

const AnesthesiologistDashboard: React.FC = () => {
    const {data: escalations, isLoading, error} = useGetAllEscalationsQuery();
    const {data: stats} = useGetEscalationStatsQuery();
    const [selectedEscalationId, setSelectedEscalationId] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<"overview" | "escalations" | "protocols">("overview");

    // Используем статистику из API или считаем локально
    const pendingCount = stats?.pending || escalations?.filter(e => e.status === EscalationStatus.PENDING).length || 0;
    const inProgressCount = stats?.inProgress || escalations?.filter(e => e.status === EscalationStatus.IN_PROGRESS).length || 0;
    const highPriorityCount = stats?.high || escalations?.filter(e => e.priority === EscalationPriority.HIGH).length || 0;
    const mediumPriorityCount = stats?.medium || escalations?.filter(e => e.priority === EscalationPriority.MEDIUM).length || 0;

    const handleEscalationSelect = (escalationId: number) => {
        setSelectedEscalationId(escalationId);
        setActiveTab("protocols");
    };

    const getStatusBadgeClass = (status: EscalationStatus) => {
        const baseClass = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
        if (status === EscalationStatus.PENDING) return `${baseClass} bg-yellow-100 text-yellow-800`;
        if (status === EscalationStatus.IN_PROGRESS) return `${baseClass} bg-blue-100 text-blue-800`;
        if (status === EscalationStatus.RESOLVED) return `${baseClass} bg-green-100 text-green-800`;
        return `${baseClass} bg-gray-100 text-gray-800`;
    };

    const getPriorityBadgeClass = (priority: EscalationPriority) => {
        const baseClass = "inline-flex px-2 py-1 text-xs font-semibold rounded-full";
        if (priority === EscalationPriority.HIGH) return `${baseClass} bg-red-100 text-red-800`;
        if (priority === EscalationPriority.MEDIUM) return `${baseClass} bg-orange-100 text-orange-800`;
        if (priority === EscalationPriority.LOW) return `${baseClass} bg-yellow-100 text-yellow-800`;
        return `${baseClass} bg-gray-100 text-gray-800`;
    };

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <LoadingSpinner message="Loading anesthesiologist dashboard..."/>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <ErrorMessage message={`Error loading data: ${JSON.stringify(error)}`}/>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 text-gray-900">
                    Anesthesiologist Dashboard
                </h1>
                <p className="text-lg text-gray-600">
                    Welcome, {localStorage.getItem("userFirstName") || "Anesthesiologist"}
                </p>
            </div>
            <Card className="mb-6">
                <CardHeader>
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
                                <StatCard
                                    title="Pending Escalations"
                                    value={pendingCount}
                                    description="Awaiting review"
                                    icon="P"
                                    iconBgColor="bg-yellow-100"
                                    iconTextColor="text-yellow-600"
                                />
                                <StatCard
                                    title="High Priority"
                                    value={highPriorityCount}
                                    description="Need immediate attention"
                                    icon="H"
                                    iconBgColor="bg-red-100"
                                    iconTextColor="text-red-600"
                                />
                                <StatCard
                                    title="Medium Priority"
                                    value={mediumPriorityCount}
                                    description="Important escalations"
                                    icon="M"
                                    iconBgColor="bg-orange-100"
                                    iconTextColor="text-orange-600"
                                />
                                <StatCard
                                    title="In Progress"
                                    value={inProgressCount}
                                    description="Escalations under review"
                                    icon="P"
                                    iconBgColor="bg-blue-100"
                                    iconTextColor="text-blue-600"
                                />
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
                                            <Card key={escalation.id}
                                                  className="cursor-pointer hover:shadow-md transition-shadow"
                                                  onClick={() => handleEscalationSelect(escalation.id)}>
                                                <CardContent className="p-4">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex-1">
                                                            <h4 className="font-medium text-gray-900">Escalation #{escalation.id}</h4>
                                                            <p className="text-sm text-gray-600">Recommendation ID: {escalation.recommendationId}</p>
                                                            <p className="text-sm text-gray-600">Reason: {escalation.escalationReason}</p>
                                                            <p className="text-sm text-gray-500">Escalated by: {escalation.escalatedBy}</p>
                                                        </div>
                                                        <div className="flex flex-col items-end space-y-2">
                                                            <span className={getStatusBadgeClass(escalation.status)}>
                                                                {escalation.status}
                                                            </span>
                                                            <span className={getPriorityBadgeClass(escalation.priority)}>
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
        <PageNavigation />

        </div>
    );
};

export default AnesthesiologistDashboard;