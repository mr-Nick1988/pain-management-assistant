import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {getErrorMessage} from "../../utils/getErrorMessageHelper";
import {
    useLazyGetPatientByMrnQuery,
    useLazyGetPatientByEmailQuery,
    useLazyGetPatientByPhoneNumberQuery
} from "../../api/api/apiNurseSlice.ts";

interface PatientSearchParams {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    isActive?: boolean;
}

const NurseDashboard: React.FC = () => {
    const navigate = useNavigate();

    const [mrn, setMrn] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [birthDate, setBirthDate] = useState("");

    // Lazy queries
    const [fetchPatientByMrn, {  isError: isMrnError, error: mrnError }] = useLazyGetPatientByMrnQuery();
    const [fetchPatientByEmail, {  isError: isEmailError, error: emailError }] = useLazyGetPatientByEmailQuery();
    const [fetchPatientByPhone, { isError: isPhoneError, error: phoneError }] = useLazyGetPatientByPhoneNumberQuery();

    // Общий поиск
    const handleFindPatients = (params?: PatientSearchParams) => {
        navigate("/nurse/patients", { state: params });
    };

    // Поиск по MRN
    const handleFindByMRN = async () => {
        const result = await fetchPatientByMrn(mrn.trim());
        if (result.data) {
            navigate(`/nurse/patient/${mrn.trim()}`, { state: result.data });
        }
    };

    // Поиск по Email
    const handleFindByEmail = async () => {
        const result = await fetchPatientByEmail(email.trim());
        if (result.data) {
            navigate(`/nurse/patient/${email.trim()}`, { state: result.data });
        }
    };

    // Поиск по Phone Number
    const handleFindByPhoneNumber = async () => {
        const result = await fetchPatientByPhone(phoneNumber.trim());
        if (result.data) {
            navigate(`/nurse/patient/${phoneNumber.trim()}`, { state: result.data });
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Nurse Dashboard</h2>

            {/* Register New Patient */}
            <button
                className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
                onClick={() => navigate("/nurse/register-patient")}
            >
                Register New Patient
            </button>

            {/* Find by MRN */}
            <div className="flex space-x-2 items-center">
                <input
                    type="text"
                    placeholder="Enter MRN"
                    value={mrn}
                    onChange={(e) => setMrn(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                    className="bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600"
                    onClick={handleFindByMRN}
                    disabled={!mrn}
                >
                    Find by MRN
                </button>
            </div>
            {isMrnError && (
                <p className="text-red-500">
                    {getErrorMessage(mrnError) || "Patient not found"}
                </p>
            )}

            {/* Find by Email */}
            <div className="flex space-x-2 items-center">
                <input
                    type="email"
                    placeholder="Enter Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                    className="bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
                    onClick={handleFindByEmail}
                    disabled={!email}
                >
                    Find by Email
                </button>
            </div>
            {isEmailError && (
                <p className="text-red-500">
                    {getErrorMessage(emailError) || "Patient not found"}
                </p>
            )}

            {/* Find by Phone Number */}
            <div className="flex space-x-2 items-center">
                <input
                    type="text"
                    placeholder="Enter Phone Number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400"
                />
                <button
                    className="bg-pink-500 text-white py-2 px-4 rounded hover:bg-pink-600"
                    onClick={handleFindByPhoneNumber}
                    disabled={!phoneNumber}
                >
                    Find by Phone Number
                </button>
            </div>
            {isPhoneError && (
                <p className="text-red-500">
                    {getErrorMessage(phoneError) || "Patient not found"}
                </p>
            )}

            {/* Find by Full Name */}
            <div className="flex space-x-2 items-center">
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
                    onClick={()=>handleFindPatients({firstName, lastName})}
                    disabled={!firstName || !lastName}
                >
                    Find by Full Name
                </button>
            </div>

            {/* Find by Birthday */}
            <div className="flex space-x-2 items-center">
                <input
                    type="date"
                    value={birthDate}
                    onChange={(e) => setBirthDate(e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <button
                    className="bg-indigo-500 text-white py-2 px-4 rounded hover:bg-indigo-600"
                    onClick={() => handleFindPatients({birthDate})}
                    disabled={!birthDate}
                >
                    Find by Birthday
                </button>
            </div>

            {/* Find All Active / Passive */}
            <div className="flex space-x-2">
                <button
                    className="flex-1 bg-teal-500 text-white py-2 px-4 rounded hover:bg-teal-600"
                    onClick={() => handleFindPatients({isActive: true})}
                >
                    Find All Active (Under Treatment)
                </button>
                <button
                    className="flex-1 bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                    onClick={() => handleFindPatients({isActive: false})}
                >
                    Find All Passive (Not Under Treatment)
                </button>
            </div>

            {/* Get All Patients */}
            <button
                className="w-full bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600"
                onClick={() => handleFindPatients()}
            >
                Get All Patients
            </button>
        </div>
    );
};

export default NurseDashboard;