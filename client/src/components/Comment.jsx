import { Button } from "react-bootstrap";
import { FaThumbsUp } from "react-icons/fa";
import "../styles/comment.css"; 
import {formatPostDate} from '../utils/formatPostDate.js';

const Comment = ({ _id, data, post, user, createdAt }) => {
  const {text, likes} = data;
  const imageLink = user?.avatar?.imageLink;
  const channelName = user?.avatar?.username;
  const cloud_name = "dojexlq8y";
  const profileImage = imageLink ? `https://res.cloudinary.com/${cloud_name}/image/upload/${imageLink}` : '../public/account.png';
  const commentDate = formatPostDate(createdAt);

  return (
    <div className="comment-container">
      <div className="comment-header">
        <img
          src={profileImage}
          className="profile-image"
        />
        <div className="comment-info">
          <span className="channel-name">{channelName}</span>
          <span className="timestamp">{commentDate}</span>
        </div>
      </div>
      <div className="comment-text text7">
        {text}
      </div>
      <div className="like-button-container">
        <Button variant="outline-primary" className="like-button">
          <FaThumbsUp /> {likes.length}
        </Button>
      </div>
    </div>
  );
};

export default Comment;
