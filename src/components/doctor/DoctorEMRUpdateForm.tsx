import React, {useState} from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {
    useUpdateEmrMutation,
    useGetIcdDiagnosesQuery,
} from "../../api/api/apiDoctorSlice";
import type {EMR, EMRUpdate, Patient, Diagnosis} from "../../types/doctor";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label, PageNavigation
} from "../ui";

import {validateEmr} from "../../utils/validationEmr";

const EMRUpdateForm: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as { patient: Patient; emrData: EMR } | undefined;

    const [updateEmr, {isLoading}] = useUpdateEmrMutation();

    const [form, setForm] = useState<EMRUpdate>({
        height: state?.emrData?.height,
        weight: state?.emrData?.weight,
        gfr: state?.emrData?.gfr,
        childPughScore: state?.emrData?.childPughScore,
        plt: state?.emrData?.plt,
        wbc: state?.emrData?.wbc,
        sat: state?.emrData?.sat,
        sodium: state?.emrData?.sodium,
        sensitivities: state?.emrData?.sensitivities ?? [],
        diagnoses: state?.emrData?.diagnoses ?? [],
    });

    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDiagnoses, setSelectedDiagnoses] = useState<Diagnosis[]>(
        state?.emrData?.diagnoses ?? []
    );
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [sensitivitiesInput, setSensitivitiesInput] = useState(
        state?.emrData?.sensitivities?.join(", ") || ""
    );

    const {data: icdResults = [], isFetching} = useGetIcdDiagnosesQuery(
        searchTerm,
        {skip: searchTerm.length < 2}
    );

    // Проверка: если нет данных
    if (!state || !state.patient || !state.patient.mrn) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="mb-4">
                            No EMR data. Please navigate from the patient details page.
                        </p>
                        <Button variant="outline" onClick={() => navigate("/doctor")}>
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const {patient} = state;

    // ===============================
    // 🔧 Обработчики
    // ===============================

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value, type} = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    const handleSensitivitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSensitivitiesInput(e.target.value);
    };

    const handleSensitivitiesBlur = () => {
        const items = sensitivitiesInput
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        setForm((prev) => ({...prev, sensitivities: items}));
    };

    const handleSelectDiagnosis = (diagnosis: Diagnosis) => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Ensure sensitivities are parsed before validation
        handleSensitivitiesBlur();

        const validationErrors = validateEmr(form as EMR);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        try {
            await updateEmr({mrn: patient.mrn!, data: form}).unwrap();
            navigate(-1);
        } catch (err) {
            console.error("Failed to update EMR:", err);
            alert("Error updating EMR");
        }
    };

    // ===============================
    // JSX
    // ===============================
    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>
                        Update EMR for {patient.firstName} {patient.lastName}
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Основные поля */}
                            {[
                                {id: "height", label: "Height (cm)", type: "number"},
                                {id: "weight", label: "Weight (kg)", type: "number"},
                                {id: "gfr", label: "Glomerular Filtration Rate (GFR)", type: "text"},
                                {id: "childPughScore", label: "Child-Pugh Score", type: "text"},
                                {id: "plt", label: "Platelet Count (PLT)", type: "number"},
                                {id: "wbc", label: "White Blood Cells (WBC)", type: "number"},
                                {id: "sat", label: "Oxygen Saturation (SpO₂)", type: "number"},
                                {id: "sodium", label: "Sodium Level (Na)", type: "number"},
                            ].map(({id, label, type}) => (
                                <div key={id}>
                                    <Label htmlFor={id}>{label}</Label>
                                    <Input
                                        id={id}
                                        name={id}
                                        type={type}
                                        placeholder={`Enter ${label.toLowerCase()}`}
                                        value={(form as Record<string, string | number | undefined>)[id] ?? ""}
                                        onChange={handleChange}
                                    />
                                    {errors[id] && (
                                        <p className="text-sm text-red-500 mt-1">{errors[id]}</p>
                                    )}
                                </div>
                            ))}

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
                                    value={sensitivitiesInput}
                                    onChange={handleSensitivitiesChange}
                                    onBlur={handleSensitivitiesBlur}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Separate multiple allergies with commas
                                </p>
                            </div>

                            {/* Diagnoses */}
                            <div className="space-y-2 col-span-2">
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
                                            <div
                                                className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900"></div>
                                        </div>
                                    )}
                                    {searchTerm.length >= 2 && icdResults.length > 0 && (
                                        <div
                                            className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                                            {icdResults.map((diagnosis) => (
                                                <div
                                                    key={diagnosis.icdCode}
                                                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                                    onClick={() => handleSelectDiagnosis(diagnosis)}
                                                >
                                                    {/* 💊 Код диагноза теперь в скобках */}
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

                                {/* Selected Diagnoses */}
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
                                {isLoading ? "Updating..." : "Update EMR"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
            <PageNavigation/>
        </div>
    );
};

export default EMRUpdateForm;