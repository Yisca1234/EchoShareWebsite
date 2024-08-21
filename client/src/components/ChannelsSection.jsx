import { useDispatch, useSelector } from 'react-redux';
import Channel from './Channel.jsx'
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { getFollowing, getFollowers } from '../redux/user/selectors.js';
import { useNavigate } from 'react-router-dom';


const ChannelsSection = ({typeOfDisplay}) => {
  const navigate = useNavigate();

  const handleHome = () => {
    navigate('/home');
  }
  const listOfChannels = typeOfDisplay === 1 ? useSelector(getFollowing) : useSelector(getFollowers);

  return (
    
    <Container className="container1 box5 box6" >
      <div className="">
        {listOfChannels.length>0 ? 
        listOfChannels.map((channel, index) => (
        <div className="post-margin postOfList" key={index}> 
          <Channel {...channel}/>
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