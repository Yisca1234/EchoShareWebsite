import { useDispatch, useSelector } from 'react-redux';
import Channel from './Channel.jsx'
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { getFollowing, getFollowers } from '../redux/user/selectors.js';
import { channelFollowers } from '../redux/channel/selectors.js';
import { useNavigate } from 'react-router-dom';


const ChannelsSection = ({typeOfDisplay, id}) => {
  // typeOfDisplay = 1 for following, 2 for followers (both user's and channel's)
  const navigate = useNavigate();

  const handleHome = () => {
    navigate('/home');
  }
  const listOfChannels = typeOfDisplay === 1 ? useSelector(getFollowing) : id===null ? useSelector(getFollowers) : useSelector(channelFollowers(id));
  const channelsList = listOfChannels.filter(channel => channel?.avatar?.username);
  const noChannelUsers = listOfChannels.length - channelsList.length;
  return (
    
    <Container className="container1 box5 box6" >
      {typeOfDisplay === 1 ? <h3 className='text8'>Channels you follow</h3> : <h3 className='text8'> {id=== null ? 'Your' : id} Followers</h3>}
      { typeOfDisplay === 2 && noChannelUsers>0 && <h3 className='text5'> {noChannelUsers} Anonymous users following too {id=== null ? 'Your' : id} channel</h3>}
      <div className="">
        {channelsList.length>0 ? 
        channelsList.map((channel, index) => (
        <div className="post-margin postOfList" key={index}> 
          { channel.avatar?.username && (
            <Channel {...channel}/>
          )}
        </div>
        )) :
        <div>
          <h3 className='text3' onClick={handleHome}>Lets Explore Some New Channels!</h3>
        </div>
        }
      </div>
    </Container>
    
  );
};

export default ChannelsSection;