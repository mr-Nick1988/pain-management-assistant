import React, { useState } from "react";
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
    const params = useParams<{ personId: string }>(); // MRN из URL
    const state = location.state as { patient?: Patient; vasData?: VAS };
    const { patient, vasData } = state || {};

    // Простая защита от прямого захода
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

    const [formData, setFormData] = useState<VAS>({
        painPlace: vasData.painPlace || "",
        painLevel: vasData.painLevel || 0,
    });

    const [updateVAS] = useUpdateVasMutation();
    const [createRecommendation] = useCreateRecommendationMutation();
    const [deleteVAS] = useDeleteVasMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "painLevel" ? Number(value) : value,
        }));
    };

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

    const handleCreateRecommendation = async () => {
        try {
            const recommendation: Recommendation = {
                status: "PENDING",
                regimenHierarchy: formData.painLevel,
            };
            await createRecommendation({ mrn: patient.mrn!, data: recommendation }).unwrap();
            alert("Recommendation created successfully!");
            navigate(`/nurse/patient/${params.personId}`, { state: patient });
        } catch (error) {
            console.error(error);
            alert("Failed to create recommendation");
        }
    };

    const handleDeleteVAS = async () => {
        try {
            await deleteVAS(patient.mrn!).unwrap();
            alert("VAS deleted successfully!");
            navigate(`/nurse/patient/${params.personId}`, { state: patient });
        } catch (error) {
            console.error(error);
            alert("Failed to delete VAS");
        }
    };

    const isUpdateDisabled = formData.painLevel < 0 || formData.painLevel > 10;

    return (
        <div className="p-6 max-w-md mx-auto bg-white shadow rounded space-y-6">
            <h1 className="text-2xl font-bold mb-4">Generate Recommendation</h1>

            <button
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-full"
                onClick={handleCreateRecommendation}
            >
                Create Recommendation
            </button>

            <div className="p-4 border rounded space-y-3 bg-gray-50">
                <h2 className="text-lg font-semibold">Update VAS</h2>

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

                <button
                    className={`bg-yellow-500 text-white px-4 py-2 rounded w-full hover:bg-yellow-600 ${isUpdateDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
                    onClick={handleUpdateVAS}
                    disabled={isUpdateDisabled}
                >
                    Update VAS
                </button>
            </div>

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