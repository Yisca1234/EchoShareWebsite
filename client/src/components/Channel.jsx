
import { Container, Row, Col, Image, Badge, Button } from 'react-bootstrap';
import {handleFollow} from '../redux/user/actions.js'
import {getUserId, getFollowing } from '../redux/user/selectors';
import { useSelector,useDispatch } from 'react-redux';
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';

const Channel = (channel) => {
  const [isFollow, setIsFollow] = useState(false);
  const [loading, setLoading] = useState(false);
  const listFollowing = useSelector(getFollowing);

  const dispatch = useDispatch();
  const cloud_name = "dojexlq8y";
  const {avatar, _id} = channel;
  const {username, imageLink} = avatar;
  const namOfFollowers = avatar.Followers.length;
  const numOfPosts = avatar.posts.length;
  const profileImage = imageLink ? `https://res.cloudinary.com/${cloud_name}/image/upload/${imageLink}` : '/account.png';
  const userId = useSelector(getUserId);
  const navigate = useNavigate();




  const handleFollowButton = async () => {
    handleLoading(true);
    await dispatch(handleFollow(userId, _id, !isFollow)).then(
      //await setIsFollow(pre=>!pre)
    )
    handleLoading(false);
  };

  useEffect(() => {
    const checkIfFollowing = () => {
      const isFollowed = listFollowing.some(user => user._id === _id);
      if(isFollowed!=isFollow){
        setIsFollow(isFollowed);
      }
    };

    checkIfFollowing();
  }, [listFollowing]); 

  const handleLoading = (state) => {
    setLoading(state);
  }

  const navigateToChannel = () => {
    navigate(`/channel/${_id}`);
  }
  return (

    <Container className="mt-4 border p-3 ">
      <div className='row-container'>
        <Container>
          <div xs={2} className='con'>
            <Image src={profileImage} fluid  style={{borderRadius: '50%', width: '35px', height: '35px', objectFit: 'cover', cursor: 'pointer' }} onClick={navigateToChannel}/>
          </div>
          <div xs={10} className="text-muted con"  >
            {username}
          </div>
        </Container>
        <Col xs={3} className='con' >
          <Button variant="primary" size="sm" disabled={loading} className={` ${loading && 'loading1'}`} onClick={handleFollowButton}>{isFollow ? 'UnFollow' : 'Follow'}</Button> 
        </Col>
      </div>

    </Container>
  );
}

export default Channel;

