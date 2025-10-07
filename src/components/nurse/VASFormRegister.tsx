import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCreateVasMutation } from "../../api/api/apiNurseSlice";
import type { Patient, VAS } from "../../types/nurse";
import { FormCard, FormFieldWrapper, Input } from "../ui";

const VASFormRegister: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const patient = location.state as Patient;


    const [formData, setFormData] = useState<VAS>({
        painPlace: "",
        painLevel: 0,
    });
    const [createVAS, { isLoading }] = useCreateVasMutation();

    if (!patient?.mrn) {
        return <div className="p-6"><p className="text-center text-gray-500">No patient data</p></div>;
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "painLevel" ? Number(value) : value,
        }));
    };

    const handleNext = async () => {
        if (!formData.painPlace || formData.painLevel < 0 || formData.painLevel > 10) {
            alert("Please fill all fields correctly.");
            return;
        }

        try {
            await createVAS({ mrn: patient.mrn!, data: formData }).unwrap();
            navigate(`/nurse/recommendation/${patient.mrn}`, { state: { patient, vasData: formData } });
        } catch (error) {
            console.error("Failed to create VAS:", error);
            alert("Ошибка при создании VAS");
        }
    };

    return (
        <div className="p-6">
            <FormCard
                title="Register Pain Complaint (VAS)"
                onSubmit={(e) => { e.preventDefault(); void handleNext(); }}
                onCancel={() => navigate(-1)}
                submitText="Next: Generate Recommendation"
                isLoading={isLoading}
            >
                <FormFieldWrapper label="Pain Location">
                    <Input type="text" name="painPlace" value={formData.painPlace} onChange={handleChange} placeholder="Enter pain location" />
                </FormFieldWrapper>
                <FormFieldWrapper label="Pain Level (0-10)" hint="0 = No pain, 10 = Worst pain imaginable">
                    <Input type="number" name="painLevel" min={0} max={10} value={formData.painLevel} onChange={handleChange} placeholder="Enter pain level" />
                </FormFieldWrapper>
            </FormCard>
        </div>
    );
};

export default VASFormRegister;