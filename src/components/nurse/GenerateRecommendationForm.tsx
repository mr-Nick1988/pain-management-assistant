import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    useUpdateVasMutation,
    useCreateRecommendationMutation,
    useDeleteVasMutation
} from "../../api/api/apiNurseSlice";
import type { Patient, VAS } from "../../types/nurse";
import { DataCard, FormFieldWrapper, Button, Input, PageNavigation } from "../ui";
import { useToast } from "../../contexts/ToastContext";

const GenerateRecommendationForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const state = location.state as { patient?: Patient; vasData?: VAS };
    const toast = useToast();
    
    const { patient, vasData } = state || {};

    // All hooks must be called before any conditional returns
    const [formData, setFormData] = useState<VAS>({
        painPlace: vasData?.painPlace || "",
        painLevel: vasData?.painLevel || 0,
    });
    const [updateVAS, { isLoading: isUpdating }] = useUpdateVasMutation();
    const [createRecommendation, { isLoading: isCreating }] = useCreateRecommendationMutation();
    const [deleteVAS, { isLoading: isDeleting }] = useDeleteVasMutation();

    if (!patient?.mrn || !vasData) {
        return <div className="p-6"><p className="text-center text-gray-500">No patient data</p></div>;
    }

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
            toast.warning("Pain level must be between 0 and 10");
            return;
        }
        try {
            await updateVAS({ mrn: patient.mrn!, data: formData }).unwrap();
            toast.success("VAS updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update VAS");
        }
    };

    // 💊 Генерация рекомендации (теперь без тела запроса!)
    const handleCreateRecommendation = async () => {
        try {
            await createRecommendation({ mrn: patient.mrn! }).unwrap();
            toast.success("Recommendation generated successfully!");
            navigate(`/nurse/recommendation-details/${patient.mrn}`);
        } catch (error) {
            console.error("Failed to create recommendation:", error);
            toast.error("Failed to generate recommendation");
        }
    };

    // 🗑 Удаление VAS
    const handleDeleteVAS = async () => {
        if (!window.confirm("Are you sure you want to delete this VAS record?")) return;
        try {
            await deleteVAS(patient.mrn!).unwrap();
            toast.success("VAS deleted successfully!");
            navigate(`/nurse/patient/${patient.mrn}`);
        } catch (error) {
            console.error(error);
            toast.error("Failed to delete VAS");
        }
    };

    const isUpdateDisabled = formData.painLevel < 0 || formData.painLevel > 10;

    return (
        <div className="p-6 space-y-6">
            <DataCard title="Generate Recommendation">
                <Button variant="approve" onClick={handleCreateRecommendation} disabled={isCreating}>
                    {isCreating ? "Generating..." : "Generate Recommendation"}
                </Button>
            </DataCard>

            <DataCard title="Update Pain Data (VAS)">
                <div className="space-y-6">
                    <FormFieldWrapper label="Pain Location">
                        <Input type="text" name="painPlace" value={formData.painPlace} onChange={handleChange} placeholder="Enter pain location" />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Pain Level (0-10)">
                        <Input type="number" name="painLevel" min={0} max={10} value={formData.painLevel} onChange={handleChange} placeholder="Enter pain level" />
                    </FormFieldWrapper>
                    <Button variant="update" onClick={handleUpdateVAS} disabled={isUpdateDisabled || isUpdating}>
                        {isUpdating ? "Updating..." : "Update VAS"}
                    </Button>
                </div>
            </DataCard>

            <DataCard title="Danger Zone">
                <Button variant="delete" onClick={handleDeleteVAS} disabled={isDeleting}>
                    {isDeleting ? "Deleting..." : "Delete VAS Record"}
                </Button>
            </DataCard>
            <PageNavigation />
        </div>
    );
};

export default GenerateRecommendationForm;