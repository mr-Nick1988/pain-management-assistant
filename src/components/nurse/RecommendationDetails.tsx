import React from "react";
import { useParams } from "react-router-dom";
import { useGetRecommendationByPatientIdQuery } from "../../api/api/apiNurseSlice";
import { PageHeader, DataCard, InfoGrid, InfoItem, LoadingSpinner } from "../ui";

const RecommendationDetails: React.FC = () => {
    const { mrn } = useParams<{ mrn: string }>();

    const { data: recommendation, isLoading, isError } = useGetRecommendationByPatientIdQuery(mrn!, {
        skip: !mrn,
    });

    if (isLoading) return <div className="p-6"><LoadingSpinner message="Loading recommendation..." /></div>;
    if (isError || !recommendation) return <div className="p-6"><p className="text-center text-red-600">No recommendation found</p></div>;

    return (
        <div className="p-6 space-y-6">
            <PageHeader title="Recommendation Details" />
            <DataCard title="Recommendation Info">
                <InfoGrid columns={2}>
                    <InfoItem label="Status" value={recommendation.status} />
                    <InfoItem label="Regimen" value={recommendation.regimenHierarchy} />
                    <InfoItem label="Created At" value={recommendation.createdAt || "N/A"} />
                    <InfoItem label="Created By" value={recommendation.createdBy || "N/A"} />
                </InfoGrid>
            </DataCard>
            {recommendation.drugs && recommendation.drugs.length > 0 && (
                <DataCard title="Drug Recommendations">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {recommendation.drugs.map((drug, i) => (
                            <div key={i} className="border rounded-lg p-4 bg-gray-50">
                                <InfoGrid columns={1}>
                                    <InfoItem label="Drug" value={drug.drugName} />
                                    <InfoItem label="Dosing" value={drug.dosing} />
                                    <InfoItem label="Route" value={drug.route} />
                                </InfoGrid>
                            </div>
                        ))}
                    </div>
                </DataCard>
            )}
            {recommendation.contraindications && recommendation.contraindications.length > 0 && (
                <DataCard title="Contraindications">
                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                        {recommendation.contraindications.map((c, i) => (<li key={i}>{c}</li>))}
                    </ul>
                </DataCard>
            )}
        </div>
    );
};

export default RecommendationDetails;
