import { io } from 'socket.io-client';
import apiClient from '../utils/apiClient';
import { store } from '../redux/store';
import { 
    setConnected, 
    addMessage, 
    setActiveChats, 
    setTypingUser,
    addNotification,
    markRoomAsRead
} from '../redux/slices/chatSlice';

class GlobalChatService {
    constructor() {
        this.socket = null;
        this.activeRooms = new Set();
        this.messageHandlers = new Map();
        this.typingHandlers = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectTimeout = null;
    }

    connect(token, userId) {
        if (this.socket && this.socket.connected) {
            //console.log('Socket already connected');
            return;
        }

        const socketUrl = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:5000' 
            : 'https://app.echo-share.click';
            
        //console.log(`Connecting to socket server at ${socketUrl} with userId ${userId}`);
        
        this.socket = io(socketUrl, {
            auth: { token },
            query: { userId },
            reconnection: true,
            reconnectionAttempts: this.maxReconnectAttempts,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 5000,
            timeout: 20000
        });

        this.setupConnectionHandlers();
        this.setupEventListeners();
    }

    setupConnectionHandlers() {
        if (!this.socket) return;

        this.socket.on('connect', () => {
            //console.log('Connected to chat server with socket ID:', this.socket.id);
            store.dispatch(setConnected(true));
            
            // Reset reconnect attempts on successful connection
            this.reconnectAttempts = 0;
            
            // Join all active rooms
            this.joinActiveRooms();
            console.log(1);
            // Fetch chats after connection
            this.fetchAndUpdateChats();
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
            store.dispatch(setConnected(false));
            this.handleReconnect();
        });

        this.socket.on('disconnect', (reason) => {
            //console.log('Disconnected from chat server:', reason);
            store.dispatch(setConnected(false));
            
            // If the disconnection was initiated by the server, try to reconnect
            if (reason === 'io server disconnect' || reason === 'transport close') {
                this.handleReconnect();
            }
        });

        this.socket.on('error', (err) => {
            console.error('Socket error:', err);
        });
    }

    handleReconnect() {
        // Clear any existing reconnect timeout
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        
        // Increment reconnect attempts
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts <= this.maxReconnectAttempts) {
            //console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
            
            // Exponential backoff for reconnect
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000);
            
            this.reconnectTimeout = setTimeout(() => {
                //console.log(`Reconnecting after ${delay}ms delay...`);
                this.socket.connect();
            }, delay);
        } else {
            console.error('Max reconnect attempts reached. Please refresh the page.');
        }
    }

    setupEventListeners() {
        if (!this.socket) return;

        // Listen for incoming messages
        this.socket.on('receive_message', this.handleIncomingMessage.bind(this));

        // Listen for typing events
        this.socket.on('user_typing', this.handleTypingEvent.bind(this));

        // Listen for chat updates
        this.socket.on('chat_updated', (updatedChat) => {
            //console.log('Chat updated:', updatedChat);
            console.log(2);
            this.fetchAndUpdateChats();
        });

        // Listen for message errors
        this.socket.on('message_error', (error) => {
            console.error('Message error:', error);
            // Handle message error (e.g., update UI to show failed message)
        });
    }

    handleIncomingMessage(data) {
        if (!data || !data.content) {
            console.error('Invalid message data received:', data);
            return;
        }

        //console.log('Received message:', data);

        const sender = data.sender || {};
        const senderAvatar = sender.avatar || {};
        const state = store.getState();
        const userId = state.user?.user?._id;
        const currentRoom = state.chat.currentRoom;

        // Create message object
        const messageObj = {
            id: data._id,
            content: data.content,
            sender: sender._id,
            senderName: sender.username || 'Unknown',
            senderImage: senderAvatar.imageLink || null,
            timestamp: data.createdAt || new Date().toISOString(),
            status: 'sent'
        };

        // Add message to the room's messages
        store.dispatch(addMessage({
            roomId: data.chat,
            message: messageObj
        }));

        // Check if the user is on the chat page
        const isOnChatPage = window.location.pathname.includes('/chat');

        // If message is not from current user and either:
        // 1. Not in current room, OR
        // 2. Not on chat page
        // Then create a notification
        if (sender._id !== userId && (data.chat !== currentRoom || !isOnChatPage)) {
            store.dispatch(addNotification({
                roomId: data.chat,
                message: messageObj
            }));
        }

        // If this is a confirmation of a pending message (has tempId), notify any registered handlers
        if (data.tempId && this.messageHandlers.has(data.tempId)) {
            const handler = this.messageHandlers.get(data.tempId);
            handler(data);
            this.messageHandlers.delete(data.tempId);
        }
    }

    handleTypingEvent({ roomId, userId, isTyping, username }) {
        //console.log(`Typing event: User ${username || userId} is ${isTyping ? 'typing' : 'stopped typing'} in room ${roomId}`);
        store.dispatch(setTypingUser({ roomId, userId, isTyping }));
        
        // Notify any registered typing handlers for this room
        if (this.typingHandlers.has(roomId)) {
            const handlers = this.typingHandlers.get(roomId);
            handlers.forEach(handler => handler({ userId, isTyping, username }));
        }
    }

    async fetchAndUpdateChats() {
        try {
            console.log('fetchAndUpdateChats');
            const response = await apiClient.get('/chat/user-chats');
            const chats = response.data;
            
            if (!Array.isArray(chats)) {
                console.error('Invalid chats data received:', chats);
                return;
            }
            
            //console.log(`Fetched ${chats.length} chats`);
            
            // Update Redux store with chats
            store.dispatch(setActiveChats(chats));
            //console.log('chats1', chats);
            
            // Join all chat rooms
            chats.forEach(chat => {
                this.joinRoom(chat._id);
            });
            
            return chats;
        } catch (error) {
            console.error('Error fetching chats:', error);
            return [];
        }
    }

    joinActiveRooms() {
        // Join all active rooms when reconnecting
        this.activeRooms.forEach(roomId => {
            this.joinRoom(roomId);
        });
    }

    joinRoom(roomId) {
        if (!this.socket || !roomId) return;
        
        // Only join if not already in the room
        if (!this.activeRooms.has(roomId)) {
            // //console.log(`Joining room ${roomId} with socket ID ${this.socket.id}`);
            this.socket.emit('join_room', roomId);
            this.activeRooms.add(roomId);
        }
    }

    leaveRoom(roomId) {
        if (!this.socket || !roomId) return;
        
        if (this.activeRooms.has(roomId)) {
            //console.log(`Leaving room ${roomId} with socket ID ${this.socket.id}`);
            this.socket.emit('leave_room', roomId);
            this.activeRooms.delete(roomId);
            
            // Remove any typing handlers for this room
            if (this.typingHandlers.has(roomId)) {
                this.typingHandlers.delete(roomId);
            }
        }
    }

    sendMessage(message) {
        if (!this.socket) return Promise.reject(new Error('Socket not connected'));
        
        return new Promise((resolve, reject) => {
            // Register a handler for this message
            if (message.tempId) {
                this.messageHandlers.set(message.tempId, (data) => {
                    resolve(data);
                });
                
                // Set a timeout to reject the promise if no response is received
                setTimeout(() => {
                    if (this.messageHandlers.has(message.tempId)) {
                        this.messageHandlers.delete(message.tempId);
                        reject(new Error('Message send timeout'));
                    }
                }, 10000);
            }
            
            this.socket.emit('send_message', message, (error) => {
                if (error) {
                    console.error('Error sending message:', error);
                    reject(error);
                }
            });
        });
    }

    emitTyping(roomId, userId, isTyping = true) {
        if (!this.socket || !roomId) return;
        this.socket.emit('typing', { roomId, userId, isTyping });
    }

    registerTypingHandler(roomId, handler) {
        if (!this.typingHandlers.has(roomId)) {
            this.typingHandlers.set(roomId, new Set());
        }
        this.typingHandlers.get(roomId).add(handler);
        
        return () => {
            // Return a function to unregister the handler
            if (this.typingHandlers.has(roomId)) {
                this.typingHandlers.get(roomId).delete(handler);
            }
        };
    }

    markRoomAsRead(roomId) {
        if (!roomId) return;
        
        // Update Redux store
        store.dispatch(markRoomAsRead(roomId));
        
        // Optionally, send to server that messages have been read
        if (this.socket) {
            this.socket.emit('mark_read', { roomId });
        }
    }

    disconnect() {
        // Clear any reconnect timeout
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.activeRooms.clear();
            this.messageHandlers.clear();
            this.typingHandlers.clear();
            store.dispatch(setConnected(false));
        }
    }

    // Get the list of active rooms
    getActiveRooms() {
        return Array.from(this.activeRooms);
    }

    // Check if connected to a specific room
    isInRoom(roomId) {
        return this.activeRooms.has(roomId);
    }

    // Check if socket is connected
    isConnected() {
        return this.socket && this.socket.connected;
    }
}

export default new GlobalChatService();