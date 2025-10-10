import React, {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import type {EMR} from "../../types/nurse";
import {useCreateEmrMutation} from "../../api/api/apiNurseSlice";
import {validateEmr} from "../../utils/validationEmr.ts";
import {FormCard, FormGrid, FormFieldWrapper, Input, ErrorMessage} from "../ui";

const EMRFormRegister: React.FC = () => {
    const navigate = useNavigate();
    const {mrn} = useParams<{ mrn: string }>();
    const [createEmr, {isLoading, error}] = useCreateEmrMutation();

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
        const {name, value, type} = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    //  обработчик для Sensitivities
    const handleSensitivitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target;
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
            await createEmr({mrn, data: form}).unwrap();
            navigate("/nurse");
        } catch (error: unknown) {
            console.error("Failed to create EMR:", error);
        }
    };


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
                                    ? String((error.data as any).message)
                                    : undefined) || "Failed to save EMR"
                            }
                        />
                    )
                }
            >
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

                    <FormFieldWrapper label="GFR" required hint="Enter A–E or 0–150 ml/min" error={errors.gfr}>
                        <Input
                            type="text"
                            name="gfr"
                            placeholder="Kidney function"
                            value={form.gfr}
                            onChange={handleChange}
                            required
                        />
                    </FormFieldWrapper>

                    <FormFieldWrapper label="Child-Pugh Score" required hint="Enter A, B or C"
                                      error={errors.childPughScore}>
                        <Input
                            type="text"
                            name="childPughScore"
                            placeholder="A/B/C"
                            value={form.childPughScore}
                            onChange={handleChange}
                            required
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

                    <FormFieldWrapper label="Sodium (mmol/L)" required hint="Enter 110–160 mmol/L"
                                      error={errors.sodium}>
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

                {/* ✅ NEW: Sensitivities */}
                <FormFieldWrapper label="Sensitivities" hint="Example: Paracetamol, Tramadol, Ibuprofen">
                    <Input
                        type="text"
                        name="sensitivities"
                        placeholder="Comma-separated (e.g. Paracetamol, Tramadol)"
                        onChange={handleSensitivitiesChange}
                    />
                </FormFieldWrapper>
            </FormCard>
        </div>
    );
}
export default EMRFormRegister;
