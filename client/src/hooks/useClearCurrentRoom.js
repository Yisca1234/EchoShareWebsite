import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCurrentRoom } from '../redux/slices/chatSlice';

/**
 * Custom hook to clear the current room when navigating away from the chat page
 */
const useClearCurrentRoom = () => {
  const location = useLocation();
  const dispatch = useDispatch();

  useEffect(() => {
    // Check if we're not on the chat page
    if (!location.pathname.includes('/chat')) {
      // Clear the current room in Redux
      dispatch(setCurrentRoom(null));
    }
  }, [location.pathname, dispatch]);
};

export default useClearCurrentRoom; 