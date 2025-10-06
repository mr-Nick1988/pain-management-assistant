import React, {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import type {EMR} from "../../types/doctor";
import {useCreateEmrMutation} from "../../api/api/apiDoctorSlice";
import {Button, Card, CardContent, CardHeader, CardTitle, Input, Label} from "../ui";
import {validateEmr} from "../../utils/validationEmr";

const EMRFormRegister: React.FC = () => {
    const navigate = useNavigate();
    const {mrn} = useParams<{ mrn: string }>();
    const [createEmr, {isLoading, error}] = useCreateEmrMutation();

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

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setForm(prev => ({
            ...prev,
            [name]: e.target.type === "number" ? Number(value) : value,
        }));
    };

    const handleSensitivitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {value} = e.target;
        const items = value
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        setForm((prev) => ({
            ...prev,
            sensitivities: items,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mrn) return;

        // Валидация формы
        const validationErrors = validateEmr(form);
        setErrors(validationErrors);
        if (Object.keys(validationErrors).length > 0) return;

        try {
            await createEmr({mrn, data: form}).unwrap();
            navigate("/doctor");
        } catch (err) {
            console.error("Error creating EMR:", err);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Create Electronic Medical Record (EMR)</CardTitle>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="height">Height (cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    name="height"
                                    placeholder="Enter patient's height in centimeters"
                                    value={form.height || ""}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.height && <p className="text-sm text-red-500 mt-1">{errors.height}</p>}
                            </div>

                            <div>
                                <Label htmlFor="weight">Weight (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    name="weight"
                                    placeholder="Enter patient's weight in kilograms"
                                    value={form.weight || ""}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.weight && <p className="text-sm text-red-500 mt-1">{errors.weight}</p>}
                            </div>

                            <div>
                                <Label htmlFor="gfr">Glomerular Filtration Rate (GFR)</Label>
                                <Input
                                    id="gfr"
                                    type="text"
                                    name="gfr"
                                    placeholder="Enter GFR value (kidney function)"
                                    value={form.gfr}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.gfr && <p className="text-sm text-red-500 mt-1">{errors.gfr}</p>}
                            </div>

                            <div>
                                <Label htmlFor="childPughScore">Child-Pugh Score</Label>
                                <Input
                                    id="childPughScore"
                                    type="text"
                                    name="childPughScore"
                                    placeholder="Enter Child-Pugh score (liver function)"
                                    value={form.childPughScore}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.childPughScore && <p className="text-sm text-red-500 mt-1">{errors.childPughScore}</p>}
                            </div>

                            <div>
                                <Label htmlFor="plt">Platelet Count (PLT)</Label>
                                <Input
                                    id="plt"
                                    type="number"
                                    name="plt"
                                    placeholder="Enter platelet count (×10⁹/L)"
                                    value={form.plt || ""}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.plt && <p className="text-sm text-red-500 mt-1">{errors.plt}</p>}
                            </div>

                            <div>
                                <Label htmlFor="wbc">White Blood Cells (WBC)</Label>
                                <Input
                                    id="wbc"
                                    type="number"
                                    name="wbc"
                                    placeholder="Enter WBC count (×10⁹/L)"
                                    value={form.wbc || ""}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.wbc && <p className="text-sm text-red-500 mt-1">{errors.wbc}</p>}
                            </div>

                            <div>
                                <Label htmlFor="sat">Oxygen Saturation (SpO₂)</Label>
                                <Input
                                    id="sat"
                                    type="number"
                                    name="sat"
                                    placeholder="Enter oxygen saturation (%)"
                                    value={form.sat || ""}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.sat && <p className="text-sm text-red-500 mt-1">{errors.sat}</p>}
                            </div>

                            <div>
                                <Label htmlFor="sodium">Sodium Level (Na)</Label>
                                <Input
                                    id="sodium"
                                    type="number"
                                    name="sodium"
                                    placeholder="Enter sodium level (mmol/L)"
                                    value={form.sodium || ""}
                                    onChange={handleChange}
                                    required
                                />
                                {errors.sodium && <p className="text-sm text-red-500 mt-1">{errors.sodium}</p>}
                            </div>

                            <div className="md:col-span-2">
                                <Label htmlFor="sensitivities">Drug Sensitivities / Allergies</Label>
                                <Input
                                    id="sensitivities"
                                    type="text"
                                    name="sensitivities"
                                    placeholder="Enter drug allergies separated by commas (e.g., Paracetamol, Ibuprofen)"
                                    value={form.sensitivities?.join(", ") || ""}
                                    onChange={handleSensitivitiesChange}
                                />
                                <p className="text-xs text-gray-500 mt-1">Separate multiple allergies with commas</p>
                            </div>
                        </div>

                        <div className="flex space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate("/doctor")}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="approve"
                                disabled={isLoading}
                                className="flex-1"
                            >
                                {isLoading ? "Saving EMR..." : "Save EMR & Return to Dashboard"}
                            </Button>
                        </div>

                        {error && (
                            <p className="text-sm text-red-500 text-center">
                                {("data" in error && typeof error.data === "object" && error.data && "message" in error.data
                                    ? String(error.data.message)
                                    : "Error saving EMR")}
                            </p>
                        )}
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EMRFormRegister;
