import {useNavigate} from "react-router-dom";
import React, {useState} from "react";
import {useLazySearchPatientsQuery} from "../../api/api/apiDoctorSlice.ts";
import type {Patient} from "../../types/doctor.ts";

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
    const [triggerSearch, { data: patients, isLoading, error }] = useLazySearchPatientsQuery();

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
        navigate("/doctor",{state:{selectedPatient:pid}});
    }
    //Handler for create recommendation button click //Navigate to doctor page with selected patient id
    const handleCreateRecommendation = (pid: string) => {
        navigate("/doctor",{state:{createRecommendationFor:pid}})
    }

    return (
        // Search by firstName only if provided
        <div className="search-patients-page">
            {/* Заголовок страницы с кнопкой возврата */}
            <div className="medical-title">
                <h2>Search Patients</h2>
                <button onClick={() => navigate("/doctor")} className="submit-button">
                    Back to Dashboard
                </button>
            </div>

            {/* Форма поиска пациентов */}
            <div className="search-form-container">
                <form onSubmit={handleSearch} className="search-form">
                    {/* Первая строка полей: имя и фамилия */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                name="firstName"
                                value={searchParams.firstName}
                                onChange={handleInputChange}
                                placeholder="Enter first name"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastName">Last Name</label>
                            <input
                                type="text"
                                id="lastName"
                                name="lastName"
                                value={searchParams.lastName}
                                onChange={handleInputChange}
                                placeholder="Enter last name"
                            />
                        </div>
                    </div>

                    {/* Вторая строка полей: дата рождения, страховка, MRN */}
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="dateOfBirth">Date of Birth</label>
                            <input
                                type="date"
                                id="dateOfBirth"
                                name="dateOfBirth"
                                value={searchParams.dateOfBirth}
                                onChange={handleInputChange}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="insurance">Insurance Policy</label>
                            <input
                                type="text"
                                id="insurance"
                                name="insurance"
                                value={searchParams.insurance}
                                onChange={handleInputChange}
                                placeholder="Insurance policy number"
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="mrn">MRN</label>
                            <input
                                type="text"
                                id="mrn"
                                name="mrn"
                                value={searchParams.mrn}
                                onChange={handleInputChange}
                                placeholder="Medical Record Number"
                            />
                        </div>
                    </div>

                    {/* Кнопки действий формы */}
                    <div className="form-actions">
                        <button type="submit" className="approve-button" disabled={isLoading}>
                            {isLoading ? "Searching..." : "Search"}
                        </button>
                        <button
                            type="button"
                            onClick={() => setSearchParams({
                                firstName: "",
                                lastName: "",
                                dateOfBirth: "",
                                insurance: "",
                                mrn: ""
                            })}
                            className="submit-button"
                        >
                            Clear
                        </button>
                    </div>
                </form>
            </div>

            {/* Секция результатов поиска */}
            <div className="search-results">
                {/* Отображение ошибок при поиске */}
                {error && (
                    <div className="error-message">
                        Error searching patients: {JSON.stringify(error)}
                    </div>
                )}

                {/* Заголовок с количеством найденных пациентов */}
                {patients && patients.length > 0 && (
                    <div className="results-header">
                        <h3>Found {patients.length} patient(s)</h3>
                    </div>
                )}

                {/* Сообщение если ничего не найдено и был выполнен поиск */}
                {patients && patients.length === 0 && Object.values(searchParams).some(value => value.trim() !== "") && (
                    <div className="no-results">
                        No patients found matching the search criteria.
                    </div>
                )}

                {/* Список найденных пациентов */}
                {patients && patients.map((patient: Patient) => (
                    <div key={patient.id} className="patient-card">
                        {/* Информация о пациенте */}
                        <div className="patient-info">
                            <h4>{patient.firstName} {patient.lastName}</h4>
                            <p><strong>DOB:</strong> {patient.dateOfBirth}</p>
                            <p><strong>Insurance:</strong> {patient.insurancePolicyNumber}</p>
                            {patient.mrn && <p><strong>MRN:</strong> {patient.mrn}</p>}
                            <p><strong>Phone:</strong> {patient.phoneNumber}</p>
                            <p><strong>Email:</strong> {patient.email}</p>
                        </div>

                        {/* Кнопки действий с пациентом */}
                        <div className="patient-actions">
                            <button
                                onClick={() => handleViewPatient(patient.id)}
                                className="view-button"
                            >
                                View Details
                            </button>
                            <button
                                onClick={() => handleCreateRecommendation(patient.id)}
                                className="recommendation-button"
                            >
                                Create Recommendation
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default SearchPatients;