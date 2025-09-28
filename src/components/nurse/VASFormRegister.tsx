import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useCreateVasMutation } from "../../api/api/apiNurseSlice";
import type { Patient, VAS } from "../../types/nurse";

const VASFormRegister: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const patient = location.state as Patient;

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
            alert("Please fill all fields correctly.");
            return;
        }

        try {
            await createVAS({ personId: patient.personId, data: formData }).unwrap();
            // Переход только после успешного создания VAS
            navigate(`/nurse/recommendation/${patient.personId}`, { state: { patient, vasData: formData } });
        } catch (error) {
            console.error("Failed to create VAS:", error);
            alert("Ошибка при создании VAS");
        }
    };

    const handleCancel = () => {
        navigate(-1); // Возврат на PatientDetails
    };

    return (
        <div className="p-6 max-w-md mx-auto bg-white shadow rounded">
            <h1 className="text-2xl font-bold mb-4">Register Pain Complaint</h1>
            <div className="space-y-4">
                <div>
                    <label className="block font-semibold mb-1">Pain Place</label>
                    <input
                        type="text"
                        name="painPlace"
                        value={formData.painPlace}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div>
                    <label className="block font-semibold mb-1">Pain Level (0-10)</label>
                    <input
                        type="number"
                        name="painLevel"
                        min={0}
                        max={10}
                        value={formData.painLevel}
                        onChange={handleChange}
                        className="w-full border p-2 rounded"
                    />
                </div>

                <div className="flex space-x-2 mt-4">
                    <button
                        disabled={isLoading}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                        onClick={handleNext}
                    >
                        Next
                    </button>
                    <button
                        className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                        onClick={handleCancel}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VASFormRegister;