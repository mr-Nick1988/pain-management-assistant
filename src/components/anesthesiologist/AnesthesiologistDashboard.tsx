import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle, PageNavigation } from "../ui";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useToast } from "../../contexts/ToastContext";
import type { PainEscalationNotificationDTO } from "../../types/common/types";

const AnesthesiologistDashboard: React.FC = () => {
    const navigate = useNavigate();
    const { client, isConnected } = useWebSocket();
    const toast = useToast();

    useEffect(() => {
        if (!client || !isConnected) {
            console.log('⏳ Waiting for WebSocket connection...', { client: !!client, isConnected });
            return;
        }

        console.log('📡 Subscribing to multiple topics for debugging...');

        // Subscribe to anesthesiologist topic
        const sub1 = client.subscribe('/topic/escalations/anesthesiologists', (message) => {
            console.log('📨 [ANESTHESIOLOGIST TOPIC] Received:', message.body);
            try {
                const notification: PainEscalationNotificationDTO = JSON.parse(message.body);
                console.log('✅ Parsed notification:', notification);

                const priorityConfig = {
                    CRITICAL: { icon: '🚨', color: 'red' },
                    ALERT: { icon: '⚠️', color: 'orange' },
                    INFO: { icon: 'ℹ️', color: 'blue' },
                };

                const config = priorityConfig[notification.priority] || priorityConfig.INFO;
                
                toast.warning(
                    `${config.icon} Pain Escalation: ${notification.patientName} (MRN: ${notification.patientMrn}) - ` +
                    `VAS ${notification.previousVas} → ${notification.currentVas} (Δ ${notification.vasChange >= 0 ? '+' : ''}${notification.vasChange})`
                );
            } catch (error) {
                console.error('❌ Error parsing notification:', error);
            }
        });

        // Subscribe to critical topic (для отладки)
        const sub2 = client.subscribe('/topic/escalations/critical', (message) => {
            console.log('🚨 [CRITICAL TOPIC] Received:', message.body);
            toast.error(`🚨 CRITICAL: ${message.body}`);
        });

        // Subscribe to dashboard topic (для отладки)
        const sub3 = client.subscribe('/topic/escalations/dashboard', (message) => {
            console.log('📊 [DASHBOARD TOPIC] Received:', message.body);
        });

        console.log('✅ Subscribed to all topics successfully');

        return () => {
            try {
                console.log('🔌 Unsubscribing from all topics');
                sub1.unsubscribe();
                sub2.unsubscribe();
                sub3.unsubscribe();
            } catch (error) {
                console.error('❌ Error unsubscribing:', error);
            }
        };
    }, [client, isConnected, toast]);

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
                
                {/* WebSocket Status */}
                <div className="mt-4 flex flex-col items-center justify-center gap-3">
                    <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="text-sm text-gray-300">
                            {isConnected ? '🟢 Real-time notifications active' : '🔴 Connecting to notifications...'}
                        </span>
                    </div>
                    
                    {/* Test Button */}
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                            try {
                                console.log('🧪 Sending test notification...');
                                const response = await fetch('http://localhost:8080/api/websocket/test/pain-escalation', {
                                    method: 'POST',
                                });
                                const data = await response.json();
                                console.log('✅ Test response:', data);
                                toast.success('Test notification sent! Check console for details.');
                            } catch (error) {
                                console.error('❌ Test failed:', error);
                                toast.error('Failed to send test notification');
                            }
                        }}
                        disabled={!isConnected}
                    >
                        🧪 Send Test Notification
                    </Button>
                </div>
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