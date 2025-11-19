import React, { useState } from "react";
import { format, subDays } from "date-fns";
import { useGetMicroserviceEventsQuery } from "../../api/api/apiAnalyticsMicroserviceSlice";
import { Card, CardContent, CardHeader, CardTitle, LoadingSpinner, PageNavigation, Input, Button } from "../ui";
import type { MicroserviceEventType } from "../../types/analytics";

const MicroserviceAnalytics: React.FC = () => {
    // Date range state (default: today)
    const today = new Date();
    const [startDate, setStartDate] = useState(format(today, "yyyy-MM-dd'T'00:00:00"));
    const [endDate, setEndDate] = useState(format(today, "yyyy-MM-dd'T'23:59:59"));
    
    // Filters
    const [eventTypeFilter, setEventTypeFilter] = useState<string>("");
    const [userIdFilter, setUserIdFilter] = useState<string>("");
    const [patientMrnFilter, setPatientMrnFilter] = useState<string>("");

    // API query
    const { data: events, isLoading, error, refetch } = useGetMicroserviceEventsQuery({
        start: startDate,
        end: endDate,
    });

    // Client-side filtering
    const filteredEvents = events?.filter((event) => {
        if (eventTypeFilter && event.eventType !== eventTypeFilter) return false;
        if (userIdFilter && !event.userId?.toLowerCase().includes(userIdFilter.toLowerCase())) return false;
        if (patientMrnFilter && !event.patientMrn?.toLowerCase().includes(patientMrnFilter.toLowerCase())) return false;
        return true;
    }) || [];

    // Statistics
    const totalEvents = filteredEvents.length;
    const eventsByType = filteredEvents.reduce((acc, event) => {
        acc[event.eventType] = (acc[event.eventType] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    const eventsByRole = filteredEvents.reduce((acc, event) => {
        if (event.userRole) {
            acc[event.userRole] = (acc[event.userRole] || 0) + 1;
        }
        return acc;
    }, {} as Record<string, number>);

    const criticalEvents = filteredEvents.filter(
        (e) => e.priority === "HIGH" || e.priority === "CRITICAL" || (e.vasLevel && e.vasLevel >= 7)
    ).length;

    // Event type icon
    const getEventTypeIcon = (type: MicroserviceEventType) => {
        if (type.includes("RECOMMENDATION")) return "💊";
        if (type.includes("ESCALATION")) return "🚨";
        if (type.includes("PATIENT")) return "👤";
        if (type.includes("VAS")) return "📊";
        if (type.includes("LOGIN")) return "🔐";
        if (type.includes("PERSON")) return "👥";
        if (type.includes("EMR")) return "📋";
        if (type.includes("DOSE")) return "💉";
        return "📝";
    };

    // Event type color
    const getEventTypeColor = (type: MicroserviceEventType) => {
        if (type.includes("APPROVED") || type.includes("RESOLVED") || type.includes("SUCCESS")) 
            return "bg-green-50 border-green-200 text-green-800";
        if (type.includes("REJECTED") || type.includes("FAILED")) 
            return "bg-red-50 border-red-200 text-red-800";
        if (type.includes("ESCALATION") || type.includes("CRITICAL")) 
            return "bg-orange-50 border-orange-200 text-orange-800";
        return "bg-blue-50 border-blue-200 text-blue-800";
    };

    // Quick date presets
    const setDateRange = (days: number) => {
        const end = new Date();
        const start = subDays(end, days);
        setStartDate(format(start, "yyyy-MM-dd'T'00:00:00"));
        setEndDate(format(end, "yyyy-MM-dd'T'23:59:59"));
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-r from-purple-600 to-blue-700 text-white border-0 shadow-lg">
                <CardContent className="py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">📊 Microservice Analytics</h1>
                            <p className="text-purple-100">
                                Real-time events from Analytics Microservice (Port 8091)
                            </p>
                        </div>
                        <div className="text-5xl">🔬</div>
                    </div>
                </CardContent>
            </Card>

            {/* Date Range Selector */}
            <Card>
                <CardHeader>
                    <CardTitle>Date Range & Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* Date inputs */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                                <Input
                                    type="datetime-local"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                                <Input
                                    type="datetime-local"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                />
                            </div>
                            <div className="flex items-end">
                                <Button onClick={() => refetch()} className="w-full">
                                    🔄 Refresh
                                </Button>
                            </div>
                        </div>

                        {/* Quick presets */}
                        <div className="flex flex-wrap gap-2">
                            <Button variant="secondary" onClick={() => setDateRange(0)}>Today</Button>
                            <Button variant="secondary" onClick={() => setDateRange(1)}>Last 24h</Button>
                            <Button variant="secondary" onClick={() => setDateRange(7)}>Last 7 days</Button>
                            <Button variant="secondary" onClick={() => setDateRange(30)}>Last 30 days</Button>
                        </div>

                        {/* Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                                <select
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={eventTypeFilter}
                                    onChange={(e) => setEventTypeFilter(e.target.value)}
                                >
                                    <option value="">All Types</option>
                                    <option value="VAS_RECORDED">VAS Recorded</option>
                                    <option value="RECOMMENDATION_CREATED">Recommendation Created</option>
                                    <option value="RECOMMENDATION_APPROVED">Recommendation Approved</option>
                                    <option value="RECOMMENDATION_REJECTED">Recommendation Rejected</option>
                                    <option value="ESCALATION_CREATED">Escalation Created</option>
                                    <option value="ESCALATION_RESOLVED">Escalation Resolved</option>
                                    <option value="PATIENT_REGISTERED">Patient Registered</option>
                                    <option value="USER_LOGIN_SUCCESS">Login Success</option>
                                    <option value="USER_LOGIN_FAILED">Login Failed</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                                <Input
                                    type="text"
                                    placeholder="Filter by user..."
                                    value={userIdFilter}
                                    onChange={(e) => setUserIdFilter(e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Patient MRN</label>
                                <Input
                                    type="text"
                                    placeholder="Filter by MRN..."
                                    value={patientMrnFilter}
                                    onChange={(e) => setPatientMrnFilter(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200">
                    <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="text-sm text-gray-600 mb-1">Total Events</p>
                        <p className="text-3xl font-bold text-blue-600">{totalEvents}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-2 border-purple-200">
                    <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-2">📝</div>
                        <p className="text-sm text-gray-600 mb-1">Event Types</p>
                        <p className="text-3xl font-bold text-purple-600">{Object.keys(eventsByType).length}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200">
                    <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-2">🚨</div>
                        <p className="text-sm text-gray-600 mb-1">Critical Events</p>
                        <p className="text-3xl font-bold text-orange-600">{criticalEvents}</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200">
                    <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-2">👥</div>
                        <p className="text-sm text-gray-600 mb-1">User Roles</p>
                        <p className="text-3xl font-bold text-green-600">{Object.keys(eventsByRole).length}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Loading State */}
            {isLoading && <LoadingSpinner message="Loading events from microservice..." />}

            {/* Error State */}
            {error && (
                <Card className="bg-red-50 border-2 border-red-200">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <div className="text-5xl mb-4">❌</div>
                            <h3 className="text-xl font-bold text-red-800 mb-2">Microservice Unavailable</h3>
                            <p className="text-red-600 mb-4">
                                Cannot connect to Analytics Microservice (Port 8091)
                            </p>
                            <p className="text-sm text-red-500">
                                {JSON.stringify(error)}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Events Table */}
            {!isLoading && !error && (
                <Card>
                    <CardHeader>
                        <CardTitle>Events Timeline ({filteredEvents.length} events)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {filteredEvents.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">📭</div>
                                <p className="text-gray-600 mb-2">No events found</p>
                                <p className="text-sm text-gray-500">Try adjusting your filters or date range</p>
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto">
                                {filteredEvents.map((event) => (
                                    <div
                                        key={event.id}
                                        className={`p-4 rounded-lg border-2 ${getEventTypeColor(event.eventType)}`}
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex items-start gap-3 flex-1">
                                                <span className="text-2xl">{getEventTypeIcon(event.eventType)}</span>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="font-bold text-sm">
                                                            {event.eventType.replace(/_/g, " ")}
                                                        </span>
                                                        {event.priority && (
                                                            <span className="px-2 py-0.5 text-xs font-semibold bg-white rounded">
                                                                {event.priority}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-xs space-y-1">
                                                        <p>
                                                            <span className="font-medium">Time:</span>{" "}
                                                            {new Date(event.timestamp).toLocaleString()}
                                                        </p>
                                                        {event.userId && (
                                                            <p>
                                                                <span className="font-medium">User:</span> {event.userId}{" "}
                                                                {event.userRole && `(${event.userRole})`}
                                                            </p>
                                                        )}
                                                        {event.patientMrn && (
                                                            <p>
                                                                <span className="font-medium">Patient:</span> {event.patientMrn}
                                                            </p>
                                                        )}
                                                        {event.vasLevel !== undefined && (
                                                            <p>
                                                                <span className="font-medium">VAS Level:</span> {event.vasLevel}/10
                                                            </p>
                                                        )}
                                                        {event.processingTimeMs && (
                                                            <p>
                                                                <span className="font-medium">Processing Time:</span>{" "}
                                                                {event.processingTimeMs}ms
                                                            </p>
                                                        )}
                                                        {event.metadata && Object.keys(event.metadata).length > 0 && (
                                                            <details className="mt-2">
                                                                <summary className="cursor-pointer font-medium text-blue-600 hover:text-blue-800">
                                                                    View Metadata
                                                                </summary>
                                                                <pre className="mt-2 p-2 bg-white rounded text-xs overflow-x-auto">
                                                                    {JSON.stringify(event.metadata, null, 2)}
                                                                </pre>
                                                            </details>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
            <PageNavigation />
        </div>
    );
};

export default MicroserviceAnalytics;
