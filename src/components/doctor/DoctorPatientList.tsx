import React, {useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {useLazySearchPatientsQuery} from "../../api/api/apiDoctorSlice";
import {Button, Card, CardContent, CardHeader, CardTitle, LoadingSpinner, PageNavigation} from "../ui";
import type {Patient} from "../../types/doctor";

const PatientList: React.FC = () => {
    const navigate = useNavigate();
    const [searchPatients, {data: patients, isFetching, error}] = useLazySearchPatientsQuery();

    // Load all patients on mount
    useEffect(() => {
        searchPatients({});
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (isFetching) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <LoadingSpinner />
                        <p className="mt-4">Loading all patients...</p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-red-500 mb-4">Error loading patients</p>
                        <Button variant="update" onClick={() => navigate("/doctor")}>
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!patients || patients.length === 0) {
        return (
            <div className="p-6">
                <Card>
                    <CardContent className="text-center py-8">
                        <p className="text-gray-600 mb-4">No patients found</p>
                        <Button variant="update" onClick={() => navigate("/doctor")}>
                            Back to Dashboard
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">All Patients</h1>
                    <p className="text-gray-600 mt-1">{patients.length} patient(s) in the system</p>
                </div>
                <Button variant="outline" onClick={() => navigate("/doctor")}>
                    ← Back to Dashboard
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {patients.map((patient: Patient) => (
                    <Card
                        key={patient.mrn}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => navigate(`../patient/${patient.mrn}`, {state: patient})}
                    >
                        <CardHeader>
                            <CardTitle className="text-lg">
                                {patient.firstName} {patient.lastName}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div>
                                    <span className="text-gray-500">MRN:</span>
                                    <span className="ml-2 font-semibold">{patient.mrn}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">DOB:</span>
                                    <span className="ml-2">{patient.dateOfBirth}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Phone:</span>
                                    <span className="ml-2">{patient.phoneNumber || "N/A"}</span>
                                </div>
                                <div>
                                    <span className="text-gray-500">Gender:</span>
                                    <span className="ml-2">{patient.gender}</span>
                                </div>
                                <div className="pt-2">
                                    <span className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                                        patient.isActive 
                                            ? "bg-green-100 text-green-800" 
                                            : "bg-gray-100 text-gray-800"
                                    }`}>
                                        {patient.isActive ? "In Treatment" : "Not in Treatment"}
                                    </span>
                                </div>
                            </div>
                            <Button
                                variant="default"
                                className="w-full mt-4"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`../patient/${patient.mrn}`, {state: patient});
                                }}
                            >
                                View Details
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <PageNavigation />
        </div>
    );
};

export default PatientList;
