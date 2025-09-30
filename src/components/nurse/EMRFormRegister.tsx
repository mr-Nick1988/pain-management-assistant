import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { EMR } from "../../types/nurse";
import { useCreateEmrMutation } from "../../api/api/apiNurseSlice";

const EMRFormRegister: React.FC = () => {
    const navigate = useNavigate();
    const { mrn } = useParams<{ mrn: string }>();
    const [createEmr, { isLoading, error }] = useCreateEmrMutation();

    const [form, setForm] = useState<EMR>({
        height: 0,
        weight: 0,
        gfr: "",
        childPughScore: "",
        plt: 0,
        wbc: 0,
        sat: 0,
        sodium: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: e.target.type === "number" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mrn) return;

        try {
            await createEmr({ mrn, data: form }).unwrap(); // unwrap для получения реального ответа
            navigate("/nurse");
        } catch (err) {
            console.error("Ошибка при создании EMR:", err);
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6">Register EMR</h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <input
                    type="number"
                    name="height"
                    placeholder="Height (cm)"
                    value={form.height || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <input
                    type="number"
                    name="weight"
                    placeholder="Weight (kg)"
                    value={form.weight || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <input
                    type="text"
                    name="gfr"
                    placeholder="Kidney function (GFR)"
                    value={form.gfr}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <input
                    type="text"
                    name="childPughScore"
                    placeholder="Liver function (Child-Pugh)"
                    value={form.childPughScore}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <input
                    type="number"
                    name="plt"
                    placeholder="Platelet count (PLT)"
                    value={form.plt || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <input
                    type="number"
                    name="wbc"
                    placeholder="White blood cells (WBC)"
                    value={form.wbc || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <input
                    type="number"
                    name="sat"
                    placeholder="Oxygen saturation (SAT)"
                    value={form.sat || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    required
                />
                <input
                    type="number"
                    name="sodium"
                    placeholder="Sodium level"
                    value={form.sodium || ""}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2"
                    required
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 px-4 rounded text-white ${
                        isLoading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"
                    }`}
                >
                    {isLoading ? "Saving..." : "Save & Go to Dashboard"}
                </button>

                {error && (
                    <p className="text-red-500 text-sm mt-2">
                        {("data" in error && (error as any).data?.message) || "Ошибка при сохранении EMR"}
                    </p>
                )}
            </form>
        </div>
    );
};

export default EMRFormRegister;