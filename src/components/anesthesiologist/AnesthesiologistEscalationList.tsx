import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetAllEscalationsQuery } from "../../api/api/apiAnesthesiologistSlice";
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

const AnesthesiologistEscalationList: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // данные можно получить либо через state, либо хук заново вызовет запрос
    const { state } = location as { state?: { escalations?: RecommendationWithVas[] } };
    const { data: escalationsFromHook, isLoading, error } = useGetAllEscalationsQuery(undefined, {
        refetchOnMountOrArgChange: true,
    });

    // если state пуст, используем данные из RTK Query
    const escalations: RecommendationWithVas[] = state?.escalations || escalationsFromHook || [];

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
                        <p className="text-red-500 mb-4">Error loading escalations</p>
                        <Button variant="update" onClick={() => navigate("/anesthesiologist")}>
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ======= ПУСТО =======
    if (!escalations || escalations.length === 0) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-gray-600 mb-4">No escalated recommendations</p>
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
            {/* Заголовок */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Escalated Recommendations</h1>
                    <p className="text-gray-600 mt-1">
                        {escalations.length} case(s) requiring review
                    </p>
                </div>
                <Button variant="outline" onClick={() => navigate("/anesthesiologist")}>
                    Back to Dashboard
                </Button>
            </div>

            {/* Список */}
            <div className="space-y-4">
                {escalations.map((item, index) => {
                    const { recommendation, vas, patientMrn } = item;

                    //  MRN берём напрямую из верхнего уровня интерфейса
                    const mrnToUse = patientMrn || "unknown";

                    //  enrich state для следующего компонента
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
                                                <p className="font-semibold text-yellow-600">
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
                                                    {vas.painLevel}/10
                                                </p>
                                            </div>

                                            <div className="md:col-span-3">
                                                <p className="text-gray-500">Pain Location</p>
                                                <p className="font-semibold">{vas.painPlace}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Кнопка Review */}
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

export default AnesthesiologistEscalationList;