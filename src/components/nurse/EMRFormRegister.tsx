import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { EMR, Diagnosis } from "../../types/nurse";
import { useCreateEmrMutation, useGetIcdDiagnosesQuery } from "../../api/api/apiNurseSlice";
import { validateEmr } from "../../utils/validationEmr.ts";
import { FormCard, FormGrid, FormFieldWrapper, Input, ErrorMessage , PageNavigation } from "../ui";

const EMRFormRegister: React.FC = () => {
    const navigate = useNavigate();

    //  Достаём из URL идентификатор пациента (MRN)
    const { mrn } = useParams<{ mrn: string }>();

    //  RTK Mutation для создания новой EMR-карты
    const [createEmr, { isLoading, error }] = useCreateEmrMutation();

    // =======================
    //  Состояние формы EMR
    // =======================
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
        diagnoses: [], // список диагнозов пациента
    });

    // ===============================
    //  Состояние поиска диагнозов
    // ===============================
    const [searchTerm, setSearchTerm] = useState("");                 // строка, которую вводит пользователь
    const [selectedDiagnoses, setSelectedDiagnoses] = useState<Diagnosis[]>([]); // выбранные диагнозы

    // ==============================
    //  RTK Query — поиск ICD кодов
    // ==============================
    const {
        data: icdResults = [],   // список диагнозов, полученных с бэкенда
        isFetching,              // индикатор загрузки
    } = useGetIcdDiagnosesQuery(searchTerm, {
        skip: searchTerm.length < 2, // запрос отправляется только при вводе 2+ символов
    });

    // ==========================
    // Ошибки валидации формы
    // ==========================
    const [errors, setErrors] = useState<Record<string, string>>({});

    // ===================================
    // Обработчик обычных текст/чисел
    // ===================================
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value, // авто-конвертация чисел
        }));
    };

    // =====================================================
    //  Обработчик поля чувствительности (список через запятую)
    // =====================================================
    const handleSensitivitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;
        const items = value
            .split(",")
            .map((s) => s.trim()) // удаляем лишние пробелы
            .filter(Boolean);     // убираем пустые строки
        setForm((prev) => ({
            ...prev,
            sensitivities: items,
        }));
    };

    // ===========================================================
    //  Выбор диагноза из выпадающего списка автоподстановки
    // ===========================================================
    const handleSelectDiagnosis = (diagnosis: Diagnosis) => {
        // Добавляем диагноз в форму
        setForm((prev) => ({
            ...prev,
            diagnoses: [...(prev.diagnoses || []), diagnosis],
        }));

        // Добавляем в локальное состояние для отображения
        setSelectedDiagnoses((prev) =>
            prev.find((d) => d.icdCode === diagnosis.icdCode)
                ? prev
                : [...prev, diagnosis]
        );

        // очищаем поле поиска после выбора
        setSearchTerm("");
    };

    // ==================================
    //  Отправка формы на backend
    // ==================================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mrn) return; // без MRN невозможно сохранить EMR

        // Проверка всех полей перед отправкой
        const validationErrors = validateEmr(form);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        // Отправляем на backend через RTK mutation
        try {
            await createEmr({ mrn, data: form }).unwrap();
            navigate("/nurse");
        } catch (error: unknown) {
            console.error("Failed to create EMR:", error);
        }
    };

    // =======================
    //  JSX-разметка формы
    // =======================
    return (
        <div className="p-6">
            <FormCard
                title="Register EMR"
                onSubmit={handleSubmit}
                onCancel={() => navigate("/nurse")}
                submitText="Save & Go to Dashboard"
                isLoading={isLoading}
                error={
                    error && (
                        <ErrorMessage
                            message={
                                ("data" in error &&
                                error.data &&
                                typeof error.data === "object" &&
                                "message" in error.data
                                    ? String((error.data as { message?: string }).message)
                                    : undefined) || "Failed to save EMR"
                            }
                        />
                    )
                }
            >
                <FormGrid columns={2}>
                    {/* --- Основные поля EMR --- */}
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

                    <FormFieldWrapper label="Weight (kg)" required hint="Enter 20–300 kg" error={errors.weight}>
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

                    <FormFieldWrapper label="Child-Pugh Score" error={errors.childPughScore}>
                        <Input
                            type="text"
                            name="childPughScore"
                            placeholder="A/B/C"
                            value={form.childPughScore}
                            onChange={handleChange}
                        />
                    </FormFieldWrapper>

                    <FormFieldWrapper label="PLT" required hint="Enter 50–600 K/µL" error={errors.plt}>
                        <Input
                            type="number"
                            name="plt"
                            placeholder="Platelet count"
                            value={form.plt || ""}
                            onChange={handleChange}
                            required
                        />
                    </FormFieldWrapper>

                    <FormFieldWrapper label="WBC" required hint="Enter 3.5–10.0 ×10³/µL" error={errors.wbc}>
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

                    <FormFieldWrapper label="Sodium (mmol/L)" required hint="Enter 110–160 mmol/L" error={errors.sodium}>
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

                {/*  Чувствительность */}
                <FormFieldWrapper
                    label="Sensitivities"
                    hint="Example: Paracetamol, Tramadol, Ibuprofen"
                >
                    <Input
                        type="text"
                        name="sensitivities"
                        placeholder="Comma-separated (e.g. Paracetamol, Tramadol)"
                        value={(form.sensitivities ?? []).join(", ")}  // ← теперь это строка, а не массив
                        onChange={handleSensitivitiesChange}
                    />
                </FormFieldWrapper>

                {/*  Диагнозы с автоподбором по ICD */}
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
                                <li key={d.icdCode}>
                                    ✅ {d.description}{" "}
                                    <span className="text-gray-500">({d.icdCode})</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </FormFieldWrapper>
            </FormCard>
        <PageNavigation />

        </div>
    );
};

export default EMRFormRegister;