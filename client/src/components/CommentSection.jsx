import { useState } from 'react';
import { Form, InputGroup, Row, Col } from "react-bootstrap";
import { FaPaperPlane } from "react-icons/fa"
import { useNavigate } from 'react-router-dom';
import '../styles/commentSection.css';
import { useSelector, useDispatch } from 'react-redux';
import {getAvatarImage, getUserId, getAvatarName} from '../redux/user/selectors.js';
import Comment from './Comment.jsx';
import {handleCreateComment } from '../redux/comment/actions.js';
import {postComments} from '../redux/comment/selectors.js'

const CommentSection = ({postId}) => {
  const [isSending, setIsSending] = useState(false);
  const [newComment, setNewComment] = useState('');
  const avatarImage = useSelector(getAvatarImage);
  const userId = useSelector(getUserId);
  const username = useSelector(getAvatarName);
  const commentsList = useSelector(postComments(postId)) || [];
  const cloud_name = "dojexlq8y";
  const profileImage = avatarImage ? `https://res.cloudinary.com/${cloud_name}/image/upload/${avatarImage}` : 'account.png';
  const dispatch = useDispatch();
  const navigate = useNavigate();


  const handleCommentChange = (e) => {
    setNewComment(e.target.value);
  };

  const handleSendComment = async () => {
    if (newComment.length > 0) {
      try {
        setIsSending(true);
        const comment = { text: newComment };
        await dispatch(handleCreateComment(postId, comment, userId));
        setNewComment('');
        console.log('comment created');
      } catch (error) {
        console.error("Error sending comment:", error);
      } finally {
        setIsSending(false);
      }
    }
  };
  

  const handleProfile = () => {
    navigate('/profile');
  }

  return (
    <div className="comment-box-container1">
      {commentsList.length>0 ? (
        <div>
          {commentsList.map((comment, index) => (
            <Comment {...comment} key={index}/>
          ))}
        </div>
      ) : (
        <div>
          <p className='text8'>There are no comments for this post, be the first!</p>
        </div>
      )}
      {username ? (
        <div className="comment-box-container w-100">
          <img
            src={profileImage}
            className="profile-image"
          />
          <InputGroup className="comment-input-group" >
            <Form.Control
              as="textarea"
              rows={1}
              placeholder="Write a comment..."
              className="comment-textbox"
              value={newComment}
              maxLength={400}
              onChange={handleCommentChange}
            />
            <InputGroup.Text onClick={handleSendComment} className="send-icon">
              <FaPaperPlane disabled={isSending} className={isSending && 'loading1'}/>
            </InputGroup.Text>
          </InputGroup>
        </div>
      ) : (
        <div className="comment-box-container w-100">
          <p className='text8'>You need to create a channel to post comments</p>
          <button className='btn1' onClick={handleProfile}>Let's Do This!</button>
        </div>
      )}
    </div>
  );
}

export default CommentSection;