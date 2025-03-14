import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearNotifications } from '../../redux/slices/chatSlice';
import '../../styles/ChatNotification.css';
import chatService from '../../services/chatService';

const ChatNotification = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeNotifications, setActiveNotifications] = useState([]);
    const [notificationQueue, setNotificationQueue] = useState([]);
    const notificationTimers = useRef({});
    const maxVisibleNotifications = 3; // Maximum number of visible notifications
    
    const { notifications, activeChats, currentRoom, notificationSettings } = useSelector(state => state.chat);

    // Skip processing if desktop notifications are disabled
    const desktopNotificationsEnabled = notificationSettings.desktop;

    // Process notification queue
    useEffect(() => {
        // Skip if desktop notifications are disabled
        if (!desktopNotificationsEnabled) {
            // Clear any active notifications
            setActiveNotifications([]);
            setNotificationQueue([]);
            return;
        }

        // If we have room in the active notifications and items in the queue
        if (activeNotifications.length < maxVisibleNotifications && notificationQueue.length > 0) {
            // Get the next notification from the queue
            const nextNotification = notificationQueue[0];
            
            // Add it to active notifications
            setActiveNotifications(prev => [...prev, { ...nextNotification, isVisible: true }]);
            
            // Remove it from the queue
            setNotificationQueue(prev => prev.slice(1));
            
            // Set a timer to remove the notification
            const timerId = setTimeout(() => {
                setActiveNotifications(prev => 
                    prev.map(notif => 
                        notif.id === nextNotification.id 
                            ? { ...notif, isVisible: false } 
                            : notif
                    )
                );
                
                // Remove the notification after animation completes
                setTimeout(() => {
                    setActiveNotifications(prev => 
                        prev.filter(notif => notif.id !== nextNotification.id)
                    );
                }, 300);
            }, 5000);
            
            // Store the timer ID
            notificationTimers.current[nextNotification.id] = timerId;
        }
    }, [activeNotifications, notificationQueue, desktopNotificationsEnabled]);

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
                // Check if this notification is already in active or queue
                const notificationId = `${roomId}-${latestNotification.id}`;
                const isAlreadyActive = activeNotifications.some(n => n.id === notificationId);
                const isAlreadyQueued = notificationQueue.some(n => n.id === notificationId);
                
                if (!isAlreadyActive && !isAlreadyQueued) {
                    // Create notification object
                    const newNotification = {
                        id: notificationId,
                        roomId,
                        message: latestNotification,
                        chatName: getChatName(chatRoom),
                        timestamp: Date.now(),
                        isVisible: false
                    };
                    
                    // Add to queue or active notifications
                    if (activeNotifications.length < maxVisibleNotifications) {
                        setActiveNotifications(prev => [...prev, { ...newNotification, isVisible: true }]);
                        
                        // Set a timer to remove the notification
                        const timerId = setTimeout(() => {
                            setActiveNotifications(prev => 
                                prev.map(notif => 
                                    notif.id === newNotification.id 
                                        ? { ...notif, isVisible: false } 
                                        : notif
                                )
                            );
                            
                            // Remove the notification after animation completes
                            setTimeout(() => {
                                setActiveNotifications(prev => 
                                    prev.filter(notif => notif.id !== newNotification.id)
                                );
                            }, 300);
                        }, 5000);
                        
                        // Store the timer ID
                        notificationTimers.current[newNotification.id] = timerId;
                    } else {
                        // Add to queue if we've reached the maximum visible notifications
                        setNotificationQueue(prev => [...prev, newNotification]);
                    }
                }
            }
        });
    }, [notifications, activeChats, currentRoom, desktopNotificationsEnabled]);

    // Cleanup timers on unmount or when settings change
    useEffect(() => {
        // Clear all timers if desktop notifications are disabled
        if (!desktopNotificationsEnabled) {
            Object.values(notificationTimers.current).forEach(timerId => {
                clearTimeout(timerId);
            });
            notificationTimers.current = {};
        }

        return () => {
            // Clear all timers
            Object.values(notificationTimers.current).forEach(timerId => {
                clearTimeout(timerId);
            });
        };
    }, [desktopNotificationsEnabled]);

    // Get chat name from chat object
    const getChatName = (chat) => {
        if (!chat) return 'Chat';
        
        // If it's a group chat, use the group name
        if (chat.isGroupChat && chat.name) {
            return chat.name;
        }
        
        // For direct messages, use the other participant's name
        const otherParticipant = chat.participants.find(p => p._id !== chat.creator);
        return otherParticipant ? otherParticipant.username : 'Chat';
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
        
        // Navigate directly to the chat page and select the room
        navigate(`/chat?channelId=${notification.roomId}`);
        
        // Clear notifications for this room
        dispatch(clearNotifications(notification.roomId));
        
        // Clear the timer
        if (notificationTimers.current[notification.id]) {
            clearTimeout(notificationTimers.current[notification.id]);
            delete notificationTimers.current[notification.id];
        }
        
        // Remove the notification
        setActiveNotifications(prev => 
            prev.filter(notif => notif.id !== notification.id)
        );
        
        // Use a small timeout to ensure the chat page is loaded before selecting the room
        // setTimeout(() => {
        //     // Dispatch action to select the room directly
            
        //     chatService.joinRoom(notification.roomId);
        //     dispatch({ type: 'chat/setCurrentRoom', payload: notification.roomId });
        //     dispatch({ type: 'chat/markRoomAsRead', payload: notification.roomId });
        // }, 100);
    };

    // If no active notifications or desktop notifications are disabled, don't render anything
    if (activeNotifications.length === 0 || !desktopNotificationsEnabled) {
        return null;
    }

    return (
        <div className="chat-notifications-container">
            {activeNotifications.map((notification) => (
                <div 
                    key={notification.id}
                    className={`chat-notification ${notification.isVisible ? 'visible' : ''}`}
                    onClick={() => handleNotificationClick(notification)}
                >
                    <div className="notification-header">
                        <div className="notification-title">New message from {notification.chatName}</div>
                    </div>
                    <div className="notification-content">
                        {notification.message.content}
                    </div>
                    <div className="notification-footer">
                        <span className="notification-time">
                            {new Date(notification.message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="notification-click">Click to view</span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ChatNotification;