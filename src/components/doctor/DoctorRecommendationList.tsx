import React from "react";
import {useNavigate} from "react-router-dom";
import {useGetAllPendingRecommendationsQuery} from "../../api/api/apiDoctorSlice";
import {Button, Card, CardContent, CardHeader, CardTitle, LoadingSpinner, PageNavigation} from "../ui";

const RecommendationList: React.FC = () => {
    const navigate = useNavigate();
    const {data: recommendations, isLoading, error} = useGetAllPendingRecommendationsQuery();

    if (isLoading) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <LoadingSpinner />
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-red-500 mb-4">Error loading recommendations</p>
                        <Button variant="update" onClick={() => navigate("/doctor")}>
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!recommendations || recommendations.length === 0) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-gray-600 mb-4">No pending recommendations</p>
                        <Button variant="update" onClick={() => navigate("/doctor")}>
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Pending Recommendations</h1>
                    <p className="text-gray-600 mt-1">{recommendations.length} recommendation(s) awaiting review</p>
                </div>
                <Button variant="outline" onClick={() => navigate("/doctor")}>
                    Back to Dashboard
                </Button>
            </div>

            <div className="space-y-4">
                {recommendations.map((recWithVas, index) => {
                    const patientMrn = recWithVas.patientMrn || recWithVas.recommendation?.patientMrn || recWithVas.vas?.patientMrn;
                    return (
                    <Card
                        key={index}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigate(`/doctor/recommendations/recommendation/${patientMrn}`, {state: recWithVas})}
                    >
                        <CardHeader>
                            <CardTitle>{patientMrn}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="space-y-2 flex-1">
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                        <div>
                                            <p className="text-gray-500">Status</p>
                                            <p className="font-semibold">{recWithVas.recommendation.status}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Regimen Hierarchy</p>
                                            <p className="font-semibold">{recWithVas.recommendation.regimenHierarchy}</p>
                                        </div>
                                        <div>
                                            <p className="text-gray-500">Pain Level</p>
                                            <p className="font-semibold text-red-600">{recWithVas.vas.painLevel}/10</p>
                                        </div>
                                        <div className="md:col-span-3">
                                            <p className="text-gray-500">Pain Location</p>
                                            <p className="font-semibold">{recWithVas.vas.painPlace}</p>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    variant="default"
                                    size="sm"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/doctor/recommendations/recommendation/${patientMrn}`, {state: recWithVas});
                                    }}
                                >
                                    Review
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    );
                })}
            </div>
            <PageNavigation />
        </div>
    );
};

export default RecommendationList;
