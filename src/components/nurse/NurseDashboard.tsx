import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useGetPatientByIdQuery } from "../../api/api/apiNurseSlice.ts";

const NurseDashboard: React.FC = () => {
    const navigate = useNavigate();
    const [personId, setPersonId] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState(""); // Заглушка
    // RTK Query хук для поиска по ID
    const { data: patientById, isError, error } = useGetPatientByIdQuery(personId, { skip: !personId });



    const handleRegisterPatient = () => {
        navigate("/nurse/register-patient");
    };

    const handleFindById = () => {
        if (patientById) {
            navigate(`/nurse/patient/${personId.trim()}`, { state: patientById });
        }
        // Ошибка будет отображена через условный рендеринг ниже
    };

    const handleFindByFullName = () => {
        navigate("/nurse/patients", { state: { firstName, lastName } });
    };

    const handleFindByEmail = () => {
        alert("Поиск по e-mail пока не реализован");
        navigate("/nurse/patients", { state: { email } });
    };

    const handleGetAllPatients = () => {
        navigate("/nurse/patients");
    };

    return (
        <div>
            <h2 className="text-xl font-bold mb-4">Nurse Dashboard</h2>

            <button
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 mb-4"
                onClick={handleRegisterPatient}
            >
                Register New Patient
            </button>

            <div className="flex space-x-2 items-center mb-4">
                <input
                    type="text"
                    placeholder="Enter Person ID"
                    value={personId}
                    onChange={(e) => setPersonId(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                    className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                    onClick={handleFindById}
                >
                    Find by ID
                </button>
            </div>

            {isError && (
                <p className="text-red-500 mb-4">
                    {(error as any)?.data?.message || "Patient not found"}
                </p>
            )}

            <div className="flex space-x-2 mb-4">
                <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                    className="bg-yellow-500 text-white py-2 px-4 rounded hover:bg-yellow-600"
                    onClick={handleFindByFullName}
                >
                    Find by Full Name
                </button>
            </div>

            <div>
                <input
                    type="email"
                    placeholder="Enter email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <button
                    className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600 mb-4"
                    onClick={handleFindByEmail}
                >
                    Find Patients by Email (Placeholder)
                </button>
            </div>

            <button
                className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                onClick={handleGetAllPatients}
            >
                Get All Patients
            </button>
        </div>
    );
};

export default NurseDashboard;