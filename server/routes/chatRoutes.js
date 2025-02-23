const express = require('express');
const router = express.Router();
const { auth } = require('../utils/middleware');
const {
    getUserChats,
    getChatMessages,
    updateChatParticipants,
    deleteChat,
    createRoom
} = require('../controllers/chatController');

// Create a new chat room
router.post('/rooms', auth, createRoom);

// Get all chats for current user
router.get('/user-chats', auth, getUserChats);

// Get messages for a specific chat
router.get('/:chatId/messages', auth, getChatMessages);

// Update chat participants (add/remove)
router.patch('/:chatId/participants', auth, updateChatParticipants);

// Delete chat
router.delete('/:chatId', auth, deleteChat);

module.exports = router; 