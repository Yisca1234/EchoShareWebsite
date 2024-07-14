import '../styles/NotFound.css';
import { useNavigate } from 'react-router-dom';
import { Button } from 'react-bootstrap';



const NotFound = () => {
  const navigate = useNavigate();
  const handleMovingToLogin = () => {
    navigate('/login');
  }
  return(
    <div className="not-found-container">
      <p className="error-text">Oops! Looks like you're lost in the digital wilderness.</p>
      <Button className="home-link" onClick={handleMovingToLogin} >Lets Start All Over Again!</Button>
    </div>
  )
};



export default NotFound;
