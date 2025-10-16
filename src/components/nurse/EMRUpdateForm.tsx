import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUpdateEmrMutation } from "../../api/api/apiNurseSlice";
import type { EMR, EMRUpdate, Patient } from "../../types/nurse";
import { validateEmr } from "../../utils/validationEmr.ts";
import { FormCard, FormGrid, FormFieldWrapper, Input, PageNavigation } from "../ui";
import {useToast} from "../../contexts/ToastContext";

const EMRUpdateForm: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as { patient: Patient; emrData: EMR } | undefined;
    
    const [updateEmr, { isLoading }] = useUpdateEmrMutation();
    const toast = useToast();
    const [form, setForm] = useState<EMRUpdate>({
        height: state?.emrData?.height || 0,
        weight: state?.emrData?.weight || 0,
        gfr: state?.emrData?.gfr || "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    if (!state || !state.patient || !state.patient?.mrn) {
        return <div className="p-6"><p className="text-center text-gray-500">No EMR data</p></div>;
    }

    const { patient } = state;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: ["height", "weight", "plt", "wbc", "sat", "sodium"].includes(name)
                ? Number(value)
                : value,
        }));
    };

    const handleSensitivitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const arr = e.target.value
            .split(",")
            .map(s => s.trim())
            .filter(Boolean);
        setForm(prev => ({ ...prev, sensitivities: arr }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validateEmr(form as EMR);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        try {
            await updateEmr({ mrn: patient.mrn!, data: form }).unwrap();
            toast.success("EMR updated successfully!");
            navigate(-1);
        } catch (error: unknown) {
            console.error("Failed to update EMR:", error);
            toast.error("Error updating EMR");
        }
    };

    return (
        <div className="p-6">
            <FormCard
                title={`Update EMR for ${patient.firstName} ${patient.lastName}`}
                onSubmit={handleSubmit}
                onCancel={() => navigate(-1)}
                submitText="Save Changes"
                isLoading={isLoading}
            >
                <FormGrid columns={2}>
                    <FormFieldWrapper label="Height (cm)" error={errors.height}>
                        <Input type="number" name="height" value={form.height || ""} onChange={handleChange} />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Weight (kg)" error={errors.weight}>
                        <Input type="number" name="weight" value={form.weight || ""} onChange={handleChange} />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="GFR" hint="Enter A–E or 0–120" error={errors.gfr}>
                        <Input type="text" name="gfr" value={form.gfr || ""} onChange={handleChange} />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Child-Pugh Score" hint="Enter A, B or C" error={errors.childPughScore}>
                        <Input type="text" name="childPughScore" value={form.childPughScore || ""} onChange={handleChange} />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="PLT" error={errors.plt}>
                        <Input type="number" name="plt" value={form.plt || ""} onChange={handleChange} />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="WBC" error={errors.wbc}>
                        <Input type="number" name="wbc" value={form.wbc || ""} onChange={handleChange} />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="SAT (%)" error={errors.sat}>
                        <Input type="number" name="sat" value={form.sat || ""} onChange={handleChange} />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Sodium (mmol/L)" error={errors.sodium}>
                        <Input type="number" name="sodium" value={form.sodium || ""} onChange={handleChange} />
                    </FormFieldWrapper>
                </FormGrid>
                <FormFieldWrapper label="Sensitivities" hint="Optional: list allergies separated by commas">
                    <Input type="text" name="sensitivities" placeholder="e.g. PARACETAMOL, IBUPROFEN" value={form.sensitivities?.join(", ") || ""} onChange={handleSensitivitiesChange} />
                </FormFieldWrapper>
            </FormCard>
            <PageNavigation />
        </div>
    );
};

export default EMRUpdateForm;