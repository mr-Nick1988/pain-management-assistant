import React, { useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useUpdatePatientMutation } from "../../api/api/apiNurseSlice";
import type { Patient, PatientUpdate } from "../../types/nurse";

const PatientUpdateForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const params = useParams<{ personId: string }>();

    // Получаем пациента из state, который мы передали из PatientDetails
    const patient = location.state as Patient;

    // Локальный state для редактируемых данных
    const [formData, setFormData] = useState<PatientUpdate>({
        firstName: patient.firstName,
        lastName: patient.lastName,
        gender: patient.gender,
        height: patient.height,
        weight: patient.weight,
    });

    const [updatePatient, { isLoading }] = useUpdatePatientMutation();

    // Обработчик изменения полей
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "height" || name === "weight" ? Number(value) : value,
        }));
    };

    // Сабмит формы
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updatePatient({ personId: params.personId!, data: formData }).unwrap();
            alert("Patient updated successfully!");
            navigate(`/nurse/patient/${params.personId}`); // возвращаем на PatientDetails
        } catch (error) {
            console.error("Failed to update patient:", error);
            alert("Ошибка при обновлении пациента");
        }
    };

    // Отмена редактирования
    const handleCancel = () => {
        navigate(-1);
    };

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
                    </select>
                </div>

                <div>
                    <label className="block font-semibold mb-1">Height (cm)</label>
                    <input
                        type="number"
                        name="height"
                        value={formData.height || ""}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-1">Weight (kg)</label>
                    <input
                        type="number"
                        name="weight"
                        value={formData.weight || ""}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
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