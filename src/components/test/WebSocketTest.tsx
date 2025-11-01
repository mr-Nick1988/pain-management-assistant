import React, { useEffect, useState } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../ui';

const WebSocketTest: React.FC = () => {
    const { client, isConnected } = useWebSocket();
    const [messages, setMessages] = useState<string[]>([]);
    const [testResult, setTestResult] = useState<string>('');

    useEffect(() => {
        if (!client || !isConnected) return;

        console.log('🧪 WebSocket Test Component: Subscribing to test topics');

        // Subscribe to anesthesiologist escalations
        const sub1 = client.subscribe('/topic/escalations/anesthesiologists', (message) => {
            const msg = `📨 [ANESTHESIOLOGIST] ${new Date().toLocaleTimeString()}: ${message.body}`;
            console.log(msg);
            setMessages(prev => [msg, ...prev].slice(0, 20));
        });

        // Subscribe to doctor escalations
        const sub2 = client.subscribe('/topic/escalations/doctors', (message) => {
            const msg = `📨 [DOCTOR] ${new Date().toLocaleTimeString()}: ${message.body}`;
            console.log(msg);
            setMessages(prev => [msg, ...prev].slice(0, 20));
        });

        // Subscribe to critical escalations
        const sub3 = client.subscribe('/topic/escalations/critical', (message) => {
            const msg = `🚨 [CRITICAL] ${new Date().toLocaleTimeString()}: ${message.body}`;
            console.log(msg);
            setMessages(prev => [msg, ...prev].slice(0, 20));
        });

        return () => {
            sub1.unsubscribe();
            sub2.unsubscribe();
            sub3.unsubscribe();
        };
    }, [client, isConnected]);

    const sendTestNotification = async () => {
        setTestResult('Sending test notification...');
        try {
            const response = await fetch('http://localhost:8080/api/websocket/test/pain-escalation', {
                method: 'POST',
            });
            const data = await response.json();
            setTestResult(`✅ Test sent: ${JSON.stringify(data)}`);
        } catch (error) {
            setTestResult(`❌ Error: ${error}`);
        }
    };

    const checkWebSocketStatus = async () => {
        setTestResult('Checking WebSocket status...');
        try {
            const response = await fetch('http://localhost:8080/api/websocket/status');
            const data = await response.json();
            setTestResult(`✅ Status: ${JSON.stringify(data, null, 2)}`);
        } catch (error) {
            setTestResult(`❌ Error: ${error}`);
        }
    };

    return (
        <div className="p-6 space-y-6 max-w-6xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>🧪 WebSocket Test Panel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Connection Status */}
                    <div className="flex items-center gap-3 p-4 bg-gray-800 rounded-lg">
                        <div className={`w-4 h-4 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span className="font-semibold">
                            {isConnected ? '✅ WebSocket Connected' : '❌ WebSocket Disconnected'}
                        </span>
                    </div>

                    {/* Test Buttons */}
                    <div className="flex gap-3">
                        <Button onClick={sendTestNotification} disabled={!isConnected}>
                            📤 Send Test Notification
                        </Button>
                        <Button onClick={checkWebSocketStatus} variant="outline">
                            🔍 Check Backend Status
                        </Button>
                        <Button onClick={() => setMessages([])} variant="outline">
                            🗑️ Clear Messages
                        </Button>
                    </div>

                    {/* Test Result */}
                    {testResult && (
                        <div className="p-4 bg-gray-800 rounded-lg">
                            <pre className="text-xs text-green-400 whitespace-pre-wrap">{testResult}</pre>
                        </div>
                    )}

                    {/* Subscribed Topics */}
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <h3 className="font-semibold mb-2">📡 Subscribed Topics:</h3>
                        <ul className="text-sm space-y-1 text-gray-300">
                            <li>✅ /topic/escalations/anesthesiologists</li>
                            <li>✅ /topic/escalations/doctors</li>
                            <li>✅ /topic/escalations/critical</li>
                        </ul>
                    </div>

                    {/* Messages Log */}
                    <div className="p-4 bg-gray-900 rounded-lg">
                        <h3 className="font-semibold mb-2">📨 Received Messages ({messages.length}):</h3>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {messages.length === 0 ? (
                                <p className="text-gray-500 text-sm">No messages yet. Click "Send Test Notification" to test.</p>
                            ) : (
                                messages.map((msg, i) => (
                                    <div key={i} className="text-xs p-2 bg-gray-800 rounded border-l-4 border-blue-500">
                                        {msg}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Instructions */}
                    <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        <h3 className="font-semibold mb-2">📋 Testing Instructions:</h3>
                        <ol className="text-sm space-y-1 text-gray-300 list-decimal list-inside">
                            <li>Check that WebSocket shows "Connected" above</li>
                            <li>Click "Send Test Notification" button</li>
                            <li>You should see a message appear in the log below</li>
                            <li>Check browser console (F12) for detailed logs</li>
                            <li>If no message appears, check backend logs</li>
                        </ol>
                    </div>

                    {/* Backend Commands */}
                    <div className="p-4 bg-gray-800 rounded-lg">
                        <h3 className="font-semibold mb-2">🖥️ Backend Test Commands:</h3>
                        <div className="space-y-2 text-xs font-mono">
                            <div className="p-2 bg-gray-900 rounded">
                                <p className="text-gray-400 mb-1"># Check WebSocket status:</p>
                                <p className="text-green-400">curl http://localhost:8080/api/websocket/status</p>
                            </div>
                            <div className="p-2 bg-gray-900 rounded">
                                <p className="text-gray-400 mb-1"># Send test notification:</p>
                                <p className="text-green-400">curl -X POST http://localhost:8080/api/websocket/test/pain-escalation</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default WebSocketTest;
