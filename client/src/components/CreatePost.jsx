import Sidebar from './NavBar.jsx'
import NewPostSection from './NewPostSection.jsx'
import { isAuthenticated  } from '../redux/auth/selectors';
import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { Container, Row, Col, Image, Button } from 'react-bootstrap';


const CreatePostPage = () => {
  const authenticated = useSelector(isAuthenticated);
  const navigate = useNavigate();

  useEffect(() => {

    if(!authenticated){
      navigate('/');
    }
    
  }, [authenticated]);
  return(
    <div className='row-container1 no-scroll'>
      < Sidebar/>
      <Container fluid className='main-section2'>
        <NewPostSection />
      </Container>
    </div>
  )
};
export default CreatePostPage