import React, {useState} from "react";
import {useNavigate, useParams} from "react-router-dom";
import type {EMR} from "../../types/doctor";
import {useCreateEmrMutation} from "../../api/api/apiDoctorSlice";
import {Button, Card, CardContent, CardHeader, CardTitle, Input, Label} from "../ui";

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
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = e.target;
        setForm(prev => ({
            ...prev,
            [name]: e.target.type === "number" ? Number(value) : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!mrn) return;

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
