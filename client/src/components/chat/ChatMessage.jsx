import React from 'react';
import PropTypes from 'prop-types';
import { formatDistanceToNow } from 'date-fns';
import { FiClock, FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import '../../styles/Chat.css';

const ChatMessage = ({ message, isOwnMessage, onRetry }) => {
    const cloud_name = "dojexlq8y";
    // console.log(message);

    const getMessageStatusIcon = () => {
        if (message.status === 'pending') {
            return <FiClock className="message-status-icon pending" />;
        } else if (message.status === 'failed') {
            return (
                <div className="message-error">
                    <FiAlertCircle className="message-status-icon failed" />
                    <button onClick={() => onRetry(message)} className="retry-button">
                        <FiRefreshCw />
                    </button>
                </div>
            );
        }
        return null;
    };

    const formatMessageTime = (timestamp) => {
        if (!timestamp) return 'Just now';
        
        try {
            const date = new Date(timestamp);
            // Check if the date is valid
            if (isNaN(date.getTime())) {
                return 'Just now';
            }
            return formatDistanceToNow(date, { addSuffix: true });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Just now';
        }
    };

    return (
        <div className={`message-wrapper ${isOwnMessage ? 'own' : 'other'}`}>
            {!isOwnMessage && (
                <div className="message-avatar left">
                    <img 
                        src={message.senderImage 
                            ? `https://res.cloudinary.com/${cloud_name}/image/upload/${message.senderImage}`
                            : '/account.png'
                        }
                        alt={message.senderName || 'User avatar'}
                        className="avatar-image"
                    />
                </div>
            )}
            <div className={`message-content ${isOwnMessage ? 'own' : 'other'}`}>
                {!isOwnMessage && (
                    <span className="message-sender">{message.senderName}</span>
                )}
                <div className={`message-bubble ${isOwnMessage ? 'own' : 'other'} ${message.status || ''}`}>
                    <p className="message-text">{message.content}</p>
                    {isOwnMessage && getMessageStatusIcon()}
                </div>
                <span className="message-time">
                    {formatMessageTime(message.timestamp)}
                </span>
            </div>
            {isOwnMessage && (
                <div className="message-avatar right">
                    <img 
                        src={message.senderImage 
                            ? `https://res.cloudinary.com/${cloud_name}/image/upload/${message.senderImage}`
                            : '/account.png'
                        }
                        alt={message.senderName || 'User avatar'}
                        className="avatar-image"
                    />
                </div>
            )}
        </div>
    );
};

ChatMessage.propTypes = {
    message: PropTypes.shape({
        content: PropTypes.string.isRequired,
        timestamp: PropTypes.string,
        sender: PropTypes.oneOfType([
            PropTypes.string,
            PropTypes.oneOf([null])
        ]),
        senderName: PropTypes.string,
        senderImage: PropTypes.string,
        status: PropTypes.oneOf(['pending', 'failed', 'sent']),
        id: PropTypes.string
    }).isRequired,
    isOwnMessage: PropTypes.bool.isRequired,
    onRetry: PropTypes.func
};

export default ChatMessage; 