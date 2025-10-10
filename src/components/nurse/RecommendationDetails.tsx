import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useGetRecommendationByPatientIdQuery } from "../../api/api/apiNurseSlice";

const RecommendationDetails: React.FC = () => {
    const navigate = useNavigate();
    const { mrn } = useParams<{ mrn: string }>();

    const { data: recommendation, isLoading, isError } =
        useGetRecommendationByPatientIdQuery(mrn!, { skip: !mrn });

    if (isLoading) {
        return <p className="p-6 text-gray-600">Loading recommendation...</p>;
    }

    if (isError || !recommendation) {
        return (
            <div className="p-6">
                <p className="text-red-600">No recommendation found for this patient.</p>
                <button
                    onClick={() => navigate("/nurse")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    return (
        <div className="p-6 max-w-2xl mx-auto bg-white rounded shadow space-y-6">
            <h1 className="text-2xl font-bold mb-2 text-center">Recommendation Details</h1>

            {/* 🧩 Основная информация */}
            <div className="space-y-2">
                <p><strong>Patient MRN:</strong> {mrn}</p>
                <p><strong>Status:</strong> {recommendation.status || "N/A"}</p>
                <p><strong>Regimen Hierarchy:</strong> {recommendation.regimenHierarchy}</p>
                <p><strong>Created At:</strong> {recommendation.createdAt || "N/A"}</p>
                <p><strong>Created By:</strong> {recommendation.createdBy || "N/A"}</p>
            </div>

            {/* 💬 Комментарии */}
            <div className="border-t pt-4">
                <h2 className="text-lg font-semibold mb-2 text-gray-700">Comments</h2>
                {recommendation.comments && recommendation.comments.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
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
            </div>

            {/* 💊 Список лекарств */}
            <div>
                <h2 className="text-lg font-semibold mb-2">Drug Recommendations</h2>
                {recommendation.drugs && recommendation.drugs.length > 0 ? (
                    recommendation.drugs.map((drug, index) => (
                        <div key={index} className="border rounded p-3 mb-3 bg-gray-50">
                            <p><strong>Drug Name:</strong> {drug.drugName}</p>
                            <p><strong>Active Moiety:</strong> {drug.activeMoiety}</p>
                            <p><strong>Dosing:</strong> {drug.dosing}</p>
                            <p><strong>Interval:</strong> {drug.interval}</p>
                            <p><strong>Route:</strong> {drug.route}</p>
                            <p><strong>Role:</strong> {drug.role}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 italic">No drug recommendations specified.</p>
                )}
            </div>

            {/* ⚠️ Противопоказания */}
            {recommendation.contraindications && recommendation.contraindications.length > 0 && (
                <div>
                    <h2 className="text-lg font-semibold mb-2 text-red-600">Contraindications</h2>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                        {recommendation.contraindications.map((c, i) => (
                            <li key={i}>{c}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* ⚙️ Навигация */}
            <div className="flex justify-between mt-6">
                <button
                    className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                    onClick={() => navigate("/nurse")}
                >
                    Back to Dashboard
                </button>

                <button
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    onClick={() => navigate(`/nurse/patient/${mrn}`, { state: { mrn } })}
                >
                    Back to Patient
                </button>
            </div>
        </div>
    );
};

export default RecommendationDetails;