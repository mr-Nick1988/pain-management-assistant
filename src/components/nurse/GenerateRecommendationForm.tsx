import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    useUpdateVasMutation,
    useCreateRecommendationMutation,
    useDeleteVasMutation
} from "../../api/api/apiNurseSlice";
import type { Patient, VAS } from "../../types/nurse";

const GenerateRecommendationForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { patient?: Patient; vasData?: VAS };
    const { patient, vasData } = state || {};

    // 🧩 Защита от прямого захода
    if (!patient?.mrn || !vasData) {
        return (
            <div className="p-6">
                <p>No patient data. Please navigate from the dashboard.</p>
                <button
                    onClick={() => navigate("/nurse")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    // 📋 Локальное состояние
    const [formData, setFormData] = useState<VAS>({
        painPlace: vasData.painPlace || "",
        painLevel: vasData.painLevel || 0,
    });

    const [updateVAS, { isLoading: isUpdating }] = useUpdateVasMutation();
    const [createRecommendation, { isLoading: isCreating }] = useCreateRecommendationMutation();
    const [deleteVAS, { isLoading: isDeleting }] = useDeleteVasMutation();

    // 🖊 Обработка изменений
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "painLevel" ? Number(value) : value,
        }));
    };

    // 🔄 Обновление VAS
    const handleUpdateVAS = async () => {
        if (formData.painLevel < 0 || formData.painLevel > 10) {
            alert("Pain level must be between 0 and 10");
            return;
        }
        try {
            await updateVAS({ mrn: patient.mrn!, data: formData }).unwrap();
            alert("VAS updated successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to update VAS");
        }
    };

    // 💊 Генерация рекомендации (теперь без тела запроса!)
    const handleCreateRecommendation = async () => {
        try {
            await createRecommendation({ mrn: patient.mrn! }).unwrap();
            alert("Recommendation generated successfully!");
            navigate(`/nurse/recommendation-details/${patient.mrn}`);
        } catch (error) {
            console.error("Failed to create recommendation:", error);
            alert("Failed to generate recommendation");
        }
    };

    // 🗑 Удаление VAS
    const handleDeleteVAS = async () => {
        if (!window.confirm("Are you sure you want to delete this VAS record?")) return;
        try {
            await deleteVAS(patient.mrn!).unwrap();
            alert("VAS deleted successfully!");
            navigate(`/nurse/patient/${patient.mrn}`);
        } catch (error) {
            console.error(error);
            alert("Failed to delete VAS");
        }
    };

    const isUpdateDisabled = formData.painLevel < 0 || formData.painLevel > 10;

    return (
        <div className="p-6 max-w-md mx-auto bg-white shadow rounded space-y-6">
            <h1 className="text-2xl font-bold mb-4 text-center">Generate Recommendation</h1>

            {/* 🔹 Кнопка генерации рекомендации */}
            <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                onClick={handleCreateRecommendation}
                disabled={isCreating}
            >
                {isCreating ? "Generating..." : "Generate Recommendation"}
            </button>

            {/* 🔸 Блок редактирования VAS */}
            <div className="p-4 border rounded space-y-3 bg-gray-50">
                <h2 className="text-lg font-semibold">Update Pain Data (VAS)</h2>

                <div>
                    <label className="block font-medium mb-1">Pain Place (optional)</label>
                    <input
                        type="text"
                        name="painPlace"
                        value={formData.painPlace}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        placeholder="Enter pain location"
                    />
                </div>

                <div>
                    <label className="block font-medium mb-1">Pain Level (0–10)</label>
                    <input
                        type="number"
                        name="painLevel"
                        min={0}
                        max={10}
                        value={formData.painLevel}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                        placeholder="Enter pain level"
                    />
                </div>

                <button
                    className={`bg-yellow-500 text-white px-4 py-2 rounded w-full hover:bg-yellow-600 ${
                        isUpdateDisabled ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={handleUpdateVAS}
                    disabled={isUpdateDisabled || isUpdating}
                >
                    {isUpdating ? "Updating..." : "Update VAS"}
                </button>
            </div>

            {/* 🔻 Кнопка удаления */}
            <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
                onClick={handleDeleteVAS}
                disabled={isDeleting}
            >
                {isDeleting ? "Deleting..." : "Delete VAS"}
            </button>
        </div>
    );
};

export default GenerateRecommendationForm;