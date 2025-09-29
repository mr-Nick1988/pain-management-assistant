import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import type {Patient} from "../../types/nurse";
import {useCreatePatientMutation} from "../../api/api/apiNurseSlice.ts";

const PatientFormRegister: React.FC = () => {
    const navigate = useNavigate();
    const [createPatient, {isLoading, error}] = useCreatePatientMutation();

    const [form, setForm] = useState<Patient>({
        firstName: "",
        lastName: "",
        personId: "",
        dateOfBirth: "",
        gender: "MALE",
        height: 0,
        weight: 0
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const {name, value} = e.target;
        setForm(prev => ({...prev, [name]: value}));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            // Вызов хука для сохранения пациента
            await createPatient(form).unwrap();
            // Если успешно, переходим на EMR
            navigate(`/nurse/emr-form/${form.personId}`);
        } catch (err: any) {
            // Обработка ошибки указана в tsx условным рендером
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
                    type="text"
                    name="personId"
                    placeholder="Person ID"
                    value={form.personId}
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
                >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                </select>
                <input
                    type="number"
                    name="height"
                    placeholder="Height (cm)"
                    value={form.height || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <input
                    type="number"
                    name="weight"
                    placeholder="Weight (kg)"
                    value={form.weight || ""}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    required
                />
                <button
                    type="submit"
                    disabled={isLoading}
                    className={`w-full py-2 px-4 rounded text-white ${isLoading ? "bg-gray-400" : "bg-green-500 hover:bg-green-600"}`}
                >
                    {isLoading ? "Registering..." : "Register & Go to EMR"}
                </button>

                {error && (
                    <p className="text-red-500 text-sm mt-2">
                        {("data" in error && (error as any).data?.message) || "Ошибка при создании пациента"}
                    </p>
                )}
            </form>
        </div>
    );
};

export default PatientFormRegister;