
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { EMR } from "../../types/nurse";
import { useCreateEmrMutation } from "../../api/api/apiNurseSlice";
import {validateEmr} from "../../utils/validationEmr.ts";

const EMRFormRegister: React.FC = () => {
    const navigate = useNavigate();
    const { mrn } = useParams<{ mrn: string }>();
    const [createEmr, { isLoading, error }] = useCreateEmrMutation();

    // состояние формы
    const [form, setForm] = useState<EMR>({
        height: 0,
        weight: 0,
        gfr: "",
        childPughScore: "",
        plt: 0,
        wbc: 0,
        sat: 0,
        sodium: 0,
        sensitivities: [],
    });

    // состояние ошибок
    const [errors, setErrors] = useState<Record<string, string>>({});

    // обработчик изменения полей
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    //  обработчик для Sensitivities
    const handleSensitivitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const items = value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);   //Это короткий способ удалить пустые строки, если человек случайно ввёл: "Paracetamol,, Ibuprofen",а .filter(Boolean) оставит только непустые элементы
        setForm((prev) => ({
            ...prev,
            sensitivities: items,
        }));
    };




    // ✅ обработчик отправки
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mrn) return;

        // 1️⃣ Проверка формы перед отправкой
        const validationErrors = validateEmr(form); //  простая фронтенд-валидация
        setErrors(validationErrors);
        // 2️⃣ Если есть ошибки — не отправляем запрос
        if (Object.keys(validationErrors).length > 0) return;

        try {
            await createEmr({ mrn, data: form }).unwrap();
            navigate("/nurse");
        } catch (err) {
            console.error(" EMR creation error: ", err);
        }
    };


    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6">Register EMR</h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
                {/* HEIGHT */}
                <div>
                    <input
                        type="number"
                        name="height"
                        placeholder="Height (cm)"
                        value={form.height || ""}
                        onChange={handleChange}
                        className={`w-full border rounded px-3 py-2 ${
                            errors.height ? "border-red-500" : ""
                        }`}
                        required
                    />
                    <p className="text-sm text-gray-500">Enter 50–250 cm</p>
                    {errors.height && <p className="text-red-500 text-sm">{errors.height}</p>}
                </div>

                {/* WEIGHT */}
                <div>
                    <input
                        type="number"
                        name="weight"
                        placeholder="Weight (kg)"
                        value={form.weight || ""}
                        onChange={handleChange}
                        className={`w-full border rounded px-3 py-2 ${
                            errors.weight ? "border-red-500" : ""
                        }`}
                        required
                    />
                    <p className="text-sm text-gray-500">Enter 20–300 kg</p>
                    {errors.weight && <p className="text-red-500 text-sm">{errors.weight}</p>}
                </div>

                {/* GFR */}
                <div>
                    <input
                        type="text"
                        name="gfr"
                        placeholder="Kidney function (GFR)"
                        value={form.gfr}
                        onChange={handleChange}
                        className={`w-full border rounded px-3 py-2 ${
                            errors.gfr ? "border-red-500" : ""
                        }`}
                        required
                    />
                    <p className="text-sm text-gray-500">Enter A–E or number (0–150 ml/min)</p>
                    {errors.gfr && <p className="text-red-500 text-sm">{errors.gfr}</p>}
                </div>

                {/* Child-Pugh */}
                <div>
                    <input
                        type="text"
                        name="childPughScore"
                        placeholder="Liver function (Child-Pugh: A/B/C)"
                        value={form.childPughScore}
                        onChange={handleChange}
                        className={`w-full border rounded px-3 py-2 ${
                            errors.childPughScore ? "border-red-500" : ""
                        }`}
                        required
                    />
                    <p className="text-sm text-gray-500">Enter A, B or C</p>
                    {errors.childPughScore && (
                        <p className="text-red-500 text-sm">{errors.childPughScore}</p>
                    )}
                </div>

                {/* PLT */}
                <div>
                    <input
                        type="number"
                        name="plt"
                        placeholder="Platelet count (PLT)"
                        value={form.plt || ""}
                        onChange={handleChange}
                        className={`w-full border rounded px-3 py-2 ${
                            errors.plt ? "border-red-500" : ""
                        }`}
                        required
                    />
                    <p className="text-sm text-gray-500">Enter 50–600 K/µL</p>
                    {errors.plt && <p className="text-red-500 text-sm">{errors.plt}</p>}
                </div>

                {/* WBC */}
                <div>
                    <input
                        type="number"
                        name="wbc"
                        placeholder="White blood cells (WBC)"
                        value={form.wbc || ""}
                        onChange={handleChange}
                        className={`w-full border rounded px-3 py-2 ${
                            errors.wbc ? "border-red-500" : ""
                        }`}
                        required
                    />
                    <p className="text-sm text-gray-500">Enter 2–30 ×10³/µL</p>
                    {errors.wbc && <p className="text-red-500 text-sm">{errors.wbc}</p>}
                </div>

                {/* SAT */}
                <div>
                    <input
                        type="number"
                        name="sat"
                        placeholder="Oxygen saturation (SAT %)"
                        value={form.sat || ""}
                        onChange={handleChange}
                        className={`w-full border rounded px-3 py-2 ${
                            errors.sat ? "border-red-500" : ""
                        }`}
                        required
                    />
                    <p className="text-sm text-gray-500">Enter 85–100 (%)</p>
                    {errors.sat && <p className="text-red-500 text-sm">{errors.sat}</p>}
                </div>

                {/* SODIUM */}
                <div>
                    <input
                        type="number"
                        name="sodium"
                        placeholder="Sodium (mmol/L)"
                        value={form.sodium || ""}
                        onChange={handleChange}
                        className={`w-full border rounded px-3 py-2 ${
                            errors.sodium ? "border-red-500" : ""
                        }`}
                        required
                    />
                    <p className="text-sm text-gray-500">Enter 110–160 mmol/L</p>
                    {errors.sodium && <p className="text-red-500 text-sm">{errors.sodium}</p>}
                </div>

                {/* ✅ NEW: SENSITIVITIES */}
                <div>
                    <input
                        type="text"
                        name="sensitivities"
                        placeholder="Sensitivities (comma-separated, e.g. Paracetamol, Tramadol)"
                        onChange={handleSensitivitiesChange}
                        className="w-full border rounded px-3 py-2"
                    />
                    <p className="text-sm text-gray-500">
                        Example: <i>Paracetamol, Tramadol, Ibuprofen</i>
                    </p>
                </div>

                {/* SUBMIT */}
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
                        {("data" in error && (error as any).data?.message) ||
                            "Ошибка при сохранении EMR"}
                    </p>
                )}
            </form>
        </div>
    );
};

export default EMRFormRegister;