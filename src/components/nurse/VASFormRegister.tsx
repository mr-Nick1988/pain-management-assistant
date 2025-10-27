import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCreateVasMutation } from "../../api/api/apiNurseSlice";
import type { Patient, VAS } from "../../types/nurse";
import { FormCard, FormFieldWrapper, Input, PageNavigation } from "../ui";
import { useToast } from "../../contexts/ToastContext";

const VASFormRegister: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const patient = location.state as Patient;
    const toast = useToast();

    const [formData, setFormData] = useState<VAS>({
        painPlace: "",
        painLevel: 0,
    });
    const [createVAS, { isLoading }] = useCreateVasMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "painLevel" ? Number(value) : value,
        }));
    };

    const handleNext = async () => {
        if (!formData.painPlace || formData.painLevel < 0 || formData.painLevel > 10) {
            toast.warning("Please fill all fields correctly.");
            return;
        }

        try {
            await createVAS({ mrn: patient.mrn!, data: formData }).unwrap();
            toast.success("VAS created successfully!");
            navigate(`/nurse/recommendation/${patient.mrn}`, { state: { patient, vasData: formData } });
        } catch (error) {
            console.error("Failed to create VAS:", error);
            toast.error("Error creating VAS");
        }
    };

    return (
        <div className="p-6">
            <FormCard
                title="Register Pain Complaint (VAS)"
                onSubmit={(e) => { e.preventDefault(); void handleNext(); }}
                onCancel={() => navigate(-1)}
                isLoading={isLoading}
            >
                <FormFieldWrapper label="Pain Location">
                    <Input type="text" name="painPlace" value={formData.painPlace} onChange={handleChange} placeholder="Enter pain location" />
                </FormFieldWrapper>
                <FormFieldWrapper
                    label={
                        <span>
                            Pain Level: <span className={`font-bold text-xl ${
                                formData.painLevel <= 3 ? "text-green-600" :
                                formData.painLevel <= 6 ? "text-yellow-600" :
                                "text-red-600"
                            }`}>{formData.painLevel}</span>
                        </span>
                    }
                    hint="Slide to select pain level"
                >
                    <input
                        type="range"
                        name="painLevel"
                        min="0"
                        max="10"
                        value={formData.painLevel}
                        onChange={handleChange}
                        className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                    />
                    <div className="flex justify-between text-sm text-gray-600 mt-2">
                        <span>0 (No Pain)</span>
                        <span>5 (Moderate)</span>
                        <span>10 (Worst Pain)</span>
                    </div>
                </FormFieldWrapper>
            </FormCard>
            <PageNavigation />
        </div>
    );
};

export default VASFormRegister;