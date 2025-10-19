import React from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useGetRecommendationByPatientIdQuery, useGetPatientByMrnQuery } from "../../api/api/apiNurseSlice";
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

    // 1 Берём из state, если переход был из PatientDetails
    const cachedPatient = location.state?.patient || null;

    // 2 Если нет — грузим пациента по MRN (для F5 или прямого URL)
    const { data: fetchedPatient, isLoading: isPatientLoading } = useGetPatientByMrnQuery(mrn ?? "", {
        skip: !mrn || !!cachedPatient,
        refetchOnMountOrArgChange: true,
    });

    const patient = cachedPatient || fetchedPatient;

    // 3 Загружаем рекомендацию
    const {
        data: recommendation,
        isLoading,
        isError,
    } = useGetRecommendationByPatientIdQuery(mrn!, { skip: !mrn });

    if (isLoading || isPatientLoading)
        return (
            <div className="p-6">
                <LoadingSpinner message="Loading recommendation..." />
            </div>
        );

    if (isError || !recommendation)
        return (
            <div className="p-6">
                <p className="text-center text-red-600">No recommendation found</p>
                <div className="flex justify-center mt-4">
                    <Button variant="default" onClick={() => navigate("/nurse")}>
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        );

    const statusLabels: Record<string, string> = {
        PENDING: "Pending",
        APPROVED_BY_DOCTOR: "Approved by Doctor",
        REJECTED_BY_DOCTOR: "Rejected by Doctor",
        ESCALATED_TO_ANESTHESIOLOGIST: "Escalated to Anesthesiologist",
        APPROVED_BY_ANESTHESIOLOGIST: "Approved by Anesthesiologist",
        REJECTED_BY_ANESTHESIOLOGIST: "Rejected by Anesthesiologist",
        FINAL_APPROVED: "Final Approved",
        CANCELLED: "Cancelled",
    };

    return (
        <div className="p-6 space-y-6">
            <PageHeader title="Recommendation Details" />
            {recommendation.generationFailed && (
                <DataCard title=" No Automatic Recommendation Found">
                    {recommendation.rejectionReasonsSummary && recommendation.rejectionReasonsSummary.length > 0 ? (
                        <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
                            {recommendation.rejectionReasonsSummary.map((reason, index) => (
                                <li key={index}>{reason}</li>
                            ))}
                        </ul>
                    ) : (
                        <p className="italic text-gray-600">
                            The system could not generate a recommendation due to patient conditions or contraindications.
                        </p>
                    )}
                    <p className="mt-4 text-sm text-gray-500">
                        This recommendation requires doctor review and possible manual override.
                    </p>
                </DataCard>
            )}
            {/*  Recommendation Info */}
            <DataCard title="Recommendation Info">
                <InfoGrid columns={2}>
                    <InfoItem label="Patient MRN" value={mrn} />
                    <InfoItem label="Patient Name" value={`${patient?.firstName ?? "?"} ${patient?.lastName ?? ""}`} />
                    <InfoItem label="Status" value={statusLabels[recommendation.status] || "N/A"} />
                    <InfoItem label="Regimen Hierarchy" value={recommendation.regimenHierarchy || "N/A"} />
                    <InfoItem label="Created At" value={formatDate(recommendation.createdAt)} />
                    <InfoItem label="Updated At" value={formatDate(recommendation.updatedAt)} />
                    <InfoItem label="Created By" value={recommendation.createdBy || "N/A"} />

                    {recommendation.rejectedReason &&
                        recommendation.status &&
                        recommendation.status.toLowerCase().includes("rejected") && (
                            <InfoItem label="Rejected Reason" value={recommendation.rejectedReason} />
                        )}
                </InfoGrid>
            </DataCard>

            {/*  Comments */}
            <DataCard title="Comments">
                {recommendation.comments && recommendation.comments.length > 0 ? (
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {recommendation.comments.map((comment, index) => (
                            <li key={index}>
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

            {/* Drugs */}
            {recommendation.drugs && recommendation.drugs.length > 0 && (
                <DataCard title="Drug Recommendations">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendation.drugs.map((drug, i) => (
                            <div key={i} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
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

            {/*  Navigation */}
            <div className="flex justify-between mt-6">
                <Button variant="cancel" onClick={() => navigate("/nurse")}>
                    Back to Dashboard
                </Button>
                <Button
                    variant="default"
                    onClick={() => navigate(`/nurse/patient/${mrn}`, { state: patient ? { patient } : undefined })}
                >
                    Back to Patient
                </Button>
            </div>

            <PageNavigation />
        </div>
    );
};

export default RecommendationDetails;