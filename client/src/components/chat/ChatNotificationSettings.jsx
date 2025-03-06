import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { updateNotificationSettings, selectNotificationSettings } from '../../redux/slices/chatSlice';
import '../../styles/ChatNotificationSettings.css';

/**
 * ChatNotificationSettings allows users to configure their notification preferences.
 */
const ChatNotificationSettings = () => {
    const dispatch = useDispatch();
    const settings = useSelector(selectNotificationSettings);
    
    // Handle toggle of notification settings
    const handleToggle = (setting) => {
        dispatch(updateNotificationSettings({
            [setting]: !settings[setting]
        }));
    };
    
    return (
        <div className="chat-notification-settings">
            <h4 className="settings-title">Notification Settings</h4>
            
            <div className="settings-option">
                <label htmlFor="sound-toggle">Sound Notifications</label>
                <div className="toggle-switch">
                    <input
                        type="checkbox"
                        id="sound-toggle"
                        checked={settings.sound}
                        onChange={() => handleToggle('sound')}
                    />
                    <span className="toggle-slider"></span>
                </div>
                <p className="settings-description">
                    Play a sound when you receive a new message
                </p>
            </div>
            
            <div className="settings-option">
                <label htmlFor="desktop-toggle">Desktop Notifications</label>
                <div className="toggle-switch">
                    <input
                        type="checkbox"
                        id="desktop-toggle"
                        checked={settings.desktop}
                        onChange={() => handleToggle('desktop')}
                    />
                    <span className="toggle-slider"></span>
                </div>
                <p className="settings-description">
                    Show a popup notification when you receive a new message
                </p>
            </div>
            
            <div className="settings-option">
                <label htmlFor="badge-toggle">Badge Notifications</label>
                <div className="toggle-switch">
                    <input
                        type="checkbox"
                        id="badge-toggle"
                        checked={settings.badge}
                        onChange={() => handleToggle('badge')}
                    />
                    <span className="toggle-slider"></span>
                </div>
                <p className="settings-description">
                    Show a badge with unread message count in the navigation bar
                </p>
            </div>
        </div>
    );
};

export default ChatNotificationSettings;