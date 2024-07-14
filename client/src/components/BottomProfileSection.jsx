
import {Button, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const BottomProfileSection = () => {
  const navigate = useNavigate();
  const handleButton = ()=> {
    navigate('/createNewPost');
  }

  return(
    <Container className='box4'>
      <Button variant="primary" className='button4' onClick={handleButton}>Create new post</Button>

    </Container>
  )
}

export default BottomProfileSection