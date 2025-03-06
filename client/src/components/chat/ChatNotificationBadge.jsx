import React from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { selectTotalUnreadCount } from '../../redux/slices/chatSlice';
import '../../styles/ChatNotificationBadge.css';

/**
 * ChatNotificationBadge displays a badge with the count of unread messages
 * in the navigation bar.
 */
const ChatNotificationBadge = () => {
    const navigate = useNavigate();
    const unreadCount = useSelector(selectTotalUnreadCount);
    const { notificationSettings } = useSelector(state => state.chat);
    
    // Handle click on the badge
    const handleClick = () => {
        // Navigate to the chat page
        navigate('/chat');
    };
    
    // Don't render if no unread messages or badge notifications are disabled
    if (unreadCount === 0 || !notificationSettings.badge) {
        return null;
    }
    
    return (
        <div className="chat-notification-badge" onClick={handleClick}>
            {unreadCount > 99 ? '99+' : unreadCount}
        </div>
    );
};

export default ChatNotificationBadge;