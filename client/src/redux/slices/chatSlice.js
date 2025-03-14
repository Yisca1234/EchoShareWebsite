import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    activeChats: [], // List of chat rooms the user is part of
    messages: {}, // Messages grouped by room ID
    typingUsers: {}, // Users currently typing in each room, stored as {roomId: {userId: true}}
    currentRoom: null,
    isConnected: false,
    error: null,
    notifications: {}, // Notifications grouped by room ID
    unreadCounts: {}, // Unread message counts by room ID
    notificationSettings: {
        sound: true, // Whether to play sound notifications
        desktop: true, // Whether to show desktop notifications
        badge: true, // Whether to show badge notifications
    },
    lastSeenMessages: {}, // Last seen message ID by room ID
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
                    //console.log(`Updating message with tempId ${tempId} to server ID ${message.id}`);
                    // Replace the pending message with the confirmed one
                    state.messages[roomId][index] = {
                        ...state.messages[roomId][index], // Keep existing properties
                        ...message, // Override with new properties
                        id: message.id || tempId, // Ensure we have an ID
                        status: message.status || 'sent' // Ensure we have a status
                    };
                } else {
                    // If for some reason we can't find the message to update, add it
                    console.warn(`Could not find message with tempId ${tempId} to update`);
                    state.messages[roomId].push(message);
                }
            } else {
                // Check if this message already exists to prevent duplicates
                const existingIndex = state.messages[roomId].findIndex(
                    msg => 
                        // Check by ID first
                        (message.id && msg.id === message.id) || 
                        // Then check by content, sender and approximate timestamp
                        (msg.content === message.content && 
                         msg.sender === message.sender && 
                         // Compare timestamps with some tolerance for slight differences
                         (Math.abs(new Date(msg.timestamp) - new Date(message.timestamp)) < 5000))
                );
                
                if (existingIndex === -1) {
                    // Only add if it doesn't exist
                    state.messages[roomId].push(message);
                    
                    // Increment unread count if this is not the current room
                    if (roomId !== state.currentRoom) {
                        if (!state.unreadCounts[roomId]) {
                            state.unreadCounts[roomId] = 0;
                        }
                        state.unreadCounts[roomId]++;
                    }
                } else {
                    // Update existing message with any new information
                    // This is useful for updating sender information that might have been incomplete
                    state.messages[roomId][existingIndex] = {
                        ...state.messages[roomId][existingIndex],
                        ...message,
                        // Keep the original ID if the new message doesn't have one
                        id: message.id || state.messages[roomId][existingIndex].id,
                        // Update status if provided
                        status: message.status || state.messages[roomId][existingIndex].status || 'sent'
                    };
                }
            }
        },
        addNotification: (state, action) => {
            const { roomId, message } = action.payload;
            
            // Initialize notifications array for room if it doesn't exist
            if (!state.notifications[roomId]) {
                state.notifications[roomId] = [];
            }
            
            // Add notification
            state.notifications[roomId].push(message);
            
            // Increment unread count
            if (!state.unreadCounts[roomId]) {
                state.unreadCounts[roomId] = 0;
            }
            state.unreadCounts[roomId]++;
            
            // Update last seen message for this room
            state.lastSeenMessages[roomId] = message.id;
        },
        clearNotifications: (state, action) => {
            const roomId = action.payload;
            
            if (roomId) {
                // Clear notifications for specific room
                if (state.notifications[roomId]) {
                    state.notifications[roomId] = [];
                }
                // Clear unread count for this room
                state.unreadCounts[roomId] = 0;
            } else {
                // Clear all notifications
                state.notifications = {};
                state.unreadCounts = {};
            }
        },
        markRoomAsRead: (state, action) => {
            const roomId = action.payload;
            
            if (roomId) {
                // Clear notifications for this room
                if (state.notifications[roomId]) {
                    state.notifications[roomId] = [];
                }
                // Reset unread count for this room
                state.unreadCounts[roomId] = 0;
                
                // Update last seen message for this room
                if (state.messages[roomId] && state.messages[roomId].length > 0) {
                    const lastMessage = state.messages[roomId][state.messages[roomId].length - 1];
                    state.lastSeenMessages[roomId] = lastMessage.id;
                }
                
                // Mark the chat as read in the activeChats array
                const chatIndex = state.activeChats.findIndex(chat => chat._id === roomId);
                if (chatIndex !== -1) {
                    // console.log(`Marking chat ${roomId} as read in Redux state`);
                    state.activeChats[chatIndex].hasUnread = false;
                }
            }
        },
        setActiveChats: (state, action) => {
            // console.log('Setting active chats:', action.payload);
            state.activeChats = action.payload;
            // console.log('Active chats updated:', state.activeChats);
        },
        setCurrentRoom: (state, action) => {
            state.currentRoom = action.payload;
            
            // Clear notifications for the current room
            if (action.payload && state.notifications[action.payload]) {
                state.notifications[action.payload] = [];
                state.unreadCounts[action.payload] = 0;
                
                // Update last seen message for this room
                if (state.messages[action.payload] && state.messages[action.payload].length > 0) {
                    const lastMessage = state.messages[action.payload][state.messages[action.payload].length - 1];
                    state.lastSeenMessages[action.payload] = lastMessage.id;
                }
            }
        },
        setTypingUser: (state, action) => {
            const { roomId, userId, isTyping } = action.payload;
            if (!state.typingUsers[roomId]) {
                state.typingUsers[roomId] = {};
            }
            
            if (isTyping) {
                state.typingUsers[roomId][userId] = true;
            } else {
                delete state.typingUsers[roomId][userId];
            }
        },
        updateNotificationSettings: (state, action) => {
            state.notificationSettings = {
                ...state.notificationSettings,
                ...action.payload
            };
        },
        clearChat: (state, action) => {
            const roomId = action.payload;
            if (roomId) {
                delete state.messages[roomId];
                delete state.typingUsers[roomId];
                delete state.notifications[roomId];
                delete state.unreadCounts[roomId];
                delete state.lastSeenMessages[roomId];
            } else {
                state.messages = {};
                state.typingUsers = {};
                state.activeChats = [];
                state.currentRoom = null;
                state.notifications = {};
                state.unreadCounts = {};
                state.lastSeenMessages = {};
            }
        },
        updateChatUnreadStatus: (state, action) => {
            const { roomId, hasUnread } = action.payload;
            const chatIndex = state.activeChats.findIndex(chat => chat._id === roomId);
            if (chatIndex !== -1) {
                state.activeChats[chatIndex].hasUnread = hasUnread;
            }
        }
    }
});

export const {
    setConnected,
    setError,
    addMessage,
    addNotification,
    clearNotifications,
    markRoomAsRead,
    setActiveChats,
    setCurrentRoom,
    setTypingUser,
    updateNotificationSettings,
    clearChat,
    updateChatUnreadStatus
} = chatSlice.actions;

// Selectors
export const selectTotalUnreadCount = (state) => {
    return Object.values(state.chat.unreadCounts).reduce((total, count) => total + count, 0);
};

export const selectUnreadCountByRoom = (state, roomId) => {
    return state.chat.unreadCounts[roomId] || 0;
};

export const selectNotificationSettings = (state) => {
    return state.chat.notificationSettings;
};

export default chatSlice.reducer;