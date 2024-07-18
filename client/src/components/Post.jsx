
import { Container, Row, Col, Image, Badge, Button } from 'react-bootstrap';
import { FaThumbsUp, FaComment, FaShare, FaEye, FaBookmark,FaQuoteRight, FaInfoCircle,FaFileAlt } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import {getFollowing, getUserId, getBookmaredPosts} from '../redux/user/selectors.js';
import { useState, useEffect } from 'react';
import {handleFollow, handleBookmark} from '../redux/user/actions.js'
import {handlePostLike} from '../redux/post/actions.js'
import {formatPostDate} from '../utils/formatPostDate.js';
import { useInView } from 'react-intersection-observer';


const Post = ({ post, incrementView }) => {
  const [isFollow, setIsFollow] = useState(null)
  const [isActive, setIsActive] = useState({
    likeButton: false,
    commentButton: false,
    qouteButton: false,
    bookmarkButton: false,
    informationButton: false,
  });
  const [loading, setLoading] = useState(new Array(3).fill(false));
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true,
  });
  const { data, createdAt } = post;
  let user;
  if(post.user[0]){
    user = post.user[0];
  } else {
    user = post.user;
  }
 
  const postId = post._id;
  const listFollowing = useSelector(getFollowing);
  const postDate = formatPostDate(createdAt);
  const {_id} = user;
  const dispatch = useDispatch();
  const bookmarkedListOfUser = useSelector(getBookmaredPosts);
  const idOfBookmarked = bookmarkedListOfUser.map((obj => obj._id));
  const isBookmarked= idOfBookmarked.length>0 ? idOfBookmarked.includes(postId)  : false;
  useEffect(() => {
    const checkIfFollowing = () => {
      const isFollowed = listFollowing.some(user => user._id === _id);
      if(isFollowed!=isFollow){
        setIsFollow(isFollowed);
      }
    };

    checkIfFollowing();
  }, [listFollowing]);  


  useEffect(() => {
    if (inView) {
      incrementView(postId);
    }
  }, [inView]);

  const cloud_name = "dojexlq8y"
  const {text, img, likes, comments, qoutes, views} = data;
  //console.log(likes);
  const {avatar} = user;
  let imgLinkPost;
  if(img.exists){
    imgLinkPost = `https://res.cloudinary.com/${cloud_name}/image/upload/${img.imageLink}`
  }
  const {username, imageLink}= avatar;
  let profileImage;
  const idFollower = useSelector(getUserId);
  const isLiked = likes.includes(idFollower);
  if(imageLink){
    profileImage= `https://res.cloudinary.com/${cloud_name}/image/upload/${imageLink}`;
  }
  else{
    profileImage= 'account.png';
  }

  const handleFollowButton = async (idChannel) => {
    handleLoading(true, 0);
    await dispatch(handleFollow(idFollower, idChannel, !isFollow)).then(
      await setIsFollow(pre=>!pre)
    )
    handleLoading(false, 0);
  };

  const handlePostButtons = async (nameOfButton, conditionOfButton) => {
    switch (nameOfButton) {
      case 'likeButton': {
        handleLoading(true, 1);
        // console.log(postId, idFollower, !conditionOfButton);
        await dispatch(handlePostLike(postId, idFollower, !conditionOfButton));
        handleLoading(false, 1);
        break;
      }
      case 'commentButton': {
        console.log('commentButton');
        break;
      }
      case 'bookmarkButton': {
        handleLoading(true, 2);
        await dispatch(handleBookmark(idFollower, postId, isBookmarked, _id));
        handleLoading(false, 2);
        console.log('bookmarkButton');
        break;
      }
      case 'informationButton': {
        console.log('informationButton');
        break;
      }
      default: {
        console.log('Unknown button');
        break;
      }
    }
    setIsActive(prevState => ({
      ...prevState,
      [nameOfButton]: !conditionOfButton,
    }));
  };

  const handleLoading = (state, index) => {
    setLoading((pre) => {
      const updated = [...pre];
      updated[index] = state;
      // console.log(updated);
      return updated;
    });
  }



  return (

    <Container ref={ref} className="mt-4 border p-3">
      <div >
        <div xs={2} className='con'>
          <Image src={profileImage} fluid  style={{borderRadius: '50%', width: '35px', height: '35px', objectFit: 'cover' }}/>
        </div>
        <div xs={10} className="text-muted con"  >
          <strong>{username}</strong> &middot; {postDate}
        </div>
        <Col xs={3} className='con' >
          <Button variant="primary" size="sm" disabled={loading[0]} className={` ${loading[0] && 'loading1'}`} onClick={()=>{handleFollowButton(_id)}}>{isFollow ? 'UnFollow' : 'Follow'}</Button> 
        </Col>
      </div>

      <Row className="mt-2">
        <Col>
          <p>{text}</p>
        </Col>
      </Row>

      {img.exists && <Row>
        <Col>
          <Image src={imgLinkPost} fluid />
        </Col>
      </Row>}

      <Row className="mt-3 justify-content-around text-center">
        <Col className={`pointer ${isLiked && 'active1'} ${loading[1] && 'loading1'}`} disabled={loading[1]} onClick={()=>{handlePostButtons('likeButton',isLiked)}}>
          <FaThumbsUp /> {likes.length}
        </Col>
        <Col>
          <FaComment /> {comments.length}
        </Col>
        <Col>
          <FaQuoteRight /> {qoutes.length}
        </Col>
        <Col >
          <FaEye /> {views.length}
        </Col>
        <Col className={`pointer ${isBookmarked && 'active1'} ${loading[2] && 'loading1'}`} disabled={loading[2]} onClick={()=>{handlePostButtons('bookmarkButton',isBookmarked)}}>
          <FaBookmark />
        </Col>
        <Col>
          <FaFileAlt /> 
        </Col>
      </Row>
    </Container>
  );
}

export default Post;
