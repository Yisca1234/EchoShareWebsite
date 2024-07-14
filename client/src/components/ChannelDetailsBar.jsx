import { useState, useEffect } from 'react';
import { Image, Button, Card, Form, Modal } from 'react-bootstrap';
import { FaCog } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { getUserfollowing, getAvatar, getUserId } from '../redux/user/selectors';
import apiClient from '../utils/apiClient.js';
import axios from 'axios';
import { updateAvatar } from '../redux/user/actions.js';
import { useNavigate } from 'react-router-dom';
import {formatPostDate1} from '../utils/formatPostDate.js';


const ChannelDetailsBar = () => {
  const [modalShow, setModalShow] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageSrc2, setImageSrc2] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cloud_name = "dojexlq8y";
  const avatar = useSelector(getAvatar);
  const numFollowing = useSelector(getUserfollowing).length;
  const { username, imageLink, description, phone, Followers, avatarSetDate } = avatar;
  const userId = useSelector(getUserId);
  const joiningDate = formatPostDate1(avatarSetDate);
  useEffect(() => {
    if (imageLink) {
      setImageSrc(`https://res.cloudinary.com/${cloud_name}/image/upload/${imageLink}`);
      setImageSrc2(`https://res.cloudinary.com/${cloud_name}/image/upload/${imageLink}`);
    } else {
      setImageSrc('account.png');
      setImageSrc2('account.png');
    }
  }, [imageLink]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageSrc2(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    let photoData = null;

    if (formData.get('imageInput').size) {
      try {
        const api_key = "459359754131954";
        const signatureResponse = await apiClient.get('/get-signature');
        const data = new FormData();
        data.append("file", formData.get('imageInput'));
        data.append("api_key", api_key);
        data.append("signature", signatureResponse.data.signature);
        data.append("timestamp", signatureResponse.data.timestamp);

        const cloudinaryResponse = await axios.post(`https://api.cloudinary.com/v1_1/${cloud_name}/auto/upload`, data, {
          headers: { "Content-Type": "multipart/form-data" }
        });
        photoData = {
          public_id: cloudinaryResponse.data.public_id,
          signature: cloudinaryResponse.data.signature
        };
      } catch (error) {
        console.error("Image upload failed:", error);
      }
    }

    try {
      const formDataToSubmit = {
        username: formData.get('username'),
        image: photoData,
        description: formData.get('description'),
        phone: formData.get('phone'),
      };
      await dispatch(updateAvatar(formDataToSubmit, userId));
      setModalShow(false);
    } catch (error) {
      console.error("Profile update failed:", error);
      navigate('/home');
    }
  };

  return (
    <div className="channel-section">
      <Modal show={modalShow} onHide={() => setModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group controlId="formUsername">
              <Form.Label>Channel Name</Form.Label>
              <Form.Control required type="text" name='username' defaultValue={username} />
            </Form.Group>
            <Form.Group className='mt-3'>
              {imageSrc2 && (
                <div>
                  <Image src={imageSrc2} fluid className="profile-image-wrapper" />
                </div>
              )}
              <input type="file" id="image" accept="image/*" name='imageInput' onChange={handleImageChange} />
            </Form.Group>
            <Form.Group controlId="formUserDescription">
              <Form.Label>Description</Form.Label>
              <Form.Control type="text" name='description' defaultValue={description} />
            </Form.Group>
            <Form.Group controlId="formUserPhone">
              <Form.Label>Phone</Form.Label>
              <Form.Control type="text" name='phone' defaultValue={phone} />
            </Form.Group>
            <Button variant="primary" type="submit">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
      <div className="line1">
        <Image src={imageSrc} roundedCircle className="channel-image" />
        <div style={{ height: '50%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <div className="profile-image-wrapper">
            <Button variant="primary" className='button3' onClick={() => setModalShow(true)}>Edit Profile</Button>
          </div>
        </div>
      </div>
      <div className="short-bold-text mt-1">{username}</div>
      <div className="mt-3">
        <strong>{numFollowing}</strong> following <strong>{Followers.length}</strong> followers
      </div>
      <div className="mt-3">Joining on:   <strong>{joiningDate}</strong></div>
      <div>
        <div className="description-box mt-3">
          {description}
        </div>
      </div>
    </div>
  );
};

export default ChannelDetailsBar;
