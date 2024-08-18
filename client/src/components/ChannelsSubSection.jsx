import { useDispatch, useSelector } from 'react-redux';
import Channel from './Channel.jsx'
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { getFollowing } from '../redux/user/selectors.js';
import { useNavigate } from 'react-router-dom';


const ChannelsSubSection = () => {
  const navigate = useNavigate();

  const handleHome = () => {
    navigate('/home');
  }

  const subChannels= useSelector(getFollowing);

  return (
    
    <Container className="container1 box5 box6" >
      <div className="">
        {subChannels.length>0 ? 
        subChannels.map((channel, index) => (
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

export default ChannelsSubSection;