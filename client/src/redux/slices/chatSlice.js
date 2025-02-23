import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    activeChats: [], // List of chat rooms the user is part of
    messages: {}, // Messages grouped by room ID
    typingUsers: {}, // Users currently typing in each room
    currentRoom: null,
    isConnected: false,
    error: null
};

const chatSlice = createSlice({
    name: 'chat',
    initialState,
    reducers: {
        setConnected: (state, action) => {
            state.isConnected = action.payload;
            state.error = null;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        addMessage: (state, action) => {
            const { roomId, message, messages, tempId } = action.payload;
            
            // Initialize messages array for room if it doesn't exist
            if (!state.messages[roomId]) {
                state.messages[roomId] = [];
            }

            if (messages) {
                // Adding multiple messages (initial load)
                state.messages[roomId] = messages;
            } else if (tempId) {
                // Updating an existing message (after server confirmation)
                const index = state.messages[roomId].findIndex(msg => msg.id === tempId);
                if (index !== -1) {
                    state.messages[roomId][index] = message;
                }
            } else {
                // Adding a single new message
                state.messages[roomId].push(message);
            }
        },
        setActiveChats: (state, action) => {
            state.activeChats = action.payload;
        },
        setCurrentRoom: (state, action) => {
            state.currentRoom = action.payload;
        },
        setTypingUser: (state, action) => {
            const { roomId, userId, isTyping } = action.payload;
            if (!state.typingUsers[roomId]) {
                state.typingUsers[roomId] = new Set();
            }
            if (isTyping) {
                state.typingUsers[roomId].add(userId);
            } else {
                state.typingUsers[roomId].delete(userId);
            }
        },
        clearChat: (state, action) => {
            const roomId = action.payload;
            if (roomId) {
                delete state.messages[roomId];
                delete state.typingUsers[roomId];
            } else {
                state.messages = {};
                state.typingUsers = {};
                state.activeChats = [];
                state.currentRoom = null;
            }
        }
    }
});

export const {
    setConnected,
    setError,
    addMessage,
    setActiveChats,
    setCurrentRoom,
    setTypingUser,
    clearChat
} = chatSlice.actions;

export default chatSlice.reducer; 