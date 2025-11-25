import React, { useState } from "react";
import { useGetRecentLogsQuery, useGetLogsByLevelQuery } from '../../api/api/apiAdminSlice.ts';
import { Card, CardHeader, CardTitle, CardContent, Input, LoadingSpinner, ErrorMessage, Select , PageNavigation } from "../ui";
import {Badge} from "../ui/Badge.tsx";
import { Wrench, XCircle, AlertTriangle, Info, Bug, FileText } from "lucide-react";

const TechnicalLogs: React.FC = () => {
    const [limit, setLimit] = useState(100);
    const [logLevel, setLogLevel] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // RTK Query hooks - загружает технические логи из МОНОЛИТА
    const { data: recentLogs, isLoading: isLoadingRecent, error: errorRecent } = useGetRecentLogsQuery(
        { limit, startDate, endDate },
        { skip: !!logLevel }
    );

    const { data: logsByLevel, isLoading: isLoadingByLevel, error: errorByLevel } = useGetLogsByLevelQuery(
        { level: logLevel, startDate, endDate },
        { skip: !logLevel }
    );

    const logs = logLevel ? logsByLevel : recentLogs;
    const isLoading = logLevel ? isLoadingByLevel : isLoadingRecent;
    const error = logLevel ? errorByLevel : errorRecent;

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
            second: '2-digit',
            fractionalSecondDigits: 3
        });
    };

    /**
     * Получить цвет бейджа для уровня лога
     */
    const getLogLevelColor = (level: string) => {
        switch (level) {
            case "ERROR": return "bg-red-100 text-red-800 border-red-200";
            case "WARN": return "bg-yellow-100 text-yellow-800 border-yellow-200";
            case "INFO": return "bg-blue-100 text-blue-800 border-blue-200";
            case "DEBUG": return "bg-gray-100 text-gray-800 border-gray-200";
            default: return "bg-gray-100 text-gray-800 border-gray-200";
        }
    };

    /**
     * Получить иконку для уровня лога
     */
    const getLogLevelIcon = (level: string): React.ReactNode => {
        switch (level) {
            case "ERROR": return <XCircle className="w-5 h-5 text-red-700"/>;
            case "WARN": return <AlertTriangle className="w-5 h-5 text-yellow-700"/>;
            case "INFO": return <Info className="w-5 h-5 text-blue-700"/>;
            case "DEBUG": return <Bug className="w-5 h-5 text-gray-700"/>;
            default: return <FileText className="w-5 h-5 text-gray-600"/>;
        }
    };

    /**
     * Получить цвет для модуля
     */
    const getModuleColor = (module: string) => {
        switch (module) {
            case "nurse": return "bg-green-100 text-green-800";
            case "doctor": return "bg-blue-100 text-blue-800";
            case "anesthesiologist": return "bg-purple-100 text-purple-800";
            case "admin": return "bg-red-100 text-red-800";
            case "external_emr_integration_service": return "bg-indigo-100 text-indigo-800";
            case "treatment_protocol": return "bg-pink-100 text-pink-800";
            case "unknown": return "bg-gray-100 text-gray-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-r from-gray-700 to-slate-800 text-white border-0 shadow-lg">
                <CardContent className="py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Technical Logs</h1>
                            <p className="text-gray-300">System logs and error tracking</p>
                        </div>
                        <div className="text-4xl sm:text-5xl"><Wrench className="w-10 h-10"/></div>
                    </div>
                </CardContent>
            </Card>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <CardTitle>Log Filters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Log Level</label>
                            <Select value={logLevel} onChange={(e) => setLogLevel(e.target.value)}>
                                <option value="">All Levels</option>
                                <option value="ERROR">ERROR</option>
                                <option value="WARN">WARN</option>
                                <option value="INFO">INFO</option>
                            </Select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Limit</label>
                            <Input
                                type="number"
                                min="10"
                                max="500"
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
                    {error && <ErrorMessage message="Error loading logs" onClose={() => {}} />}
                </CardContent>
            </Card>

            {isLoading && <LoadingSpinner message="Loading logs..." />}

            {/* Logs List */}
            {logs && !isLoading && (
                <Card>
                    <CardHeader>
                        <CardTitle>
                            {logLevel ? `${logLevel} Logs` : 'Recent Logs'} ({logs.length})
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {logs.map((log) => (
                                <div
                                    key={log.id}
                                    className={`p-4 border-l-4 rounded-r-lg ${
                                        log.logLevel === 'ERROR' ? 'border-red-500 bg-red-50' :
                                        log.logLevel === 'WARN' ? 'border-yellow-500 bg-yellow-50' :
                                        log.logLevel === 'INFO' ? 'border-blue-500 bg-blue-50' :
                                        'border-gray-500 bg-gray-50'
                                    }`}
                                >
                                    {/* Log Header */}
                                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                                        <div className="flex items-center space-x-2">
                                            <span className="inline-flex items-center justify-center">{getLogLevelIcon(log.logLevel)}</span>
                                            <Badge className={`${getLogLevelColor(log.logLevel)} border`}>
                                                {log.logLevel}
                                            </Badge>
                                            <Badge className={getModuleColor(log.module)}>
                                                {log.module}
                                            </Badge>
                                            <Badge className={log.success ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}>
                                                {log.success ? "SUCCESS" : "FAILED"}
                                            </Badge>
                                        </div>
                                        <span className="text-xs text-gray-600">
                                            {formatTimestamp(log.timestamp)}
                                        </span>
                                    </div>

                                    {/* Log Details */}
                                    <div className="space-y-2">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                                            <div>
                                                <span className="font-medium text-gray-700">Category:</span>{' '}
                                                <span className="text-gray-900">{log.logCategory}</span>
                                            </div>
                                            <div>
                                                <span className="font-medium text-gray-700">Duration:</span>{' '}
                                                <span className="text-gray-900">{log.durationMs}ms</span>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <span className="font-medium text-gray-700">Class:</span>{' '}
                                                <span className="text-gray-900 font-mono text-xs">{log.className}</span>
                                            </div>
                                            <div className="sm:col-span-2">
                                                <span className="font-medium text-gray-700">Method:</span>{' '}
                                                <span className="text-gray-900 font-mono text-xs">{log.methodName}</span>
                                            </div>
                                        </div>

                                        {/* Method Signature */}
                                        {log.methodSignature && (
                                            <div className="p-2 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
                                                <span className="text-gray-600">Signature:</span>{' '}
                                                <span className="text-gray-900">{log.methodSignature}</span>
                                            </div>
                                        )}

                                        {/* Arguments */}
                                        {log.arguments && (
                                            <div className="p-2 bg-gray-100 rounded text-xs font-mono overflow-x-auto">
                                                <span className="text-gray-600">Arguments:</span>{' '}
                                                <span className="text-gray-900">{log.arguments}</span>
                                            </div>
                                        )}

                                        {/* Error Message */}
                                        {log.errorMessage && (
                                            <div className="p-3 bg-red-100 border border-red-200 rounded">
                                                <p className="text-sm font-medium text-red-800 mb-1">Error Message:</p>
                                                <p className="text-sm text-red-700">{log.errorMessage}</p>
                                            </div>
                                        )}

                                        {/* Stack Trace */}
                                        {log.errorStackTrace && (
                                            <details className="mt-2">
                                                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                                                    Stack Trace
                                                </summary>
                                                <pre className="mt-2 p-3 bg-gray-900 text-green-400 rounded text-xs overflow-x-auto">
                                                    {log.errorStackTrace}
                                                </pre>
                                            </details>
                                        )}

                                        {/* User & Session Info */}
                                        {(log.userId || log.sessionId) && (
                                            <div className="flex flex-wrap gap-3 text-xs text-gray-600 pt-2 border-t border-gray-200">
                                                {log.userId && (
                                                    <div>
                                                        <span className="font-medium">User ID:</span> {log.userId}
                                                    </div>
                                                )}
                                                {log.sessionId && (
                                                    <div>
                                                        <span className="font-medium">Session ID:</span> {log.sessionId}
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Empty State */}
            {logs && logs.length === 0 && !isLoading && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="mb-4 flex justify-center"><Wrench className="w-12 h-12 text-gray-500"/></div>
                        <p className="text-gray-600 mb-4">No logs found</p>
                        <p className="text-sm text-gray-500">Try adjusting your filters</p>
                    </CardContent>
                </Card>
            )}

            {!logs && !isLoading && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="mb-4 flex justify-center"><Wrench className="w-12 h-12 text-gray-500"/></div>
                        <p className="text-gray-600 mb-4">No logs loaded yet</p>
                        <p className="text-sm text-gray-500">Logs will load automatically</p>
                    </CardContent>
                </Card>
            )}
        <PageNavigation />

        </div>
    );
};

export default TechnicalLogs;
