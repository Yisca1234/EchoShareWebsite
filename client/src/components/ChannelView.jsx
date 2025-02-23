import React from 'react';
import { Button, Image } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { channel } from '../redux/channel/selectors';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUserId, getFollowing } from '../redux/user/selectors';
import {handleFollow} from '../redux/user/actions.js'
import { FaComments } from 'react-icons/fa';


const ChannelView = ({id}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isFollow, setIsFollow] = useState(false);
  const listFollowing = useSelector(getFollowing);
  const dispatch = useDispatch();
  
  const cloud_name = "dojexlq8y";
  const navigate = useNavigate();
  const userId = useSelector(getUserId);

  const channelData = useSelector(channel(id));
  const { following, name, imageLink, description, Followers } = channelData;
  useEffect(() => {
    if (imageLink) {
      setImageSrc(`https://res.cloudinary.com/${cloud_name}/image/upload/${imageLink}`);
    } else {
      setImageSrc('/account.png');
    }
  }, [imageLink]);

  const handleFollowers = () => {
    navigate(`/followersList/${id}`);
  };

  const handleFollowButton = async () => {
    handleLoading(true);
    await dispatch(handleFollow(userId, id, !isFollow)).then(
      //await setIsFollow(pre=>!pre)
    )
    handleLoading(false);
  };

  const handleChatClick = () => {
    navigate(`/chat?channelId=${id}`);
  };

  useEffect(() => {
    const checkIfFollowing = () => {
      const isFollowed = listFollowing.some(user => user._id === id);
      if(isFollowed!=isFollow){
        setIsFollow(isFollowed);
      }
    };

    checkIfFollowing();
  }, [listFollowing]); 

  const handleLoading = (state) => {
    setLoading(state);
  }

  return (
    <div children='box12'>
      <div className="line2">
        <Image src={imageSrc} roundedCircle className="channel-image" />
        <div className="d-flex gap-2">
          <Button variant="primary" size="sm" disabled={loading} className={`button1 ${loading && 'loading1'}`} onClick={handleFollowButton}>
            {isFollow ? 'UnFollow' : 'Follow'}
          </Button>
          <Button 
            variant="outline-primary" 
            size="sm" 
            onClick={handleChatClick}
            className="d-flex align-items-center gap-1"
          >
            <FaComments /> Chat
          </Button>
        </div>
      </div>
      <div className="short-bold-text mt-1">{name}</div>
      <div className="mt-3">
        <strong>{Followers.length}</strong> <span className='hover1' onClick={handleFollowers}>followers</span> <strong>{following.length}</strong > <span>following</span>
      </div>
      {/* <div className="mt-3">Joining on:   <strong>{joiningDate}</strong></div> */}
      <div>
        <div className="description-box mt-3">
          {description}
        </div>
      </div>
    </div>
  );
};

export default ChannelView;