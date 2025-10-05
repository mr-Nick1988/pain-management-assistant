import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {getErrorMessage} from "../../utils/getErrorMessageHelper";
import {
    useLazyGetPatientByMrnQuery,
    useLazyGetPatientByEmailQuery,
    useLazyGetPatientByPhoneNumberQuery
} from "../../api/api/apiDoctorSlice.ts";


const DoctorDashboard: React.FC = () => {
    const navigate = useNavigate();

    const [mrn, setMrn] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");

    // Lazy queries
    const [fetchPatientByMrn, {isError: isMrnError, error: mrnError}] = useLazyGetPatientByMrnQuery();
    const [fetchPatientByEmail, {isError: isEmailError, error: emailError}] = useLazyGetPatientByEmailQuery();
    const [fetchPatientByPhone, {isError: isPhoneError, error: phoneError}] = useLazyGetPatientByPhoneNumberQuery();

    // Поиск по MRN
    const handleFindByMRN = async () => {
        const result = await fetchPatientByMrn(mrn.trim());
        if (result.data) {
            navigate(`/doctor/patient/${mrn.trim()}`, {state: result.data});
        }
    };

    // Поиск по Email
    const handleFindByEmail = async () => {
        const result = await fetchPatientByEmail(email.trim());
        if (result.data) {
            navigate(`/doctor/patient/${result.data.mrn}`, {state: result.data});
        }
    };

    // Поиск по Phone Number
    const handleFindByPhoneNumber = async () => {
        const result = await fetchPatientByPhone(phoneNumber.trim());
        if (result.data) {
            navigate(`/doctor/patient/${result.data.mrn}`, {state: result.data});
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold mb-4">Doctor Dashboard</h2>

            {/* Pending Recommendations Button */}
            <button
                className="w-full bg-purple-500 text-white py-2 px-4 rounded hover:bg-purple-600"
                onClick={() => navigate("/doctor/recommendations")}
            >
                View Pending Recommendations
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
        </div>
    );
};

export default DoctorDashboard;

