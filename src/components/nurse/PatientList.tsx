import React from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useGetPatientsQuery} from "../../api/api/apiNurseSlice.ts";
import { PageHeader, DataCard, InfoGrid, InfoItem, LoadingSpinner } from "../ui";

const PatientList: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = location.state || {};

    const {
        data: patients,
        isLoading,
    } = useGetPatientsQuery(queryParams);


    if (isLoading) return <div className="p-6"><LoadingSpinner message="Loading patients..." /></div>;
    if (!patients || patients.length === 0) return <div className="p-6"><p className="text-center text-gray-500">No patients found</p></div>;

    return (
        <div className="p-6 space-y-6">
            <PageHeader 
                title="Patient List" 
                description={`Found ${patients.length} patient(s)`}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patients.map((p) => (
                    <DataCard
                        key={p.mrn}
                        title={`${p.firstName} ${p.lastName}`}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                    >
                        <div onClick={() => navigate(`/nurse/patient/${p.mrn}`, { state: { patient: p } })}>
                            <InfoGrid columns={1}>
                                <InfoItem label="MRN" value={p.mrn} />
                                <InfoItem label="Birth Date" value={p.dateOfBirth} />
                                <InfoItem label="Phone" value={p.phoneNumber} />
                                <InfoItem 
                                    label="Status" 
                                    value={p.isActive ? "Active" : "Inactive"}
                                    valueClassName={p.isActive ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}
                                />
                            </InfoGrid>
                        </div>
                    </DataCard>
                ))}
            </div>
        </div>
    );
};

export default PatientList;
