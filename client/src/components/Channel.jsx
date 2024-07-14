
import { Container, Row, Col, Image, Badge, Button } from 'react-bootstrap';
import {handleFollow} from '../redux/user/actions.js'
import {getUserId } from '../redux/user/selectors';
import { useSelector,useDispatch } from 'react-redux';
import { useEffect, useState } from 'react'

const Channel = (channel) => {
  // to do: when the mouse is one a certain channel it will show card with more details about the channel
  const dispatch = useDispatch();
  const cloud_name = "dojexlq8y";
  const {avatar, _id} = channel;
  const {username, imageLink, description} = avatar;
  const namOfFollowers = avatar.Followers.length;
  const numOfPosts = avatar.posts.length;
  let profileImage;
  if(imageLink){
    profileImage= `https://res.cloudinary.com/${cloud_name}/image/upload/${imageLink}`;
  }
  else{
    profileImage= 'account.png';
  }
  const userId = useSelector(getUserId);


  const handleUnFollowButton = async () => {
    await dispatch(handleFollow(userId, _id, false));
  };
  return (

    <Container className="mt-4 border p-3 ">
      <div className='row-container'>
        <Container>
          <div xs={2} className='con'>
            <Image src={profileImage} fluid  style={{borderRadius: '50%', width: '35px', height: '35px', objectFit: 'cover' }}/>
          </div>
          <div xs={10} className="text-muted con"  >
            {username}
          </div>
        </Container>
        <Col xs={3} className='con' >
          <Button variant="primary" size="sm" onClick={handleUnFollowButton}>unfollow</Button> 
        </Col>
      </div>

    </Container>
  );
}

export default Channel;

