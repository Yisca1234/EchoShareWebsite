import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from './NavBar.jsx'
import { isAuthenticated  } from '../redux/auth/selectors';
import { useEffect, useState } from 'react'
import ChannelsSection from './ChannelsSection.jsx'
import { Container, Row, Col, Image, Button } from 'react-bootstrap';


const FollowersPage = () => {
  const authenticated = useSelector(isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {

    if(!authenticated){
      navigate('/login');
    }
    
  }, [authenticated]);

  return(
    <div className='row-container1 no-scroll box7 '>
      <Sidebar />
      <Container fluid >
        <ChannelsSection typeOfDisplay={2}/>
      </Container>
    </div>
  )
};
export default FollowersPage
