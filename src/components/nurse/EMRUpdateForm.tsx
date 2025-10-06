import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUpdateEmrMutation } from "../../api/api/apiNurseSlice";
import type { EMR, EMRUpdate, Patient } from "../../types/nurse";
import { validateEmr } from "../../utils/validationEmr.ts";

const EMRUpdateForm: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

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
    const [updateEmr, { isLoading }] = useUpdateEmrMutation();

    const [form, setForm] = useState<EMRUpdate>({
        height: emrData.height,
        weight: emrData.weight,
        gfr: emrData.gfr,
        childPughScore: emrData.childPughScore,
        plt: emrData.plt,
        wbc: emrData.wbc,
        sat: emrData.sat,
        sodium: emrData.sodium,
        sensitivities: emrData.sensitivities || [],
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

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
            navigate(-1);
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
                        className={`border rounded w-full p-2 ${errors.height ? "border-red-500" : ""}`}
                    />
                    {errors.height && <p className="text-red-500 text-sm">{errors.height}</p>}
                </div>

                <div>
                    <label className="block font-semibold">Weight (kg)</label>
                    <input
                        type="number"
                        name="weight"
                        value={form.weight || ""}
                        onChange={handleChange}
                        className={`border rounded w-full p-2 ${errors.weight ? "border-red-500" : ""}`}
                    />
                    {errors.weight && <p className="text-red-500 text-sm">{errors.weight}</p>}
                </div>

                <div>
                    <label className="block font-semibold">GFR</label>
                    <input
                        type="text"
                        name="gfr"
                        value={form.gfr || ""}
                        onChange={handleChange}
                        className={`border rounded w-full p-2 ${errors.gfr ? "border-red-500" : ""}`}
                    />
                    <p className="text-sm text-gray-500">Enter A–E or number (0–120)</p>
                    {errors.gfr && <p className="text-red-500 text-sm">{errors.gfr}</p>}
                </div>

                <div>
                    <label className="block font-semibold">Child-Pugh Score</label>
                    <input
                        type="text"
                        name="childPughScore"
                        value={form.childPughScore || ""}
                        onChange={handleChange}
                        className={`border rounded w-full p-2 ${errors.childPughScore ? "border-red-500" : ""}`}
                    />
                    <p className="text-sm text-gray-500">Enter A, B, or C</p>
                    {errors.childPughScore && (
                        <p className="text-red-500 text-sm">{errors.childPughScore}</p>
                    )}
                </div>

                <div>
                    <label className="block font-semibold">PLT</label>
                    <input
                        type="number"
                        name="plt"
                        value={form.plt || ""}
                        onChange={handleChange}
                        className={`border rounded w-full p-2 ${errors.plt ? "border-red-500" : ""}`}
                    />
                    {errors.plt && <p className="text-red-500 text-sm">{errors.plt}</p>}
                </div>

                <div>
                    <label className="block font-semibold">WBC</label>
                    <input
                        type="number"
                        name="wbc"
                        value={form.wbc || ""}
                        onChange={handleChange}
                        className={`border rounded w-full p-2 ${errors.wbc ? "border-red-500" : ""}`}
                    />
                    {errors.wbc && <p className="text-red-500 text-sm">{errors.wbc}</p>}
                </div>

                <div>
                    <label className="block font-semibold">Oxygen Saturation (SAT)</label>
                    <input
                        type="number"
                        name="sat"
                        value={form.sat || ""}
                        onChange={handleChange}
                        className={`border rounded w-full p-2 ${errors.sat ? "border-red-500" : ""}`}
                    />
                    {errors.sat && <p className="text-red-500 text-sm">{errors.sat}</p>}
                </div>

                <div>
                    <label className="block font-semibold">Sodium (Na)</label>
                    <input
                        type="number"
                        name="sodium"
                        value={form.sodium || ""}
                        onChange={handleChange}
                        className={`border rounded w-full p-2 ${errors.sodium ? "border-red-500" : ""}`}
                    />
                    {errors.sodium && <p className="text-red-500 text-sm">{errors.sodium}</p>}
                </div>

                <div>
                    <label className="block font-semibold">Sensitivities (comma-separated)</label>
                    <input
                        type="text"
                        name="sensitivities"
                        placeholder="e.g. PARACETAMOL, IBUPROFEN"
                        value={form.sensitivities?.join(", ") || ""}
                        onChange={handleSensitivitiesChange}
                        className="border rounded w-full p-2"
                    />
                    <p className="text-sm text-gray-500">
                        Optional: list allergies separated by commas
                    </p>
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