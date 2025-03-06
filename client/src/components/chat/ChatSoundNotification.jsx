import React, { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

/**
 * ChatSoundNotification plays a sound when a new message is received.
 * It monitors the notifications in the Redux store and plays a sound
 * when a new notification is added.
 */
const ChatSoundNotification = () => {
    const { notifications, currentRoom, notificationSettings } = useSelector(state => state.chat);
    const prevNotificationsRef = useRef({});
    const audioRef = useRef(null);
    
    // Initialize audio element
    useEffect(() => {
        // Create audio element
        audioRef.current = new Audio('/message-notification.mp3');
        audioRef.current.volume = 0.5;
        
        // Cleanup on unmount
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, []);
    
    // Play sound when new notification is received
    useEffect(() => {
        // Skip if sound notifications are disabled
        if (!notificationSettings.sound) {
            return;
        }
        
        // Check if there are new notifications
        let hasNewNotification = false;
        
        // Compare current notifications with previous ones
        Object.entries(notifications).forEach(([roomId, roomNotifications]) => {
            // Skip current room
            if (roomId === currentRoom) return;
            
            // Get previous notifications count for this room
            const prevCount = prevNotificationsRef.current[roomId]?.length || 0;
            const currentCount = roomNotifications.length;
            
            // If there are more notifications now, play sound
            if (currentCount > prevCount) {
                hasNewNotification = true;
            }
        });
        
        // Play sound if there's a new notification
        if (hasNewNotification && audioRef.current) {
            // Reset audio and play
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(error => {
                // Autoplay might be blocked by browser
                console.warn('Could not play notification sound:', error);
            });
        }
        
        // Update previous notifications reference
        prevNotificationsRef.current = { ...notifications };
    }, [notifications, currentRoom, notificationSettings.sound]);
    
    // This component doesn't render anything
    return null;
};

export default ChatSoundNotification;