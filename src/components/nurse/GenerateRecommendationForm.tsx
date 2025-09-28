import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import {
    useUpdateVasMutation,
    useCreateRecommendationMutation,
    useDeleteVasMutation
} from "../../api/api/apiNurseSlice";
import type { Patient, VAS, Recommendation } from "../../types/nurse";

const GenerateRecommendationForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams<{ personId: string }>();
    const state = location.state as { patient?: Patient; vasData?: VAS };

    const { patient, vasData } = state || {};

    // RTK Query хуки для работы с VAS и Recommendation
    const [updateVAS] = useUpdateVasMutation();
    const [createRecommendation] = useCreateRecommendationMutation();
    const [deleteVAS] = useDeleteVasMutation();

    // Локальное состояние для редактирования VAS
    const [formData, setFormData] = useState<VAS>({
        painPlace: vasData?.painPlace || "",
        painLevel: vasData?.painLevel || 0,
    });

    // Защита: прямой доступ через URL запрещён
    useEffect(() => {
        if (!patient || !vasData || patient.personId !== params.personId) {
            navigate(`/nurse/patient/${params.personId}`, { replace: true });
        }
    }, [patient, vasData, params.personId, navigate]);

    // Обработка изменения инпутов
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "painLevel" ? Number(value) : value,
        }));
    };

    // Обновление VAS через API
    const handleUpdateVAS = async () => {
        if (!patient) return;

        // Проверка корректности Pain Level
        if (formData.painLevel < 0 || formData.painLevel > 10) {
            alert("Pain level must be between 0 and 10");
            return;
        }

        try {
            await updateVAS({ personId: patient.personId, data: formData }).unwrap();
            alert("VAS updated successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to update VAS");
        }
    };

    // Создание рекомендации на основе VAS
    const handleCreateRecommendation = async () => {
        if (!patient) return;

        try {
            const recommendation: Recommendation = {
                status: "PENDING",
                regimenHierarchy: formData.painLevel, // пример, можно заменить на нужное поле
            };
            await createRecommendation({ personId: patient.personId, data: recommendation }).unwrap();
            alert("Recommendation created successfully!");
            navigate(`/nurse/patient/${patient.personId}`);
        } catch (error) {
            console.error(error);
            alert("Failed to create recommendation");
        }
    };

    // Удаление VAS через API
    const handleDeleteVAS = async () => {
        if (!patient) return;
        try {
            await deleteVAS(patient.personId).unwrap();
            alert("VAS deleted successfully!");
            navigate(`/nurse/patient/${patient.personId}`);
        } catch (error) {
            console.error(error);
            alert("Failed to delete VAS");
        }
    };

    // Валидация для кнопки Update: включена только если Pain Level заполнен и корректен
    const isUpdateDisabled = formData.painLevel < 0 || formData.painLevel > 10;

    return (
        <div className="p-6 max-w-md mx-auto bg-white shadow rounded space-y-6">

            <h1 className="text-2xl font-bold mb-4">Generate Recommendation</h1>

            {/* Создание Recommendation */}
            <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                onClick={handleCreateRecommendation}
            >
                Create Recommendation
            </button>

            {/* Блок для обновления VAS: inputs + кнопка */}
            <div className="p-4 border rounded space-y-3 bg-gray-50">
                <h2 className="text-lg font-semibold">Update VAS</h2>

                {/* Инпут для Pain Place (опционально) */}
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

                {/* Инпут для Pain Level (обязательно) */}
                <div>
                    <label className="block font-medium mb-1">Pain Level (0-10)</label>
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

                {/* Кнопка обновления VAS */}
                <button
                    className={`bg-yellow-500 text-white px-4 py-2 rounded w-full hover:bg-yellow-600 ${isUpdateDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={handleUpdateVAS}
                    disabled={isUpdateDisabled}
                >
                    Update VAS
                </button>
            </div>

            {/* Удаление VAS */}
            <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 w-full"
                onClick={handleDeleteVAS}
            >
                Delete VAS
            </button>
        </div>
    );
};

export default GenerateRecommendationForm;