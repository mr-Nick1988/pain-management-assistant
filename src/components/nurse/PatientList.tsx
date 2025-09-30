import React from "react";
import {useLocation, useNavigate} from "react-router-dom";
import {useGetPatientsQuery} from "../../api/api/apiNurseSlice.ts";

const PatientList: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryParams = location.state || {};

    const {
        data: patients,
        isLoading,
    } = useGetPatientsQuery(queryParams);


    if (isLoading) return <p>Loading patients...</p>;
    if (!patients || patients.length === 0) return <p>No patients found</p>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Patient List</h1>
                <button
                    onClick={() => navigate("/nurse")}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Back to Dashboard
                </button>
            </div>

            <ul className="space-y-2">
                {patients.map((p) => (
                    <li
                        key={p.mrn}
                        className="p-3 border rounded hover:bg-gray-100 cursor-pointer"
                        onClick={() => navigate(`/nurse/patient/${p.mrn}`,{state:p})}
                    >
                        <p className="text-sm text-gray-500">MRN: {p.mrn}</p>
                        <p className="font-semibold">{p.firstName} {p.lastName}</p>
                        <p className="text-sm text-gray-500">Birth Date: {p.dateOfBirth}</p>
                        <p className="text-sm text-gray-500">Phone Number: {p.phoneNumber}</p>
                        <p className="text-sm text-gray-500">
                            Active: {p.isActive ? "Yes" : "No"}
                        </p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PatientList;
