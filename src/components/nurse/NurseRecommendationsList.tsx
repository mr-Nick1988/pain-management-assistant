import React from "react";
import { useNavigate } from "react-router-dom";
import { useGetAllApprovedRecommendationsQuery } from "../../api/api/apiNurseSlice";
import { PageHeader, DataCard, Button, LoadingSpinner } from "../ui";
import type { Recommendation } from "../../types/nurse";

const NurseRecommendationsList: React.FC = () => {
  const navigate = useNavigate();

  // 🩺 Запрос на сервер
  const { data: recommendations, isLoading, isError } = useGetAllApprovedRecommendationsQuery();

  // 🌀 Состояние загрузки
  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner message="Loading approved recommendations..." />
        </div>
    );
  }

  // ⚠️ Ошибка при загрузке
  if (isError) {
    return (
        <div className="p-6">
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <p className="text-red-700 font-medium">
              Failed to load approved recommendations. Please try again later.
            </p>
            <div className="mt-4">
              <Button variant="default" onClick={() => navigate("/nurse")}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
    );
  }

  // 🧠 Основной контент
  return (
      <div className="p-6 space-y-6">
        <PageHeader
            title="Approved Recommendations"
            description="List of all recommendations that were finally approved by medical staff"
        />

        {/* 🔙 Кнопка возврата */}
        <div className="flex justify-start mb-4">
          <Button variant="default" onClick={() => navigate("/nurse")}>
            Back to Dashboard
          </Button>
        </div>

        {/* 📋 Если нет данных */}
        {(!recommendations || recommendations.length === 0) ? (
            <p className="text-center text-gray-500 italic">
              No approved recommendations found.
            </p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recommendations.map((r: Recommendation, index: number) => (
                  <DataCard
                      key={index}
                      title={`MRN: ${r.patientMrn || "N/A"}`}
                      className="hover:shadow-lg transition-shadow cursor-pointer"
                      // @ts-ignore
                      onClick={() => navigate(`/nurse/patient/${r.patientMrn}`)}
                  >
                    <p className="text-sm text-gray-700"><strong>Drug(s):</strong> {r.drugs?.map(d => d.activeMoiety).join(", ") || "N/A"}</p>
                    <p className="text-sm text-gray-700"><strong>Created:</strong> {new Date(r.createdAt || "").toLocaleDateString()}</p>
                    <p className="text-sm text-green-600 font-semibold mt-1">✅ Approved</p>
                  </DataCard>
              ))}
            </div>
        )}
      </div>
  );
};

export default NurseRecommendationsList;