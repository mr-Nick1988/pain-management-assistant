import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getErrorMessage } from "../../utils/getErrorMessageHelper";
import {
    useLazyGetPatientByMrnQuery,
    useLazyGetPatientByEmailQuery,
    useLazyGetPatientByPhoneNumberQuery,
} from "../../api/api/apiNurseSlice.ts";
import { PageHeader, ActionCard, SearchCard, SearchField, Button, Input } from "../ui";

interface PatientSearchParams {
    firstName?: string;
    lastName?: string;
    birthDate?: string;
    isActive?: boolean;
}

const NurseDashboard: React.FC = () => {
    const navigate = useNavigate();

    // 🔹 Состояния полей поиска
    const [mrn, setMrn] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [email, setEmail] = useState("");
    const [phoneNumber, setPhoneNumber] = useState("");
    const [birthDate, setBirthDate] = useState("");

    // 🔹 Состояние показа формы поиска
    const [showSearchForm, setShowSearchForm] = useState(false);

    // 🔹 Lazy queries
    const [fetchPatientByMrn, { isError: isMrnError, error: mrnError }] = useLazyGetPatientByMrnQuery();
    const [fetchPatientByEmail, { isError: isEmailError, error: emailError }] = useLazyGetPatientByEmailQuery();
    const [fetchPatientByPhone, { isError: isPhoneError, error: phoneError }] = useLazyGetPatientByPhoneNumberQuery();

    // 🔹 Общий поиск
    const handleFindPatients = (params?: PatientSearchParams) => {
        navigate("/nurse/patients", { state: params });
    };

    // 🔹 Поиск по MRN
    const handleFindByMRN = async () => {
        const result = await fetchPatientByMrn(mrn.trim());
        if (result.data) navigate(`/nurse/patient/${mrn.trim()}`, { state: result.data });
    };

    // 🔹 Поиск по Email
    const handleFindByEmail = async () => {
        const result = await fetchPatientByEmail(email.trim());
        if (result.data) navigate(`/nurse/patient/${result.data.mrn}`, { state: result.data });
    };

    // 🔹 Поиск по Phone Number
    const handleFindByPhoneNumber = async () => {
        const result = await fetchPatientByPhone(phoneNumber.trim());
        if (result.data) navigate(`/nurse/patient/${result.data.mrn}`, { state: result.data });
    };

    return (
        <div className="p-6 space-y-6">
            <PageHeader title="Nurse Dashboard" description="Search for patients or register new ones" />

            {/* 🔹 Верхние карточки действий */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <ActionCard
                    title="Register Patient"
                    description="Add a new patient to the system"
                    icon="👤"
                    onClick={() => navigate("/nurse/register-patient")}
                    buttonText="Register New Patient"
                    buttonVariant="approve"
                />

                <ActionCard
                    title="All Patients"
                    description="View complete patient list"
                    icon="📋"
                    onClick={() => handleFindPatients()}
                    buttonText="Get All Patients"
                    buttonVariant="default"
                />

                <ActionCard
                    title="Quick Search"
                    description="Find patients by various criteria"
                    icon="🔍"
                    onClick={() => setShowSearchForm((prev) => !prev)}
                    buttonText={showSearchForm ? "Hide Search" : "Open Search"}
                    buttonVariant={showSearchForm ? "reject" : "default"}
                />
            </div>

            {/* Centered Approved Recommendations Card */}
            <div className="mt-8 flex justify-center">
                <div className="w-full md:w-1/2 lg:w-1/3">
                    <ActionCard
                        title="Approved Recommendations"
                        description="View all approved recommendations"
                        icon="✅"
                        onClick={() => navigate('/nurse/recommendations')}
                        buttonText="View All"
                        buttonVariant="approve"
                    />
                </div>
            </div>

            {/* 🔹 Вся форма поиска появляется только после клика */}
            {showSearchForm && (
                <>
                    <SearchCard title="Search Patients" description="Use any of the search methods below">
                        <SearchField
                            label="Search by MRN"
                            error={isMrnError ? getErrorMessage(mrnError) || "Patient not found" : undefined}
                        >
                            <Input type="text" placeholder="Enter MRN" value={mrn} onChange={(e) => setMrn(e.target.value)} />
                            <Button variant="approve" onClick={handleFindByMRN} disabled={!mrn}>
                                Find
                            </Button>
                        </SearchField>

                        <SearchField
                            label="Search by Email"
                            error={isEmailError ? getErrorMessage(emailError) || "Patient not found" : undefined}
                        >
                            <Input type="email" placeholder="Enter Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                            <Button variant="update" onClick={handleFindByEmail} disabled={!email}>
                                Find
                            </Button>
                        </SearchField>

                        <SearchField
                            label="Search by Phone Number"
                            error={isPhoneError ? getErrorMessage(phoneError) || "Patient not found" : undefined}
                        >
                            <Input
                                type="text"
                                placeholder="Enter Phone Number"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                            />
                            <Button variant="default" onClick={handleFindByPhoneNumber} disabled={!phoneNumber}>
                                Find
                            </Button>
                        </SearchField>

                        <SearchField label="Search by Full Name">
                            <Input
                                type="text"
                                placeholder="First Name"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                            <Input
                                type="text"
                                placeholder="Last Name"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                            <Button
                                variant="default"
                                onClick={() => handleFindPatients({ firstName, lastName })}
                                disabled={!firstName || !lastName}
                            >
                                Find
                            </Button>
                        </SearchField>

                        <SearchField label="Search by Birthday">
                            <Input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} />
                            <Button
                                variant="default"
                                onClick={() => handleFindPatients({ birthDate })}
                                disabled={!birthDate}
                            >
                                Find
                            </Button>
                        </SearchField>
                    </SearchCard>

                    {/* 🔹 Фильтр по статусу лечения */}
                    <SearchCard title="Filter by Treatment Status" description="View patients by their treatment status">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button variant="approve" onClick={() => handleFindPatients({ isActive: true })}>
                                Active Patients
                            </Button>
                            <Button variant="reject" onClick={() => handleFindPatients({ isActive: false })}>
                                Passive Patients
                            </Button>
                        </div>
                    </SearchCard>
                </>
            )}
        </div>
    );
};

export default NurseDashboard;