import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUpdateEmrMutation } from "../../api/api/apiDoctorSlice";
import type { EMR, EMRUpdate, Patient } from "../../types/doctor";
import {Button, Card, CardContent, CardHeader, CardTitle, Input, Label} from "../ui";

const EMRUpdateForm: React.FC = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const state = location.state as { patient: Patient; emrData: EMR } | undefined;

    // Хуки должны быть вызваны ДО любых условных return
    const [updateEmr, { isLoading }] = useUpdateEmrMutation();
    const [form, setForm] = useState<EMRUpdate>({
        height: state?.emrData?.height,
        weight: state?.emrData?.weight,
        gfr: state?.emrData?.gfr,
        childPughScore: state?.emrData?.childPughScore,
        plt: state?.emrData?.plt,
        wbc: state?.emrData?.wbc,
        sat: state?.emrData?.sat,
        sodium: state?.emrData?.sodium,
        sensitivities:state?.emrData?.sensitivities??[],
    });

    // Проверка после вызова хуков
    if (!state || !state.patient || !state.patient?.mrn) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="mb-4">No EMR data. Please navigate from the patient details page.</p>
                        <Button variant="update" onClick={() => navigate("/doctor")}>
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const { patient } = state;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: ["height", "weight", "plt", "wbc", "sat", "sodium"].includes(name)
                ? Number(value)
                : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await updateEmr({ mrn: patient.mrn!, data: form }).unwrap();
            navigate(-1);
        } catch (err) {
            console.error("Failed to update EMR:", err);
            alert("Error updating EMR");
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Update EMR for {patient.firstName} {patient.lastName}</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
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
                                />
                            </div>

                            <div>
                                <Label htmlFor="gfr">Glomerular Filtration Rate (GFR)</Label>
                                <Input
                                    id="gfr"
                                    type="text"
                                    name="gfr"
                                    placeholder="Enter GFR value (kidney function)"
                                    value={form.gfr || ""}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <Label htmlFor="childPughScore">Child-Pugh Score</Label>
                                <Input
                                    id="childPughScore"
                                    type="text"
                                    name="childPughScore"
                                    placeholder="Enter Child-Pugh score (liver function)"
                                    value={form.childPughScore || ""}
                                    onChange={handleChange}
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
                                />
                            </div>
                        </div>

                        <div className="flex space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => navigate(-1)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                variant="update"
                                disabled={isLoading}
                                className="flex-1"
                            >
                                {isLoading ? "Updating EMR..." : "Update EMR"}
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default EMRUpdateForm;
