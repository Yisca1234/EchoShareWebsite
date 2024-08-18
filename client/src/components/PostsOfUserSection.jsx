import SmallPost from './SmallPost.jsx'
import { Container, Row, Col, Image, Button } from 'react-bootstrap';
import { userPostsSelector } from '../redux/user/selectors.js'
import { useSelector, useDispatch ,} from 'react-redux';
import { useNavigate } from 'react-router-dom';



const PostsOfUserSection = () => {
  const userPosts = useSelector(userPostsSelector);
  const navigate = useNavigate();

  const navi = () => {
    navigate("/createNewPost");
  };
  return (
    <Container className="container1 " style={{display: 'inline-block', height: '100vh'}}>
      {userPosts[0] ? 
      <div className="post-list">
        {userPosts.map((post, index) => (
        <div className="post-margin postOfList" key={index}> 
          <SmallPost  postShortContent={post}/>
        </div>
        ))}
      </div>:
      <div className="container4">
        <h3 className='text1'>You have no posts yet</h3>
        <a className='text2 pointer' onClick={navi}>I want to start saying something to the world!</a>
      </div>}
    </Container>
    
  );
};

export default PostsOfUserSection;
