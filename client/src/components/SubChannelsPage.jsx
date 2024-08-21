import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from './NavBar.jsx'
import ChannelsSection from './ChannelsSection.jsx'
import { isAuthenticated  } from '../redux/auth/selectors';
import { useEffect, useState } from 'react'

import { Container, Row, Col, Image, Button } from 'react-bootstrap';


const SubChannelsPage = () => {
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
        <ChannelsSection typeOfDisplay={1}/>
      </Container>
    </div>
  )
};
export default SubChannelsPage
