import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ChatMessage from './ChatMessage';
import chatService from '../../services/chatService';
import NavBar from '../NavBar';
import { FiSend, FiSearch, FiMoreVertical, FiMessageSquare } from 'react-icons/fi';
import {
    addMessage,
    setConnected,
    setTypingUser,
    setActiveChats,
    setCurrentRoom
} from '../../redux/slices/chatSlice';
import '../../styles/Chat.css';
import { isAuthenticated } from '../../redux/auth/selectors';
import { getUserId, getAvatarName, isAvatar } from '../../redux/user/selectors';

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
        
        chatService.onReceiveMessage((data) => {
            if (!data || !data.content) {
                console.error('Invalid message data received:', data);
                return;
            }

            const sender = data.sender || {};
            const senderAvatar = sender.avatar || {};

            // If this is a confirmation of our pending message, update its status
            if (pendingMessages[data.tempId]) {
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
            } else {
                // This is a new message from another user
                dispatch(addMessage({
                    roomId: data.chat,
                    message: {
                        id: data._id,
                        content: data.content,
                        sender: sender._id?.toString() || '',
                        senderName: senderAvatar.username || 'Unknown User',
                        senderImage: senderAvatar.imageLink || null,
                        timestamp: data.createdAt || new Date().toISOString(),
                        status: 'sent'
                    }
                }));
            }
        });

        // Add error handler for failed messages
        chatService.onMessageError((error) => {
            if (error.tempId && pendingMessages[error.tempId]) {
                const updatedPending = { ...pendingMessages };
                updatedPending[error.tempId].status = 'failed';
                setPendingMessages(updatedPending);
            }
        });

        chatService.onChatUpdated((updatedChat) => {
            if (!updatedChat || !updatedChat._id) {
                console.error('Invalid chat update received:', updatedChat);
                return;
            }
            console.log('updatedChat');
            // Create a new array with the updated chat
            const updatedChats = activeChats.map(chat => 
                chat._id === updatedChat._id ? updatedChat : chat
            ).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

            dispatch(setActiveChats(updatedChats));
        });

        chatService.onTyping(({ roomId, userId, isTyping }) => {
            dispatch(setTypingUser({ roomId, userId, isTyping }));
        });

        return () => {
            chatService.offReceiveMessage();
            chatService.offMessageError();
            chatService.offChatUpdated();
            chatService.offTyping();
        };
    }, [isConnected, pendingMessages, userId]);

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
                    console.log(1);
                    const existingChat = activeChats.find(chat => 
                        chat.participants.some(p => p._id === channelId)
                    );
                    
                    if (existingChat) {
                        await selectChat(existingChat._id);
                    } else {
                        const result = await chatService.createRoom(channelId);
                        console.log(result);
                        if (result) {
                            // Update active chats with the new chat
                            const updatedChats = activeChats.concat(result.chats);
                            console.log(updatedChats);
                            dispatch(setActiveChats(updatedChats));
                            await selectChat(result.roomId);
                        }
                    }
                } else {
                    // If no channelId, only clear current room to show welcome screen
                    // but keep the active chats in the sidebar
                    const result = await chatService.createRoom('111');
                    
                    dispatch(setActiveChats(result.chats));
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

        // Add to pending messages
        const pendingMessage = {
            id: tempId,
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

        chatService.sendMessage(messageData);
        setMessage('');
        setIsTyping(false);
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

    const handleTyping = (e) => {
        setMessage(e.target.value);
        if (!isTyping && currentRoom) {
            setIsTyping(true);
            chatService.emitTyping(currentRoom, userId);
            setTimeout(() => {
                setIsTyping(false);
                chatService.emitTyping(currentRoom, userId, false);
            }, 2000);
        }
    };

    const selectChat = async (roomId) => {
        try {
            chatService.joinRoom(roomId);
            dispatch(setCurrentRoom(roomId));
            
            // Find the chat and get the other participant's ID
            const selectedChat = activeChats.find(chat => chat._id === roomId);
            if (selectedChat) {
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
                                            return (
                                                <div
                                                    key={chat._id}
                                                    onClick={() => selectChat(chat._id)}
                                                    className={`chat-item ${currentRoom === chat._id ? 'active' : ''}`}
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
                                                                {typingUsers[currentRoom]?.size > 0 && (
                                                                    <p className="typing-indicator">typing...</p>
                                                                )}
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
                                                {Array.isArray(messages[currentRoom]) && messages[currentRoom].map((msg, index) => {
                                                    if (!msg || !msg.content) return null;
                                                    
                                                    // If this message has a pending state, use that instead
                                                    const pendingMsg = msg.id && pendingMessages[msg.id];
                                                    const messageToShow = pendingMsg || msg;

                                                    // Ensure sender is a string and compare with userId as string
                                                    const isOwnMessage = (messageToShow.sender?.toString() || '') === userId.toString();

                                                    return (
                                                        <ChatMessage
                                                            key={messageToShow.id || index}
                                                            message={messageToShow}
                                                            isOwnMessage={isOwnMessage}
                                                            onRetry={handleRetry}
                                                        />
                                                    );
                                                })}
                                                <div ref={messagesEndRef} />
                                            </div>
                                        </div>

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
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChatPage; 