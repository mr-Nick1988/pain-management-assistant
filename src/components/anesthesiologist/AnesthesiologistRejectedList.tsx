import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetAllRejectedRecommendationsQuery } from "../../api/api/apiAnesthesiologistSlice";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    LoadingSpinner,
    PageNavigation,
} from "../ui";
import type { RecommendationWithVas } from "../../types/common/types";

const AnesthesiologistRejectedList: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { state } = location as { state?: { rejectedList?: RecommendationWithVas[] } };
    const { data: rejectedFromHook, isLoading, error } = useGetAllRejectedRecommendationsQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    const rejectedList: RecommendationWithVas[] = state?.rejectedList || rejectedFromHook || [];

    // ======= ЗАГРУЗКА =======
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

    // ======= ОШИБКА =======
    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-red-500 mb-4">Error loading rejected recommendations</p>
                        <Button variant="update" onClick={() => navigate("/anesthesiologist")}>
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ======= ПУСТО =======
    if (!rejectedList || rejectedList.length === 0) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-gray-600 mb-4">No rejected recommendations</p>
                        <Button variant="update" onClick={() => navigate("/anesthesiologist")}>
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ======= РЕНДЕР =======
    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Rejected Recommendations</h1>
                    <p className="text-gray-600 mt-1">
                        {rejectedList.length} case(s) pending replacement
                    </p>
                </div>
                <Button variant="outline" onClick={() => navigate("/anesthesiologist")}>
                    Back to Dashboard
                </Button>
            </div>

            {/* Список */}
            <div className="space-y-4">
                {rejectedList.map((item, index) => {
                    const { recommendation, vas, patientMrn } = item;

                    const mrnToUse =
                        patientMrn ||
                        recommendation?.patientMrn ||
                        vas?.patientMrn ||
                        "unknown";

                    const enrichedState = { ...item, patientMrn: mrnToUse };

                    return (
                        <Card
                            key={index}
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() =>
                                navigate(
                                    `/anesthesiologist/recommendation/details/${mrnToUse}`,
                                    { state: enrichedState }
                                )
                            }
                        >
                            <CardHeader>
                                <CardTitle>Patient MRN: {mrnToUse}</CardTitle>
                            </CardHeader>

                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2 flex-1">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                                            <div>
                                                <p className="text-gray-500">Status</p>
                                                <p className="font-semibold text-red-600">
                                                    {recommendation.status}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-gray-500">Regimen Hierarchy</p>
                                                <p className="font-semibold">
                                                    {recommendation.regimenHierarchy}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-gray-500">Pain Level (VAS)</p>
                                                <p className="font-semibold text-red-600">
                                                    {vas?.painLevel ?? "N/A"}/10
                                                </p>
                                            </div>

                                            <div className="md:col-span-3">
                                                <p className="text-gray-500">Rejected Reason</p>
                                                <p className="font-semibold">
                                                    {recommendation.rejectedReason || "—"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <Button
                                        variant="default"
                                        size="sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            navigate(
                                                `/anesthesiologist/recommendation/details/${mrnToUse}`,
                                                { state: enrichedState }
                                            );
                                        }}
                                    >
                                        View
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

export default AnesthesiologistRejectedList;