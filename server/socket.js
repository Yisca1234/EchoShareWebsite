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
        console.log(`User connected: ${socket.userId}`);
        connectedUsers.set(socket.userId, socket.id);

        // Join a chat room
        socket.on('join_room', async (roomId) => {
            console.log('join_room', roomId);
            try {
                const chat = await Chat.findById(roomId);
                if (!chat) {
                    socket.emit('error', { message: 'Chat not found' });
                    return;
                }
                // console.log('chat', chat);
                // if (!chat.participants.includes(socket.userId)) {
                //     socket.emit('error', { message: 'Not authorized to join this chat' });
                //     return;
                // }

                socket.join(roomId);
                console.log(`User ${socket.userId} joined room ${roomId}`);
            } catch (error) {
                socket.emit('error', { message: 'Error joining chat room' });
            }
        });

        // Leave a chat room
        socket.on('leave_room', (roomId) => {
            socket.leave(roomId);
            console.log(`User ${socket.userId} left room ${roomId}`);
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
                    console.log('message sent by server');

                } catch (error) {
                    console.error('Error emitting message to room:', error);
                    socket.emit('message_error', { tempId, error: 'Failed to send message' });
                    return;
                }

                // Emit chat update to all participants
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

                chat.participants.forEach(participant => {
                    const participantSocketId = connectedUsers.get(participant._id.toString());
                    if (participantSocketId) {
                        io.to(participantSocketId).emit('chat_updated', chat);
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
        socket.on('typing', ({ roomId, isTyping }) => {
            socket.to(roomId).emit('user_typing', {
                userId: socket.userId,
                roomId,
                isTyping
            });
        });

        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.userId}`);
            connectedUsers.delete(socket.userId);
        });
    });

    return io;
}

module.exports = setupSocket; 