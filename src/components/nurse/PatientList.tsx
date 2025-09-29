import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useGetPatientsQuery } from "../../api/api/apiNurseSlice.ts";
import type { Patient } from "../../types/nurse";

const PatientList: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { firstName, lastName, email } = location.state || {};

    const { data: patients, isLoading, error } = useGetPatientsQuery();

    if (isLoading) return <p>Loading patients...</p>;
    if (error) return <p>Error loading patients</p>;

    let filteredPatients: Patient[] = patients || [];

    // Фильтрация по full name
    if (firstName || lastName) {
        filteredPatients = filteredPatients.filter(p =>
            (!firstName || p.firstName.toLowerCase().includes(firstName.toLowerCase())) &&
            (!lastName || p.lastName.toLowerCase().includes(lastName.toLowerCase()))
        );
    }

    // Фильтрация по email — заглушка
    if (email) {
        filteredPatients = filteredPatients.map(p => ({
            ...p,
            email: email // просто показываем заглушку
        }));
    }

    if (filteredPatients.length === 0) return <p>No patients found</p>;

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
                {filteredPatients.map((p) => (
                    <li
                        key={p.personId}
                        className="p-3 border rounded hover:bg-gray-100 cursor-pointer"
                        onClick={() => navigate(`/nurse/patient/${p.personId}`)}
                    >
                        <p className="font-semibold">{p.firstName} {p.lastName}</p>
                        <p className="text-sm text-gray-500">Person ID: {p.personId}</p>
                        <p className="text-sm text-gray-500">Email: {p.email || "N/A"}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default PatientList;
