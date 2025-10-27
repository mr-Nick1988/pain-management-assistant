import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {
    useLazySearchFhirPatientsQuery,
    useImportPatientFromFhirMutation,
    useGenerateMockPatientMutation,
    useGenerateBatchMockPatientsMutation,
    useLazyCheckImportStatusQuery
} from "../../api/api/apiFhirSlice";
import type {FhirPatientDTO, EmrImportResultDTO} from "../../types/fhir";
import {Button, Card, CardContent, CardHeader, CardTitle, Input, Label, LoadingSpinner, PageNavigation} from "../ui";
import {useToast} from "../../contexts/ToastContext";

const ImportPatientFromFHIR: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();

    // Search form state
    const [searchParams, setSearchParams] = useState({
        firstName: "",
        lastName: "",
        birthDate: ""
    });

    // Batch generation state
    const [batchCount, setBatchCount] = useState(10);

    // Modal state
    const [showImportModal, setShowImportModal] = useState(false);
    const [importResult, setImportResult] = useState<EmrImportResultDTO | null>(null);

    // API hooks
    const [searchPatients, {data: searchResults, isFetching: isSearching}] = useLazySearchFhirPatientsQuery();
    const [importPatient, {isLoading: isImporting}] = useImportPatientFromFhirMutation();
    const [generateMock, {isLoading: isGeneratingMock}] = useGenerateMockPatientMutation();
    const [generateBatch, {isLoading: isGeneratingBatch}] = useGenerateBatchMockPatientsMutation();
    const [checkImport] = useLazyCheckImportStatusQuery();

    const handleSearch = async () => {
        if (!searchParams.firstName && !searchParams.lastName && !searchParams.birthDate) {
            toast.error("Please enter at least one search parameter");
            return;
        }

        try {
            await searchPatients(searchParams).unwrap();
        } catch (error) {
            console.error("Search failed:", error);
            toast.error("Failed to search FHIR system");
        }
    };

    const handleImport = async (patient: FhirPatientDTO) => {
        try {
            // Check if already imported
            const checkResult = await checkImport(patient.patientIdInFhirResource).unwrap();
            if (checkResult.alreadyImported) {
                toast.error(`Patient already imported with MRN: ${checkResult.internalEmrNumber}`);
                return;
            }

            const result = await importPatient({
                fhirPatientId: patient.patientIdInFhirResource,
                importedBy: localStorage.getItem("username") || "system"
            }).unwrap();

            setImportResult(result);
            setShowImportModal(true);

            if (result.success) {
                toast.success("Patient imported successfully!");
            }
        } catch (error) {
            console.error("Import failed:", error);
            toast.error("Failed to import patient");
        }
    };

    const handleGenerateMock = async () => {
        try {
            const result = await generateMock({
                createdBy: localStorage.getItem("username") || "system"
            }).unwrap();
            setImportResult(result);
            setShowImportModal(true);
            toast.success("Mock patient generated successfully!");
        } catch (error) {
            console.error("Mock generation failed:", error);
            toast.error("Failed to generate mock patient");
        }
    };

    const handleGenerateBatch = async () => {
        if (batchCount < 1 || batchCount > 100) {
            toast.error("Batch count must be between 1 and 100");
            return;
        }

        try {
            const results = await generateBatch({
                count: batchCount,
                createdBy: localStorage.getItem("username") || "system"
            }).unwrap();
            toast.success(`${results.length} mock patients generated successfully!`);
        } catch (error) {
            console.error("Batch generation failed:", error);
            toast.error("Failed to generate batch patients");
        }
    };

    const getConfidenceBadgeColor = (confidence: string) => {
        switch (confidence) {
            case "HIGH": return "bg-green-100 text-green-800";
            case "MEDIUM": return "bg-yellow-100 text-yellow-800";
            case "LOW": return "bg-red-100 text-red-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    const getSourceBadgeColor = (sourceType: string) => {
        return sourceType === "FHIR_SERVER" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-800";
    };

    return (
        <div className="p-6 space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    🔍 Import Patient from External FHIR System
                </h1>
                <p className="text-gray-600">
                    Search and import patients from FHIR-compatible medical systems
                </p>
            </div>

            {/* Search Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Search in FHIR System</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="firstName">First Name</Label>
                            <Input
                                id="firstName"
                                placeholder="Enter first name"
                                value={searchParams.firstName}
                                onChange={(e) => setSearchParams({...searchParams, firstName: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label htmlFor="lastName">Last Name</Label>
                            <Input
                                id="lastName"
                                placeholder="Enter last name"
                                value={searchParams.lastName}
                                onChange={(e) => setSearchParams({...searchParams, lastName: e.target.value})}
                            />
                        </div>
                        <div>
                            <Label htmlFor="birthDate">Birth Date</Label>
                            <Input
                                id="birthDate"
                                type="date"
                                value={searchParams.birthDate}
                                onChange={(e) => setSearchParams({...searchParams, birthDate: e.target.value})}
                            />
                        </div>
                    </div>
                    <Button
                        variant="approve"
                        onClick={handleSearch}
                        disabled={isSearching}
                        className="w-full"
                    >
                        {isSearching ? "Searching..." : "🔍 Search in FHIR System"}
                    </Button>
                </CardContent>
            </Card>

            {/* Search Results */}
            {isSearching && (
                <Card>
                    <CardContent className="text-center py-8">
                        <LoadingSpinner />
                        <p className="mt-4">Searching FHIR system...</p>
                    </CardContent>
                </Card>
            )}

            {searchResults && searchResults.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Search Results ({searchResults.length} patients found)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {searchResults.map((patient) => (
                                <div
                                    key={patient.patientIdInFhirResource}
                                    className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-bold text-lg">
                                                    {patient.firstName} {patient.lastName}
                                                </h3>
                                                <span className={`px-2 py-1 rounded text-xs font-semibold ${getSourceBadgeColor(patient.sourceType)}`}>
                                                    {patient.sourceType === "FHIR_SERVER" ? "🔵 FHIR Server" : "⚪ Mock Generator"}
                                                </span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-semibold">Birth Date:</span> {patient.dateOfBirth}
                                                </div>
                                                <div>
                                                    <span className="font-semibold">Gender:</span> {patient.gender}
                                                </div>
                                                {patient.identifiers.length > 0 && (
                                                    <div>
                                                        <span className="font-semibold">MRN:</span> {patient.identifiers[0].value}
                                                    </div>
                                                )}
                                                {patient.phoneNumber && (
                                                    <div>
                                                        <span className="font-semibold">Phone:</span> {patient.phoneNumber}
                                                    </div>
                                                )}
                                                {patient.email && (
                                                    <div className="col-span-2">
                                                        <span className="font-semibold">Email:</span> {patient.email}
                                                    </div>
                                                )}
                                                {patient.address && (
                                                    <div className="col-span-2">
                                                        <span className="font-semibold">Address:</span> {patient.address}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="approve"
                                                onClick={() => handleImport(patient)}
                                                disabled={isImporting}
                                            >
                                                Import
                                            </Button>
                                        </div>
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

            {/* Testing Tools */}
            <Card>
                <CardHeader>
                    <CardTitle>🧪 Testing Tools</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex gap-4">
                        <Button
                            variant="default"
                            onClick={handleGenerateMock}
                            disabled={isGeneratingMock}
                            className="flex-1"
                        >
                            {isGeneratingMock ? "Generating..." : "Generate 1 Mock Patient"}
                        </Button>
                    </div>
                    <div className="flex gap-4 items-end">
                        <div className="flex-1">
                            <Label htmlFor="batchCount">Generate Batch (max 100)</Label>
                            <Input
                                id="batchCount"
                                type="number"
                                min="1"
                                max="100"
                                value={batchCount}
                                onChange={(e) => setBatchCount(Number(e.target.value))}
                            />
                        </div>
                        <Button
                            variant="update"
                            onClick={handleGenerateBatch}
                            disabled={isGeneratingBatch}
                        >
                            {isGeneratingBatch ? "Generating..." : "Generate"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Import Result Modal */}
            {showImportModal && importResult && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                {importResult.success ? "✅" : "❌"} Import Result
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 bg-gray-50 rounded">
                                <p className="font-semibold">{importResult.message}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <span className="text-gray-600">Internal Patient ID:</span>
                                    <p className="font-semibold">{importResult.internalPatientId}</p>
                                </div>
                                {importResult.internalMrn && (
                                    <div>
                                        <span className="text-gray-600">MRN:</span>
                                        <p className="font-semibold font-mono">{importResult.internalMrn}</p>
                                    </div>
                                )}
                                <div>
                                    <span className="text-gray-600">Match Confidence:</span>
                                    <p>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getConfidenceBadgeColor(importResult.matchConfidence)}`}>
                                            {importResult.matchConfidence}
                                        </span>
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-600">New Patient Created:</span>
                                    <p className="font-semibold">{importResult.newPatientCreated ? "Yes" : "No"}</p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Observations Imported:</span>
                                    <p className={`font-semibold ${importResult.observationsImported === 0 ? 'text-orange-600' : 'text-green-600'}`}>
                                        {importResult.observationsImported}
                                        {importResult.observationsImported === 0 && " (No lab data)"}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-600">Source Type:</span>
                                    <p>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${getSourceBadgeColor(importResult.sourceType)}`}>
                                            {importResult.sourceType === "FHIR_SERVER" ? "FHIR Server" : "Mock Generator"}
                                        </span>
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <span className="text-gray-600">Imported At:</span>
                                    <p className="font-semibold">{new Date(importResult.importedAt).toLocaleString()}</p>
                                </div>
                            </div>

                            {importResult.observationsImported === 0 && (
                                <div className="p-4 bg-orange-50 border border-orange-200 rounded">
                                    <p className="font-semibold text-orange-800 mb-2">⚠️ No Medical Data Imported:</p>
                                    <p className="text-sm text-orange-700 mb-2">
                                        No observations found in the external FHIR system.
                                    </p>
                                    <p className="text-sm text-orange-700">
                                        <strong>Action Required:</strong> Please add patient's medical records manually through "Register EMR" or "Update EMR".
                                    </p>
                                </div>
                            )}

                            {importResult.warnings.length > 0 && (
                                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">
                                    <p className="font-semibold text-yellow-800 mb-2">⚠️ Warnings:</p>
                                    <ul className="list-disc list-inside text-sm text-yellow-700">
                                        {importResult.warnings.map((warning, idx) => (
                                            <li key={idx}>{warning}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {importResult.errors.length > 0 && (
                                <div className="p-4 bg-red-50 border border-red-200 rounded">
                                    <p className="font-semibold text-red-800 mb-2">❌ Errors:</p>
                                    <ul className="list-disc list-inside text-sm text-red-700">
                                        {importResult.errors.map((error, idx) => (
                                            <li key={idx}>{error}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {importResult.requiresManualReview && (
                                <div className="p-4 bg-orange-50 border border-orange-200 rounded">
                                    <p className="font-semibold text-orange-800 mb-2">🔍 Manual Review Required:</p>
                                    <p className="text-sm text-orange-700">{importResult.reviewNotes}</p>
                                </div>
                            )}

                            <div className="flex gap-2 pt-4">
                                {importResult.internalMrn && (
                                    <Button
                                        variant="approve"
                                        onClick={() => {
                                            setShowImportModal(false);
                                            navigate(`/nurse/patient/${importResult.internalMrn}`);
                                        }}
                                        className="flex-1"
                                    >
                                        Go to Patient
                                    </Button>
                                )}
                                {!importResult.internalMrn && (
                                    <Button
                                        variant="approve"
                                        onClick={() => {
                                            setShowImportModal(false);
                                            navigate('/nurse/patients');
                                        }}
                                        className="flex-1"
                                    >
                                        Go to Patients List
                                    </Button>
                                )}
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowImportModal(false);
                                        setImportResult(null);
                                    }}
                                    className="flex-1"
                                >
                                    Close
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            <PageNavigation />
        </div>
    );
};

export default ImportPatientFromFHIR;
