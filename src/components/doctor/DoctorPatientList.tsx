import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {useLazyGetPatientByMrnQuery} from "../../api/api/apiDoctorSlice.ts";

const PatientList: React.FC = () => {
    const navigate = useNavigate();
    const [mrn, setMrn] = useState("");
    const [fetchPatient, {data: patients, isLoading}] = useLazyGetPatientByMrnQuery();

    const handleSearch = async () => {
        if (mrn.trim()) {
            const result = await fetchPatient(mrn.trim());
            if (result.data) {
                navigate(`/doctor/patient/${mrn.trim()}`, {state: result.data});
            }
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Patient List</h1>
                <button
                    onClick={() => navigate("/doctor")}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Back to Dashboard
                </button>
            </div>

            <div className="mb-4 flex space-x-2">
                <input
                    type="text"
                    placeholder="Enter MRN to search"
                    value={mrn}
                    onChange={(e) => setMrn(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2"
                />
                <button
                    onClick={handleSearch}
                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                    disabled={!mrn || isLoading}
                >
                    {isLoading ? "Searching..." : "Search"}
                </button>
            </div>

            {patients && (
                <div className="p-3 border rounded hover:bg-gray-100 cursor-pointer"
                     onClick={() => navigate(`/doctor/patient/${patients.mrn}`, {state: patients})}>
                    <p className="text-sm text-gray-500">MRN: {patients.mrn}</p>
                    <p className="font-semibold">{patients.firstName} {patients.lastName}</p>
                    <p className="text-sm text-gray-500">Birth Date: {patients.dateOfBirth}</p>
                    <p className="text-sm text-gray-500">Phone: {patients.phoneNumber}</p>
                    <p className="text-sm text-gray-500">Active: {patients.isActive ? "Yes" : "No"}</p>
                </div>
            )}
        </div>
    );
};

export default PatientList;
