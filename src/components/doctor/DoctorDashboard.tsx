import React from "react";
import {useNavigate} from "react-router-dom";
import {Button, Card, CardContent, CardDescription, CardHeader, CardTitle, PageNavigation} from "../ui";

const DoctorDashboard: React.FC = () => {
    const navigate = useNavigate();

    const dashboardCards = [
        {
            title: "Register Patient",
            description: "Register a new patient in the system",
            action: () => navigate("register-patient"),
            variant: "default" as const,
            icon: "👤"
        },
        {
            title: "Quick Search",
            description: "Quick search by MRN, email or phone",
            action: () => navigate("quick-search"),
            variant: "update" as const,
            icon: "🔍"
        },
        {
            title: "All Patients",
            description: "View and manage all patients",
            action: () => navigate("patients-list"),
            variant: "default" as const,
            icon: "📋"
        },
        {
            title: "Pending Recommendations",
            description: "Review and approve/reject recommendations",
            action: () => navigate("recommendations"),
            variant: "approve" as const,
            icon: "📝"
        }
    ];

    return (
        <div className="p-6 space-y-6">
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-yellow-300 via-orange-400 to-pink-400 bg-clip-text text-transparent animate-gradient drop-shadow-lg">
                    Doctor Dashboard
                </h1>
                <p className="text-lg font-medium bg-gradient-to-r from-white via-yellow-100 to-white bg-clip-text text-transparent drop-shadow-md">
                    Manage patients and review recommendations
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {dashboardCards.map((card, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={card.action}>
                        <CardHeader>
                            <div className="text-4xl mb-2">{card.icon}</div>
                            <CardTitle>{card.title}</CardTitle>
                            <CardDescription>{card.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button
                                variant={card.variant}
                                className="w-full"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    card.action();
                                }}
                            >
                                Open
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <PageNavigation />
        </div>
    );
};

export default DoctorDashboard;
