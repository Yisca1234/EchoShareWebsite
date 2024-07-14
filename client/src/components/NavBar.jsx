
import { Navbar, Nav, OverlayTrigger, Popover, Image, Button } from 'react-bootstrap';
import { FaIdBadge,FaClipboardList,FaPlus,FaPencilAlt,FaBookmark,FaUser, FaHome, FaBell, FaEnvelope, FaCog } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';
import {logoutAction} from '../redux/auth/actions.js'
import {logout} from '../redux/user/actions.js'
import {logout1} from '../redux/post/actions.js'
import { useNavigate } from 'react-router-dom';

import { useDispatch } from 'react-redux';



const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout= async () => {
    await dispatch(logoutAction());
    await dispatch(logout());
    await dispatch(logout1());
    await dispatch(logout2());
    //navigate('/signup');
  }

  const popover = (
    <Popover id="popover-basic">
      <Popover.Body>
        <a href='login'>
          <Button variant="primary" onClick={handleLogout}>
            LogOut
          </Button>
        </a>
        
      </Popover.Body>
    </Popover>
  );

  return (
    <Navbar className="sidebar d-flex flex-column justify-content-between">
      <Nav className="flex-column">
        <Navbar.Brand>
          <Image src="echoShare.png" fluid roundedCircle className='brand' />
        </Navbar.Brand>
        <Nav.Link as={Link} to="/home" className="mt-3">
          <FaHome />
        </Nav.Link>
        <Nav.Link as={Link} to="/profile">
          <FaIdBadge />
        </Nav.Link>
        <Nav.Link as={Link} to="/subscribedChannelsList">
          <FaClipboardList />
        </Nav.Link>
        <Nav.Link as={Link} to="/bookmarkedPosts">
          <FaBookmark />
        </Nav.Link>
        <Nav.Link as={Link} to="/createNewPost">
          <FaPlus />
        </Nav.Link>
      </Nav>
      <div className="profile-image-wrapper">
        <OverlayTrigger
          trigger="click"
          placement="top"
          overlay={popover}
        >
          <Image src="account.png" roundedCircle fluid className='logout' />
        </OverlayTrigger>
      </div>
    </Navbar>
  );
};
export default Sidebar;
