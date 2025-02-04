import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import Sidebar from './NavBar.jsx'
import { isAuthenticated  } from '../redux/auth/selectors';
import { useEffect, useState } from 'react'
import ChannelsSection from './ChannelsSection.jsx'
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { useParams } from 'react-router-dom';

const FollowersPage = () => {
  const authenticated = useSelector(isAuthenticated);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {

    if(!authenticated){
      navigate('/');
    }
    
  }, [authenticated]);

  return(
    <div className='row-container1 no-scroll box7 '>
      <Sidebar />
      { authenticated &&
      (<Container fluid >
        <ChannelsSection typeOfDisplay={2} id={ id ? id : null}/>
      </Container>)}
    </div>
  )
};
export default FollowersPage
