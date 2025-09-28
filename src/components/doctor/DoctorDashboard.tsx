import {useLocation, useNavigate} from "react-router-dom";
import React, {useEffect, useState} from "react";
import {
    useApproveRecommendationMutation,
    useGetRecommendationsQuery,
    useRejectRecommendationMutation
} from "../../api/api/apiDoctorSlice.ts";
import {type Recommendation, RecommendationStatus} from "../../types/recommendation.ts";
import {PatientRecommendationForm} from "../../exports/exports.ts";
import { Button, Card, CardHeader, CardTitle } from "../ui";


const DoctorDashboard: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Состояние для модалов и селектов
    const [selectedRecommendation, setSelectedRecommendation] = useState<Recommendation | null>(null);

    // API хуки для рекомендаций
    const {data: recommendations, isLoading, error, refetch} = useGetRecommendationsQuery();

    // Мутации для рекомендаций
    const [approveRecommendation, {isLoading: isApproving}] = useApproveRecommendationMutation();
    const [rejectRecommendation, {isLoading: isRejecting}] = useRejectRecommendationMutation();

    //Обработчики навигации из SearchPatients
    useEffect(() => {
        if (location.state) {
            navigate(location.pathname, {replace: true, state: {}});
        }
    }, [location.state, location.pathname, navigate]);

    // Фильтрация рекомендаций по статусу
    const pendingRecommendations = recommendations?.filter((recommendation) => recommendation.status === "PENDING") || [];
    const approvedRecommendations = recommendations?.filter((recommendation) => recommendation.status === "APPROVED") || [];
    const rejectedRecommendations = recommendations?.filter((recommendation) => recommendation.status === "REJECTED") || [];

    // HANDLERS ДЛЯ РЕКОМЕНДАЦИЙ
    const handleRecommendationSelect = (recommendation: Recommendation) => {
        setSelectedRecommendation(recommendation);
    };

    const handleRecommendationClose = () => {
        setSelectedRecommendation(null);
    };

    const handleApprove = async (recommendationId: string) => {
        try {
            await approveRecommendation({
                recommendationId,
                status: RecommendationStatus.APPROVED,
                comment: "Approved by doctor"
            }).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to approve recommendation:', error);
        }
    };

    const handleReject = async (recommendationId: string) => {
        try {
            await rejectRecommendation({
                recommendationId,
                status: RecommendationStatus.REJECTED,
                comment: "Rejected by doctor"
            }).unwrap();
            refetch();
        } catch (error) {
            console.error('Failed to reject recommendation:', error);
        }
    };

    // LOADING & ERROR HANDLING
    if (isLoading) {
        return <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading doctor dashboard...</span>
        </div>;
    }

    if (error) {
        return <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            Error loading data: {JSON.stringify(error)}
        </div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* HEADER С КНОПКАМИ НАВИГАЦИИ */}
            <Card className="mb-6">
                <CardHeader>
                    <CardTitle>Doctor Dashboard</CardTitle>
                    <div className="flex gap-2">
                        <Button onClick={() => navigate("/doctor/patients-list")} variant="default">
                            My Patients
                        </Button>
                        <Button onClick={() => navigate("/doctor/search-patients")} variant="update">
                            Search Patients
                        </Button>
                        <Button onClick={() => navigate("/doctor/recommendations")} variant="submit">
                            Manage Recommendations
                        </Button>
                    </div>
                </CardHeader>
            </Card>

            {/* ОСНОВНОЙ КОНТЕНТ */}
            {selectedRecommendation ? (
                /* МОДАЛ ДЕТАЛЕЙ РЕКОМЕНДАЦИИ */
                <PatientRecommendationForm
                    recommendation={selectedRecommendation}
                    onClose={handleRecommendationClose}
                />
            ) : (
                <div className="space-y-6">
                    {/* СЕКЦИЯ РЕКОМЕНДАЦИЙ */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* PENDING RECOMMENDATIONS С КНОПКАМИ */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Pending Recommendations ({pendingRecommendations.length})</h3>
                            {pendingRecommendations.length > 0 ? (
                                <ul className="space-y-2">
                                    {pendingRecommendations.map((rec) => (
                                        <li
                                            key={rec.id}
                                            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="space-y-1">
                                                    <h3 className="font-medium">{rec.patient?.firstName} {rec.patient?.lastName}</h3>
                                                    <p className="text-sm text-gray-600">MRN: {rec.patient?.mrn}</p>
                                                    <p className="text-sm text-gray-600">DOB: {rec.patient?.dateOfBirth ? new Date(rec.patient.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                                    <p className="text-sm text-gray-600">Gender: {rec.patient?.gender}</p>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="approve"
                                                        onClick={() => handleApprove(rec.id)}
                                                        disabled={isApproving}
                                                    >
                                                        {isApproving ? "Approving..." : "Approve"}
                                                    </Button>
                                                    <Button
                                                        variant="reject"
                                                        onClick={() => handleReject(rec.id)}
                                                        disabled={isRejecting}
                                                    >
                                                        {isRejecting ? "Rejecting..." : "Reject"}
                                                    </Button>
                                                </div>
                                            </div>
                                            <div className="text-gray-600 text-sm mb-2">
                                                {rec.description.substring(0, 100)}
                                                {rec.description.length > 100 ? "..." : ""}
                                            </div>
                                            <div className="text-gray-500 text-xs">
                                                {new Date(rec.createdAt).toLocaleDateString()}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No pending recommendations</p>
                            )}
                        </div>

                        {/* APPROVED RECOMMENDATIONS */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Approved ({approvedRecommendations.length})</h3>
                            {approvedRecommendations.length > 0 ? (
                                <ul className="space-y-2">
                                    {approvedRecommendations.map((rec) => (
                                        <li
                                            key={rec.id}
                                            className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md"
                                            onClick={() => handleRecommendationSelect(rec)}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="space-y-1">
                                                    <h3 className="font-medium">{rec.patient?.firstName} {rec.patient?.lastName}</h3>
                                                    <p className="text-sm text-gray-600">MRN: {rec.patient?.mrn}</p>
                                                    <p className="text-sm text-gray-600">DOB: {rec.patient?.dateOfBirth ? new Date(rec.patient.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                                    <p className="text-sm text-gray-600">Gender: {rec.patient?.gender}</p>
                                                </div>
                                            </div>
                                            <div className="text-gray-600 text-sm mb-2">
                                                {rec.description.substring(0, 100)}
                                                {rec.description.length > 100 ? "..." : ""}
                                            </div>
                                            <div className="text-gray-500 text-xs">
                                                {new Date(rec.updatedAt).toLocaleDateString()}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No approved recommendations</p>
                            )}
                        </div>

                        {/* REJECTED RECOMMENDATIONS */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold">Rejected ({rejectedRecommendations.length})</h3>
                            {rejectedRecommendations.length > 0 ? (
                                <ul className="space-y-2">
                                    {rejectedRecommendations.map((rec) => (
                                        <li
                                            key={rec.id}
                                            className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-sm cursor-pointer hover:shadow-md"
                                            onClick={() => handleRecommendationSelect(rec)}
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="space-y-1">
                                                    <h3 className="font-medium">{rec.patient?.firstName} {rec.patient?.lastName}</h3>
                                                    <p className="text-sm text-gray-600">MRN: {rec.patient?.mrn}</p>
                                                    <p className="text-sm text-gray-600">DOB: {rec.patient?.dateOfBirth ? new Date(rec.patient.dateOfBirth).toLocaleDateString() : 'N/A'}</p>
                                                    <p className="text-sm text-gray-600">Gender: {rec.patient?.gender}</p>
                                                </div>
                                            </div>
                                            <div className="text-gray-600 text-sm mb-2">
                                                {rec.description.substring(0, 100)}
                                                {rec.description.length > 100 ? "..." : ""}
                                            </div>
                                            <div className="text-gray-500 text-xs">
                                                {new Date(rec.updatedAt).toLocaleDateString()}
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No rejected recommendations</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;

