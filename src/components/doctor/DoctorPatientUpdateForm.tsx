import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useUpdatePatientMutation } from "../../api/api/apiDoctorSlice";
import type { Patient, PatientUpdate } from "../../types/doctor";

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

    const [updatePatient, { isLoading }] = useUpdatePatientMutation();

    // Проверка после вызова всех хуков
    if (!patient?.mrn) {
        return (
            <div className="p-6">
                <p>No patient data. Please navigate from the dashboard.</p>
                <button
                    onClick={() => navigate("/doctor")}
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Back to Dashboard
                </button>
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
        <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
            <h1 className="text-2xl font-bold mb-4">Update Patient Data</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-semibold mb-1">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName || ""}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-1">Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName || ""}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-1">Gender</label>
                    <select
                        name="gender"
                        value={formData.gender || ""}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    >
                        <option value="">Select Gender</option>
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                <div>
                    <label className="block font-semibold mb-1">Insurance Policy Number</label>
                    <input
                        type="text"
                        name="insurancePolicyNumber"
                        value={formData.insurancePolicyNumber || ""}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-1">Phone Number</label>
                    <input
                        type="text"
                        name="phoneNumber"
                        value={formData.phoneNumber || ""}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email || ""}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-1">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address || ""}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-1">Additional Info</label>
                    <input
                        type="text"
                        name="additionalInfo"
                        value={formData.additionalInfo || ""}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        name="isActive"
                        checked={formData.isActive || false}
                        onChange={handleChange}
                    />
                    <label>In treatment</label>
                </div>

                <div className="flex space-x-2 mt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        Save
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default PatientUpdateForm;
