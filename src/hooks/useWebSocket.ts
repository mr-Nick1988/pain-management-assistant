import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// WebSocket endpoint (БЕЗ /api/ префикса!)
const WS_URL = 'http://localhost:8080/ws';

export const useWebSocket = () => {
    const [isConnected, setIsConnected] = useState(false);
    const clientRef = useRef<Client | null>(null);

    useEffect(() => {
        console.log('🔌 Initializing WebSocket connection to:', WS_URL);
        
        // Create STOMP client
        const client = new Client({
            webSocketFactory: () => new SockJS(WS_URL),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
            onConnect: () => {
                console.log('✅ WebSocket connected successfully');
                setIsConnected(true);
            },
            onDisconnect: () => {
                console.log('❌ WebSocket disconnected');
                setIsConnected(false);
            },
            onStompError: (frame) => {
                console.error('🚨 STOMP error:', frame);
            },
            debug: (str) => {
                console.log('🔍 STOMP Debug:', str);
            }
        });

        clientRef.current = client;
        client.activate();

        return () => {
            if (client.active) {
                console.log('🔌 Deactivating WebSocket connection');
                client.deactivate();
            }
        };
    }, []);

    return { client: clientRef.current, isConnected };
};
