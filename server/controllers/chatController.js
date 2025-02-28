const Chat = require('../models/chat');
const Message = require('../models/message');
const mongoose = require('mongoose');
const User = require('../models/user');

// Create a new chat (one-on-one or group)
// const createChat = async (req, res) => {
//     console.log('here-controller');
//     try {
//         console.log(name, participants, isGroupChat);
//         const { name, participants, isGroupChat } = req.body;
        
//         if (!participants || participants.length < 1) {
//             return res.status(400).json({ message: 'At least one participant is required' });
//         }

//         // Add the current user to participants if not already included
//         const allParticipants = [...new Set([...participants, req.user._id.toString()])];

//         // For one-on-one chats, check if a chat already exists
//         if (!isGroupChat && allParticipants.length === 2) {
//             const existingChat = await Chat.findOne({
//                 isGroupChat: false,
//                 participants: { $all: allParticipants }
//             });

//             if (existingChat) {
//                 return res.status(200).json(existingChat);
//             }
//         }

//         const newChat = await Chat.create({
//             name: name || 'Chat',
//             participants: allParticipants,
//             createdBy: req.user._id,
//             isGroupChat: isGroupChat || false
//         });

//         const populatedChat = await Chat.findById(newChat._id)
//             .populate('participants', 'username email')
//             .populate('createdBy', 'username email');

//         res.status(201).json(populatedChat);
//     } catch (error) {
//         console.error('Error creating chat:', error);
//         res.status(500).json({ message: 'Error creating chat' });
//     }
// };

// Get all chats for current user
const getUserChats = async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.user._id })
            .populate({
                path: 'participants',
                select: '_id avatar.username avatar.imageLink'
            })
            .populate('lastMessage')
            .populate('createdBy', '_id avatar.username')
            .sort({ updatedAt: -1 });

        res.status(200).json(chats);
    } catch (error) {
        console.error('Error fetching chats:', error);
        res.status(500).json({ message: 'Error fetching chats' });
    }
};

// Get chat messages
const getChatMessages = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { page = 1, limit = 50 } = req.query;
        const userId = req.header('userId');
        

        // Verify chat exists and user is a participant
        const chat = await Chat.findOne({
            _id: chatId,
            participants: userId
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found or unauthorized' });
        }

        const messages = await Message.find({ chat: chatId })
            .populate({
                path: 'sender',
                select: '_id avatar.username avatar.imageLink'
            })
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const totalMessages = await Message.countDocuments({ chat: chatId });

        res.status(200).json({
            messages: messages.reverse(),
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalMessages / limit),
            totalMessages
        });
    } catch (error) {
        console.error('Error fetching messages:', error);
        res.status(500).json({ message: 'Error fetching messages' });
    }
};

// Add/Remove participants from group chat
const updateChatParticipants = async (req, res) => {
    try {
        const { chatId } = req.params;
        const { participants, action } = req.body;

        if (!['add', 'remove'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action' });
        }

        const chat = await Chat.findOne({
            _id: chatId,
            isGroupChat: true,
            createdBy: req.user._id
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found or unauthorized' });
        }

        if (action === 'add') {
            chat.participants = [...new Set([...chat.participants, ...participants])];
        } else {
            chat.participants = chat.participants.filter(
                p => !participants.includes(p.toString())
            );
        }

        await chat.save();

        const updatedChat = await Chat.findById(chatId)
            .populate('participants', 'username email')
            .populate('createdBy', 'username email');

        res.status(200).json(updatedChat);
    } catch (error) {
        console.error('Error updating chat participants:', error);
        res.status(500).json({ message: 'Error updating chat participants' });
    }
};

// Delete chat (only for group creator or one-on-one chats)
const deleteChat = async (req, res) => {
    try {
        const { chatId } = req.params;

        const chat = await Chat.findOne({
            _id: chatId,
            $or: [
                { createdBy: req.user._id },
                { participants: req.user._id, isGroupChat: false }
            ]
        });

        if (!chat) {
            return res.status(404).json({ message: 'Chat not found or unauthorized' });
        }

        // Delete all messages in the chat
        await Message.deleteMany({ chat: chatId });
        await chat.remove();

        res.status(200).json({ message: 'Chat deleted successfully' });
    } catch (error) {
        console.error('Error deleting chat:', error);
        res.status(500).json({ message: 'Error deleting chat' });
    }
};

const createRoom = async (req, res) => {
    try {
        const { channelId } = req.body;
        const userId = req.header('userId');
        const channel = await User.findById(userId).select('avatar.username avatar.imageLink');
        if (!channel) {
            return res.status(404).json({ message: 'User not found' });
        }


        // Get channel details
        console.log('userId', userId);
        let newChat;
        if(channelId !== '111') {
            const existingChat = await Chat.findOne({
                $and: [
                    { participants: { $size: 2 } },  // Ensure exactly 2 participants
                    { participants: { $all: [userId, channelId] } },
                    { isGroupChat: false }
                ]
            }).populate({
                path: 'participants',
                select: '_id avatar.username avatar.imageLink'
            });
    
            if (existingChat) {
                const chats = await Chat.find({ participants: userId })
                    .populate({
                        path: 'participants',
                        select: '_id avatar.username avatar.imageLink'
                    })
                    .populate({
                        path: 'lastMessage',
                        populate: {
                            path: 'sender',
                            select: '_id avatar.username avatar.imageLink'
                        }
                    })
                    .populate('createdBy', '_id avatar.username')
                    .sort({ updatedAt: -1 });
    
                return res.status(200).json({ roomId: existingChat._id, chats });
            }
            // channelId equal 111 if the chatpage is open trough the navbar
            // Create new chat room without a name for one-on-one chats
            newChat = await Chat.create({
                participants: [userId, channelId],
                createdBy: userId,
                isGroupChat: false
            });
        }

        // Get updated list of chats with populated data
        const chats = await Chat.find({ participants: userId })
            .populate({
                path: 'participants',
                select: '_id avatar.username avatar.imageLink'
            })
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'sender',
                    select: '_id avatar.username avatar.imageLink'
                }
            })
            .populate('createdBy', '_id avatar.username')
            .sort({ updatedAt: -1 });

        res.status(201).json({ roomId: newChat?._id, chats });
    } catch (error) {
        console.error('Error creating chat room:', error);
        res.status(500).json({ message: 'Error creating chat room' });
    }
};

module.exports = {
    createRoom,
    getUserChats,
    getChatMessages,
    updateChatParticipants,
    deleteChat
}; 