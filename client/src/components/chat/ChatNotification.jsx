import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearNotifications } from '../../redux/slices/chatSlice';
import '../../styles/ChatNotification.css';

const ChatNotification = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeNotification, setActiveNotification] = useState(null);
    const notificationTimer = useRef(null);
    
    const { notifications, activeChats, currentRoom, notificationSettings } = useSelector(state => state.chat);

    // Skip processing if desktop notifications are disabled
    const desktopNotificationsEnabled = notificationSettings.desktop;

    // Check for new notifications
    useEffect(() => {
        // Skip if desktop notifications are disabled
        if (!desktopNotificationsEnabled) {
            return;
        }

        // Process all rooms with notifications
        Object.entries(notifications).forEach(([roomId, roomNotifications]) => {
            // Skip notifications for the current room
            if (roomId === currentRoom) return;
            
            // Skip empty notification arrays
            if (!roomNotifications || roomNotifications.length === 0) return;
            
            // Get the latest notification
            const latestNotification = roomNotifications[roomNotifications.length - 1];
            
            // Find the chat room details
            const chatRoom = activeChats.find(chat => chat._id === roomId);
            
            if (chatRoom && latestNotification) {
                // Create notification object
                const newNotification = {
                    id: `${roomId}-${latestNotification.id}`,
                    roomId,
                    message: latestNotification,
                    chatName: getChatName(chatRoom),
                    senderName: getSenderName(latestNotification, chatRoom),
                    timestamp: Date.now(),
                    isVisible: true
                };
                
                // Clear any existing timer
                if (notificationTimer.current) {
                    clearTimeout(notificationTimer.current);
                }
                
                // Replace any existing notification with the new one
                setActiveNotification(newNotification);
                
                // Set a timer to remove the notification
                notificationTimer.current = setTimeout(() => {
                    setActiveNotification(prev => 
                        prev && prev.id === newNotification.id 
                            ? { ...prev, isVisible: false } 
                            : prev
                    );
                    
                    // Remove the notification after animation completes
                    setTimeout(() => {
                        setActiveNotification(null);
                    }, 300);
                }, 5000);
            }
        });
    }, [notifications, activeChats, currentRoom, desktopNotificationsEnabled]);

    // Cleanup timer on unmount or when settings change
    useEffect(() => {
        return () => {
            if (notificationTimer.current) {
                clearTimeout(notificationTimer.current);
            }
        };
    }, []);

    // Get chat name from chat object
    const getChatName = (chat) => {
        if (!chat) return 'Chat';
        
        // If it's a group chat, use the group name
        if (chat.isGroupChat && chat.name) {
            return chat.name;
        }
        
        // For direct messages, use the other participant's name
        const otherParticipant = chat.participants.find(p => p._id !== chat.creator);
        return otherParticipant?.avatar?.username || otherParticipant?.username || 'Chat';
    };
    
    // Get sender name from message and chat
    const getSenderName = (message, chat) => {
        if (!message || !message.sender || !chat) return 'Someone';
        
        // Find the sender in the participants
        const sender = chat.participants.find(p => p._id === message.sender);
        if (sender) {
            return sender.avatar?.username || sender.username || 'Someone';
        }
        
        // If we can't find the sender in participants, use the message sender name
        return message.senderName || 'Someone';
    };

    // Handle click on notification
    const handleNotificationClick = (notification) => {
        if (!notification) return;
        
        // Find the chat room
        const chatRoom = activeChats.find(chat => chat._id === notification.roomId);
        if (!chatRoom) {
            console.error('Chat room not found:', notification.roomId);
            return;
        }
        
        // Find the other participant to get their ID for the URL
        const otherParticipant = chatRoom.participants.find(p => p._id !== chatRoom.creator);
        if (!otherParticipant) {
            console.error('Other participant not found in chat:', chatRoom);
            return;
        }
        
        // Navigate to the chat page with the other participant's ID
        navigate(`/chat?channelId=${otherParticipant._id}`);
        
        // Clear notifications for this room
        dispatch(clearNotifications(notification.roomId));
        
        // Clear the timer
        if (notificationTimer.current) {
            clearTimeout(notificationTimer.current);
            notificationTimer.current = null;
        }
        
        // Remove the notification
        setActiveNotification(null);
    };

    // If no active notification or desktop notifications are disabled, don't render anything
    if (!activeNotification || !desktopNotificationsEnabled) {
        return null;
    }

    return (
        <div className="chat-notifications-container">
            <div 
                className={`chat-notification ${activeNotification.isVisible ? 'visible' : ''}`}
                onClick={() => handleNotificationClick(activeNotification)}
            >
                <div className="notification-header">
                    <div className="notification-title">New message from {activeNotification.senderName}</div>
                </div>
                <div className="notification-content">
                    {activeNotification.message.content}
                </div>
                <div className="notification-footer">
                    <span className="notification-time">
                        {new Date(activeNotification.message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="notification-click">Click to view</span>
                </div>
            </div>
        </div>
    );
};

export default ChatNotification;