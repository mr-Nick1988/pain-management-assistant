import React, {useMemo, useState} from "react";
import {type Escalation, EscalationStatus} from "../../types/anesthesiologist.ts";
import {useSendQuestionToDoctorMutation, useTakeEscalationMutation} from "../../api/api/apiAnesthesiologistSlice.ts";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "../ui";

interface EscalationListProps {
    escalations: Escalation[];
    onEscalationSelect: (escalationId: string) => void;
}

const EscalationsList: React.FC<EscalationListProps> = ({escalations, onEscalationSelect}) => {
    const [filteredStatus, setFilteredStatus] = useState<EscalationStatus | "ALL">("ALL");
    const [filterPriority, setFilterPriority] = useState<"ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("ALL");
    const [sortBy, setSortBy] = useState<"date" | "priority" | "status">("date");
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [selectedEscalation, setSelectedEscalation] = useState<Escalation | null>(null);
    const [questionText, setQuestionText] = useState<string>("");

    const [takeEscalation, {isLoading: isTaking}] = useTakeEscalationMutation();
    const [sendQuestionToDoctor, {isLoading: isSendingQuestion}] = useSendQuestionToDoctorMutation();

    const filteredAndSortedEscalations = useMemo(() => {
        const filteredEscalations = escalations.filter((escalation) => {
            const matchesStatus = filteredStatus === "ALL" || escalation.status === filteredStatus;
            const matchesPriority = filterPriority === "ALL" || escalation.priority === filterPriority;
            const matchesSearch = searchTerm === "" ||
                escalation.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                escalation.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                escalation.rejectedReason.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesStatus && matchesPriority && matchesSearch;
        });

        filteredEscalations.sort((a, b) => {
            switch (sortBy) {
                case "date":
                    return new Date(b.escalationDate).getTime() - new Date(a.escalationDate).getTime();
                case "priority":
                    const priorityOrder = {"CRITICAL": 4, "HIGH": 3, "MEDIUM": 2, "LOW": 1};
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                case "status":
                    return b.status.localeCompare(a.status);
                default:
                    return 0;
            }
        });
        return filteredEscalations;
    }, [escalations, filteredStatus, filterPriority, sortBy, searchTerm]);

    const handleTakeEscalation = async (escalationId: string) => {
        try {
            await takeEscalation(escalationId).unwrap();
        } catch (error) {
            console.error("Error taking escalation:", error);
        }
    };

    const handleSendQuestionToDoctor = async () => {
        if (!selectedEscalation || !questionText.trim()) return;
        try {
            await sendQuestionToDoctor({
                escalationId: selectedEscalation.id,
                question: questionText
            }).unwrap();
            setQuestionText("");
            setSelectedEscalation(null);
        } catch (error) {
            console.error("Error sending question to doctor:", error);
        }
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl">
            <Card>
                <CardHeader>
                    <CardTitle>Escalations Management</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    {/* Filters and Search */}
                    <div className="bg-gray-50 p-4 rounded-lg space-y-4">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1">
                                <Label htmlFor="search">Search</Label>
                                <Input
                                    id="search"
                                    type="text"
                                    placeholder="Search by patient, doctor, or reason..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="mt-1"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                                <Label htmlFor="status-filter">Status</Label>
                                <select
                                    id="status-filter"
                                    value={filteredStatus}
                                    onChange={(e) => setFilteredStatus(e.target.value as EscalationStatus | "ALL")}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ALL">All Status</option>
                                    <option value={EscalationStatus.PENDING}>Pending</option>
                                    <option value={EscalationStatus.IN_REVIEW}>In Review</option>
                                    <option value={EscalationStatus.RESOLVED}>Resolved</option>
                                    <option value={EscalationStatus.REQUIRES_CLARIFICATION}>Requires Clarification</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="priority-filter">Priority</Label>
                                <select
                                    id="priority-filter"
                                    value={filterPriority}
                                    onChange={(e) => setFilterPriority(e.target.value as "ALL" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW")}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="ALL">All Priority</option>
                                    <option value="CRITICAL">Critical</option>
                                    <option value="HIGH">High</option>
                                    <option value="MEDIUM">Medium</option>
                                    <option value="LOW">Low</option>
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="sort-by">Sort By</Label>
                                <select
                                    id="sort-by"
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as "date" | "priority" | "status")}
                                    className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="date">Date</option>
                                    <option value="priority">Priority</option>
                                    <option value="status">Status</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Escalations Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredAndSortedEscalations.map((escalation) => (
                            <Card key={escalation.id} className={`hover:shadow-lg transition-shadow ${
                                escalation.priority === 'CRITICAL' ? 'border-red-300' :
                                    escalation.priority === 'HIGH' ? 'border-orange-300' :
                                        escalation.priority === 'MEDIUM' ? 'border-yellow-300' :
                                            'border-gray-300'
                            }`}>
                                <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <CardTitle className="text-lg">{escalation.patientName}</CardTitle>
                                            <p className="text-sm text-gray-600 mt-1">Doctor: {escalation.doctorName}</p>
                                        </div>
                                        <div className="flex flex-col items-end space-y-2">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                escalation.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    escalation.status === 'IN_REVIEW' ? 'bg-blue-100 text-blue-800' :
                                                        escalation.status === 'RESOLVED' ? 'bg-green-100 text-green-800' :
                                                            'bg-purple-100 text-purple-800'
                                            }`}>
                                                {escalation.status}
                                            </span>
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                                escalation.priority === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                                                    escalation.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                                                        escalation.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-gray-100 text-gray-800'
                                            }`}>
                                                {escalation.priority}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="space-y-3">
                                        <div>
                                            <p className="text-sm text-gray-700"><strong>Date:</strong> {new Date(escalation.escalationDate).toLocaleDateString()}</p>
                                            <p className="text-sm text-gray-700 mt-2"><strong>Reason:</strong> {escalation.rejectedReason}</p>
                                        </div>

                                        <div className="flex flex-col space-y-2 pt-2">
                                            {escalation.status === EscalationStatus.PENDING && (
                                                <Button
                                                    onClick={() => handleTakeEscalation(escalation.id)}
                                                    disabled={isTaking}
                                                    variant="update"
                                                    size="sm"
                                                    className="w-full"
                                                >
                                                    {isTaking ? "Taking..." : "Take Escalation"}
                                                </Button>
                                            )}

                                            <Button
                                                onClick={() => onEscalationSelect(escalation.id)}
                                                variant="submit"
                                                size="sm"
                                                className="w-full"
                                            >
                                                View Protocol
                                            </Button>

                                            <Button
                                                onClick={() => setSelectedEscalation(escalation)}
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                            >
                                                Ask Question
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {filteredAndSortedEscalations.length === 0 && (
                        <Card>
                            <CardContent className="p-8 text-center">
                                <p className="text-gray-500">No escalations found matching your criteria.</p>
                            </CardContent>
                        </Card>
                    )}
                </CardContent>
            </Card>

            {/* Question Modal */}
            {selectedEscalation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <Card className="w-full max-w-md">
                        <CardHeader>
                            <CardTitle>Ask a Question</CardTitle>
                            <Button
                                onClick={() => setSelectedEscalation(null)}
                                variant="ghost"
                                size="sm"
                                className="absolute top-4 right-4"
                            >
                                ×
                            </Button>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center">
                                <Label>Patient:</Label>
                                <span className="font-medium">{selectedEscalation.patientName}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <Label>Doctor:</Label>
                                <span className="font-medium">{selectedEscalation.doctorName}</span>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="question">Your Question:</Label>
                                <textarea
                                    id="question"
                                    value={questionText}
                                    onChange={(e) => setQuestionText(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows={4}
                                    placeholder="Type your question here..."
                                />
                            </div>
                            <div className="flex space-x-3 justify-end pt-4">
                                <Button
                                    onClick={() => setSelectedEscalation(null)}
                                    variant="cancel"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleSendQuestionToDoctor}
                                    disabled={!questionText.trim() || isSendingQuestion}
                                    variant="submit"
                                >
                                    {isSendingQuestion ? "Sending..." : "Send Question"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
};

export default EscalationsList;