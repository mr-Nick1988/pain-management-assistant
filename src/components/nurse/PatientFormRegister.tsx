import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import type {Patient, PatientsGenders} from "../../types/nurse";
import {useCreatePatientMutation} from "../../api/api/apiNurseSlice.ts";
import {getErrorMessage} from "../../utils/getErrorMessageHelper.ts";
import { FormCard, FormGrid, FormFieldWrapper, Input, Select, ErrorMessage , PageNavigation } from "../ui";

const PatientFormRegister: React.FC = () => {
    const navigate = useNavigate();
    const [createPatient, {isLoading, error}] = useCreatePatientMutation();

    const [form, setForm] = useState<Patient>({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "MALE" as PatientsGenders,
        insurancePolicyNumber: "",
        phoneNumber: "",
        email: "",
        address: "",
        additionalInfo: "",
        isActive: true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setForm(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const createdPatient = await createPatient(form).unwrap();
            navigate(`/nurse/emr-form/${createdPatient.mrn}`);
        } catch (error: unknown) {
            console.error("Failed to create patient:", error);
        }
    };

    return (
        <div className="p-6">
            <FormCard
                title="Register New Patient"
                onSubmit={handleSubmit}
                onCancel={() => navigate("/nurse")}
                submitText="Register & Go to EMR"
                isLoading={isLoading}
                error={error && <ErrorMessage message={getErrorMessage(error) || "Failed to register patient"} />}
            >
                <FormGrid columns={2}>
                    <FormFieldWrapper label="First Name" required>
                        <Input type="text" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} required />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Last Name" required>
                        <Input type="text" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} required />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Date of Birth" required>
                        <Input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} required />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Gender" required>
                        <Select name="gender" value={form.gender} onChange={handleChange} required>
                            <option value="MALE">Male</option>
                            <option value="FEMALE">Female</option>
                        </Select>
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Insurance Policy Number" required>
                        <Input type="text" name="insurancePolicyNumber" placeholder="Insurance Policy Number" value={form.insurancePolicyNumber} onChange={handleChange} required />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Phone Number" required>
                        <Input type="text" name="phoneNumber" placeholder="Phone Number" value={form.phoneNumber} onChange={handleChange} required />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Email">
                        <Input type="email" name="email" placeholder="Email" value={form.email} onChange={handleChange} />
                    </FormFieldWrapper>
                    <FormFieldWrapper label="Treatment Status" required>
                        <Select name="isActive" value={form.isActive ? "true" : "false"} onChange={(e) => setForm(prev => ({...prev, isActive: e.target.value === "true"}))} required>
                            <option value="" disabled>Select Status</option>
                            <option value="true">Under Treatment</option>
                            <option value="false">Not Under Treatment</option>
                        </Select>
                    </FormFieldWrapper>
                </FormGrid>
                <FormFieldWrapper label="Address" required>
                    <Input type="text" name="address" placeholder="Address" value={form.address} onChange={handleChange} required />
                </FormFieldWrapper>
                <FormFieldWrapper label="Additional Info">
                    <Input type="text" name="additionalInfo" placeholder="Additional Info" value={form.additionalInfo} onChange={handleChange} />
                </FormFieldWrapper>
            </FormCard>
        <PageNavigation />

        </div>
    );
};

export default PatientFormRegister;