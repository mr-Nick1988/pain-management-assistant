import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
    useUpdateRecommendationMutation,
    useApproveRecommendationMutation,
} from "../../api/api/apiAnesthesiologistSlice";
import {
    Button,
    Card,
    CardHeader,
    CardContent,
    CardTitle,
    Input,
    Label,
    Textarea,
    LoadingSpinner,
    PageNavigation,
} from "../ui";
import {type RecommendationWithVas, type DrugRecommendation, RecommendationStatus} from "../../types/common/types";
import type { AnesthesiologistRecommendationUpdate } from "../../types/anesthesiologist";
import { useToast } from "../../contexts/ToastContext";

const AnesthesiologistRecommendationUpdateForm: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    // const { mrn } = useParams<{ mrn: string }>();
    const recWithVas = location.state as RecommendationWithVas | undefined;

    const [updateRecommendation, { isLoading: isUpdating }] = useUpdateRecommendationMutation();
    const [approveRecommendation, { isLoading: isApproving }] = useApproveRecommendationMutation();

    if (!recWithVas) {
        return (
            <div className="p-6 text-center">
                <p>No recommendation data. Please navigate from details view.</p>
                <Button variant="update" onClick={() => navigate("/anesthesiologist/escalations")}>
                    Back to Escalations
                </Button>
            </div>
        );
    }

    const { recommendation } = recWithVas;

    const [formData, setFormData] = useState<AnesthesiologistRecommendationUpdate>({
        drugs: recommendation.drugs || [],
        contraindications: recommendation.contraindications || [],
        comment: "",
    });

    const handleDrugChange = (index: number, field: keyof DrugRecommendation, value: string) => {
        const updated = [...(formData.drugs || [])];
        updated[index] = { ...updated[index], [field]: value };
        setFormData((prev) => ({ ...prev, drugs: updated }));
    };

    const handleSubmit = async () => {
        try {
            if (!recommendation.id) {
                toast.error("Recommendation ID is missing!");
                return;
            }

            // 1 Сначала обновляем
            await updateRecommendation({
                id: recommendation.id,
                dto: formData,
            }).unwrap();

            // 2 Затем аппрувим (ключ — recommendationId, а не id!)
            await approveRecommendation({
                recommendationId: recommendation.id,
                dto: {
                    status: RecommendationStatus.APPROVED,
                    comment: formData.comment,
                },
            }).unwrap();

            toast.success("Recommendation successfully updated and approved!");
            navigate("/anesthesiologist/escalations");
        } catch (error) {
            console.error("Failed to update or approve:", error);
            toast.error("Failed to update or approve recommendation.");
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Update & Approve Recommendation
            </h1>

            {/* Editable Drugs */}
            {(formData.drugs || []).map((drug, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle>Drug #{index + 1}</CardTitle>
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
                            <Input
                                value={drug.route}
                                onChange={(e) => handleDrugChange(index, "route", e.target.value)}
                            />
                        </div>
                        <div>
                            <Label>Role</Label>
                            <Input
                                value={drug.role}
                                onChange={(e) => handleDrugChange(index, "role", e.target.value)}
                            />
                        </div>
                    </CardContent>
                </Card>
            ))}

            {/* Comment Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Comment (required)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        rows={3}
                        value={formData.comment}
                        onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                        placeholder="Provide approval justification or notes..."
                    />
                </CardContent>
            </Card>

            {/* Submit */}
            <div className="flex space-x-3">
                <Button
                    variant="approve"
                    className="flex-1"
                    disabled={isUpdating || isApproving}
                    onClick={handleSubmit}
                >
                    {isUpdating || isApproving ? <LoadingSpinner /> : "✅ Save & Approve"}
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

export default AnesthesiologistRecommendationUpdateForm;