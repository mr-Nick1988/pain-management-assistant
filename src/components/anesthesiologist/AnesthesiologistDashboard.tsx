import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, PageNavigation } from "../ui";

const AnesthesiologistDashboard: React.FC = () => {
    const navigate = useNavigate();

    const dashboardCards = [
        {
            title: "View All Escalated Recommendations",
            description: "Review all recommendations marked as ESCALATED",
            icon: "🩺",
            variant: "default" as const,
            action: () => navigate("/anesthesiologist/escalations"),
        },
        {
            title: "View All Rejected Recommendations",
            description: "See all REJECTED cases awaiting replacement",
            icon: "❌",
            variant: "reject" as const,
            action: () => navigate("/anesthesiologist/rejected"),
        },
        {
            title: "Pain Trends (Analytics)",
            description: "Analyze pain dynamics (coming soon)",
            icon: "📊",
            variant: "update" as const,
            action: () => console.log("Analytics module — coming soon"),
        },
    ];

    return (
        <div className="p-6 space-y-6">
            {/* Заголовок */}
            <div className="text-center mb-8">
                <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-blue-300 via-indigo-400 to-purple-400 bg-clip-text text-transparent animate-gradient drop-shadow-lg">
                    Anesthesiologist Dashboard
                </h1>
                <p className="text-lg font-medium bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent drop-shadow-md">
                    Manage escalated and rejected pain cases efficiently
                </p>
            </div>

            {/* Карточки */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dashboardCards.map((card, i) => (
                    <Card
                        key={i}
                        onClick={card.action}
                        className="hover:shadow-lg transition-shadow cursor-pointer"
                    >
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
                                {card.title.includes("View All") ? "View All" : "Open"}
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <PageNavigation />
        </div>
    );
};

export default AnesthesiologistDashboard;