import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetPatientsQuery } from "../../api/api/apiNurseSlice.ts";
import {
    PageHeader,
    ActionCard,
    LoadingSpinner,
    Button,
} from "../ui";

const PatientList: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = location.state || {};

    const { data: patients, isLoading } = useGetPatientsQuery(queryParams);

    // Если загрузка
    if (isLoading)
        return (
            <div className="p-6">
                <LoadingSpinner message="Loading patients..." />
            </div>
        );

    // ⚠ Если список пуст
    if (!patients || patients.length === 0)
        return (
            <div className="p-6">
                <PageHeader title="Patient List" />
                <div className="flex justify-center mt-4">
                    <Button variant="default" onClick={() => navigate("/nurse")}>
                        Back to Dashboard
                    </Button>
                </div>
                <p className="text-center text-gray-500 mt-6">No patients found</p>
            </div>
        );

    //  Основной рендер
    return (
        <div className="p-6 space-y-6">
            <PageHeader
                title="Patient List"
                description={`Found ${patients.length} patient(s)`}
            />

            {/*  Кнопка возврата на главную панель */}
            <div className="flex justify-start mb-2">
                <Button variant="default" onClick={() => navigate("/nurse")}>
                    Back to Dashboard
                </Button>
            </div>

            {/*  Список пациентов в виде ActionCard */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patients.map((p) => (
                    <ActionCard
                        key={p.mrn}
                        title={`${p.firstName} ${p.lastName}`}
                        description={`MRN: ${p.mrn}\nPhone: ${p.phoneNumber || "N/A"}\nBirth: ${p.dateOfBirth || "N/A"}`}
                        icon="🧍"
                        onClick={() =>
                            navigate(`/nurse/patient/${p.mrn}`, { state: { patient: p } })
                        }
                        buttonText="Open Details"
                        buttonVariant={p.isActive ? "approve" : "reject"}
                    />
                ))}
            </div>
        </div>
    );
};

export default PatientList;