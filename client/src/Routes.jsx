import Login from './components/Login.jsx'
import {Routes, Route, Navigate } from 'react-router-dom'
import Home from './components/Home.jsx'
import SignUp from './components/SignUp.jsx'
import Profile from './components/ProfilePage.jsx'
import CreatePostPage from './components/CreatePost.jsx'
import BookmarkedPostsPage from './components/BookmarkedPostsPage.jsx'
import SubChannelsPage from './components/SubChannelsPage.jsx'
import FollowersPage from './components/FollowersPage.jsx'
import NotFound from './components/NotFound.jsx'
import Modal from './components/Modal.jsx'
import MobileScreen from './components/MobileScreen.jsx'
import ChannelPage from './components/ChannelPage.jsx'
import ChatPage from './components/chat/ChatPage.jsx'
import { isMobile } from 'react-device-detect'; 
import { useState, useEffect, useRef } from 'react'
import { change_of_following } from './redux/post/actions.js'
import { useSelector, useDispatch } from 'react-redux';
import { getUserfollowing } from './redux/user/selectors.js'
import isEqual from 'lodash/isEqual';
import ResetPassword from './components/ResetPassword.jsx';
import ConfirmationResetPage from './components/ConfirmationResetPage.jsx';


const AppRoutes = () => {
  const [showModal, setShowModal] = useState(false);

  const list_following = useSelector(getUserfollowing, isEqual);
  const listFollowingRef = useRef(list_following);

  useEffect(() => {
    const isModal = localStorage.getItem('modalShow');
    if (!isModal) {
      setShowModal(true);
    }
  }, []);

  useEffect(() => {
    if (list_following !== listFollowingRef.current) {
      deletePostsOfFollowing();
      listFollowingRef.current = list_following; // Update the ref
    }
  }, [list_following]);

  const dispatch = useDispatch();
  
  const handleCloseModal = async (state) => {
    // state = 1 means to not show again the model and 2 to do show the model another time
    if(state === 1){
      localStorage.setItem('modalShow', true);
    }
    setShowModal(false);
  };

  const deletePostsOfFollowing = async () => {
    await dispatch(change_of_following());
  };

  return (
    <>
      {showModal ? 
        <Modal onClose={handleCloseModal}/> :
        <Routes>
          <Route path="/" element={isMobile ? <Navigate to="/mobile-screen" /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/confirmation-reset" element={<ConfirmationResetPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/createNewPost" element={<CreatePostPage />} />
          <Route path="/bookmarkedPosts" element={<BookmarkedPostsPage />}/>
          <Route path="/subscribedChannelsList" element={<SubChannelsPage />} />
          <Route path="/followersList/:id?" element={<FollowersPage />} />
          <Route path="/channel/:id" element={<ChannelPage />} />
          <Route path="/mobile-screen" element={<MobileScreen />} />
          <Route path="*" element={<NotFound />} /> 
        </Routes>
      }
    </>
  );
};

export default AppRoutes;
