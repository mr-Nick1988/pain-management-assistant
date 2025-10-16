import React, { useState } from "react";
import { useGetRecentEventsQuery, useGetEventsByTypeQuery } from '../../api/api/apiAdminSlice.ts';
import { Card, CardHeader, CardTitle, CardContent, Input, LoadingSpinner, ErrorMessage, Badge, Select } from "../ui";

const EventsTimeline: React.FC = () => {
    const [limit, setLimit] = useState(50);
    const [eventType, setEventType] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // RTK Query hooks - загружает события
    // Если выбран тип события - используем getEventsByType, иначе getRecentEvents
    const { data: recentEvents, isLoading: isLoadingRecent, error: errorRecent } = useGetRecentEventsQuery(
        { limit, startDate, endDate },
        { skip: !!eventType } // Skip если выбран конкретный тип
    );

    const { data: eventsByType, isLoading: isLoadingByType, error: errorByType } = useGetEventsByTypeQuery(
        { eventType, startDate, endDate },
        { skip: !eventType } // Skip если тип не выбран
    );

    const events = eventType ? eventsByType : recentEvents;
    const isLoading = eventType ? isLoadingByType : isLoadingRecent;
    const error = eventType ? errorByType : errorRecent;

    /**
     * Форматировать timestamp в читаемый формат
     */
    const formatTimestamp = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    /**
     * Получить иконку для типа события
     */
    const getEventIcon = (type: string) => {
        if (type.includes("RECOMMENDATION")) return "💊";
        if (type.includes("ESCALATION")) return "🚨";
        if (type.includes("PATIENT")) return "👤";
        if (type.includes("VAS")) return "📊";
        if (type.includes("LOGIN")) return "🔐";
        if (type.includes("PERSON")) return "👥";
        if (type.includes("EMR")) return "📋";
        return "📝";
    };

    /**
     * Получить цвет бейджа для статуса
     */
    const getStatusColor = (status?: string) => {
        if (!status) return "bg-gray-100 text-gray-800";
        if (status.includes("APPROVED") || status.includes("SUCCESS")) return "bg-green-100 text-green-800";
        if (status.includes("PENDING") || status.includes("REVIEW")) return "bg-yellow-100 text-yellow-800";
        if (status.includes("REJECTED") || status.includes("FAILED")) return "bg-red-100 text-red-800";
        return "bg-blue-100 text-blue-800";
    };

    /**
     * Получить цвет бейджа для приоритета
     */
    const getPriorityColor = (priority?: string) => {
        if (!priority) return "bg-gray-100 text-gray-800";
        if (priority === "CRITICAL") return "bg-red-100 text-red-800";
        if (priority === "HIGH") return "bg-orange-100 text-orange-800";
        if (priority === "MEDIUM") return "bg-yellow-100 text-yellow-800";
        if (priority === "LOW") return "bg-green-100 text-green-800";
        return "bg-blue-100 text-blue-800";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white border-0 shadow-lg">
                <CardContent className="py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Events Timeline</h1>
                            <p className="text-indigo-100">Real-time system events and activity log</p>
                        </div>
                        <div className="text-4xl sm:text-5xl">📅</div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Event Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Event Type</label>
                            <Select value={eventType} onChange={(e) => setEventType(e.target.value)}>
                                <option value="">All Events</option>
                                <option value="RECOMMENDATION_CREATED">Recommendation Created</option>
                                <option value="RECOMMENDATION_APPROVED">Recommendation Approved</option>
                                <option value="RECOMMENDATION_REJECTED">Recommendation Rejected</option>
                                <option value="ESCALATION_CREATED">Escalation Created</option>
                                <option value="ESCALATION_RESOLVED">Escalation Resolved</option>
                                <option value="PATIENT_CREATED">Patient Created</option>
                                <option value="VAS_RECORDED">VAS Recorded</option>
                                <option value="LOGIN_SUCCESS">Login Success</option>
                                <option value="LOGIN_FAILED">Login Failed</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Limit</label>
                            <Input
                                type="number"
                                min="10"
                                max="200"
                                value={limit}
                                onChange={(e) => setLimit(Number(e.target.value))}
                            />
                        </div>
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
                    </div>
                    {error && <ErrorMessage message="Error loading events" onClose={() => {}} />}
                </CardContent>
            </Card>

            {isLoading && <LoadingSpinner message="Loading events..." />}

            {/* Events List */}
            {events && !isLoading && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {eventType ? `${eventType} Events` : 'Recent Events'} ({events.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {events.map((event) => (
                                <div
                                    key={event.id}
                                    className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 bg-white"
                                >
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                        {/* Event Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <span className="text-2xl">{getEventIcon(event.eventType)}</span>
                                                <h3 className="text-base font-semibold text-gray-900">
                                                    {event.eventType}
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">User:</span> {event.userId} ({event.userRole})
                                                </div>
                                                <div>
                                                    <span className="font-medium">Time:</span> {formatTimestamp(event.timestamp)}
                                                </div>
                                                {event.patientMrn && (
                                                    <div>
                                                        <span className="font-medium">Patient MRN:</span> {event.patientMrn}
                                                    </div>
                                                )}
                                                {event.recommendationId && (
                                                    <div>
                                                        <span className="font-medium">Recommendation ID:</span> {event.recommendationId}
                                                    </div>
                                                )}
                                                {event.escalationId && (
                                                    <div>
                                                        <span className="font-medium">Escalation ID:</span> {event.escalationId}
                                                    </div>
                                                )}
                                                {event.vasLevel !== undefined && (
                                                    <div>
                                                        <span className="font-medium">VAS Level:</span> {event.vasLevel}
                                                    </div>
                                                )}
                                                {event.processingTimeMs && (
                                                    <div>
                                                        <span className="font-medium">Processing Time:</span> {event.processingTimeMs}ms
                                                    </div>
                                                )}
                                            </div>

                                            {/* Metadata */}
                                            {event.metadata && Object.keys(event.metadata).length > 0 && (
                                                <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                                                    <span className="font-medium text-gray-700">Metadata:</span>
                                                    <pre className="mt-1 text-gray-600 overflow-x-auto">
                                                        {JSON.stringify(event.metadata, null, 2)}
                                                    </pre>
                                                </div>
                                            )}
                                        </div>

                                        {/* Badges */}
                                        <div className="flex flex-row sm:flex-col gap-2">
                                            {event.status && (
                                                <Badge className={getStatusColor(event.status)}>
                                                    {event.status}
                                                </Badge>
                                            )}
                                            {event.priority && (
                                                <Badge className={getPriorityColor(event.priority)}>
                                                    {event.priority}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {events && events.length === 0 && !isLoading && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="text-6xl mb-4">📅</div>
                        <p className="text-gray-600 mb-4">No events found</p>
                        <p className="text-sm text-gray-500">Try adjusting your filters</p>
                    </CardContent>
                </Card>
            )}

            {!events && !isLoading && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="text-6xl mb-4">📅</div>
                        <p className="text-gray-600 mb-4">No events loaded yet</p>
                        <p className="text-sm text-gray-500">Events will load automatically</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default EventsTimeline;
