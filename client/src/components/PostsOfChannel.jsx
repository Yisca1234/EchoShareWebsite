import React from 'react';
import Post from './Post.jsx'
import { channelPosts } from '../redux/channel/selectors.js'
import { useSelector, useDispatch } from 'react-redux';
import { Container } from 'react-bootstrap';
import { useState, useEffect, useRef } from 'react';
import { handleView } from '../redux/post/actions.js';
import { getUserId } from '../redux/user/selectors.js'


const PostsOfChannel = ({id}) => {
  const viewedPostsArray = useRef([]);
  const dispatch = useDispatch();
  const channel_posts = useSelector(channelPosts(id));
  const userId = useSelector(getUserId);
  

  useEffect(() => {
    const intervalId = setInterval(intervalFunction, 45000);
  
    return () => {
      clearInterval(intervalId);
      intervalFunction();
    };
  }, []);

  const intervalFunction = async ()=> {
      if(viewedPostsArray.current.length>0){
        await dispatch(handleView(viewedPostsArray.current, userId));
        viewedPostsArray.current = [];   
      }
    }

  const incrementView = (postId)=> {
    viewedPostsArray.current.push(postId);    
  }
  return (
    <Container className="container1 " style={{display: 'inline-block', height: '100vh'}}>
      {channel_posts[0] ? 
      <div className="post-list">
        <p>This channel has {channel_posts.length} posts</p>
        {channel_posts.map((post, index) => (
        <div className="post-margin postOfList" key={index}> 
          <Post post={{...post, idChannel: id}} incrementView={incrementView} isChannelpage={true}/>
        </div>
        ))}
      </div>:
      <div className="container4">
        <h3 className='text1'>The channel have no posts yet</h3>
        {/* <a className='text2 pointer' onClick={navi}>I want to start saying something to the world!</a> */}
      </div>}
    </Container>
  );
};

export default PostsOfChannel;