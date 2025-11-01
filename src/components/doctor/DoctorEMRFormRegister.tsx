import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    useCreateEmrMutation,
    useGetIcdDiagnosesQuery,
} from "../../api/api/apiDoctorSlice";
import { validateEmr } from "../../utils/validationEmr";
import type { EMR, Diagnosis } from "../../types/doctor";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    PageNavigation,
    FormFieldWrapper,
    FormGrid,
} from "../ui";
import { useToast } from "../../contexts/ToastContext";

const EMRFormRegister: React.FC = () => {
    const navigate = useNavigate();
    const { mrn } = useParams<{ mrn: string }>();
    const toast = useToast();

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
            toast.success("EMR created successfully!");
            navigate("/doctor");
        } catch (err) {
            console.error("Error creating EMR:", err);
            toast.error("Error creating EMR. Please try again.");
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
                        <FormGrid columns={2}>
                            <FormFieldWrapper label="Height (cm)" required hint="Enter 50–250 cm" error={errors.height}>
                                <Input
                                    type="number"
                                    name="height"
                                    placeholder="Height"
                                    value={form.height || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </FormFieldWrapper>

                            <FormFieldWrapper label="Weight (kg)" required hint="Enter 2–300 kg" error={errors.weight}>
                                <Input
                                    type="number"
                                    name="weight"
                                    placeholder="Weight"
                                    value={form.weight || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </FormFieldWrapper>

                            <FormFieldWrapper label="GFR" required hint="Enter A–E or 0–120 ml/min" error={errors.gfr}>
                                <Input
                                    type="text"
                                    name="gfr"
                                    placeholder="Kidney function"
                                    value={form.gfr}
                                    onChange={handleChange}
                                    required
                                />
                            </FormFieldWrapper>

                            <FormFieldWrapper label="Child-Pugh Score" required hint="Enter A, B or C" error={errors.childPughScore}>
                                <Input
                                    type="text"
                                    name="childPughScore"
                                    placeholder="A/B/C"
                                    value={form.childPughScore}
                                    onChange={handleChange}
                                    required
                                />
                            </FormFieldWrapper>

                            <FormFieldWrapper label="PLT" required hint="Enter 10–600 ×10³/µL" error={errors.plt}>
                                <Input
                                    type="number"
                                    name="plt"
                                    placeholder="Platelet count"
                                    value={form.plt || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </FormFieldWrapper>

                            <FormFieldWrapper label="WBC" required hint="Enter 3.5–10 ×10³/µL" error={errors.wbc}>
                                <Input
                                    type="number"
                                    name="wbc"
                                    placeholder="White blood cells"
                                    value={form.wbc || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </FormFieldWrapper>

                            <FormFieldWrapper label="SAT (%)" required hint="Enter 85–100%" error={errors.sat}>
                                <Input
                                    type="number"
                                    name="sat"
                                    placeholder="Oxygen saturation"
                                    value={form.sat || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </FormFieldWrapper>

                            <FormFieldWrapper label="Sodium (mmol/L)" required hint="Enter 120–160 mmol/L" error={errors.sodium}>
                                <Input
                                    type="number"
                                    name="sodium"
                                    placeholder="Sodium"
                                    value={form.sodium || ""}
                                    onChange={handleChange}
                                    required
                                />
                            </FormFieldWrapper>
                        </FormGrid>

                        {/* Sensitivities */}
                        <FormFieldWrapper label="Sensitivities" hint="Example: Paracetamol, Tramadol, Ibuprofen">
                            <Input
                                type="text"
                                name="sensitivities"
                                placeholder="Comma-separated (e.g. Paracetamol, Tramadol)"
                                onChange={handleSensitivitiesChange}
                            />
                        </FormFieldWrapper>

                        {/* Diagnoses */}
                        <FormFieldWrapper
                            label="Diagnoses"
                            hint="Start typing diagnosis name (2+ letters)..."
                        >
                            <Input
                                type="text"
                                value={searchTerm}
                                placeholder="Search diagnosis..."
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />

                            {/* Индикатор загрузки */}
                            {isFetching && (
                                <p className="text-gray-400 text-sm mt-1">Searching...</p>
                            )}

                            {/* Выпадающий список найденных диагнозов */}
                            {icdResults.length > 0 && searchTerm.length >= 2 && (
                                <ul className="border rounded mt-1 bg-white shadow max-h-40 overflow-auto">
                                    {icdResults.slice(0, 10).map((d) => (
                                        <li
                                            key={d.icdCode}
                                            onClick={() => handleSelectDiagnosis(d)}
                                            className="p-2 hover:bg-blue-100 cursor-pointer"
                                        >
                                            {d.description}{" "}
                                            <span className="text-gray-500 text-sm">({d.icdCode})</span>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            {/* Список уже выбранных диагнозов */}
                            {selectedDiagnoses.length > 0 && (
                                <ul className="mt-3 text-sm">
                                    {selectedDiagnoses.map((d) => (
                                        <li
                                            key={d.icdCode}
                                            className="flex items-center justify-between border-b py-1"
                                        >
                                            <span>
                                                ✅ {d.description}{" "}
                                                <span className="text-gray-500">({d.icdCode})</span>
                                            </span>
                                            <button
                                                type="button"
                                                className="text-red-500 hover:text-red-700 ml-2"
                                                onClick={() => handleRemoveDiagnosis(d.icdCode)}
                                            >
                                                ❌
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </FormFieldWrapper>
                        <div className="flex justify-end space-x-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
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
