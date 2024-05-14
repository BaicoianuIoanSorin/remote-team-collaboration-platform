// Import the WebSocket polyfill for Node.js environment
let WebSocketImplementation: typeof WebSocket;

if (typeof window === 'undefined') {
    WebSocketImplementation = require('ws');
} else {
    WebSocketImplementation = WebSocket;
}

class WebSocketClient {
    private url: string;
    private client: WebSocket;
    private isConnected: boolean = false;  // Add isConnected property
    private messageQueue: any[] = [];      // Add messageQueue property

    constructor(url: string) {
        this.url = url;
        this.client = new WebSocketImplementation(this.url);

        this.client.onopen = () => {
            this.isConnected = true;
            console.log('WebSocket connection opened!');
            this.messageQueue.forEach((message) => this.send(message));
            this.messageQueue = [];
        };

        this.client.onclose = () => {
            this.isConnected = false;
            console.log('WebSocket connection closed!');
        };

        this.client.onmessage = this.onMessage;
        this.client.onerror = (err) => {
            console.log('Error while connecting to the server: ', err);
        };

        console.log('WebSocketClient initialized!');
    }

    send(message: any) {
        const messageCopy = JSON.parse(JSON.stringify(message, (key, value) => {
            return value instanceof Date ? value.toISOString() : value;
        }));

        if (this.isConnected) {
            console.log('Sending message: ', JSON.stringify(messageCopy));
            this.client.send(JSON.stringify(messageCopy));
        } else {
            console.log('Queueing message: ', messageCopy);
            this.messageQueue.push(messageCopy);
        }
    }

    onMessage = (message: any) => {
        const messagePayload = JSON.parse(message.data);
        console.log('Received message from the server: ', messagePayload);

        if (this.onReceiveMessage) this.onReceiveMessage(messagePayload);
    };

    close = () => {
        this.client.close();
    };

    onReceiveMessage = (message: any) => {};
}

const client = new WebSocketClient('ws://192.168.1.47:8080/chat');

export default client;