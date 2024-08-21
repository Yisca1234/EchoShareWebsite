import { Container, Nav } from 'react-bootstrap';
import Post from './Post.jsx'; 
import '../styles/CustomScrollbar.css'; 
import { allPostsSelector } from '../redux/post/selectors.js';
import { useSelector, useDispatch } from 'react-redux';
import { useState, useEffect, useRef } from 'react';
import { getAllPosts, handleView } from '../redux/post/actions.js';
import { getUserId, getUserfollowing } from '../redux/user/selectors.js'
import { useInView } from 'react-intersection-observer';




const ContentSection = () => {
  const [loading, setLoading] = useState(false);
  const [typeOfSortOfSection, setTypeOfSortOfSection] = useState('foryou');
  const viewedPostsArray = useRef([]);
  const { ref, inView } = useInView({
    threshold: 0.1,
  });
  const dispatch = useDispatch();
  const list_following = useSelector(getUserfollowing);
  const allPosts = useSelector(allPostsSelector);
  const userId = useSelector(getUserId);
  useEffect(() => {
    function1();
  }, [typeOfSortOfSection]);

  useEffect(() => {
    if(typeOfSortOfSection === 'following'){
      function1(true);
    }
  }, [list_following]);


  const fetchPosts = async (flag = false) => {
    const exclude = allPosts[typeOfSortOfSection].length === 0 || flag ? null : allPosts[typeOfSortOfSection].map(post => post._id).join(',');
    await dispatch(getAllPosts(userId, 10, exclude, typeOfSortOfSection));
  };

  useEffect(() => {
    if(inView){
      fetchPosts(); 
    }
  }, [inView]);



  const handleForYou = async () => {
    setTypeOfSortOfSection('foryou');
  };

  const handleFollowing = async () => {
    setTypeOfSortOfSection('following');
  };


  const intervalFunction = async ()=> {
    if(viewedPostsArray.current.length>0){
      await dispatch(handleView(viewedPostsArray.current, userId));
      viewedPostsArray.current = [];   
    }
  }
  useEffect(() => {
    const intervalId = setInterval(intervalFunction, 45000);
  
    return () => {
      clearInterval(intervalId);
      intervalFunction();
    };
  }, []);
  

  const incrementView = (postId)=> {
    viewedPostsArray.current.push(postId);    
  }

  const function1 = async (flag = false) => {
    setLoading(true);
    await fetchPosts(flag);
    setLoading(false);
  }


  return (
    <Container 
      className="border custom-scroll contentBar" 
      style={{ 
        backgroundColor: 'white', 
        width: '50%', 
        display: 'inline-block', 
        marginBottom: '300px', 
        marginRight: '38%', 
        overflowY: 'auto'
      }}
    >
      <Nav variant="tabs" className="fixed-nav"> {/* Sticky navbar */}
        <Nav.Item 
          className={`navItem ${typeOfSortOfSection === 'foryou' ? 'active2' : ''}`} 
          style={{ borderRight: '1px solid lightgray' }} 
          onClick={handleForYou}
        >
          <Nav.Link>
            For You
          </Nav.Link>
        </Nav.Item>
        <Nav.Item 
          className={`navItem ${typeOfSortOfSection === 'following' ? 'active2' : ''}`} 
          onClick={handleFollowing}
        >
          <Nav.Link>
            Following
          </Nav.Link>
        </Nav.Item>
      </Nav>
      <div className="post-list">
        {loading ? (
          <h1>Loading posts...</h1>
        ) : 
        allPosts[typeOfSortOfSection]?.length > 0 ? (
        <>
          {allPosts[typeOfSortOfSection].map((post, index) => (
            <div className="post-margin postOfList" key={index}>
            <Post
              post={post}
              incrementView={incrementView}
            />
            </div>
          ))}
          <div className='box10' ref={ref}>preparing more posts for you...</div>
        </>
        ) : (
          <h1>have no posts</h1>
        )}
      </div>
    </Container>
  );
  
};

export default ContentSection;
