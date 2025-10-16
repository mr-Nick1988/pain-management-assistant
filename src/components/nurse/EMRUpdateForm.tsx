import React, {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {
    useUpdateEmrMutation,
    useGetIcdDiagnosesQuery,
} from "../../api/api/apiNurseSlice";
import type {EMR, EMRUpdate, Patient, Diagnosis} from "../../types/nurse";
import {validateEmr} from "../../utils/validationEmr.ts";
import {FormCard, FormGrid, FormFieldWrapper, Input} from "../ui";

const EMRUpdateForm: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // 🧩 Получаем данные пациента и его EMR из состояния маршрута
    const state = location.state as { patient: Patient; emrData: EMR } | undefined;

    // RTK mutation для обновления EMR
    const [updateEmr, {isLoading}] = useUpdateEmrMutation();

    // 🩺 Инициализация полей формы
    const [form, setForm] = useState<EMRUpdate>({
        height: state?.emrData?.height || 0,
        weight: state?.emrData?.weight || 0,
        gfr: state?.emrData?.gfr || "",
        childPughScore: state?.emrData?.childPughScore || "",
        plt: state?.emrData?.plt || 0,
        wbc: state?.emrData?.wbc || 0,
        sat: state?.emrData?.sat || 0,
        sodium: state?.emrData?.sodium || 0,
        sensitivities: state?.emrData?.sensitivities || [],
        diagnoses: state?.emrData?.diagnoses ?? [], // список диагнозов
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [searchTerm, setSearchTerm] = useState("");

    // 📡 RTK Query: поиск диагнозов ICD по введённой строке
    const {
        data: icdResults = [],
        isFetching,
    } = useGetIcdDiagnosesQuery(searchTerm, {
        skip: searchTerm.length < 2, // запрос выполняется, если 2+ символа
    });

    // Если компонент открыт без данных
    if (!state || !state.patient || !state.patient?.mrn) {
        return (
            <div className="p-6">
                <p className="text-center text-gray-500">No EMR data</p>
            </div>
        );
    }

    const {patient} = state;

    // ✏️ Универсальный обработчик обычных полей
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: ["height", "weight", "plt", "wbc", "sat", "sodium"].includes(name)
                ? Number(value)
                : value,
        }));
    };

    // 💊 Обработка списка чувствительностей (через запятую)
    const handleSensitivitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const arr = e.target.value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        setForm((prev) => ({...prev, sensitivities: arr}));
    };

    // ➕ Добавление диагноза из автоподбора
    const handleSelectDiagnosis = (diagnosis: Diagnosis) => {
        const prevList = form.diagnoses ?? [];
        if (!prevList.find((d) => d.icdCode === diagnosis.icdCode)) {
            setForm((prev) => ({
                ...prev,
                diagnoses: [...prevList, diagnosis],
            }));
        }
        setSearchTerm("");
    };

    // ❌ Удаление диагноза
    const handleRemoveDiagnosis = (code: string) => {
        const prevList = form.diagnoses ?? [];
        setForm((prev) => ({
            ...prev,
            diagnoses: prevList.filter((d) => d.icdCode !== code),
        }));
    };

    // 📤 Сабмит формы (валидация + обновление EMR)
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const validationErrors = validateEmr(form as EMR);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        try {
            await updateEmr({
                mrn: patient.mrn!,
                data: {
                    ...form,
                    // 👇 преобразуем только названия полей, если нужно
                    diagnoses: form.diagnoses?.map((d) => ({
                        icdCode: d.icdCode,
                        description: d.description,
                    })) ?? [],
                },
            }).unwrap();

            navigate(-1);
        } catch (error) {
            console.error("Failed to update EMR:", error);
            alert("Error updating EMR");
        }
    };

    // =======================
    // 🧱 JSX-разметка формы
    // =======================
    return (
        <div className="p-6">
            <FormCard
                title={`Update EMR for ${patient.firstName} ${patient.lastName}`}
                onSubmit={handleSubmit}
                onCancel={() => navigate(-1)}
                submitText="Save Changes"
                isLoading={isLoading}
            >
                {/* Основные клинические поля */}
                <FormGrid columns={2}>
                    <FormFieldWrapper label="Height (cm)" error={errors.height}>
                        <Input
                            type="number"
                            name="height"
                            value={form.height || ""}
                            onChange={handleChange}
                        />
                    </FormFieldWrapper>

                    <FormFieldWrapper label="Weight (kg)" error={errors.weight}>
                        <Input
                            type="number"
                            name="weight"
                            value={form.weight || ""}
                            onChange={handleChange}
                        />
                    </FormFieldWrapper>

                    <FormFieldWrapper label="GFR" hint="Enter A–E or 0–120" error={errors.gfr}>
                        <Input
                            type="text"
                            name="gfr"
                            value={form.gfr || ""}
                            onChange={handleChange}
                        />
                    </FormFieldWrapper>

                    <FormFieldWrapper
                        label="Child-Pugh Score"
                        hint="Enter A, B or C"
                        error={errors.childPughScore}
                    >
                        <Input
                            type="text"
                            name="childPughScore"
                            value={form.childPughScore || ""}
                            onChange={handleChange}
                        />
                    </FormFieldWrapper>

                    <FormFieldWrapper label="PLT" error={errors.plt}>
                        <Input
                            type="number"
                            name="plt"
                            value={form.plt || ""}
                            onChange={handleChange}
                        />
                    </FormFieldWrapper>

                    <FormFieldWrapper label="WBC" error={errors.wbc}>
                        <Input
                            type="number"
                            name="wbc"
                            value={form.wbc || ""}
                            onChange={handleChange}
                        />
                    </FormFieldWrapper>

                    <FormFieldWrapper label="SAT (%)" error={errors.sat}>
                        <Input
                            type="number"
                            name="sat"
                            value={form.sat || ""}
                            onChange={handleChange}
                        />
                    </FormFieldWrapper>

                    <FormFieldWrapper label="Sodium (mmol/L)" error={errors.sodium}>
                        <Input
                            type="number"
                            name="sodium"
                            value={form.sodium || ""}
                            onChange={handleChange}
                        />
                    </FormFieldWrapper>
                </FormGrid>

                {/* 💊 Sensitivities */}
                <FormFieldWrapper
                    label="Sensitivities"
                    hint="Optional: list allergies separated by commas"
                >
                    <Input
                        type="text"
                        name="sensitivities"
                        placeholder="e.g. PARACETAMOL, IBUPROFEN"
                        value={form.sensitivities?.join(", ") || ""}
                        onChange={handleSensitivitiesChange}
                    />
                </FormFieldWrapper>

                {/* 🧠 Diagnoses (ICD автоподбор) */}
                <FormFieldWrapper
                    label="Diagnoses"
                    hint="Search by disease name (2+ letters)..."
                >
                    <Input
                        type="text"
                        value={searchTerm}
                        placeholder="Type diagnosis..."
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />

                    {/* Индикатор загрузки */}
                    {isFetching && (
                        <p className="text-gray-400 text-sm mt-1">Searching...</p>
                    )}

                    {/* Список найденных диагнозов */}
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

                    {/* Выбранные диагнозы */}
                    {(form.diagnoses ?? []).length > 0 && (
                        <ul className="mt-3 text-sm">
                            {(form.diagnoses ?? []).map((d) => (
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
            </FormCard>
        </div>
    );
};

export default EMRUpdateForm;