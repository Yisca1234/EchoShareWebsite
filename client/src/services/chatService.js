import { io } from 'socket.io-client';
import apiClient from '../utils/apiClient';


class ChatService {
    constructor() {
        this.socket = null;
        this.messageCallbacks = [];
        this.typingCallbacks = [];
        this.chatUpdatedCallbacks = [];
        this.messagesReadCallbacks = [];
        this.messageErrorCallbacks = [];
    }

    connect(token, userId) {
        const socketUrl = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:5000' 
            : 'https://app.echo-share.click';
        //console.log(`Connecting to socket server at ${socketUrl} with userId ${userId}`);
        this.socket = io(socketUrl, {
            auth: {
                token
            },
            query: {
                userId
            }
        });

        this.socket.on('connect', () => {
            //console.log('Connected to chat server with socket ID:', this.socket.id);
            
            // Re-register all event listeners when connection is established
            this.registerEventListeners();
        });

        this.socket.on('connect_error', (err) => {
            console.error('Socket connection error:', err);
        });

        this.socket.on('error', (err) => {
            console.error('Socket error:', err);
            // Emit message_error event when there's a socket error during message sending
            if (err.type === 'message_error' && err.tempId) {
                this.socket.emit('message_error', { tempId: err.tempId });
            }
        });
        
        // Register event listeners immediately
        this.registerEventListeners();
    }
    
    registerEventListeners() {
        if (!this.socket) return;
        
        // Clear existing listeners to prevent duplicates
        this.socket.off('receive_message');
        this.socket.off('user_typing');
        this.socket.off('chat_updated');
        this.socket.off('messages_read');
        this.socket.off('message_error');
        
        // Re-register all callbacks
        if (this.messageCallbacks.length > 0) {
            this.messageCallbacks.forEach(callback => {
                this.socket.on('receive_message', callback);
            });
        }
        
        if (this.typingCallbacks.length > 0) {
            this.typingCallbacks.forEach(callback => {
                this.socket.on('user_typing', callback);
            });
        }
        
        if (this.chatUpdatedCallbacks.length > 0) {
            this.chatUpdatedCallbacks.forEach(callback => {
                this.socket.on('chat_updated', callback);
            });
        }
        
        if (this.messagesReadCallbacks.length > 0) {
            this.messagesReadCallbacks.forEach(callback => {
                this.socket.on('messages_read', callback);
            });
        }
        
        if (this.messageErrorCallbacks.length > 0) {
            this.messageErrorCallbacks.forEach(callback => {
                this.socket.on('message_error', callback);
            });
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    sendMessage(message) {
        if (!this.socket) return;
        this.socket.emit('send_message', message);
    }

    onReceiveMessage(callback) {
        if (!this.socket) return;
        this.socket.on('receive_message', callback);
        this.messageCallbacks.push(callback);
    }

    offReceiveMessage() {
        if (!this.socket) return;
        this.socket.off('receive_message');
        this.messageCallbacks = [];
    }

    onMessagesRead(callback) {
        if (!this.socket) return;
        this.socket.on('messages_read', callback);
        this.messagesReadCallbacks.push(callback);
    }

    offMessagesRead() {
        if (!this.socket) return;
        this.socket.off('messages_read');
        this.messagesReadCallbacks = [];
    }

    onChatUpdated(callback) {
        if (!this.socket) return;
        // console.log('onChatUpdated');
        this.socket.on('chat_updated', callback);
        this.chatUpdatedCallbacks.push(callback);
    }

    offChatUpdated() {
        if (!this.socket) return;
        this.socket.off('chat_updated');
        this.chatUpdatedCallbacks = [];
    }

    joinRoom(roomId) {
        if (!this.socket) return;
        //console.log(`Joining room ${roomId} with socket ID ${this.socket.id}`);
        this.socket.emit('join_room', roomId);
    }

    leaveRoom(roomId) {
        if (!this.socket) return;
        //console.log(`Leaving room ${roomId} with socket ID ${this.socket.id}`);
        this.socket.emit('leave_room', roomId);
    }

    onTyping(callback) {
        if (!this.socket) return;
        //console.log('Registering typing event listener');
        this.socket.on('user_typing', (data) => {
            // Only notify about other users typing, not the current user
            const currentUserId = sessionStorage.getItem('userId');
            if (data.userId !== currentUserId) {
                callback(data);
            }
        });
        this.typingCallbacks.push(callback);
    }

    offTyping() {
        if (!this.socket) return;
        //console.log('Removing typing event listener');
        this.socket.off('user_typing');
        this.typingCallbacks = [];
    }

    emitTyping(roomId, userId, isTyping = true) {
        if (!this.socket) return;
        //console.log(`Emitting typing event: User ${userId} is ${isTyping ? 'typing' : 'stopped typing'} in room ${roomId}`);
        this.socket.emit('typing', { roomId, userId, isTyping });
    }

    async getActiveChats() {
        try {
            // console.log('getActiveChats');
            const response = await apiClient.get('/chat/user-chats');
            return response.data;
        } catch (error) {
            console.error('Error fetching chats:', error);
            return [];
        }
    }

    async getChatMessages(chatId) {
        try {
            const response = await apiClient.get(`/chat/${chatId}/messages`);
            return response.data.messages;
        } catch (error) {
            console.error('Error fetching messages:', error);
            throw error;
        }
    }

    async getChatById(chatId) {
        try {
            const response = await apiClient.get(`/chat/${chatId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching chat by ID:', error);
            return null;
        }
    }

    async createRoom(channelId) {
        try {
            if (!channelId) {
                throw new Error('Channel ID is required');
            }

            const response = await apiClient.post('/chat/create-room', {
                channelId
            });
            
            if (!response.data) {
                throw new Error('Invalid response from server: missing or invalid chats array');
            }

            
            return {
                newChat: response.data.newChat
            };
        } catch (error) {
            console.error('Error creating chat room:', error);
            throw error;
        }
    }

    onMessageError(callback) {
        if (!this.socket) return;
        this.socket.on('message_error', callback);
        this.messageErrorCallbacks.push(callback);
    }

    offMessageError() {
        if (!this.socket) return;
        this.socket.off('message_error');
        this.messageErrorCallbacks = [];
    }
}

export default new ChatService(); 