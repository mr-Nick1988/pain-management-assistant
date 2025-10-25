import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import {
    useGetRecommendationByPatientIdQuery,
    useGetPatientByMrnQuery,
    useExecuteRecommendationMutation,
} from "../../api/api/apiNurseSlice";
import {
    PageHeader,
    DataCard,
    InfoGrid,
    InfoItem,
    LoadingSpinner,
    Button,
    PageNavigation,
} from "../ui";

const formatDate = (dateString?: string): string => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

const RecommendationDetails: React.FC = () => {
    const { mrn } = useParams<{ mrn: string }>();
    const navigate = useNavigate();
    const location = useLocation();

    const cachedPatient = location.state?.patient || null;

    const { data: fetchedPatient, isLoading: isPatientLoading } = useGetPatientByMrnQuery(mrn ?? "", {
        skip: !mrn || !!cachedPatient,
        refetchOnMountOrArgChange: true,
    });

    const patient = cachedPatient || fetchedPatient;

    const {
        data: recommendation,
        isLoading,
        isError,
    } = useGetRecommendationByPatientIdQuery(mrn ?? "", { skip: !mrn });

    // ✅ Хук для подтверждения выдачи лекарства
    const [executeRecommendation, { isLoading: isExecuting }] = useExecuteRecommendationMutation();

    // ✅ Обработчик клика "Administrate Medicine"
    const handleExecute = async () => {
        if (!mrn) return;
        try {
            await executeRecommendation({ mrn }).unwrap();
            alert("✅ Medication administration confirmed successfully.");
            navigate(`/nurse/patient/${mrn}`, { replace: true });
        } catch (err) {
            console.error("Execution error:", err);
            alert("❌ Failed to confirm medication administration. Please try again.");
        }
    };

    if (isLoading || isPatientLoading)
        return (
            <div className="p-6">
                <LoadingSpinner message="Loading recommendation..." />
            </div>
        );

    if (isError || !recommendation)
        return (
            <div className="p-6 text-center text-red-600">
                <p>No recommendation found.</p>
                <div className="flex justify-center mt-4">
                    <Button variant="default" onClick={() => navigate("/nurse")}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );

    return (
        <div className="p-6 space-y-6">
            <PageHeader title="Recommendation Details" />

            {/* === Основная информация === */}
            <DataCard title="Recommendation Info">
                <InfoGrid columns={2}>
                    <InfoItem label="Patient MRN" value={mrn} />
                    <InfoItem
                        label="Patient Name"
                        value={`${patient?.firstName ?? "?"} ${patient?.lastName ?? ""}`}
                    />
                    <InfoItem label="Status" value={recommendation.status} />
                    <InfoItem
                        label="Regimen Hierarchy"
                        value={recommendation.regimenHierarchy || "N/A"}
                    />
                    <InfoItem label="Created At" value={formatDate(recommendation.createdAt)} />
                    <InfoItem label="Updated At" value={formatDate(recommendation.updatedAt)} />
                    <InfoItem label="Created By" value={recommendation.createdBy || "N/A"} />

                    {recommendation.rejectedReason &&
                        recommendation.status === "REJECTED" && (
                            <InfoItem
                                label="Rejected Reason"
                                value={recommendation.rejectedReason}
                            />
                        )}
                </InfoGrid>
            </DataCard>

            {/* === Комментарии === */}
            <DataCard title="Comments">
                {recommendation.comments?.length ? (
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {recommendation.comments.map((comment, i) => (
                            <li key={i}>
                                {comment.trim().startsWith("[SYSTEM]") ? (
                                    <span className="text-blue-600 font-medium">
                                        {comment.replace("[SYSTEM]", "💡 System:")}
                                    </span>
                                ) : comment.trim().startsWith("[DOCTOR]") ? (
                                    <span className="text-green-600 font-medium">
                                        {comment.replace("[DOCTOR]", "👨‍⚕️ Doctor:")}
                                    </span>
                                ) : (
                                    comment
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="italic text-gray-500">No comments available.</p>
                )}
            </DataCard>
            {/* === System Rejection Reasons === */}
            {(recommendation.generationFailed || (recommendation.rejectionReasonsSummary?.length ?? 0) > 0) && (
                <DataCard title="System Rejection Reasons">
                    {recommendation.rejectionReasonsSummary?.length ? (
                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                            {recommendation.rejectionReasonsSummary.map((reason: string, i: number) => (
                                <li key={i} className="text-red-600 font-medium">
                                    ⚠️ {reason}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="italic text-gray-500">
                            No rejection reasons recorded.
                        </p>
                    )}
                </DataCard>
            )}
            {/* === Препараты === */}
            {(recommendation.drugs ?? []).length > 0 && (
                <DataCard title="Drug Recommendations">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendation.drugs?.map((drug, i) => (
                            <div
                                key={i}
                                className="border rounded-lg p-4 bg-gray-50 shadow-sm hover:shadow-md transition"
                            >
                                <InfoGrid columns={1}>
                                    <InfoItem label="Drug" value={drug.drugName} />
                                    <InfoItem label="Active Moiety" value={drug.activeMoiety} />
                                    <InfoItem label="Dosing" value={drug.dosing} />
                                    <InfoItem label="Interval" value={drug.interval} />
                                    <InfoItem label="Route" value={drug.route} />
                                    <InfoItem label="Role" value={drug.role} />
                                </InfoGrid>
                            </div>
                        ))}
                    </div>
                </DataCard>
            )}

            {/* === Кнопка выдачи лекарства (только если статус APPROVED) === */}
            {recommendation.status === "APPROVED" && (
                <div className="flex justify-center mt-6">
                    <Button
                        variant="approve"
                        onClick={handleExecute}
                        disabled={isExecuting}
                    >
                        {isExecuting ? "Processing..." : "💊 Administrate Medicine"}
                    </Button>
                </div>
            )}

            {/* === Навигация === */}
            <div className="flex justify-between mt-8">
                <Button variant="cancel" onClick={() => navigate("/nurse")}>
                    Back to Dashboard
                </Button>
                <Button
                    variant="default"
                    onClick={() =>
                        navigate(`/nurse/patient/${mrn}`, { state: patient ? { patient } : undefined })
                    }
                >
                    Back to Patient
                </Button>
            </div>

            <PageNavigation />
        </div>
    );
};

export default RecommendationDetails;