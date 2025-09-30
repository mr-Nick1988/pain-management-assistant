import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUpdateEmrMutation } from "../../api/api/apiNurseSlice";
import type { EMR, EMRUpdate, Patient } from "../../types/nurse";

const EMRUpdateForm: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Защита от прямого захода по URL
    const state = location.state as { patient: Patient; emrData: EMR } | undefined;
    if (!state || !state.patient || !state.patient?.mrn) {
        return (
            <div className="p-6">
                <p>No EMR data. Please navigate from the patient details page.</p>
                <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    onClick={() => navigate("/nurse")}
                >
                    Back to Dashboard
                </button>
            </div>
        );
    }

    const { patient, emrData } = state;

    // RTK Mutation для обновления EMR
    const [updateEmr, { isLoading }] = useUpdateEmrMutation();

    // Локальное состояние для формы
    const [form, setForm] = useState<EMRUpdate>({
        height: emrData.height,
        weight: emrData.weight,
        gfr: emrData.gfr,
        childPughScore: emrData.childPughScore,
        plt: emrData.plt,
        wbc: emrData.wbc,
        sat: emrData.sat,
        sodium: emrData.sodium,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: ["height", "weight", "plt", "wbc", "sat", "sodium"].includes(name)
                ? Number(value)
                : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateEmr({ mrn: patient.mrn!, data: form }).unwrap();
            navigate(-1); // возвращаемся на PatientDetails
        } catch (err) {
            console.error("Failed to update EMR:", err);
            alert("Error updating EMR");
        }
    };

    return (
        <div className="p-6 max-w-lg mx-auto bg-white rounded shadow">
            <h1 className="text-2xl font-bold mb-4">
                Update EMR for {patient.firstName} {patient.lastName}
            </h1>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-semibold">Height (cm)</label>
                    <input
                        type="number"
                        name="height"
                        value={form.height || ""}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                    />
                </div>

                <div>
                    <label className="block font-semibold">Weight (kg)</label>
                    <input
                        type="number"
                        name="weight"
                        value={form.weight || ""}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                    />
                </div>

                <div>
                    <label className="block font-semibold">GFR</label>
                    <input
                        type="text"
                        name="gfr"
                        value={form.gfr || ""}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                    />
                </div>

                <div>
                    <label className="block font-semibold">Child Pugh Score</label>
                    <input
                        type="text"
                        name="childPughScore"
                        value={form.childPughScore || ""}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                    />
                </div>

                <div>
                    <label className="block font-semibold">PLT</label>
                    <input
                        type="number"
                        name="plt"
                        value={form.plt || ""}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                    />
                </div>

                <div>
                    <label className="block font-semibold">WBC</label>
                    <input
                        type="number"
                        name="wbc"
                        value={form.wbc || ""}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                    />
                </div>

                <div>
                    <label className="block font-semibold">Oxygen Saturation (SAT)</label>
                    <input
                        type="number"
                        name="sat"
                        value={form.sat || ""}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                    />
                </div>

                <div>
                    <label className="block font-semibold">Sodium (Na)</label>
                    <input
                        type="number"
                        name="sodium"
                        value={form.sodium || ""}
                        onChange={handleChange}
                        className="border rounded w-full p-2"
                    />
                </div>

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