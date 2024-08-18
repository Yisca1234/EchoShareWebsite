import { useDispatch, useSelector } from 'react-redux';

import { Container, Row, Col, Image, Badge, Button } from 'react-bootstrap';
import { handleDeletePost } from '../redux/user/actions.js';

const SmallPost = ({ postShortContent }) => {
  const postId = postShortContent._id;
  const {data} =postShortContent;
  const {text, img} = data;
  const {imageLink} = img;
  let url;
  if(imageLink){
    const cloud_name = "dojexlq8y"
    url = `https://res.cloudinary.com/${cloud_name}/image/upload/${imageLink}`
  }
  const dispatch = useDispatch();

  const handleDeletePostButton = async () => {
    await dispatch(handleDeletePost(postId));
  }
  return (

    <Container className="mt-4 p-3 container2">

      <Row className="mt-2">
        <Col>
          <p>{text}</p>
        </Col>
      </Row>

      {imageLink &&
      <Row className="mt-2">
        <Col>
          <img src={url} alt="post image" className='img1' />
        </Col>
      </Row>}

      <Row className="mt-3 justify-content-around text-center">
        <Col>
        <Button variant="primary" size="sm" onClick={handleDeletePostButton}>Delete</Button>
        </Col>
      </Row>
    </Container>
  );

};

export default SmallPost;
