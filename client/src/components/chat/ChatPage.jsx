import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ChatMessage from './ChatMessage';
import chatService from '../../services/chatService';
import globalChatService from '../../services/globalChatService';
import NavBar from '../NavBar';
import { FiSend, FiSearch, FiMoreVertical, FiMessageSquare } from 'react-icons/fi';
import {
    addMessage,
    setConnected,
    setTypingUser,
    setActiveChats,
    setCurrentRoom,
    markRoomAsRead,
    updateChatUnreadStatus
} from '../../redux/slices/chatSlice';
import '../../styles/Chat.css';
import { isAuthenticated } from '../../redux/auth/selectors';
import { getUserId, getAvatarName, isAvatar } from '../../redux/user/selectors';
import ChatNotificationSettings from './ChatNotificationSettings';
// import ActiveChatsIndicator from './ActiveChatsIndicator';

const ChatPage = () => {
    const dispatch = useDispatch();
    const [searchParams] = useSearchParams();
    const channelId = searchParams.get('channelId');
    const [message, setMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [initialized, setInitialized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isInitializingChat, setIsInitializingChat] = useState(false);
    const [pendingMessages, setPendingMessages] = useState({});
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();
    const authenticated = useSelector(isAuthenticated);
    const username = useSelector(getAvatarName);
    const hasAvatar = useSelector(isAvatar);
    const cloud_name = "dojexlq8y";

    const {
        messages,
        currentRoom,
        activeChats,
        typingUsers,
        isConnected
    } = useSelector(state => state.chat);
    const token = sessionStorage.getItem('jwtToken');
    const userId = useSelector(getUserId);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        if (!authenticated) {
            navigate('/');
        }
    }, [authenticated]);

    // Handle socket connection
    useEffect(() => {
        if (token && !isConnected) {
            chatService.connect(token, userId);
            dispatch(setConnected(true));
        }

        return () => {
            chatService.disconnect();
            dispatch(setConnected(false));
        };
    }, [token]);

    // Set up message listeners
    useEffect(() => {
        if (!isConnected) return;
        
        const handleNewMessage = (data) => {
            if (!data || !data.content) {
                console.error('Invalid message data received:', data);
                return;
            }

            const sender = data.sender || {};
            const senderAvatar = sender.avatar || {};
            const isSelfMessage = sender._id?.toString() === userId.toString();

            // If this is a confirmation of our pending message, update its status
            if (data.tempId && pendingMessages[data.tempId]) {
                //console.log('Updating pending message with server response:', data);
                
                const updatedPending = { ...pendingMessages };
                delete updatedPending[data.tempId];
                setPendingMessages(updatedPending);

                // Update the existing message instead of adding a new one
                dispatch(addMessage({
                    roomId: data.chat,
                    message: {
                        id: data._id,
                        content: data.content,
                        sender: userId.toString(), // Use userId for own messages
                        senderName: 'You',
                        senderImage: senderAvatar.imageLink || null,
                        timestamp: data.createdAt || new Date().toISOString(),
                        status: 'sent'
                    },
                    tempId: data.tempId // Add tempId to identify the message to update
                }));
                
                // Scroll to bottom after message is updated
                setTimeout(() => scrollToBottom(), 100);
            } 
            // For messages from the current user that don't have a tempId,
            // check if we already have this message in our state
            else if (isSelfMessage) {
                // Try to find a matching message by content and approximate timestamp
                const existingMessage = messages[data.chat]?.find(msg => 
                    msg.content === data.content && 
                    msg.sender === userId.toString() &&
                    Math.abs(new Date(msg.timestamp) - new Date(data.createdAt)) < 5000
                );
                
                if (existingMessage) {
                    // Update the existing message with server data
                    dispatch(addMessage({
                        roomId: data.chat,
                        message: {
                            id: data._id,
                            content: data.content,
                            sender: userId.toString(),
                            senderName: 'You',
                            senderImage: senderAvatar.imageLink || null,
                            timestamp: data.createdAt || new Date().toISOString(),
                            status: 'sent'
                        },
                        tempId: existingMessage.id // Use the existing message ID to update it
                    }));
                } else {
                    // If it doesn't exist, add it
                    dispatch(addMessage({
                        roomId: data.chat,
                        message: {
                            id: data._id,
                            content: data.content,
                            sender: userId.toString(),
                            senderName: 'You',
                            senderImage: senderAvatar.imageLink || null,
                            timestamp: data.createdAt || new Date().toISOString(),
                            status: 'sent'
                        }
                    }));
                }
            }
            // Only add messages from other users
            else if (!isSelfMessage) {
                // Try to get more complete sender information from the active chats
                let senderName = senderAvatar.username || 'Unknown User';
                let senderImage = senderAvatar.imageLink || null;
                
                // Find the chat in active chats
                const chat = activeChats.find(c => c._id === data.chat);
                if (chat) {
                    // Find the sender in the participants
                    const participant = chat.participants.find(p => p._id === sender._id);
                    if (participant && participant.avatar) {
                        senderName = participant.avatar.username || senderName;
                        senderImage = participant.avatar.imageLink || senderImage;
                    }
                }
                
                // This is a new message from another user
                dispatch(addMessage({
                    roomId: data.chat,
                    message: {
                        id: data._id,
                        content: data.content,
                        sender: sender._id?.toString() || '',
                        senderName: senderName,
                        senderImage: senderImage,
                        timestamp: data.createdAt || new Date().toISOString(),
                        status: 'sent'
                    }
                }));
                
                // If we couldn't get complete sender info, fetch updated chat data
                if (senderName === 'Unknown User' && data.chat) {
                    // Fetch updated chat information to get complete user data
                    chatService.getChatById(data.chat)
                        .then(updatedChat => {
                            if (updatedChat && updatedChat.participants) {
                                const updatedSender = updatedChat.participants.find(p => p._id === sender._id);
                                if (updatedSender && updatedSender.avatar && updatedSender.avatar.username) {
                                    // Update the message with the correct sender name
                                    dispatch(addMessage({
                                        roomId: data.chat,
                                        message: {
                                            id: data._id,
                                            content: data.content,
                                            sender: sender._id?.toString() || '',
                                            senderName: updatedSender.avatar.username,
                                            senderImage: updatedSender.avatar.imageLink || null,
                                            timestamp: data.createdAt || new Date().toISOString(),
                                            status: 'sent'
                                        },
                                        tempId: data._id // Use the message ID to update it
                                    }));
                                }
                            }
                        })
                        .catch(err => console.error('Error fetching updated chat data:', err));
                }
            }

            // If the message is not from the current user and not in the current room,
            // mark the chat as having unread messages
            if (!isSelfMessage && data.chat !== currentRoom) {
                console.log(`Marking chat ${data.chat} as unread`);
                dispatch(updateChatUnreadStatus({ roomId: data.chat, hasUnread: true }));
                
                // Also update the chat in activeChats directly to ensure the UI updates
                const updatedChats = activeChats.map(chat => 
                    chat._id === data.chat 
                        ? { ...chat, hasUnread: true } 
                        : chat
                );
                dispatch(setActiveChats(updatedChats));
            }
        };

        const handleMessageError = (error) => {
            if (error.tempId && pendingMessages[error.tempId]) {
                const updatedPending = { ...pendingMessages };
                updatedPending[error.tempId].status = 'failed';
                setPendingMessages(updatedPending);
            }
        };

        const handleUserTyping = ({ roomId, userId, isTyping }) => {
            dispatch(setTypingUser({ roomId, userId, isTyping }));
        };

        const handleChatUpdated = (updatedChat) => {
            if (!updatedChat || !updatedChat._id) {
                console.error('Invalid chat update received:', updatedChat);
                return;
            }
            
            console.log('Chat update received:', updatedChat);
            console.log('Has unread property:', updatedChat.hasUnread);
            
            // Find the chat in our current list
            const existingChatIndex = activeChats.findIndex(c => c._id === updatedChat._id);
            
            // Create a new array to avoid mutating state directly
            const updatedChats = [...activeChats];
            
            if (existingChatIndex !== -1) {
                // Determine if the chat should be marked as unread
                const shouldBeUnread = updatedChat._id !== currentRoom && updatedChat.hasUnread === true;
                
                // Update existing chat
                updatedChats[existingChatIndex] = {
                    ...updatedChats[existingChatIndex],
                    ...updatedChat,
                    // Set hasUnread based on whether this is the current room and the updatedChat's hasUnread property
                    hasUnread: shouldBeUnread
                };
                console.log('Updated chat hasUnread:', updatedChats[existingChatIndex].hasUnread);
            } else {
                // Add new chat with hasUnread property preserved
                updatedChats.push({
                    ...updatedChat,
                    hasUnread: updatedChat._id !== currentRoom && updatedChat.hasUnread === true
                });
            }
            
            // Sort chats by last message timestamp
            updatedChats.sort((a, b) => {
                const aTime = a.lastMessage?.timestamp || a.updatedAt || a.createdAt;
                const bTime = b.lastMessage?.timestamp || b.updatedAt || b.createdAt;
                return new Date(bTime) - new Date(aTime);
            });
            
            dispatch(setActiveChats(updatedChats));
        };

        const handleMessagesRead = (data) => {
            dispatch(markRoomAsRead(data.roomId));
        };

        chatService.onReceiveMessage(handleNewMessage);
        chatService.onMessageError(handleMessageError);
        chatService.onTyping(handleUserTyping);
        chatService.onChatUpdated(handleChatUpdated);
        chatService.onMessagesRead(handleMessagesRead);

        return () => {
            chatService.offReceiveMessage();
            chatService.offMessageError();
            chatService.offTyping();
            chatService.offChatUpdated();
            chatService.offMessagesRead();
        };
    }, [isConnected, currentRoom, userId]);

    // Handle scrolling
    useEffect(() => {
        scrollToBottom();
    }, [messages, currentRoom]);

    // Fetch active chats once on mount and when connection changes
    useEffect(() => {
        const fetchChats = async () => {
            if (!token) return;

            try {
                setIsLoading(true);
                const chats = await chatService.getActiveChats();
                
                if (!Array.isArray(chats)) {
                    console.error('Invalid chats data received:', chats);
                    return;
                }
                
                // Add last message to each chat object
                const chatsWithLastMessage = await Promise.all(chats.map(async (chat) => {
                    try {
                        const messages = await chatService.getChatMessages(chat._id, { limit: 1 });
                        const lastMessage = Array.isArray(messages) && messages.length > 0 ? messages[0] : null;
                        
                        return {
                            ...chat,
                            lastMessage: lastMessage ? {
                                content: lastMessage.content || '',
                                timestamp: lastMessage.createdAt || lastMessage.timestamp || new Date().toISOString()
                            } : null
                        };
                    } catch (error) {
                        console.error(`Error fetching last message for chat ${chat._id}:`, error);
                        return chat;
                    }
                }));

                dispatch(setActiveChats(chatsWithLastMessage));
                //console.log('chats3', chatsWithLastMessage);
                setInitialized(true);
            } catch (error) {
                console.error('Error fetching chats:', error);
            } finally {
                setIsLoading(false);
            }
        };

        // Reset state when component mounts or token changes
        if (!token) {
            dispatch(setActiveChats([]));
            //console.log('chats4', []);
            setInitialized(false);
            return;
        }

        fetchChats();
    }, [token]);

    // Initialize chat with channel
    useEffect(() => {
        
        const initializeChat = async () => {
            if (!token || !initialized) return;
            try {
                setIsInitializingChat(true);
                
                // Only try to create/select chat if channelId is provided
                if (channelId) {
                    ////console.log(1);
                    const existingChat = activeChats.find(chat => 
                        chat.participants.some(p => p._id === channelId)
                    );
                    
                    if (existingChat) {
                        await selectChat(existingChat._id);
                    } else {
                        const result = await chatService.createRoom(channelId);
                        ////console.log(result);
                        if (result) {
                            // Update active chats with the new chat
                            const updatedChats = activeChats.concat(result.chats);
                            ////console.log(updatedChats);
                            dispatch(setActiveChats(updatedChats));
                            //console.log('chats5', updatedChats);
                            await selectChat(result.roomId);
                        }
                    }
                } else {
                    // If no channelId, only clear current room to show welcome screen
                    // but keep the active chats in the sidebar
                    const result = await chatService.createRoom('111');
                    
                    dispatch(setActiveChats(result.chats));
                    //console.log('chats6', result.chats);
                    dispatch(setCurrentRoom(null));
                }
            } catch (error) {
                console.error('Error initializing chat:', error);
            } finally {
                setIsInitializingChat(false);
            }
        };

        initializeChat();
    }, [channelId, token, initialized]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !token) return;

        const tempId = Date.now().toString();
        const timestamp = new Date().toISOString();
        
        const messageData = {
            content: message.trim(),
            roomId: currentRoom,
            timestamp,
            tempId
        };

        //console.log(`Sending message with tempId ${tempId}:`, messageData);

        // Add to pending messages
        const pendingMessage = {
            id: tempId, // Use tempId as the message id for now
            content: message.trim(),
            sender: userId.toString(),
            senderName: 'You',
            senderImage: null, // Start with no image, will be updated when server responds
            timestamp,
            status: 'pending'
        };

        setPendingMessages(prev => ({
            ...prev,
            [tempId]: pendingMessage
        }));

        // Optimistically add to messages
        dispatch(addMessage({
            roomId: currentRoom,
            message: pendingMessage
        }));

        // Send the message to the server
        chatService.sendMessage(messageData);
        setMessage('');
        setIsTyping(false);
        
        // Scroll to bottom after sending a message
        setTimeout(() => scrollToBottom(), 100);
    };

    const handleRetry = (failedMessage) => {
        // Update message status back to pending
        const updatedPending = { ...pendingMessages };
        updatedPending[failedMessage.id].status = 'pending';
        setPendingMessages(updatedPending);

        // Retry sending the message
        chatService.sendMessage({
            content: failedMessage.content,
            roomId: currentRoom,
            timestamp: failedMessage.timestamp,
            tempId: failedMessage.id
        });
    };

    const typingTimeoutRef = useRef(null);

    const handleTyping = (e) => {
        setMessage(e.target.value);
        
        // Clear any existing timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        
        if (!isTyping && currentRoom) {
            // Only emit typing start if not already typing
            ////console.log(`Emitting typing start: User ${userId} in room ${currentRoom}`);
            setIsTyping(true);
            chatService.emitTyping(currentRoom, userId, true);
        }
        
        // Always set a new timeout to stop typing indicator
        typingTimeoutRef.current = setTimeout(() => {
            if (isTyping && currentRoom) {
                ////console.log(`Emitting typing stop: User ${userId} in room ${currentRoom}`);
                setIsTyping(false);
                chatService.emitTyping(currentRoom, userId, false);
            }
        }, 2000);
    };

    const selectChat = async (roomId) => {
        try {
            ////console.log(`Selecting chat room ${roomId}`);
            
            // If we're already in a room, leave it first
            if (currentRoom) {
                ////console.log(`Leaving current room ${currentRoom}`);
                chatService.leaveRoom(currentRoom);
                
                // Make sure to stop typing indicator when leaving a room
                if (isTyping) {
                    ////console.log(`Stopping typing in room ${currentRoom} before leaving`);
                    setIsTyping(false);
                    chatService.emitTyping(currentRoom, userId, false);
                }
            }
            
            chatService.joinRoom(roomId);
            dispatch(setCurrentRoom(roomId));
            dispatch(markRoomAsRead(roomId));
            
            // Also update the chat in activeChats directly to ensure the UI updates
            const updatedChats = activeChats.map(chat => 
                chat._id === roomId 
                    ? { ...chat, hasUnread: false } 
                    : chat
            );
            dispatch(setActiveChats(updatedChats));
            
            // Find the chat and get the other participant's ID
            const selectedChat = activeChats.find(chat => chat._id === roomId);
            if (selectedChat) {
                ////console.log(`Selected chat:`, selectedChat);
                const otherParticipant = selectedChat.participants.find(p => p._id !== userId);
                if (otherParticipant) {
                    // Update the URL with the other participant's ID
                    navigate(`/chat?channelId=${otherParticipant._id}`, { replace: true });
                }
            }
            
            // Fetch all messages only when selecting a chat
            const messages = await chatService.getChatMessages(roomId);
            if (Array.isArray(messages) && messages.length > 0) {
                const formattedMessages = messages.map(msg => ({
                    id: msg._id?.toString() || msg.id?.toString(),
                    content: msg.content || '',
                    sender: msg.sender?._id?.toString() || msg.sender?.toString() || '',
                    senderName: msg.sender?.avatar?.username || 'Unknown User',
                    senderImage: msg.sender?.avatar?.imageLink || null,
                    timestamp: msg.createdAt || msg.timestamp || new Date().toISOString(),
                    status: 'sent'
                }));

                dispatch(addMessage({
                    roomId,
                    messages: formattedMessages
                }));
            } else {
                dispatch(addMessage({
                    roomId,
                    messages: []
                }));
            }
            
            // Scroll to bottom after messages are loaded
            setTimeout(() => scrollToBottom(), 100);
        } catch (error) {
            console.error('Error selecting chat:', error);
            dispatch(addMessage({
                roomId,
                messages: []
            }));
        }
    };

    const getCurrentChat = () => {
        return activeChats.find(chat => chat._id === currentRoom);
    };

    const getOtherParticipant = (chat) => {
        if (!chat) return null;
        const other = chat.participants.find(p => p._id !== userId);
        return other ? {
            _id: other._id,
            username: other.avatar?.username || 'Unknown User',
            imageLink: other.avatar?.imageLink
        } : null;
    };

    const getChatName = (chat) => {
        if (chat.isGroupChat) return chat.name || 'Group Chat';
        const other = getOtherParticipant(chat);
        return other?.username || 'Unknown User';
    };

    const filteredChats = activeChats.filter(chat => {
        const chatName = getChatName(chat);
        return chatName.toLowerCase().includes(searchQuery.toLowerCase());
    });

    // Clean up typing timeout on unmount or when changing rooms
    useEffect(() => {
        return () => {
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            
            // Make sure to stop typing indicator when leaving a room
            if (isTyping && currentRoom) {
                chatService.emitTyping(currentRoom, userId, false);
                setIsTyping(false);
            }
        };
    }, [currentRoom, isTyping, userId]);

    // Log typingUsers state when it changes
    useEffect(() => {
        if (currentRoom && typingUsers[currentRoom]) {
            ////console.log('Current typing users:', typingUsers[currentRoom]);
        }
    }, [typingUsers, currentRoom]);

    ////console.log('typingUsers', typingUsers[currentRoom]);

    return (
        <div className="chat-container">
            <NavBar />
            <div className="chat-wrapper">
                <div className="chat-main">
                    {!hasAvatar || !username ? (
                        <div className="welcome-screen">
                            <div className="welcome-content">
                                <div className="welcome-icon">
                                    <FiMessageSquare size={48} />
                                </div>
                                <h3 className="welcome-title">Create Your Channel First</h3>
                                <p className="welcome-text">You need to create a channel before you can start chatting</p>
                                <button 
                                    className="create-channel-button"
                                    onClick={() => navigate('/profile')}
                                >
                                    Create Channel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Sidebar */}
                            <div className="chat-sidebar">
                                <div className="sidebar-header">
                                    <h2 className="sidebar-title">Messages</h2>
                                    <div className="search-container">
                                        <FiSearch className="search-icon" />
                                        <input
                                            type="text"
                                            placeholder="Search conversations..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="search-input"
                                        />
                                    </div>
                                </div>
                                <div className="chat-list">
                                    {isLoading ? (
                                        <div className="loading-chats">
                                            {[1, 2, 3].map((n) => (
                                                <div key={n} className="chat-item-skeleton">
                                                    <div className="avatar-skeleton"></div>
                                                    <div className="chat-info-skeleton">
                                                        <div className="name-skeleton"></div>
                                                        <div className="message-skeleton"></div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        filteredChats.map((chat) => {
                                            const otherParticipant = getOtherParticipant(chat);
                                            console.log(`Chat ${chat._id} hasUnread:`, chat.hasUnread);
                                            
                                            // Ensure hasUnread is a boolean
                                            const isUnread = chat.hasUnread === true;
                                            
                                            return (
                                                <div
                                                    key={chat._id}
                                                    onClick={() => selectChat(chat._id)}
                                                    className={`chat-item ${currentRoom === chat._id ? 'active' : ''} ${isUnread ? 'unread' : ''}`}
                                                >
                                                    <div className="chat-item-content">
                                                        <div 
                                                            className="avatar"
                                                        >
                                                            <img 
                                                                src={otherParticipant?.imageLink 
                                                                    ? `https://res.cloudinary.com/${cloud_name}/image/upload/${otherParticipant.imageLink}`
                                                                    : '/account.png'
                                                                }
                                                                alt={otherParticipant?.username || 'User avatar'}
                                                                className="avatar-image"
                                                            />
                                                        </div>
                                                        <div className="chat-item-info">
                                                            <h3 className="chat-item-name">{getChatName(chat)}</h3>
                                                            <p className="chat-item-last-message">
                                                                {chat.lastMessage 
                                                                    ? chat.lastMessage.content
                                                                    : 'No messages yet'
                                                                }
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Chat Area */}
                            <div className="chat-area">
                                {isLoading || isInitializingChat ? (
                                    <div className="loading-chat-area">
                                        <div className="loading-spinner"></div>
                                        <p>Loading your conversations...</p>
                                    </div>
                                ) : currentRoom ? (
                                    <>
                                        {/* Chat Header */}
                                        <div className="chat-header">
                                            <div className="header-user-info">
                                                {(() => {
                                                    const currentChat = getCurrentChat();
                                                    const otherParticipant = getOtherParticipant(currentChat);
                                                    
                                                    return (
                                                        <>
                                                            <div 
                                                                className="header-avatar"
                                                            >
                                                                <img 
                                                                    src={otherParticipant?.imageLink 
                                                                        ? `https://res.cloudinary.com/${cloud_name}/image/upload/${otherParticipant.imageLink}`
                                                                        : '/account.png'
                                                                    }
                                                                    alt={otherParticipant?.username || 'User avatar'}
                                                                    className="avatar-image pointer"
                                                                    onClick={() => navigate(`/channel/${otherParticipant?._id}`)}
                                                                />
                                                            </div>
                                                            <div>
                                                                <h3 className="header-name">
                                                                    {otherParticipant?.username || 'Unknown User'}
                                                                </h3>
                                                                {/* <p className="typing-indicator">
                                                                    {otherParticipant?.username || 'Someone'} is typing
                                                                </p> */}
                                                                {/* {(() => {
                                                                    const hasTypingUsers = typingUsers[currentRoom] && 
                                                                        Object.keys(typingUsers[currentRoom]).length > 0;
                                                                    //console.log('Has typing users:', hasTypingUsers, typingUsers[currentRoom]);
                                                                    return hasTypingUsers && (
                                                                        <p className="typing-indicator">
                                                                            {otherParticipant?.username || 'Someone'} is typing
                                                                        </p>
                                                                    );
                                                                })()} */}
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                            <button className="more-options">
                                                <FiMoreVertical />
                                            </button>
                                        </div>

                                        {/* Messages */}
                                        <div className="messages-container">
                                            <div className="messages-list">
                                                {Array.isArray(messages[currentRoom]) && 
                                                  // Filter out duplicate messages by ID first, then by content+sender+timestamp
                                                  [...new Map(messages[currentRoom]
                                                    .filter(msg => msg && msg.content)
                                                    .map(msg => [msg.id, msg]))
                                                    .values()]
                                                    .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
                                                    .map((msg, index) => {
                                                    // If this message has a pending state, use that instead
                                                    const pendingMsg = msg.id && pendingMessages[msg.id];
                                                    const messageToShow = pendingMsg || msg;

                                                    // Ensure sender is a string and compare with userId as string
                                                    const isOwnMessage = (messageToShow.sender?.toString() || '') === userId.toString();

                                                    return (
                                                        <ChatMessage
                                                            key={`${messageToShow.id || index}-${messageToShow.status || 'sent'}`}
                                                            message={messageToShow}
                                                            isOwnMessage={isOwnMessage}
                                                            onRetry={handleRetry}
                                                        />
                                                    );
                                                })}
                                                <div ref={messagesEndRef} />
                                            </div>
                                        </div>

                                        {(() => {
                                            const hasTypingUsers = typingUsers[currentRoom] && 
                                                Object.keys(typingUsers[currentRoom]).length > 0;
                                            
                                            // Filter out current user from typing users
                                            const otherTypingUsers = typingUsers[currentRoom] ? 
                                                Object.keys(typingUsers[currentRoom]).filter(typingUserId => 
                                                    typingUserId !== userId.toString()
                                                ) : [];
                                            
                                            // Only show typing indicator if OTHER users are typing
                                            return otherTypingUsers.length > 0 && (
                                                <p className="typing-indicator">
                                                    typing
                                                </p>
                                            );
                                        })()}

                                        {/* Input Area */}
                                        <div className="input-area">
                                            <form onSubmit={handleSendMessage} className="input-form">
                                                <input
                                                    type="text"
                                                    value={message}
                                                    onChange={handleTyping}
                                                    placeholder="Type your message..."
                                                    className="message-input"
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={!message.trim()}
                                                    className="send-button"
                                                >
                                                    <FiSend />
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                ) : (
                                    <div className="welcome-screen">
                                        <div className="welcome-content">
                                            <div className="welcome-icon">
                                                <FiMessageSquare />
                                            </div>
                                            <h3 className="welcome-title">Welcome to Chat</h3>
                                            <p className="welcome-text">Select a conversation to start messaging</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {/* <ActiveChatsIndicator /> */}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage; 