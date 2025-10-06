import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useUpdatePatientMutation } from "../../api/api/apiDoctorSlice";
import type { Patient, PatientUpdate } from "../../types/doctor";
import {Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select} from "../ui";
import {validatePatient} from "../../utils/validationPatient";

const PatientUpdateForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams<{ mrn: string }>();
    const patient = location.state as Patient;

    // Все хуки должны быть вызваны ДО любых условных return
    const [formData, setFormData] = useState<PatientUpdate>({
        firstName: patient?.firstName,
        lastName: patient?.lastName,
        gender: patient?.gender,
        insurancePolicyNumber: patient?.insurancePolicyNumber,
        phoneNumber: patient?.phoneNumber,
        email: patient?.email,
        address: patient?.address,
        additionalInfo: patient?.additionalInfo,
        isActive: patient?.isActive,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [updatePatient, { isLoading }] = useUpdatePatientMutation();

    // Проверка после вызова всех хуков
    if (!patient?.mrn) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="mb-4">No patient data. Please navigate from the dashboard.</p>
                        <Button variant="update" onClick={() => navigate("/doctor")}>
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Валидация формы (поля не обязательны при обновлении)
        const validationErrors = validatePatient(formData, false);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        try {
            await updatePatient({ mrn: params.mrn!, data: formData }).unwrap();
            alert("Patient updated successfully!");
            navigate(`/doctor/patient/${params.mrn}`, { state: { ...patient, ...formData } });
        } catch (error) {
            console.error("Failed to update patient:", error);
            alert("Error updating patient");
        }
    };

    const handleCancel = () => navigate(-1);

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Update Patient: {patient.firstName} {patient.lastName}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                name="firstName"
                                placeholder="Enter patient's first name"
                                value={formData.firstName || ""}
                                onChange={handleChange}
                            />
                            {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                        </div>

                        <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                name="lastName"
                                placeholder="Enter patient's last name"
                                value={formData.lastName || ""}
                                onChange={handleChange}
                            />
                            {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                        </div>

                        <div>
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                                id="gender"
                                name="gender"
                                value={formData.gender || ""}
                                onChange={handleChange}
                            >
                                <option value="">Select gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </Select>
                        </div>

                        <div>
                            <Label htmlFor="insurancePolicyNumber">Insurance Policy Number</Label>
                            <Input
                                id="insurancePolicyNumber"
                                name="insurancePolicyNumber"
                                placeholder="Enter insurance policy number"
                                value={formData.insurancePolicyNumber || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <Label htmlFor="phoneNumber">Phone Number</Label>
                            <Input
                                id="phoneNumber"
                                name="phoneNumber"
                                placeholder="Enter patient's phone number"
                                value={formData.phoneNumber || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="Enter patient's email address"
                                value={formData.email || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                name="address"
                                placeholder="Enter patient's full address"
                                value={formData.address || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <Label htmlFor="additionalInfo">Additional Information</Label>
                            <Input
                                id="additionalInfo"
                                name="additionalInfo"
                                placeholder="Enter any additional information"
                                value={formData.additionalInfo || ""}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="isActive"
                                name="isActive"
                                checked={formData.isActive || false}
                                onChange={handleChange}
                                className="h-4 w-4"
                            />
                            <Label htmlFor="isActive">Patient is currently in treatment</Label>
                        </div>

                        <div className="flex space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleCancel}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="update"
                                disabled={isLoading}
                                className="flex-1"
                            >
                                {isLoading ? "Updating..." : "Update Patient"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default PatientUpdateForm;
