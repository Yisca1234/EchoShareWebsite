import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { getUserId } from '../redux/user/selectors';
import { isAuthenticated } from '../redux/auth/selectors';
import globalChatService from '../services/globalChatService';
import { setConnected } from '../redux/slices/chatSlice';

/**
 * ChatConnectionProvider is a component that handles the chat connection globally
 * across the application. It ensures that the chat connection is maintained
 * even when navigating between different pages.
 */
const ChatConnectionProvider = ({ children }) => {
  const dispatch = useDispatch();
  const authenticated = useSelector(isAuthenticated);
  const userId = useSelector(getUserId);
  const { isConnected } = useSelector(state => state.chat);
  const [connectionInitialized, setConnectionInitialized] = useState(false);
  const connectionAttempts = useRef(0);
  const maxConnectionAttempts = 3;
  const reconnectTimeoutRef = useRef(null);

  // Connect to chat server when user is authenticated
  useEffect(() => {
    if (!authenticated || !userId) {
      // If not authenticated, disconnect and reset state
      if (isConnected) {
        globalChatService.disconnect();
        dispatch(setConnected(false));
      }
      setConnectionInitialized(false);
      connectionAttempts.current = 0;
      return;
    }

    // Connect to chat server if not already connected
    const token = sessionStorage.getItem('jwtToken');
    if (token && !connectionInitialized) {
      //console.log('Initializing global chat connection');
      
      // Initialize chat connection
      globalChatService.connect(token, userId);
      
      // Mark connection as initialized
      setConnectionInitialized(true);
      
      // Reset connection attempts
      connectionAttempts.current = 0;
    }

    // Cleanup on unmount or when user logs out
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [authenticated, userId, isConnected, connectionInitialized, dispatch]);

  // Handle reconnection if connection fails
  useEffect(() => {
    if (authenticated && userId && !isConnected && connectionInitialized) {
      //console.log('Connection lost, attempting to reconnect...');
      
      // Retry connection if failed
      if (connectionAttempts.current < maxConnectionAttempts) {
        connectionAttempts.current += 1;
        //console.log(`Retrying connection (attempt ${connectionAttempts.current}/${maxConnectionAttempts})`);
        
        // Reset connection initialized flag to trigger reconnection after a delay
        reconnectTimeoutRef.current = setTimeout(() => {
          setConnectionInitialized(false);
        }, 2000 * connectionAttempts.current); // Exponential backoff
      }
    }
  }, [authenticated, userId, isConnected, connectionInitialized]);

  // Fetch active chats when connected
  useEffect(() => {
    if (isConnected && authenticated && userId) {
      //console.log('Fetching active chats from global provider');
      
      // Fetch active chats
      globalChatService.fetchAndUpdateChats();
    }
  }, [isConnected, authenticated, userId]);

  // Simply render children - this component only handles the connection logic
  return <>{children}</>;
};

export default ChatConnectionProvider;
