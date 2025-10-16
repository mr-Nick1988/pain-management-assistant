import React, { useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    useGetEmrByPatientIdQuery,
    useDeletePatientMutation,
    useGetPatientByMrnQuery,
} from "../../api/api/apiNurseSlice";

import { XCircleIcon } from "@heroicons/react/24/outline";
import {
    PageHeader,
    DataCard,
    InfoGrid,
    InfoItem,
    Button,
    LoadingSpinner,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
} from "../ui";
import type {Diagnosis} from "../../types/common/types.ts";

const PatientDetails: React.FC = () => {
    const { mrn } = useParams<{ mrn: string }>();
    const location = useLocation();
    const navigate = useNavigate();

    // 🔹 Поддерживаем устойчивость: берем либо из state, либо загружаем по MRN
    const cachedPatient = location.state?.patient || null;

    const {
        data: patientData,
        isLoading: isLoadingPatient,
        isError: isErrorPatient,
    } = useGetPatientByMrnQuery(mrn || "", { skip: !mrn });

    const patient = patientData || cachedPatient;

    // 🔹 Дополнительные состояния
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loadEmr, setLoadEmr] = useState(false);
    const [deletePatient] = useDeletePatientMutation();

    // 🔹 EMR загрузка (по кнопке)
    const { data: emrData, isFetching: emrLoading } = useGetEmrByPatientIdQuery(
        patient?.mrn || "",
        { skip: !loadEmr || !patient?.mrn }
    );

    // 🔹 Обработка удаления
    const confirmDelete = async () => {
        await deletePatient(patient!.mrn!);
        setIsDeleteModalOpen(false);
        navigate("/nurse");
    };

    // 🔹 Состояния загрузки и ошибок
    if (isLoadingPatient && !patient)
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner message="Loading patient data..." />
                </div>
            </div>
        );

    if (isErrorPatient || !patient)
        return (
            <div className="p-6">
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <XCircleIcon className="h-5 w-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-red-700">
                                No patient data available. Please return to the Dashboard.
                            </p>
                            <div className="mt-4">
                                <Button variant="default" onClick={() => navigate("/nurse")}>
                                    Back to Dashboard
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );

    // ✅ Основной рендер
    return (
        <div className="p-6 space-y-6">
            <PageHeader title="Patient Details" />

            {/* 👤 Основная информация */}
            <DataCard title="Patient Information">
                <InfoGrid columns={2}>
                    <InfoItem label="MRN" value={patient.mrn} />
                    <InfoItem label="Name" value={`${patient.firstName} ${patient.lastName}`} />
                    <InfoItem label="Gender" value={patient.gender || "N/A"} />
                    <InfoItem label="Date of Birth" value={patient.dateOfBirth || "N/A"} />
                    <InfoItem label="Phone" value={patient.phoneNumber || "N/A"} />
                    <InfoItem label="Email" value={patient.email || "N/A"} />
                    <InfoItem label="Address" value={patient.address || "N/A"} />
                    <InfoItem label="Insurance Number" value={patient.insurancePolicyNumber || "N/A"} />

                    <InfoItem
                        label="Status"
                        value={patient.isActive ? "In treatment" : "Not in treatment"}
                        valueClassName={
                            patient.isActive
                                ? "text-green-600 font-semibold"
                                : "text-red-600 font-semibold"
                        }
                    />
                </InfoGrid>
            </DataCard>

            {/* 🧬 EMR */}
            <DataCard
                title="Electronic Medical Record (EMR)"
                actions={
                    !loadEmr && (
                        <Button variant="default" onClick={() => setLoadEmr(true)}>
                            Load EMR
                        </Button>
                    )
                }
            >
                {loadEmr &&
                    (emrLoading ? (
                        <LoadingSpinner message="Loading EMR..." />
                    ) : emrData ? (
                        <div className="space-y-4">
                            <InfoGrid columns={4}>
                                <InfoItem label="Height" value={`${emrData.height ?? "N/A"} cm`} />
                                <InfoItem label="Weight" value={`${emrData.weight ?? "N/A"} kg`} />
                                <InfoItem label="GFR" value={emrData.gfr ?? "N/A"} />
                                <InfoItem label="Child-Pugh" value={emrData.childPughScore ?? "N/A"} />
                                <InfoItem label="PLT" value={emrData.plt ?? "N/A"} />
                                <InfoItem label="WBC" value={emrData.wbc ?? "N/A"} />
                                <InfoItem label="SAT" value={`${emrData.sat ?? "N/A"}%`} />
                                <InfoItem label="Sodium" value={emrData.sodium ?? "N/A"} />
                            </InfoGrid>
                            {emrData.diagnoses?.length ? (
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <p className="font-semibold text-gray-800 mb-2">Diagnoses:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        {emrData.diagnoses.map((d: Diagnosis, i: number) => (
                                            <li key={i}>{d.description} -  {d.icdCode}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No diagnoses recorded.</p>
                            )}

                            {emrData.sensitivities?.length ? (
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <p className="font-semibold text-gray-800 mb-2">Sensitivities:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        {emrData.sensitivities.map((s: string, i: number) => (
                                            <li key={i}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No sensitivities recorded.</p>
                            )}

                            <Button
                                variant="update"
                                onClick={() =>
                                    navigate(`/nurse/emr-update/${patient.mrn}`, {
                                        state: { patient, emrData },
                                    })
                                }
                            >
                                Update EMR
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="approve"
                            onClick={() =>
                                navigate(`/nurse/emr-form/${patient.mrn}`, { state: patient })
                            }
                        >
                            Create EMR
                        </Button>
                    ))}
            </DataCard>

            {/* 💊 Recommendation */}
            <DataCard title="Pain Management Recommendation">
                <Button
                    variant="default"
                    onClick={() =>
                        navigate(`/nurse/recommendation-details/${patient.mrn}`, {
                            state: { patient },
                        })
                    }
                >
                    View Last Recommendation
                </Button>
            </DataCard>

            {/* ⚙️ Кнопки действий */}
            <DataCard title="Patient Actions">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                        variant="approve"
                        onClick={() =>
                            navigate(`/nurse/vas-form/${patient.mrn}`, { state: patient })
                        }
                    >
                        Register Pain Complaint
                    </Button>
                    <Button
                        variant="update"
                        onClick={() =>
                            navigate(`/nurse/update-patient/${patient.mrn}`, { state: patient })
                        }
                    >
                        Update Patient Data
                    </Button>
                    <Button variant="delete" onClick={() => setIsDeleteModalOpen(true)}>
                        Delete Patient
                    </Button>
                </div>
            </DataCard>

            {/* 🗑️ Модалка удаления */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <ModalHeader>Confirm Delete</ModalHeader>
                <ModalBody>
                    <p>
                        Are you sure you want to delete {patient.firstName} {patient.lastName}? This
                        action cannot be undone.
                    </p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="cancel" onClick={() => setIsDeleteModalOpen(false)}>
                        Cancel
                    </Button>
                    <Button variant="delete" onClick={confirmDelete}>
                        Delete
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default PatientDetails;

//Добавить кнопку back to main board - NurseDashboard