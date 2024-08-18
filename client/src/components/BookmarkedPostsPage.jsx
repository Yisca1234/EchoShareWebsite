

import { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import Sidebar from './NavBar.jsx'
import BookmarkBar from './BookmarkBar.jsx'
import { isAuthenticated  } from '../redux/auth/selectors';



const BookmarkedPostsPage = () => {
  const navigate = useNavigate();

  const authenticated = useSelector(isAuthenticated);

  useEffect(() => {

    if(!authenticated){
      navigate('/login');
    }
    
  }, [authenticated]);
  return(
    <div className='row-container1 no-scroll'>
      < Sidebar/>
      <Container fluid className='main-section2'>
        <BookmarkBar />
      </Container>
    </div>
  )
};
export default BookmarkedPostsPage
