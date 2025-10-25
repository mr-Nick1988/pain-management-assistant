import React, {useState} from "react";
import {useLocation, useNavigate, useParams} from "react-router-dom";
import {
    useGetEmrByPatientIdQuery,
    useGetRecommendationByPatientIdQuery,
    useDeletePatientMutation,
    useGetPatientByMrnQuery,
    useGetLastVasByPatientIdQuery,
} from "../../api/api/apiNurseSlice";
import type {Patient} from "../../types/nurse";
import type {Diagnosis} from "../../types/common/types.ts";
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
    PageNavigation,
} from "../ui";

const PatientDetails: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {mrn} = useParams<{ mrn: string }>();

    const cachedPatient = location.state?.patient || null;

    const {
        data: patientData,
        isLoading: isLoadingPatient,
        isError: isErrorPatient,
    } = useGetPatientByMrnQuery(mrn || "", {skip: !mrn});

    const patient: Patient = patientData || cachedPatient;
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loadEmr, setLoadEmr] = useState(false);
    const [showRecommendation, setShowRecommendation] = useState(false);

    // Автоматически подгружаем EMR, VAS и последнюю рекомендацию
    const {data: emrData, isFetching: emrLoading} = useGetEmrByPatientIdQuery(
        patient?.mrn || "",
        {skip: !loadEmr || !patient?.mrn}
    );

    const { data: lastVas, isLoading: isVasLoading } =
        useGetLastVasByPatientIdQuery(patient.mrn ?? "", { skip: !patient?.mrn });

    const { data: lastRecommendation, isLoading: isRecLoading, isError: isRecError } =
        useGetRecommendationByPatientIdQuery(patient?.mrn || "", {
            skip: !patient?.mrn,
            refetchOnMountOrArgChange: true,
        });

    const [deletePatient] = useDeletePatientMutation();

    // Проверка статуса рекомендации
    const isRecommendationPending = lastRecommendation?.status === "PENDING";

    // Удаление пациента
    const confirmDelete = async () => {
        await deletePatient(patient.mrn!);
        setIsDeleteModalOpen(false);
        navigate("/nurse");
    };

    // Логика жалобы
    const handlePainComplaint = () => {
        if (isVasLoading || isRecLoading) return;

        // Если есть рекомендация и она PENDING — запрет на новую жалобу
        if (isRecommendationPending) {
            alert("You cannot register a new pain complaint until the current recommendation is approved.");
            return;
        }

        //  Если есть незакрытая жалоба — переходим в GenerateRecommendationForm
        if (lastVas && lastVas.resolved === false) {
            navigate(`/nurse/recommendation/${patient.mrn}`, {
                state: { patient, vasData: lastVas },
            });
        } else {
            //  Иначе открываем новую форму регистрации
            navigate(`/nurse/vas-form/${patient.mrn}`, { state: patient });
        }
    };

    // Кнопка блокируется только если последняя рекомендация существует
    // и у неё статус не EXECUTED
    const isRecommendationLocked =
        lastRecommendation && lastRecommendation.status !== "EXECUTED";
    const isRecommendationExecuted = lastRecommendation?.status === "EXECUTED";
    const isRecommendationApproved = lastRecommendation?.status === "APPROVED";

    if (isLoadingPatient && !patient)
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <LoadingSpinner message="Loading patient data..."/>
                </div>
            </div>
        );

    if (isErrorPatient || !patient)
        return (
            <div className="p-6">
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
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
        );

    return (
        <div className="p-6 space-y-6">
            <PageHeader title="Patient Details"/>

            {/* Patient Info */}
            <DataCard title="Patient Information">
                <InfoGrid columns={2}>
                    <InfoItem label="MRN" value={patient.mrn}/>
                    <InfoItem label="Name" value={`${patient.firstName} ${patient.lastName}`}/>
                    <InfoItem label="Date of Birth" value={patient.dateOfBirth}/>
                    <InfoItem label="Gender" value={patient.gender}/>
                    <InfoItem label="Insurance Policy Number" value={patient.insurancePolicyNumber}/>
                    <InfoItem label="Phone number" value={patient.phoneNumber}/>
                    <InfoItem label="Email" value={patient.email ?? "N/A"}/>
                    <InfoItem label="Address" value={patient.address ?? "N/A"}/>
                    <InfoItem label="Additional Info" value={patient.additionalInfo ?? "N/A"}/>
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

            {/*  EMR */}
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
                {loadEmr ? (
                    emrLoading ? (
                        <LoadingSpinner message="Loading EMR..." />
                    ) : emrData ? (
                        <div className="space-y-4">
                            <InfoGrid columns={4}>
                                <InfoItem label="Height" value={`${emrData.height ?? "N/A"} cm`} />
                                <InfoItem label="Weight" value={`${emrData.weight ?? "N/A"} kg`} />
                                <InfoItem label="GFR" value={`${emrData.gfr ?? "N/A"} ml/min`} />
                                <InfoItem label="Child-Pugh" value={emrData.childPughScore ?? "N/A"} />
                                <InfoItem label="PLT" value={`${emrData.plt ?? "N/A"} K/µL`} />
                                <InfoItem label="WBC" value={`${emrData.wbc ?? "N/A"} 10³/µL`} />
                                <InfoItem label="SAT" value={`${emrData.sat ?? "N/A"}%`} />
                                <InfoItem label="Sodium" value={`${emrData.sodium ?? "N/A"} mEq/L`} />
                            </InfoGrid>

                            {/* Diagnoses */}
                            {emrData.diagnoses?.length ? (
                                <div className="bg-yellow-50 p-4 rounded-lg">
                                    <p className="font-semibold text-gray-800 mb-2">Diagnoses:</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        {emrData.diagnoses.map((d: Diagnosis, i: number) => (
                                            <li key={i}>
                                                {d.description} - {d.icdCode}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No diagnoses recorded.</p>
                            )}

                            {/* Sensitivities */}
                            {emrData.sensitivities?.length ? (
                                <div className="bg-green-50 p-4 rounded-lg">
                                    <p className="font-semibold text-gray-800 mb-2">Sensitivities (Allergies):</p>
                                    <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                        {emrData.sensitivities.map((s: string, i: number) => (
                                            <li key={i}>{s}</li>
                                        ))}
                                    </ul>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No sensitivities recorded.</p>
                            )}

                            {/*  Кнопка Update EMR */}
                            <div className="pt-2">
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
                    )
                ) : null}
            </DataCard>

            {/* Recommendation */}
            <DataCard
                title="Pain Management Recommendation"
                actions={
                    <div className="flex gap-2">
                        {!showRecommendation && (
                            <Button variant="default" onClick={() => setShowRecommendation(true)}>
                                Show Last Recommendation
                            </Button>
                        )}

                        {lastRecommendation && (
                            <Button
                                variant="approve"
                                onClick={() =>
                                    navigate(`/nurse/recommendation-details/${patient.mrn}`, {
                                        state: { patient },
                                    })
                                }
                            >
                                View Full Recommendation
                            </Button>
                        )}
                    </div>
                }
            >
                {showRecommendation && (
                    <>
                        {isRecLoading ? (
                            <LoadingSpinner message="Loading recommendation..." />
                        ) : isRecError ? (
                            <p className="text-red-600">Error loading recommendation.</p>
                        ) : lastRecommendation ? (
                            <div className="space-y-4">
                                <InfoGrid columns={2}>
                                    <InfoItem label="Status" value={lastRecommendation.status} />
                                    <InfoItem label="Regimen" value={lastRecommendation.regimenHierarchy} />
                                    <InfoItem label="Created At" value={lastRecommendation.createdAt ?? "N/A"} />
                                    <InfoItem label="Created By" value={lastRecommendation.createdBy ?? "N/A"} />
                                </InfoGrid>

                                {lastRecommendation.comments?.length ? (
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <p className="font-semibold text-gray-800 mb-2">Comments:</p>
                                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                            {lastRecommendation.comments.map((c, i) => (
                                                <li key={i}>{c}</li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-500 italic">No comments.</p>
                                )}
                            </div>
                        ) : (
                            //  этот блок добавлен — fallback
                            <p className="text-sm text-gray-500 italic">
                                No recommendation found for this patient.
                            </p>
                        )}
                    </>
                )}
            </DataCard>

            {/*  Actions */}
            <DataCard title="Patient Actions">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Button
                        variant="approve"
                        onClick={handlePainComplaint}
                        disabled={isRecommendationLocked}
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
                    <Button variant="default" onClick={() => navigate("/nurse")}>
                        Back to Dashboard
                    </Button>
                </div>

                {/*  Предупреждение о незакрытой жалобе */}
                {lastVas && !lastVas.resolved && (
                    <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                        <p className="text-sm text-yellow-700 font-medium">
                            There is an unresolved pain complaint for this patient.
                        </p>
                        <p className="text-xs text-yellow-600 mt-1">
                            Pain level: <strong>{lastVas.painLevel}</strong> /10
                            {lastVas.painPlace && ` • Location: ${lastVas.painPlace}`}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Created on: {new Date(lastVas.createdAt).toLocaleString()}
                        </p>
                    </div>
                )}

                {/*  Предупреждение о блокировке (PENDING) */}
                {isRecommendationPending && (
                    <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
                        <p className="text-sm text-yellow-700 font-medium">
                            Recommendation is not yet approved — new pain complaints are temporarily disabled.
                        </p>
                    </div>
                )}

                {/*  Уведомление о готовности к выдаче лекарства (APPROVED) */}
                {isRecommendationApproved && (
                    <div className="mt-4 bg-green-50 border-l-4 border-green-400 p-4 rounded-md">
                        <p className="text-sm text-green-700 font-medium">
                            The recommendation has been approved by the doctor.
                        </p>
                        <p className="text-xs text-green-600 mt-1">
                            Please review the recommendation and administer the prescribed medication.
                        </p>
                        <p className="text-xs text-gray-500 mt-1 italic">
                            You can open it via “View Full Recommendation”.
                        </p>
                    </div>
                )}

                {/*  Информационное уведомление (EXECUTED) */}
                {isRecommendationExecuted && (
                    <div className="mt-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-md">
                        <p className="text-sm text-blue-700 font-medium">
                            The medication has been administered successfully.
                        </p>
                        <p className="text-xs text-blue-600 mt-1 italic">
                            You can now register a new pain complaint if needed.
                        </p>
                    </div>
                )}
            </DataCard>

            {/* Delete Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <ModalHeader>Confirm Delete</ModalHeader>
                <ModalBody>
                    <p>
                        Are you sure you want to delete {patient.firstName} {patient.lastName}? This action
                        cannot be undone.
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

            <PageNavigation/>
        </div>
    );
};

export default PatientDetails;