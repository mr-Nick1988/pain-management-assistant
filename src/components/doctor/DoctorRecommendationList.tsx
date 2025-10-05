import React from "react";
import {useNavigate} from "react-router-dom";
import {useGetAllPendingRecommendationsQuery} from "../../api/api/apiDoctorSlice";

const RecommendationList: React.FC = () => {
    const navigate = useNavigate();
    const {data: recommendations, isLoading, error} = useGetAllPendingRecommendationsQuery();

    if (isLoading) return <p>Loading pending recommendations...</p>;
    if (error) return <p className="text-red-500">Error loading recommendations</p>;
    if (!recommendations || recommendations.length === 0) return <p>No pending recommendations</p>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Pending Recommendations</h1>
                <button
                    onClick={() => navigate("/doctor")}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Back to Dashboard
                </button>
            </div>

            <ul className="space-y-4">
                {recommendations.map((recWithVas, index) => (
                    <li
                        key={index}
                        className="p-4 border rounded hover:bg-gray-100 cursor-pointer"
                        onClick={() => navigate(`/doctor/recommendation/${recWithVas.patientMrn}`, {state: recWithVas})}
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="font-semibold">Patient MRN: {recWithVas.patientMrn}</p>
                                <p className="text-sm text-gray-600">Status: {recWithVas.recommendation.status}</p>
                                <p className="text-sm text-gray-600">Regimen Hierarchy: {recWithVas.recommendation.regimenHierarchy}</p>
                                <p className="text-sm text-gray-600">Pain Level: {recWithVas.vas.painLevel}/10</p>
                                <p className="text-sm text-gray-600">Pain Place: {recWithVas.vas.painPlace}</p>
                            </div>
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded text-sm">
                                PENDING
                            </span>
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RecommendationList;
