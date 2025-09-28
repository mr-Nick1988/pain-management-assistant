import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {useLazySearchPatientsQuery} from "../../api/api/apiDoctorSlice.ts";
import type {Patient} from "../../types/doctor.ts";
import {Button, Card, CardHeader, CardTitle, Input} from "../ui";

const SearchPatients: React.FC = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useState({
        firstName: "",
        lastName: "",
        dateOfBirth: "",
        insurance: "",
        mrn: "",
    });

    //API hook for search patients - NOW USING LAZY QUERY FOR PROPER REQUEST EXECUTION
    const [triggerSearch, {data: patients, isLoading, error}] = useLazySearchPatientsQuery();

    //Handler for input change //Renew state of searchParams when input value changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchParams(prev => ({
            ...prev,
            [e.target.name]: e.target.value
        }));
    };
    //Handler for search button click - FIXED: now uses triggerSearch instead of broken refetch
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        triggerSearch(searchParams); // THIS WILL ACTUALLY SEND THE REQUEST
    };
    //Handler for view patient button click //Navigate to doctor page with selected patient id
    const handleViewPatient = (pid: string) => {
        navigate("/doctor", {state: {selectedPatient: pid}});
    }
    //Handler for create recommendation button click //Navigate to doctor page with selected patient id
    const handleCreateRecommendation = (pid: string) => {
        navigate("/doctor", {state: {createRecommendationFor: pid}})
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Заголовок страницы с кнопкой возврата */}
            <Card className="mb-6">
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle>Search Patients</CardTitle>
                        <Button variant="submit" onClick={() => navigate("/doctor")}>Back to Dashboard</Button>
                    </div>
                </CardHeader>
            </Card>

            {/* Форма поиска пациентов */}
            <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
                <form onSubmit={handleSearch} className="space-y-6">
                    {/* Первая строка полей: имя и фамилия */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="firstName" className="block text-sm font-medium">First Name</label>
                            <Input
                                id="firstName"
                                name="firstName"
                                value={searchParams.firstName}
                                onChange={handleInputChange}
                                placeholder="Enter first name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="lastName" className="block text-sm font-medium">Last Name</label>
                            <Input
                                id="lastName"
                                name="lastName"
                                value={searchParams.lastName}
                                onChange={handleInputChange}
                                placeholder="Enter last name"
                            />
                        </div>
                    </div>

                    {/* Вторая строка полей: дата рождения, страховка, MRN */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium">Date of Birth</label>
                            <Input
                                type="date"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                value={searchParams.dateOfBirth}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="insurance" className="block text-sm font-medium">Insurance Policy</label>
                            <Input
                                id="insurance"
                                name="insurance"
                                value={searchParams.insurance}
                                onChange={handleInputChange}
                                placeholder="Insurance policy number"
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="mrn" className="block text-sm font-medium">MRN</label>
                            <Input
                                id="mrn"
                                name="mrn"
                                value={searchParams.mrn}
                                onChange={handleInputChange}
                                placeholder="Medical Record Number"
                            />
                        </div>
                    </div>

                    {/* Кнопки действий формы */}
                    <div className="flex gap-2 justify-end">
                        <Button type="submit" variant="approve" disabled={isLoading}>
                            {isLoading ? "Searching..." : "Search"}
                        </Button>
                        <Button
                            type="button"
                            variant="submit"
                            onClick={() => setSearchParams({
                                firstName: "",
                                lastName: "",
                                dateOfBirth: "",
                                insurance: "",
                                mrn: ""
                            })}
                        >
                            Clear
                        </Button>
                    </div>
                </form>
            </div>

            {/* Секция результатов поиска */}
            <div className="space-y-6">
                {/* Отображение ошибок при поиске */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                        Error searching patients: {JSON.stringify(error)}
                    </div>
                )}

                {/* Заголовок с количеством найденных пациентов */}
                {patients && patients.length > 0 && (
                    <div className="text-center mb-4">
                        <h3 className="text-lg font-semibold">Found {patients.length} patient(s)</h3>
                    </div>
                )}

                {/* Сообщение если ничего не найдено и был выполнен поиск */}
                {patients && patients.length === 0 && Object.values(searchParams).some(value => value.trim() !== "") && (
                    <div className="text-center py-8 text-gray-500">
                        No patients found matching the search criteria.
                    </div>
                )}

                {/* Список найденных пациентов */}
                {patients && patients.map((patient: Patient) => (
                    <div key={patient.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                        {/* Информация о пациенте */}
                        <div className="space-y-2">
                            <h4 className="font-semibold">{patient.firstName} {patient.lastName}</h4>
                            <p><strong>DOB:</strong> {patient.dateOfBirth}</p>
                            <p><strong>Insurance:</strong> {patient.insurancePolicyNumber}</p>
                            {patient.mrn && <p><strong>MRN:</strong> {patient.mrn}</p>}
                            <p><strong>Phone:</strong> {patient.phoneNumber}</p>
                            <p><strong>Email:</strong> {patient.email}</p>
                        </div>

                        {/* Кнопки действий с пациентом */}
                        <div className="flex gap-2 mt-4">
                            <Button
                                onClick={() => handleViewPatient(patient.id)}
                            >
                                View Details
                            </Button>
                            <Button
                                variant="update"
                                onClick={() => handleCreateRecommendation(patient.id)}
                            >
                                Create Recommendation
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default SearchPatients;