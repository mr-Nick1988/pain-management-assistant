import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
    useGetEmrByPatientIdQuery,
    useDeletePatientMutation,
    useGetRecommendationByPatientIdQuery
} from "../../api/api/apiNurseSlice";
import type { Patient } from "../../types/nurse";
import { PageHeader, DataCard, InfoGrid, InfoItem, Button, LoadingSpinner, Modal, ModalHeader, ModalBody, ModalFooter } from "../ui";

const PatientDetails: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const patient = location.state as Patient;
    
    // All hooks must be called before any conditional returns
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [loadEmr, setLoadEmr] = useState(false);
    const [loadRecommendation, setLoadRecommendation] = useState(false);

    const { data: emrData, isFetching: emrLoading } = useGetEmrByPatientIdQuery(patient?.mrn || "", {
        skip: !loadEmr || !patient?.mrn,
    });

    const { data: recommendation, isFetching: recLoading, isError: recError } =
        useGetRecommendationByPatientIdQuery(patient?.mrn || "", { skip: !loadRecommendation || !patient?.mrn });

    const [deletePatient] = useDeletePatientMutation();

    if (!patient?.mrn) {
        return <div className="p-6"><p className="text-center text-gray-500">No patient data</p></div>;
    }

    const confirmDelete = async () => {
        await deletePatient(patient.mrn!);
        setIsDeleteModalOpen(false);
        navigate("/nurse");
    };

    return (
        <div className="p-6 space-y-6">
            <PageHeader title="Patient Details" />

            <DataCard title="Patient Information">
                <InfoGrid columns={2}>
                    <InfoItem label="MRN" value={patient.mrn} />
                    <InfoItem label="Name" value={`${patient.firstName} ${patient.lastName}`} />
                    <InfoItem label="Date of Birth" value={patient.dateOfBirth} />
                    <InfoItem label="Gender" value={patient.gender} />
                    <InfoItem 
                        label="Status" 
                        value={patient.isActive ? "In treatment" : "Not in treatment"}
                        valueClassName={patient.isActive ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}
                    />
                </InfoGrid>
            </DataCard>

            <DataCard 
                title="Electronic Medical Record (EMR)"
                actions={!loadEmr && <Button variant="default" onClick={() => setLoadEmr(true)}>Load EMR</Button>}
            >
                {loadEmr && (emrLoading ? (
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
                        {emrData.sensitivities?.length ? (
                            <div className="bg-yellow-50 p-4 rounded-lg">
                                <p className="font-semibold text-gray-800 mb-2">Sensitivities:</p>
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    {emrData.sensitivities.map((s: string, i: number) => (<li key={i}>{s}</li>))}
                                </ul>
                            </div>
                        ) : null}
                        <Button variant="update" onClick={() => navigate(`/nurse/emr-update/${patient.mrn}`, { state: { patient, emrData } })}>Update EMR</Button>
                    </div>
                ) : (
                    <Button variant="approve" onClick={() => navigate(`/nurse/emr-form/${patient.mrn}`, { state: patient })}>Create EMR</Button>
                ))}
            </DataCard>

            <DataCard 
                title="Pain Management Recommendation"
                actions={!loadRecommendation && <Button variant="default" onClick={() => setLoadRecommendation(true)}>Get Last Recommendation</Button>}
            >
                {loadRecommendation && (recLoading ? (
                    <LoadingSpinner message="Loading recommendation..." />
                ) : recError ? (
                    <p className="text-red-600">No recommendation found.</p>
                ) : recommendation ? (
                    <div className="space-y-4">
                        <InfoGrid columns={2}>
                            <InfoItem label="Status" value={recommendation.status} />
                            <InfoItem label="Regimen" value={recommendation.regimenHierarchy} />
                            <InfoItem label="Created At" value={recommendation.createdAt ?? "N/A"} />
                            <InfoItem label="Created By" value={recommendation.createdBy ?? "N/A"} />
                        </InfoGrid>
                        {recommendation.comments?.length ? (
                            <div className="bg-blue-50 p-4 rounded-lg">
                                <p className="font-semibold text-gray-800 mb-2">Comments:</p>
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    {recommendation.comments.map((c, i) => (<li key={i}>{c}</li>))}
                                </ul>
                            </div>
                        ) : null}
                        {recommendation.contraindications?.length ? (
                            <div className="bg-red-50 p-4 rounded-lg">
                                <p className="font-semibold text-gray-800 mb-2">Contraindications:</p>
                                <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                    {recommendation.contraindications.map((c, i) => (<li key={i}>{c}</li>))}
                                </ul>
                            </div>
                        ) : null}
                        {recommendation.drugs?.length ? (
                            <div>
                                <p className="font-semibold text-gray-800 mb-3">Drug Recommendations:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {recommendation.drugs.map((drug, i) => (
                                        <div key={i} className="border rounded-lg p-4 bg-gray-50">
                                            <p className="text-sm"><strong>Role:</strong> {drug.role}</p>
                                            <p className="text-sm"><strong>Drug:</strong> {drug.drugName}</p>
                                            <p className="text-sm"><strong>Active Moiety:</strong> {drug.activeMoiety}</p>
                                            <p className="text-sm"><strong>Dosing:</strong> {drug.dosing}</p>
                                            <p className="text-sm"><strong>Interval:</strong> {drug.interval}</p>
                                            <p className="text-sm"><strong>Route:</strong> {drug.route}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : null}
                    </div>
                ) : null)}
            </DataCard>

            <DataCard title="Patient Actions">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button variant="update" onClick={() => navigate(`/nurse/update-patient/${patient.mrn}`, { state: patient })}>Update Patient Data</Button>
                    <Button variant="delete" onClick={() => setIsDeleteModalOpen(true)}>Delete Patient</Button>
                </div>
            </DataCard>

            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)}>
                <ModalHeader>Confirm Delete</ModalHeader>
                <ModalBody>
                    <p>Are you sure you want to delete {patient.firstName} {patient.lastName}? This action cannot be undone.</p>
                </ModalBody>
                <ModalFooter>
                    <Button variant="cancel" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                    <Button variant="delete" onClick={confirmDelete}>Delete</Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default PatientDetails;