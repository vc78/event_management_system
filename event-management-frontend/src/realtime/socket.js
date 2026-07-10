import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

class SocketService {
    constructor() {
        this.client = null;
        this.connected = false;
        this.subscribers = new Map(); // topic -> array of callbacks
    }

    connect(token) {
        if (this.connected) return;

        this.client = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            connectHeaders: {
                Authorization: `Bearer ${token}`
            },
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = () => {
            this.connected = true;
            console.log('Connected to WebSocket');
            
            // Re-subscribe to all active topics upon reconnection
            this.subscribers.forEach((callbacks, topic) => {
                this.client.subscribe(topic, (message) => {
                    const data = JSON.parse(message.body);
                    callbacks.forEach(cb => cb(data));
                });
            });
        };

        this.client.onDisconnect = () => {
            this.connected = false;
            console.log('Disconnected from WebSocket');
        };

        this.client.activate();
    }

    disconnect() {
        if (this.client) {
            this.client.deactivate();
        }
        this.connected = false;
        this.subscribers.clear();
    }

    subscribe(topic, callback) {
        if (!this.subscribers.has(topic)) {
            this.subscribers.set(topic, []);
            
            // If already connected, immediately subscribe on the STOMP client
            if (this.connected && this.client) {
                this.client.subscribe(topic, (message) => {
                    const data = JSON.parse(message.body);
                    const callbacks = this.subscribers.get(topic) || [];
                    callbacks.forEach(cb => cb(data));
                });
            }
        }
        
        this.subscribers.get(topic).push(callback);

        // Return unsubscribe function
        return () => {
            const callbacks = this.subscribers.get(topic);
            if (callbacks) {
                const newCallbacks = callbacks.filter(cb => cb !== callback);
                if (newCallbacks.length === 0) {
                    this.subscribers.delete(topic);
                    // Note: We don't actively unsubscribe from the STOMP client here for simplicity,
                    // but in a production app we should manage StompSubscription objects and call .unsubscribe()
                } else {
                    this.subscribers.set(topic, newCallbacks);
                }
            }
        };
    }
}

export const socketService = new SocketService();
