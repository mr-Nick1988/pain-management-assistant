import React, {useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {useCreateRecommendationAfterRejectionMutation,} from "../../api/api/apiAnesthesiologistSlice";
import {
    Button,
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    Input,
    Label,
    LoadingSpinner,
    PageNavigation,
    Textarea,
} from "../ui";
import {type DrugRecommendation, DrugRole, DrugRoute, type RecommendationWithVas} from "../../types/common/types";
import type {AnesthesiologistRecommendationCreate} from "../../types/anesthesiologist";
import {useToast} from "../../contexts/ToastContext";

const AnesthesiologistRecommendationCreateForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const { mrn } = useParams<{ mrn: string }>();
    const recWithVas = location.state as RecommendationWithVas | undefined;

    const [createRecommendation, { isLoading }] = useCreateRecommendationAfterRejectionMutation();

    // previousRecommendationId определяется автоматически
    const previousRecommendationId = recWithVas?.recommendation?.id ?? 0;
    const patientMrn = mrn || recWithVas?.patientMrn || recWithVas?.recommendation?.patientMrn || "—";

    // начальные пустые поля
    const [formData, setFormData] = useState<AnesthesiologistRecommendationCreate>({
        previousRecommendationId,
        patientMrn,
        regimenHierarchy: 1,
        drugs: [
            {
                drugName: "",
                activeMoiety: "",
                dosing: "",
                interval: "",
                route: DrugRoute.IM,
                role: DrugRole.MAIN,
            },
            {
                drugName: "",
                activeMoiety: "",
                dosing: "",
                interval: "",
                route: DrugRoute.PO,
                role: DrugRole.ALTERNATIVE,
            },
        ],
        contraindications: [],
        comments: [],
    });

    const handleDrugChange = (index: number, field: keyof DrugRecommendation, value: string) => {
        const updated = [...formData.drugs];
        updated[index] = { ...updated[index], [field]: value };
        setFormData((prev) => ({ ...prev, drugs: updated }));
    };

    const handleSubmit = async () => {
        try {
            await createRecommendation(formData).unwrap();
            toast.success("New recommendation successfully created!");
            navigate("/anesthesiologist/escalations");
        } catch (error) {
            console.error("Failed to create recommendation:", error);
            toast.error("Failed to create recommendation.");
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Create New Recommendation
            </h1>

            {/* Regimen Hierarchy */}
            <Card>
                <CardHeader>
                    <CardTitle>Therapy Line</CardTitle>
                </CardHeader>
                <CardContent>
                    <Label>Regimen Hierarchy</Label>
                    <Input
                        type="number"
                        value={formData.regimenHierarchy}
                        onChange={(e) =>
                            setFormData({ ...formData, regimenHierarchy: Number(e.target.value) })
                        }
                    />
                </CardContent>
            </Card>

            {/* Drugs (Main + Alternative) */}
            {formData.drugs.map((drug, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle>
                            {index === 0 ? "Main Drug" : "Alternative Drug"}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label>Drug Name</Label>
                            <Input
                                value={drug.drugName}
                                onChange={(e) => handleDrugChange(index, "drugName", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Active Moiety</Label>
                            <Input
                                value={drug.activeMoiety}
                                onChange={(e) => handleDrugChange(index, "activeMoiety", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Dosing</Label>
                            <Input
                                value={drug.dosing}
                                onChange={(e) => handleDrugChange(index, "dosing", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Interval</Label>
                            <Input
                                value={drug.interval}
                                onChange={(e) => handleDrugChange(index, "interval", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Route</Label>
                            <select
                                value={drug.route}
                                onChange={(e) => handleDrugChange(index, "route", e.target.value)}
                                className="border border-gray-300 rounded-md p-2 w-full bg-white text-gray-800 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
                            >
                                {Object.values(DrugRoute).map((routeValue) => (
                                    <option key={routeValue} value={routeValue}>
                                        {routeValue}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Input value={drug.role} disabled/>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Contraindications */}
            <Card>
                <CardHeader>
                    <CardTitle>Contraindications (optional)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="List contraindications separated by commas..."
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                contraindications: e.target.value
                                    .split(",")
                                    .map((c) => c.trim())
                                    .filter(Boolean),
                            })
                        }
                    />
                </CardContent>
            </Card>

            {/* Comments */}
            <Card>
                <CardHeader>
                    <CardTitle>Comments (optional)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="Add comments, separated by commas..."
                        onChange={(e) =>
                            setFormData({
                                ...formData,
                                comments: e.target.value
                                    .split(",")
                                    .map((c) => c.trim())
                                    .filter(Boolean),
                            })
                        }
                    />
                </CardContent>
            </Card>

            {/* Submit buttons */}
            <div className="flex space-x-3">
                <Button
                    variant="approve"
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={isLoading}
                >
                    {isLoading ? <LoadingSpinner /> : "✅ Create & Approve"}
                </Button>

                <Button
                    variant="update"
                    className="flex-1"
                    onClick={() => navigate(-1)}
                >
                    Cancel
                </Button>
            </div>

            <PageNavigation />
        </div>
    );
};

export default AnesthesiologistRecommendationCreateForm;