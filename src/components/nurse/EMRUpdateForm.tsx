import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUpdateEmrMutation } from "../../api/api/apiNurseSlice";
import type { EMR, EMRUpdate } from "../../types/nurse";

const EMRUpdateForm: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Данные, переданные из PatientDetails
    const { patient, emrData } = location.state as { patient: any; emrData: EMR };

    // RTK Mutation для обновления EMR
    const [updateEmr, { isLoading }] = useUpdateEmrMutation();

    // Локальное состояние для формы (заполняем начальными значениями из emrData)
    const [form, setForm] = useState<EMRUpdate>({
        gfr: emrData.gfr || "",
        childPughScore: emrData.childPughScore || "",
        plt: emrData.plt || 0,
        wbc: emrData.wbc || 0,
        sat: emrData.sat || 0,
        sodium: emrData.sodium || 0,
    });

    // Обработчик изменения полей
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    // Сабмит формы
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateEmr({ personId: patient.personId, data: form }).unwrap();
            navigate(-1); // возвращаемся на PatientDetails после успеха
        } catch (err) {
            console.error("Failed to update EMR:", err);
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4">
                Update EMR for {patient.firstName} {patient.lastName}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* GFR */}
                <div>
                    <label className="block font-semibold">GFR</label>
                    <input
                        type="text"
                        name="gfr"
                        value={form.gfr}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                    />
                </div>

                {/* Child Pugh Score */}
                <div>
                    <label className="block font-semibold">Child Pugh Score</label>
                    <input
                        type="text"
                        name="childPughScore"
                        value={form.childPughScore}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                    />
                </div>

                {/* PLT */}
                <div>
                    <label className="block font-semibold">PLT</label>
                    <input
                        type="number"
                        name="plt"
                        value={form.plt}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                    />
                </div>

                {/* WBC */}
                <div>
                    <label className="block font-semibold">WBC</label>
                    <input
                        type="number"
                        name="wbc"
                        value={form.wbc}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                    />
                </div>

                {/* Saturation */}
                <div>
                    <label className="block font-semibold">Saturation</label>
                    <input
                        type="number"
                        name="sat"
                        value={form.sat}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                    />
                </div>

                {/* Sodium */}
                <div>
                    <label className="block font-semibold">Sodium</label>
                    <input
                        type="number"
                        name="sodium"
                        value={form.sodium}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                    />
                </div>

                {/* Кнопки */}
                <div className="flex justify-end space-x-2">
                    <button
                        type="button"
                        className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                    >
                        {isLoading ? "Saving..." : "Save"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EMRUpdateForm;