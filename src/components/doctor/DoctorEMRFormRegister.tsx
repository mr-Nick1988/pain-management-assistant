import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { EMR, Diagnosis } from "../../types/doctor";
import {
    useCreateEmrMutation,
    useGetIcdDiagnosesQuery,
} from "../../api/api/apiDoctorSlice";
import { validateEmr } from "../../utils/validationEmr";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
 PageNavigation } from "../ui";

const EMRFormRegister: React.FC = () => {
    const navigate = useNavigate();
    const { mrn } = useParams<{ mrn: string }>();

    // ❗ Убрали error, чтобы не подчёркивало как неиспользуемое
    const [createEmr, { isLoading }] = useCreateEmrMutation();

    // 🩺 Состояние формы
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
        diagnoses: [],
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDiagnoses, setSelectedDiagnoses] = useState<Diagnosis[]>([]);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // 📡 Поиск ICD диагнозов (работает после 2+ символов)
    const { data: icdResults = [], isFetching } = useGetIcdDiagnosesQuery(
        searchTerm,
        { skip: searchTerm.length < 2 }
    );

    // ===============================
    // 🔧 Обработчики
    // ===============================

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    const handleSensitivitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const items = e.target.value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        setForm((prev) => ({ ...prev, sensitivities: items }));
    };

    const handleSelectDiagnosis = (diagnosis: Diagnosis) => {
        // 💡 защита от дублирования
        setForm((prev) => ({
            ...prev,
            diagnoses: prev.diagnoses?.some((d) => d.icdCode === diagnosis.icdCode)
                ? prev.diagnoses
                : [...(prev.diagnoses || []), diagnosis],
        }));

        setSelectedDiagnoses((prev) =>
            prev.some((d) => d.icdCode === diagnosis.icdCode)
                ? prev
                : [...prev, diagnosis]
        );

        setSearchTerm("");
    };

    const handleRemoveDiagnosis = (icdCode: string) => {
        setForm((prev) => ({
            ...prev,
            diagnoses: (prev.diagnoses || []).filter((d) => d.icdCode !== icdCode),
        }));
        setSelectedDiagnoses((prev) =>
            prev.filter((d) => d.icdCode !== icdCode)
        );
    };

    // ===============================
    // 📤 Сабмит формы
    // ===============================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mrn) return;

        const validationErrors = validateEmr(form);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        try {
            await createEmr({ mrn, data: form }).unwrap();
            navigate("/doctor");
        } catch (err) {
            console.error("Error creating EMR:", err);
            alert("Error creating EMR. Check console for details.");
        }
    };

    // ===============================
    // 🧱 JSX
    // ===============================
    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create Electronic Medical Record (EMR)</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        {/* Основные поля */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* поля height, weight, gfr, childPughScore, plt, wbc, sat, sodium */}
                            {[
                                { id: "height", label: "Height (cm)", type: "number" },
                                { id: "weight", label: "Weight (kg)", type: "number" },
                                { id: "gfr", label: "Glomerular Filtration Rate (GFR)", type: "text" },
                                { id: "childPughScore", label: "Child-Pugh Score", type: "text" },
                                { id: "plt", label: "Platelet Count (PLT)", type: "number" },
                                { id: "wbc", label: "White Blood Cells (WBC)", type: "number" },
                                { id: "sat", label: "Oxygen Saturation (SpO₂)", type: "number" },
                                { id: "sodium", label: "Sodium Level (Na)", type: "number" },
                            ].map(({ id, label, type }) => (
                                <div key={id}>
                                    <Label htmlFor={id}>{label}</Label>
                                    <Input
                                        id={id}
                                        name={id}
                                        type={type}
                                        placeholder={`Enter ${label.toLowerCase()}`}
                                        value={form[id as keyof EMR] as string | number || ""}
                                        onChange={handleChange}
                                        required
                                    />
                                    {errors[id] && (
                                        <p className="text-sm text-red-500 mt-1">{errors[id]}</p>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Sensitivities */}
                        <div className="md:col-span-2">
                            <Label htmlFor="sensitivities">
                                Drug Sensitivities / Allergies
                            </Label>
                            <Input
                                id="sensitivities"
                                type="text"
                                name="sensitivities"
                                placeholder="Enter drug allergies separated by commas (e.g., Paracetamol, Ibuprofen)"
                                value={form.sensitivities?.join(", ") || ""}
                                onChange={handleSensitivitiesChange}
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Separate multiple allergies with commas
                            </p>
                        </div>

                        {/* Diagnoses */}
                        <div className="space-y-2">
                            <Label htmlFor="diagnosis-search">Search Diagnoses</Label>
                            <div className="relative">
                                <Input
                                    id="diagnosis-search"
                                    type="text"
                                    placeholder="Type at least 2 characters to search..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                                {isFetching && (
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                    </div>
                                )}
                                {searchTerm.length >= 2 && icdResults.length > 0 && (
                                    <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                        {icdResults.map((diagnosis) => (
                                            <div
                                                key={diagnosis.icdCode}
                                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                onClick={() => handleSelectDiagnosis(diagnosis)}
                                            >
                                                {/* 💊 Код теперь в скобках */}
                                                <div className="font-medium">
                                                    {diagnosis.description}{" "}
                                                    <span className="text-gray-500 text-sm">
                            ({diagnosis.icdCode})
                          </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Выбранные диагнозы */}
                            {selectedDiagnoses.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    <Label>Selected Diagnoses:</Label>
                                    <div className="space-y-2">
                                        {selectedDiagnoses.map((diagnosis) => (
                                            <div
                                                key={diagnosis.icdCode}
                                                className="flex items-center justify-between bg-gray-50 p-2 rounded"
                                            >
                                                <div>
                                                    {diagnosis.description}{" "}
                                                    <span className="text-gray-500">
                            ({diagnosis.icdCode})
                          </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDiagnosis(diagnosis.icdCode)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    Remove
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Кнопки */}
                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                                disabled={isLoading}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Creating..." : "Create EMR"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        <PageNavigation />

        </div>
    );
};

export default EMRFormRegister;