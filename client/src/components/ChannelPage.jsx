import Sidebar from './NavBar.jsx'
import { Container, Row, Col, Image, Button, Modal, Form , } from 'react-bootstrap';
import { isAuthenticated  } from '../redux/auth/selectors';
import { useEffect, useState } from 'react'
import ChannelView from './ChannelView.jsx'
import ChannelsDisplay from './ChannelsDisplay.jsx'
import PostsOfChannel from './PostsOfChannel.jsx'
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useParams, useLocation } from 'react-router-dom';
import { use } from 'react';
import { getChannel } from '../redux/channel/actions';
import { channels } from '../redux/channel/selectors';
// import _ from 'lodash';


const ChannelPage = () => {
  const [loading, setLoading] = useState(true);
  const {id} = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const channelsdata = useSelector(channels);
  console.log(channelsdata);

  const authenticated = useSelector(isAuthenticated);
  useEffect(() => {
    // console.log(id);
    if(!authenticated){
      navigate('/');
    }
    
  }, [authenticated]);

  useEffect(() => {
    const fetchData = async () => {
      await dispatch(getChannel(id));
      setLoading(false);
    }
    fetchData();

  }, []);

  return (
    <div className='no-scroll row-container1'>
      <Sidebar />
      { authenticated && (
        loading ?
        <div>Loading...</div> :
        (<Container fluid className='main-section1'>
          <Row>
            <Col xs={6}>
              <div className='fullheight section3'>
                <ChannelView id={id} />
                {/* <ChannelsDisplay id={id} /> */}
              </div>
            </Col>
            <Col xs={6}>
              <div >
                <PostsOfChannel id={id} />
              </div>
            </Col>
          </Row>
        </Container>)
      )}  
    </div>
  );
};

export default ChannelPage;