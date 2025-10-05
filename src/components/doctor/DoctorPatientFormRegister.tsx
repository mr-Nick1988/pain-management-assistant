import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {type Patient, PatientsGenders} from "../../types/doctor";
import {useCreatePatientMutation} from "../../api/api/apiDoctorSlice.ts";
import {getErrorMessage} from "../../utils/getErrorMessageHelper.ts";

const PatientFormRegister: React.FC = () => {
    const navigate = useNavigate();
    const [createPatient, {isLoading, error}] = useCreatePatientMutation();

    const [form, setForm] = useState<Patient>({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        gender: PatientsGenders.MALE,
        insurancePolicyNumber: "",
        phoneNumber: "",
        email: "",
        address: "",
        additionalInfo: "",
        isActive: true,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setForm(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const createdPatient = await createPatient(form).unwrap();
            navigate(`/doctor/emr-form/${createdPatient.mrn}`);
        } catch {
            // Ошибка отобразится условным рендером
        }
    };

    return (
        <div className="p-6 max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6">Register New Patient</h1>
            <form className="space-y-4" onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="firstName"
                    placeholder="First Name"
                    value={form.firstName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <input
                    type="text"
                    name="lastName"
                    placeholder="Last Name"
                    value={form.lastName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <input
                    type="date"
                    name="dateOfBirth"
                    value={form.dateOfBirth}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                >
                    <option value="" disabled>Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                </select>

                <input
                    type="text"
                    name="insurancePolicyNumber"
                    placeholder="Insurance Policy Number"
                    value={form.insurancePolicyNumber}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <input
                    type="text"
                    name="phoneNumber"
                    placeholder="Phone Number"
                    value={form.phoneNumber}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <input
                    type="text"
                    name="address"
                    placeholder="Address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <input
                    type="text"
                    name="additionalInfo"
                    placeholder="Additional Info"
                    value={form.additionalInfo}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <select
                    name="isActive"
                    value={form.isActive ? "true" : "false"}
                    onChange={(e) =>
                        setForm(prev => ({...prev, isActive: e.target.value === "true"}))
                    }
                    required
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-400"
                >
                    <option value="" disabled>Select Status</option>
                    <option value="true">Under Treatment</option>
                    <option value="false">Not Under Treatment</option>
                </select>

                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 px-4 rounded text-white ${isLoading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"}`}
                >
                    {isLoading ? "Registering..." : "Register & Go to EMR"}
                </button>

                {error && (
                    <p className="text-red-500">
                        {getErrorMessage(error) || "Error registering patient"}
                    </p>
                )}
            </form>
        </div>
    );
};

export default PatientFormRegister;
