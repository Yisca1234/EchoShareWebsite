import { Navbar, Nav, OverlayTrigger, Popover, Image, Button } from 'react-bootstrap';
import { FaIdBadge, FaClipboardList, FaPlus, FaPencilAlt, FaBookmark, FaUser, FaHome, FaBell, FaEnvelope, FaCog, FaComments } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import '../styles/Sidebar.css';
import { logoutAction } from '../redux/auth/actions.js'
import { logout } from '../redux/user/actions.js'
import { logout1 } from '../redux/post/actions.js'
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import ChatNotificationBadge from './chat/ChatNotificationBadge';

const Sidebar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const handleLogout = async () => {
    await dispatch(logoutAction());
    await dispatch(logout());
    await dispatch(logout1());
    await dispatch(logout2());
  }

  const popover = (
    <Popover id="popover-basic">
      <Popover.Body>
        <a href='login'>
          <Button variant="primary" onClick={handleLogout} className="btn-sm">
            LogOut
          </Button>
        </a>
      </Popover.Body>
    </Popover>
  );

  return (
    <Navbar className="sidebar d-flex flex-column vh-100">
      <div className="nav-content-wrapper">
        <div className='top-container'>
          <Navbar.Brand className="text-center">
            <Image src="/echoShare.png" fluid roundedCircle className='brand-small' />
          </Navbar.Brand>

          <Nav className="flex-column nav-buttons-container">
            <Nav.Link as={Link} to="/home" className="nav-item">
              <div className='box11'>
                <FaHome className="nav-icon" />
                <h6 className='text5 mb-0'>Home</h6>
              </div>
            </Nav.Link>
            <Nav.Link as={Link} to="/profile" className="nav-item">
              <div className='box11'>
                <FaIdBadge className="nav-icon" />
                <h6 className='text5 mb-0'>Profile</h6>
              </div>
            </Nav.Link>
            <Nav.Link as={Link} to="/subscribedChannelsList" className="nav-item">
              <div className='box11'>
                <FaClipboardList className="nav-icon" />
                <h6 className='text6 mb-0'>Channels</h6>
              </div>
            </Nav.Link>
            <Nav.Link as={Link} to="/bookmarkedPosts" className="nav-item">
              <div className='box11'>
                <FaBookmark className="nav-icon" />
                <h6 className='text6 mb-0'>Bookmarks</h6>
              </div>
            </Nav.Link>
            <Nav.Link as={Link} to="/createNewPost" className="nav-item">
              <div className='box11'>
                <FaPlus className="nav-icon" />
                <h6 className='text6 mb-0'>New Post</h6>
              </div>
            </Nav.Link>
            <Nav.Link as={Link} to="/chat" className="nav-item">
              <div className='box11 position-relative'>
                <FaComments className="nav-icon" />
                <h6 className='text5 mb-0'>Chat</h6>
                <ChatNotificationBadge />
              </div>
            </Nav.Link>
          </Nav>

        </div>

        <div className="profile-image-wrapper">
          <OverlayTrigger
            trigger="click"
            placement="right"
            overlay={popover}
          >
            <Image src="/account.png" roundedCircle fluid className='logout-small' />
          </OverlayTrigger>
        </div>
      </div>
    </Navbar>
  );
};

export default Sidebar;
