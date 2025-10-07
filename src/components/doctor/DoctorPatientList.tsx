import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {
    useLazyGetPatientByMrnQuery,
    useLazyGetPatientByEmailQuery,
    useLazyGetPatientByPhoneNumberQuery,
    useLazySearchPatientsQuery
} from "../../api/api/apiDoctorSlice";
import {Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Select} from "../ui";
import type {Patient} from "../../types/doctor";

const PatientList: React.FC = () => {
    const navigate = useNavigate();

    // Quick Search
    const [searchMrn, setSearchMrn] = useState("");
    const [searchEmail, setSearchEmail] = useState("");
    const [searchPhone, setSearchPhone] = useState("");

    // Advanced Search
    const [advancedSearch, setAdvancedSearch] = useState({
        firstName: "",
        lastName: "",
        birthDate: "",
        gender: "",
        insurancePolicyNumber: "",
        address: "",
        isActive: "" as "" | "true" | "false"
    });

    const [fetchByMrn, {isFetching: isFetchingMrn, error: errorMrn}] = useLazyGetPatientByMrnQuery();
    const [fetchByEmail, {isFetching: isFetchingEmail, error: errorEmail}] = useLazyGetPatientByEmailQuery();
    const [fetchByPhone, {isFetching: isFetchingPhone, error: errorPhone}] = useLazyGetPatientByPhoneNumberQuery();
    const [searchPatients, {data: searchResults, isFetching: isSearching, error: searchError}] = useLazySearchPatientsQuery();

    const handleSearchMrn = async () => {
        if (searchMrn.trim()) {
            const result = await fetchByMrn(searchMrn.trim());
            if (result.data) {
                navigate(`/doctor/patient/${result.data.mrn}`, {state: result.data});
            }
        }
    };

    const handleSearchEmail = async () => {
        if (searchEmail.trim()) {
            const result = await fetchByEmail(searchEmail.trim());
            if (result.data) {
                navigate(`/doctor/patient/${result.data.mrn}`, {state: result.data});
            }
        }
    };

    const handleSearchPhone = async () => {
        if (searchPhone.trim()) {
            const result = await fetchByPhone(searchPhone.trim());
            if (result.data) {
                navigate(`/doctor/patient/${result.data.mrn}`, {state: result.data});
            }
        }
    };

    const handleAdvancedSearch = () => {
        const params: {
            firstName?: string;
            lastName?: string;
            birthDate?: string;
            gender?: string;
            insurancePolicyNumber?: string;
            address?: string;
            isActive?: boolean;
        } = {};
        
        if (advancedSearch.firstName.trim()) params.firstName = advancedSearch.firstName.trim();
        if (advancedSearch.lastName.trim()) params.lastName = advancedSearch.lastName.trim();
        if (advancedSearch.birthDate) {
            const [year, month, day] = advancedSearch.birthDate.split('-');
            params.birthDate = `${day}-${month}-${year}`;
        }
        if (advancedSearch.gender) params.gender = advancedSearch.gender;
        if (advancedSearch.insurancePolicyNumber.trim()) params.insurancePolicyNumber = advancedSearch.insurancePolicyNumber.trim();
        if (advancedSearch.address.trim()) params.address = advancedSearch.address.trim();
        if (advancedSearch.isActive) params.isActive = advancedSearch.isActive === "true";

        searchPatients(params);
    };

    const handleClearAdvancedSearch = () => {
        setAdvancedSearch({
            firstName: "",
            lastName: "",
            birthDate: "",
            gender: "",
            insurancePolicyNumber: "",
            address: "",
            isActive: ""
        });
    };

    return (
        <div className="p-6 space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 bg-clip-text text-transparent animate-gradient drop-shadow-lg">
                    Patient Search
                </h1>
                <p className="text-lg font-medium mb-4 bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-md">
                    Search for patients using various criteria
                </p>
                <Button variant="update" onClick={() => navigate("/doctor")}>
                    Back to Dashboard
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">Quick Search</h2>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Search by MRN */}
                    <div>
                        <Label htmlFor="mrn">Medical Record Number (MRN)</Label>
                        <div className="flex space-x-2 mt-1">
                            <Input
                                id="mrn"
                                placeholder="Enter MRN"
                                value={searchMrn}
                                onChange={(e) => setSearchMrn(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchMrn()}
                                className="flex-1"
                            />
                            <Button
                                variant="approve"
                                onClick={handleSearchMrn}
                                disabled={!searchMrn || isFetchingMrn}
                            >
                                {isFetchingMrn ? "Searching..." : "Search"}
                            </Button>
                        </div>
                        {errorMrn && (
                            <p className="text-sm text-red-500 mt-1">Patient not found</p>
                        )}
                    </div>

                    {/* Search by Email */}
                    <div>
                        <Label htmlFor="email">Email Address</Label>
                        <div className="flex space-x-2 mt-1">
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter email address"
                                value={searchEmail}
                                onChange={(e) => setSearchEmail(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchEmail()}
                                className="flex-1"
                            />
                            <Button
                                variant="update"
                                onClick={handleSearchEmail}
                                disabled={!searchEmail || isFetchingEmail}
                            >
                                {isFetchingEmail ? "Searching..." : "Search"}
                            </Button>
                        </div>
                        {errorEmail && (
                            <p className="text-sm text-red-500 mt-1">Patient not found</p>
                        )}
                    </div>

                    {/* Search by Phone */}
                    <div>
                        <Label htmlFor="phone">Phone Number</Label>
                        <div className="flex space-x-2 mt-1">
                            <Input
                                id="phone"
                                placeholder="Enter phone number"
                                value={searchPhone}
                                onChange={(e) => setSearchPhone(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSearchPhone()}
                                className="flex-1"
                            />
                            <Button
                                variant="default"
                                onClick={handleSearchPhone}
                                disabled={!searchPhone || isFetchingPhone}
                            >
                                {isFetchingPhone ? "Searching..." : "Search"}
                            </Button>
                        </div>
                        {errorPhone && (
                            <p className="text-sm text-red-500 mt-1">Patient not found</p>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-gray-900">
                            Advanced Search
                        </h2>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                placeholder="Enter first name"
                                value={advancedSearch.firstName}
                                onChange={(e) => setAdvancedSearch({...advancedSearch, firstName: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                placeholder="Enter last name"
                                value={advancedSearch.lastName}
                                onChange={(e) => setAdvancedSearch({...advancedSearch, lastName: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label htmlFor="birthDate">Date of Birth</Label>
                            <Input
                                id="birthDate"
                                type="date"
                                value={advancedSearch.birthDate}
                                onChange={(e) => setAdvancedSearch({...advancedSearch, birthDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label htmlFor="gender">Gender</Label>
                            <Select
                                id="gender"
                                value={advancedSearch.gender}
                                onChange={(e) => setAdvancedSearch({...advancedSearch, gender: e.target.value})}
                            >
                                <option value="">Select gender</option>
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="insurance">Insurance Policy Number</Label>
                            <Input
                                id="insurance"
                                placeholder="Enter insurance number"
                                value={advancedSearch.insurancePolicyNumber}
                                onChange={(e) => setAdvancedSearch({...advancedSearch, insurancePolicyNumber: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label htmlFor="address">Address</Label>
                            <Input
                                id="address"
                                placeholder="Enter address"
                                value={advancedSearch.address}
                                onChange={(e) => setAdvancedSearch({...advancedSearch, address: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label htmlFor="isActive">Treatment Status</Label>
                            <Select
                                id="isActive"
                                value={advancedSearch.isActive}
                                onChange={(e) => setAdvancedSearch({...advancedSearch, isActive: e.target.value as "" | "true" | "false"})}
                            >
                                <option value="">All patients</option>
                                <option value="true">In treatment</option>
                                <option value="false">Not in treatment</option>
                            </Select>
                        </div>
                    </div>
                    
                    <div className="flex space-x-2 pt-4">
                        <Button
                            variant="approve"
                            onClick={handleAdvancedSearch}
                            disabled={isSearching}
                            className="flex-1"
                        >
                            {isSearching ? "Searching..." : "Search Patients"}
                        </Button>
                        <Button
                            variant="reject"
                            onClick={handleClearAdvancedSearch}
                            className="flex-1"
                        >
                            Clear
                        </Button>
                    </div>

                    {searchError && (
                        <p className="text-sm text-red-500">Error searching patients</p>
                    )}
                </CardContent>
            </Card>

            {/* Search Results */}
            {searchResults && searchResults.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Search Results ({searchResults.length} patients found)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {searchResults.map((patient: Patient) => (
                                <div
                                    key={patient.mrn}
                                    className="p-4 border rounded hover:bg-gray-50 cursor-pointer transition-colors"
                                    onClick={() => navigate(`/doctor/patient/${patient.mrn}`, {state: patient})}
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-bold">{patient.firstName} {patient.lastName}</p>
                                            <p className="text-sm text-gray-600">MRN: {patient.mrn}</p>
                                            <p className="text-sm text-gray-600">DOB: {patient.dateOfBirth}</p>
                                            {patient.phoneNumber && (
                                                <p className="text-sm text-gray-600">Phone: {patient.phoneNumber}</p>
                                            )}
                                        </div>
                                        <span className={`px-2 py-1 rounded text-xs ${patient.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                                            {patient.isActive ? "In Treatment" : "Not in Treatment"}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {searchResults && searchResults.length === 0 && (
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-gray-600">No patients found matching your search criteria</p>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default PatientList;
