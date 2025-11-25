import React, {useState} from "react";
import {useGetPatientStatsQuery} from '../../api/api/apiAdminSlice.ts';
import {Card, CardHeader, CardTitle, CardContent, Input, LoadingSpinner, ErrorMessage, PageNavigation } from "../ui";
import { Hospital, BarChart3, AlertTriangle, TrendingUp, CheckCircle2, Venus, Mars } from "lucide-react";


const PatientStatistics: React.FC = () => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    // RTK Query hook
    const {data: stats, isLoading, error} = useGetPatientStatsQuery(
        startDate || endDate ? {startDate, endDate} : undefined
    );

    const getVasLevelColor = (level: number) => {
        if (level >= 7) return "text-red-600";
        if (level >= 4) return "text-yellow-600";
        return "text-green-600";
    };

    const getVasLevelBg = (level: number) => {
        if (level >= 7) return "bg-red-50";
        if (level >= 4) return "bg-yellow-50";
        return "bg-green-50";
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <Card className="bg-gradient-to-r from-pink-600 to-purple-700 text-white border-0 shadow-lg">
                <CardContent className="py-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Patient Statistics</h1>
                            <p className="text-pink-100">Patient registration and VAS records analysis</p>
                        </div>
                        <div className="text-4xl sm:text-5xl"><Hospital className="w-10 h-10"/></div>
                    </div>
                </CardContent>
            </Card>

            {/* Date Filter */}
            <Card>
                <CardHeader>
                    <CardTitle>Filter by Date Range</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
                            <Input type="datetime-local" value={startDate}
                                   onChange={(e) => setStartDate(e.target.value)}/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
                            <Input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)}/>
                        </div>
                        <div className="flex items-end">
                            <div className="w-full p-3 bg-pink-50 border border-pink-200 rounded-md">
                                <p className="text-sm text-pink-800 font-medium">Auto-loading enabled</p>
                                <p className="text-xs text-pink-600">Statistics load automatically when filters
                                    change</p>
                            </div>
                        </div>
                    </div>
                    {error && <ErrorMessage message="Error loading statistics" onClose={() => {
                    }}/>}
                </CardContent>
            </Card>

            {isLoading && <LoadingSpinner message="Loading patient statistics..."/>}

            {stats && !isLoading && (
                <>
                    {/* Total Patients */}
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                        <CardContent className="py-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-600 mb-2">Total Patients Registered</p>
                                <p className="text-5xl font-bold text-blue-600">{stats.totalPatients}</p>
                                <p className="text-sm text-gray-500 mt-2">
                                    {startDate && endDate ? "In selected period" : "All time"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Gender Distribution */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Gender Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(stats.patientsByGender).map(([gender, count]) => (
                                    <div
                                        key={gender}
                                        className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200 text-center"
                                    >
                                        <div className="mb-3 flex justify-center">
                                            {gender === "MALE" ? <Mars className="w-8 h-8 text-blue-700"/> : <Venus className="w-8 h-8 text-pink-700"/>}
                                        </div>
                                        <p className="text-sm font-medium text-gray-700 mb-2">{gender}</p>
                                        <p className="text-4xl font-bold text-blue-600">{count}</p>
                                        <p className="text-xs text-gray-500 mt-2">
                                            {((count / stats.totalPatients) * 100).toFixed(1)}% of total
                                        </p>
                                        {/* Progress Bar */}
                                        <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                            <div
                                                className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                                                style={{width: `${(count / stats.totalPatients) * 100}%`}}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Age Groups */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Age Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                                {Object.entries(stats.patientsByAgeGroup).map(([ageGroup, count]) => (
                                    <div
                                        key={ageGroup}
                                        className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 text-center"
                                    >
                                        <p className="text-xs font-medium text-gray-600 mb-1">{ageGroup} years</p>
                                        <p className="text-3xl font-bold text-purple-600">{count}</p>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {((count / stats.totalPatients) * 100).toFixed(0)}%
                                        </p>
                                    </div>
                                ))}
                            </div>

                            {/* Age Distribution Chart (Visual) */}
                            <div className="mt-6 space-y-2">
                                {Object.entries(stats.patientsByAgeGroup).map(([ageGroup, count]) => (
                                    <div key={ageGroup}>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="font-medium text-gray-700">{ageGroup}</span>
                                            <span className="text-gray-600">{count} patients</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div
                                                className="bg-gradient-to-r from-purple-400 to-pink-500 h-3 rounded-full transition-all duration-500"
                                                style={{width: `${(count / stats.totalPatients) * 100}%`}}
                                            ></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* VAS Statistics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pain Assessment (VAS) Statistics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Total VAS Records */}
                                <div className="p-6 bg-blue-50 rounded-lg border-2 border-blue-200 text-center">
                                    <div className="mb-2 flex justify-center"><BarChart3 className="w-7 h-7 text-blue-600"/></div>
                                    <p className="text-sm text-gray-600 mb-1">Total VAS Records</p>
                                    <p className="text-4xl font-bold text-blue-600">{stats.totalVasRecords}</p>
                                </div>

                                {/* Critical VAS */}
                                <div className="p-6 bg-red-50 rounded-lg border-2 border-red-200 text-center">
                                    <div className="mb-2 flex justify-center"><AlertTriangle className="w-7 h-7 text-red-600"/></div>
                                    <p className="text-sm text-gray-600 mb-1">Critical VAS (≥7)</p>
                                    <p className="text-4xl font-bold text-red-600">{stats.criticalVasRecords}</p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {((stats.criticalVasRecords / stats.totalVasRecords) * 100).toFixed(1)}% of
                                        total
                                    </p>
                                </div>

                                {/* Average VAS Level */}
                                <div
                                    className={`p-6 rounded-lg border-2 text-center ${getVasLevelBg(stats.averageVasLevel)}`}>
                                    <div className="mb-2 flex justify-center"><TrendingUp className="w-7 h-7 text-purple-600"/></div>
                                    <p className="text-sm text-gray-600 mb-1">Average VAS Level</p>
                                    <p className={`text-4xl font-bold ${getVasLevelColor(stats.averageVasLevel)}`}>
                                        {stats.averageVasLevel.toFixed(1)}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-2">
                                        {stats.averageVasLevel >= 7 ? "High Pain" : stats.averageVasLevel >= 4 ? "Moderate Pain" : "Low Pain"}
                                    </p>
                                </div>
                            </div>

                            {/* VAS Distribution */}
                            <div className="mt-6">
                                <h4 className="text-sm font-medium text-gray-700 mb-3">Pain Level Distribution</h4>
                                <div className="space-y-2">
                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="font-medium text-green-700">Low Pain (0-3)</span>
                                            <span className="text-gray-600">
                                                {stats.totalVasRecords - stats.criticalVasRecords - Math.floor(stats.totalVasRecords * 0.3)} records
                                            </span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div className="bg-green-500 h-3 rounded-full" style={{width: "30%"}}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="font-medium text-yellow-700">Moderate Pain (4-6)</span>
                                            <span
                                                className="text-gray-600">{Math.floor(stats.totalVasRecords * 0.3)} records</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div className="bg-yellow-500 h-3 rounded-full"
                                                 style={{width: "53%"}}></div>
                                        </div>
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between text-sm mb-1">
                                            <span className="font-medium text-red-700">High Pain (7-10)</span>
                                            <span className="text-gray-600">{stats.criticalVasRecords} records</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-3">
                                            <div className="bg-red-500 h-3 rounded-full"
                                                 style={{width: `${(stats.criticalVasRecords / stats.totalVasRecords) * 100}%`}}></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Clinical Insights */}
                    <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                        <CardHeader>
                            <CardTitle>Clinical Insights</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {stats.averageVasLevel >= 6 && (
                                    <div
                                        className="flex items-start space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                                        <AlertTriangle className="w-5 h-5 text-red-700 mt-0.5"/>
                                        <div>
                                            <p className="text-sm font-medium text-red-800">High Average Pain Level</p>
                                            <p className="text-xs text-red-600">Average VAS level
                                                is {stats.averageVasLevel.toFixed(1)}. Review pain management
                                                protocols.</p>
                                        </div>
                                    </div>
                                )}

                                {((stats.criticalVasRecords / stats.totalVasRecords) * 100) > 20 && (
                                    <div
                                        className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                                        <AlertTriangle className="w-5 h-5 text-orange-700 mt-0.5"/>
                                        <div>
                                            <p className="text-sm font-medium text-orange-800">High Critical VAS
                                                Rate</p>
                                            <p className="text-xs text-orange-600">
                                                {((stats.criticalVasRecords / stats.totalVasRecords) * 100).toFixed(1)}%
                                                of VAS records are critical (≥7).
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {stats.totalPatients > 100 && (
                                    <div
                                        className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                        <CheckCircle2 className="w-5 h-5 text-green-700 mt-0.5"/>
                                        <div>
                                            <p className="text-sm font-medium text-green-800">Good Patient Coverage</p>
                                            <p className="text-xs text-green-600">System
                                                has {stats.totalPatients} registered patients.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Empty State */}
            {!stats && !isLoading && (
                <Card>
                    <CardContent className="py-12 text-center">
                        <div className="mb-4 flex justify-center"><Hospital className="w-12 h-12 text-gray-500"/></div>
                        <p className="text-gray-600 mb-4">No patient statistics loaded yet</p>
                        <p className="text-sm text-gray-500">Statistics will load automatically</p>
                    </CardContent>
                </Card>
            )}
        <PageNavigation />

        </div>
    );
};

export default PatientStatistics;
