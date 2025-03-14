import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import '../styles/ConnectionStatus.css';

const ConnectionStatus = () => {
  const { isConnected } = useSelector(state => state.chat);
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Show the status indicator when connection state changes
    setVisible(true);
    
    // Hide it after 3 seconds
    const timer = setTimeout(() => {
      setVisible(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [isConnected]);
  
  if (!visible) return null;
  
  return (
    <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'} visible`}>
      <div className={`connection-status-indicator ${isConnected ? 'connected' : 'disconnected'}`}></div>
      {isConnected ? 'Connected' : 'Disconnected'}
    </div>
  );
};

export default ConnectionStatus; 