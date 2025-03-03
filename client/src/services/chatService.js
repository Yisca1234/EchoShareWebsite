import { io } from 'socket.io-client';
import apiClient from '../utils/apiClient';


class ChatService {
    constructor() {
        this.socket = null;
        
    }

    connect(token, userId) {
        const socketUrl = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:5000' 
            : 'https://app.echo-share.click';
        this.socket = io(socketUrl, {
            auth: {
                token
            },
            query: {
                userId
            }
        });

        this.socket.on('connect', () => {
            console.log('Connected to chat server');
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
    }

    offReceiveMessage() {
        if (!this.socket) return;
        this.socket.off('receive_message');
    }

    onChatUpdated(callback) {
        if (!this.socket) return;
        this.socket.on('chat_updated', callback);
    }

    offChatUpdated() {
        if (!this.socket) return;
        this.socket.off('chat_updated');
    }

    joinRoom(roomId) {
        if (!this.socket) return;
        this.socket.emit('join_room', roomId);
    }

    leaveRoom(roomId) {
        if (!this.socket) return;
        this.socket.emit('leave_room', roomId);
    }

    onTyping(callback) {
        if (!this.socket) return;
        this.socket.on('user_typing', callback);
    }

    offTyping() {
        if (!this.socket) return;
        this.socket.off('user_typing');
    }

    emitTyping(roomId, userId) {
        if (!this.socket) return;
        this.socket.emit('typing', { roomId, userId });
    }

    async getActiveChats() {
        try {
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

    async createRoom(channelId) {
        try {
            const response = await apiClient.post('/chat/rooms', {
                channelId
            });
            
            if (!response.data ) {
                throw new Error('Invalid response from server');
            }
            if(channelId !== '111' && !response.data.roomId) {
                throw new Error('Invalid response from server');
            }
            
            return {
                roomId: response.data.roomId,
                chats: response.data.chats || []
            };
        } catch (error) {
            console.error('Error creating chat room:', error);
            throw error;
        }
    }

    onMessageError(callback) {
        if (!this.socket) return;
        this.socket.on('message_error', callback);
    }

    offMessageError() {
        if (!this.socket) return;
        this.socket.off('message_error');
    }
}

export default new ChatService(); 