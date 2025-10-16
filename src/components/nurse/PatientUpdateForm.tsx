import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useUpdatePatientMutation } from "../../api/api/apiNurseSlice";
import type { Patient, PatientUpdate } from "../../types/nurse";
import { FormCard, FormGrid, FormFieldWrapper, Input, Select, SuccessMessage , PageNavigation } from "../ui";

const PatientUpdateForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams<{ mrn: string }>();
    const patient = location.state as Patient;
    const [showSuccess, setShowSuccess] = useState(false);

    if (!patient?.mrn) return <div className="p-6"><p className="text-center text-gray-500">No patient data</p></div>;

    const [formData, setFormData] = useState<PatientUpdate>({
        firstName: patient.firstName,
        lastName: patient.lastName,
        gender: patient.gender,
        insurancePolicyNumber: patient.insurancePolicyNumber,
        phoneNumber: patient.phoneNumber,
        email: patient.email,
        address: patient.address,
        additionalInfo: patient.additionalInfo,
        isActive: patient.isActive,
    });

    const [updatePatient, { isLoading }] = useUpdatePatientMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updatePatient({ mrn: params.mrn!, data: formData }).unwrap();
            setShowSuccess(true);
            setTimeout(() => {
                navigate(`/nurse/patient/${params.mrn}`, { state: { ...patient, ...formData } });
            }, 1500);
        } catch (error) {
            console.error("Failed to update patient:", error);
        }
    };

    return (
        <div className="p-6">
            {showSuccess && <SuccessMessage message="Patient updated successfully!" />}
            <FormCard
                title="Update Patient Data"
                onSubmit={handleSubmit}
                onCancel={() => navigate(-1)}
                submitText="Save Changes"
                cancelText="Cancel"
                isLoading={isLoading}
            >
                <FormGrid columns={2}>
                    <FormFieldWrapper label="First Name">
                        <Input type="text" name="firstName" value={formData.firstName || ""} onChange={handleChange} />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Last Name">
                        <Input type="text" name="lastName" value={formData.lastName || ""} onChange={handleChange} />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Gender">
                        <Select name="gender" value={formData.gender || ""} onChange={handleChange}>
                            <option value="">Select Gender</option>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                        </Select>
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Insurance Policy Number">
                        <Input type="text" name="insurancePolicyNumber" value={formData.insurancePolicyNumber || ""} onChange={handleChange} />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Phone Number">
                        <Input type="text" name="phoneNumber" value={formData.phoneNumber || ""} onChange={handleChange} />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Email">
                        <Input type="email" name="email" value={formData.email || ""} onChange={handleChange} />
                    </FormFieldWrapper>
                </FormGrid>
                <FormFieldWrapper label="Address">
                    <Input type="text" name="address" value={formData.address || ""} onChange={handleChange} />
                </FormFieldWrapper>
                <FormFieldWrapper label="Additional Info">
                    <Input type="text" name="additionalInfo" value={formData.additionalInfo || ""} onChange={handleChange} />
                </FormFieldWrapper>
                <div className="flex items-center gap-2">
                    <input type="checkbox" name="isActive" checked={formData.isActive || false} onChange={handleChange} />
                    <label className="text-sm font-semibold text-gray-700">In treatment</label>
                </div>
            </FormCard>
        <PageNavigation />

        </div>
    );
};

export default PatientUpdateForm;