import Sidebar from './NavBar.jsx'
import ContentSection from './ForyouOrFollowing.jsx'
import Search from './SearchSection.jsx'
import ChannelSuggestionSection from './ChannelSuggestionSection.jsx'
import { useEffect, useState } from 'react'
import { userRequest } from '../redux/user/actions.js';
import { useDispatch, useSelector } from 'react-redux';
import { getUserEmail  } from '../redux/auth/selectors';
import { getUserId } from '../redux/user/selectors';
import axios from 'axios'
import { getAllPosts } from '../redux/post/actions.js';
import { Link, useNavigate } from 'react-router-dom';
import {  Modal,Form, Button} from 'react-bootstrap';
import apiClient from '../utils/apiClient.js'
import { selectAuthError,isAuthenticated  } from '../redux/auth/selectors';





const Home = () => {
  
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const useremail = useSelector(getUserEmail);
  const authenticated = useSelector(isAuthenticated);
  const userId = useSelector(getUserId);
  useEffect(() => {

    if(!authenticated){
      navigate('/login');
    }
    
  }, [authenticated]);



  return(
    <div className='row-container no-horizontal-scroll'>
      
      < Sidebar/>
      < ContentSection />
      <div className='column-container' style={{display: 'inline-block',width: '37%' , position: 'fixed', top: '0', right: '0', marginRight: '10px'}}>
        < Search />
        < ChannelSuggestionSection />
      </div>
    </div>
  )
};
export default Home


