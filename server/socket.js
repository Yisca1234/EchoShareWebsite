const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Message = require('./models/message');
const Chat = require('./models/chat');
const { SECRET } = require('./utils/config');
const User = require('./models/user');

function setupSocket(server) {
    const io = new Server(server, {
        cors: process.env.NODE_ENV === 'development' ? {
            origin: "http://localhost:5173", // Vite's default port
            methods: ["GET", "POST"],
            credentials: true
        } : false
    });

    // Socket.IO middleware for authentication
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;
            if (!token) {
                return next(new Error('Authentication error'));
            }

            const decoded = jwt.verify(token, SECRET);
            socket.userId = socket.handshake.query.userId;
            next();
        } catch (error) {
            return next(new Error('Authentication error'));
        }
    });

    const connectedUsers = new Map();

    io.on('connection', (socket) => {
        ////console.log(`User connected: ${socket.userId}`);
        connectedUsers.set(socket.userId, socket.id);

        // Join a chat room
        socket.on('join_room', async (roomId) => {
            //
            // //console.log(`User ${socket.userId} (socket ${socket.id}) is joining room ${roomId}`);
            try {
                const chat = await Chat.findById(roomId);
                if (!chat) {
                    console.error(`Chat room ${roomId} not found`);
                    socket.emit('error', { message: 'Chat not found' });
                    return;
                }
                
                socket.join(roomId);
                ////console.log(`User ${socket.userId} (socket ${socket.id}) successfully joined room ${roomId}`);
                
                // Mark all messages in this room as read by this user
                await Message.updateMany(
                    { 
                        chat: roomId,
                        sender: { $ne: socket.userId },
                        readBy: { $ne: socket.userId }
                    },
                    { $addToSet: { readBy: socket.userId } }
                );
                
                // Notify other users in the room that this user has joined
                socket.to(roomId).emit('user_joined', {
                    userId: socket.userId,
                    roomId
                });
                
                // Emit an event to the user who joined to update their UI
                socket.emit('messages_read', { roomId });
            } catch (error) {
                console.error(`Error joining chat room ${roomId}:`, error);
                socket.emit('error', { message: 'Error joining chat room' });
            }
        });

        // Leave a chat room
        socket.on('leave_room', (roomId) => {
            ////console.log(`User ${socket.userId} (socket ${socket.id}) is leaving room ${roomId}`);
            socket.leave(roomId);
            ////console.log(`User ${socket.userId} (socket ${socket.id}) successfully left room ${roomId}`);
            
            // Notify other users in the room that this user has left
            socket.to(roomId).emit('user_left', {
                userId: socket.userId,
                roomId
            });
        });

        // Handle new message
        socket.on('send_message', async (messageData) => {
            try {
                const { content, roomId, tempId } = messageData;

                // First get the user data to ensure we have all sender information
                const sender = await User.findById(socket.userId).select('_id avatar.username avatar.imageLink');
                if (!sender) {
                    socket.emit('message_error', { tempId, error: 'Sender not found' });
                    return;
                }
                
                // Create and save the new message
                const newMessage = await Message.create({
                    chat: roomId,
                    sender: socket.userId,
                    content,
                    readBy: [socket.userId]
                });
                
                // Attach sender information directly
                newMessage.sender = sender;
                
                // Update the lastMessage reference in the chat
                await Chat.findByIdAndUpdate(roomId, {
                    lastMessage: newMessage._id,
                    updatedAt: new Date()
                });
                
                const messageToSend = {
                    _id: newMessage._id,
                    content: newMessage.content,
                    sender: newMessage.sender,
                    chat: newMessage.chat,
                    createdAt: newMessage.createdAt,
                    readBy: newMessage.readBy,
                    tempId // Include tempId in response for client-side matching
                };
                
                // Emit to all users in the room
                try {
                    io.to(roomId).emit('receive_message', messageToSend);
                    ////console.log('message sent by server');

                } catch (error) {
                    console.error('Error emitting message to room:', error);
                    socket.emit('message_error', { tempId, error: 'Failed to send message' });
                    return;
                }

                // Get the chat with participants
                const chat = await Chat.findById(roomId)
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
                    });

                // Emit chat update to all participants
                chat.participants.forEach(participant => {
                    const participantSocketId = connectedUsers.get(participant._id.toString());
                    if (participantSocketId) {
                        // For participants other than the sender, mark the chat as having unread messages
                        const hasUnread = participant._id.toString() !== socket.userId;
                        const chatToSend = {
                            ...chat.toObject(),
                            hasUnread
                        };
                        
                        // console.log(`Sending chat update to ${participant._id.toString()} with hasUnread:`, hasUnread);
                        io.to(participantSocketId).emit('chat_updated', chatToSend);
                    }
                });
            } catch (error) {
                console.error('Error sending message:', error);
                socket.emit('message_error', { 
                    tempId: messageData.tempId, 
                    error: 'Error sending message' 
                });
            }
        });

        // Handle typing status
        socket.on('typing', ({ roomId, userId, isTyping }) => {
            ////console.log(`User ${userId} (socket ${socket.id}) is ${isTyping ? 'typing' : 'stopped typing'} in room ${roomId}`);
            
            // Check if the socket is in the room
            const rooms = Array.from(socket.rooms);
            if (!rooms.includes(roomId)) {
                console.warn(`Socket ${socket.id} is not in room ${roomId}, joining now`);
                socket.join(roomId);
            }
            
            // Broadcast typing status to all other users in the room
            socket.to(roomId).emit('user_typing', {
                userId: userId,
                roomId,
                isTyping
            });
            
            ////console.log(`Typing status broadcast to room ${roomId}`);
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            ////console.log(`User ${socket.userId} (socket ${socket.id}) disconnected`);
            
            // Get all rooms the socket was in
            const rooms = Array.from(socket.rooms);
            ////console.log(`Socket ${socket.id} was in rooms:`, rooms);
            
            // Notify all rooms that the user has disconnected
            rooms.forEach(room => {
                if (room !== socket.id) { // Skip the default room (socket.id)
                    socket.to(room).emit('user_disconnected', {
                        userId: socket.userId,
                        roomId: room
                    });
                }
            });
            
            connectedUsers.delete(socket.userId);
        });
    });

    return io;
}

module.exports = setupSocket; 