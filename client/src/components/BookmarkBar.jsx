import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
import Post from './Post.jsx'; 
import '../styles/CustomScrollbar.css'; 
import { getBookmaredPosts } from '../redux/user/selectors.js';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';


const BookmarkBar = () => {
  const viewedPostsArray = useRef([]);
  const navigate = useNavigate();
  const handleHome = () => {
    navigate('/home');
  }

  const intervalFunction = async ()=> {
    if(viewedPostsArray.current.length>0){
      await dispatch(handleView(viewedPostsArray.current, userId));
      viewedPostsArray.current = [];   
    }
  }
  useEffect(() => {
    const intervalId = setInterval(intervalFunction, 45000);
  
    return () => {
      clearInterval(intervalId);
      intervalFunction();
    };
  }, []);
  

  const incrementView = (postId)=> {
    viewedPostsArray.current.push(postId);    
  }
  
  const listPosts= useSelector(getBookmaredPosts);
  return (
    <Container className="box5 container1">
      {listPosts.length > 0 ? (
        <div className="post-list">
          {listPosts.map((post, index) => (
            <div className="post-margin postOfList" key={index}>
              <Post
                post={post}
                incrementView={incrementView}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="box10">
          <h3>I don't see you saved some posts in your drawer</h3>
          <a className='text3' onClick={handleHome}>Go see interesting posts to bookmark</a>
        </div>
      )}
    </Container>
  );
  
  
};

export default BookmarkBar;