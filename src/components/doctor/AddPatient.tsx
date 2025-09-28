import React, {useState} from "react";
import type {PatientCreation} from "../../types/./doctor.ts";
import {useCreatePatientMutation} from "../../api/api/apiDoctorSlice.ts";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select } from "../ui";

interface AddPatientProps {
    onClose: () => void;
    onSuccess: () => void;
}

const AddPatient: React.FC<AddPatientProps> = ({onClose, onSuccess}) => {
    const [formData, setFormData] = useState<Omit<PatientCreation, 'createdBy'>>({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: "",
        insurancePolicyNumber: "",
        phoneNumber: "",
        email: "",
        address: "",
        additionalInfo: "",
    });

    const [createPatient, {isLoading, error}] = useCreatePatientMutation();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({...formData, [e.target.name]: e.target.value});
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const createdBy = localStorage.getItem("userLogin");
        if (!createdBy) {
            console.error("Doctor login not found in localStorage. Cannot create patient.");
            return;
        }

        const dataToSend: PatientCreation = {
            ...formData,
            createdBy: createdBy,
        };

        // Convert date from DD.MM.YYYY to YYYY-MM-DD format for Spring LocalDate
        if (dataToSend.dateOfBirth && dataToSend.dateOfBirth.includes('.')) {
            const [day, month, year] = dataToSend.dateOfBirth.split('.');
            if (day && month && year) {
                dataToSend.dateOfBirth = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
        }

        try {
            await createPatient(dataToSend).unwrap();
            onSuccess();
            onClose();
        } catch (err) {
            console.error("Error creating patient:", err);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <CardHeader>
                    <CardTitle>Add New Patient</CardTitle>
                    <Button
                        onClick={onClose}
                        variant="ghost"
                        size="sm"
                        className="absolute top-4 right-4"
                    >
                        ×
                    </Button>
                </CardHeader>

                <CardContent>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
                            Error creating patient: {JSON.stringify(error)}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name *</Label>
                                <Input
                                    id="firstName"
                                    name="firstName"
                                    value={formData.firstName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter first name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name *</Label>
                                <Input
                                    id="lastName"
                                    name="lastName"
                                    value={formData.lastName}
                                    onChange={handleChange}
                                    required
                                    placeholder="Enter last name"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                                <Input
                                    id="dateOfBirth"
                                    name="dateOfBirth"
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={handleChange}
                                    required
                                    placeholder="DD.MM.YYYY"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender *</Label>
                                <Select
                                    id="gender"
                                    name="gender"
                                    value={formData.gender}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Select gender</option>
                                    <option value="MALE">Male</option>
                                    <option value="FEMALE">Female</option>
                                    <option value="OTHER">Other</option>
                                </Select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="insurancePolicyNumber">Insurance Policy Number</Label>
                                <Input
                                    id="insurancePolicyNumber"
                                    name="insurancePolicyNumber"
                                    value={formData.insurancePolicyNumber}
                                    onChange={handleChange}
                                    placeholder="Enter insurance number"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="phoneNumber">Phone Number</Label>
                                <Input
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    placeholder="Enter phone number"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Enter email address"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="address">Address</Label>
                            <textarea
                                id="address"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Enter address"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="additionalInfo">Additional Information</Label>
                            <textarea
                                id="additionalInfo"
                                name="additionalInfo"
                                value={formData.additionalInfo}
                                onChange={handleChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Any additional information about the patient"
                            />
                        </div>

                        <div className="flex space-x-3 justify-end pt-6 border-t">
                            <Button
                                type="button"
                                onClick={onClose}
                                variant="cancel"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                variant="submit"
                            >
                                {isLoading ? "Creating..." : "Create Patient"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default AddPatient;