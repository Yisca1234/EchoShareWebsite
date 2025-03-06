import Sidebar from './NavBar.jsx'
import ContentSection from './ForyouOrFollowing.jsx'
import Search from './SearchSection.jsx'
import ChannelSuggestionSection from './ChannelSuggestionSection.jsx'
import { useEffect } from 'react'
import { useSelector } from 'react-redux';
import { isAuthenticated } from '../redux/auth/selectors';
import { useNavigate } from 'react-router-dom';
import ChatNotification from './chat/ChatNotification';

const Home = () => {
  const navigate = useNavigate();
  const authenticated = useSelector(isAuthenticated);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authenticated) {
      navigate('/');
    }
  }, [authenticated, navigate]);

  return(
    <div className='row-container no-horizontal-scroll'>
      <Sidebar />
      {authenticated && ContentSection()}
      {authenticated && (
        <div className='column-container' style={{ display: 'inline-block', width: '37%', position: 'fixed', top: '0', right: '0', marginRight: '10px' }}>
          <Search />
          <ChannelSuggestionSection />
        </div>
      )}
      {/* Chat notification is now handled globally in App.jsx */}
    </div>
  )
};

export default Home


