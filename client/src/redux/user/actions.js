import axios from 'axios';
import {
  USER_REQUEST,
  USER_SUCCESS, 
  USER_FAILURE,
  USER_ADD_POST,
  CREATE_AVATAR,
  SUCCESS_AVATAR,
  FAILURE_AVATAR,
  FOLLOW_SUCCESS,
  UNFOLLOW_SUCCESS,
  DELETE_POST_SUCCESS,
  UNBOOKMARK_SUCCESS,
  BOOKMARK_SUCCESS,
  BOOKMARK_LIKE_SUCCESS,
  BOOKMARK_UNLIKE_SUCCESS,
  BOOKMARK_VIEW_SUCCESS,
  LOGOUT,
} from './actionTypes';
import Swal from 'sweetalert2';
import apiClient from '../../utils/apiClient.js';
import {handleFollowingPosts} from '../post/actions.js'

export const successUpdateAvatar = (avatar) => ({
  type: SUCCESS_AVATAR,
  payload: { avatar },
});



export const addUserPost = (post) => ({
  type: USER_ADD_POST,
  payload: { post },
});


export const userSuccess = (user) => ({
  type: USER_SUCCESS,
  payload: { user },
});

export const userFailure = (error) => ({
  type: USER_FAILURE,
  payload: {error },
});

export const followSuccess = (channel) => ({
  type: FOLLOW_SUCCESS,
  payload: {channel },
});

export const unFollowSuccess = (idChannel) => ({
  type: UNFOLLOW_SUCCESS,
  payload: {idChannel },
});

export const deletePostSuccess = (postId) => ({
  type: DELETE_POST_SUCCESS,
  payload: {postId},
});

export const bookmarkSuccess = (post) => ({
  type: BOOKMARK_SUCCESS,
  payload: {post },
});

export const unBookmarkSuccess = (postId) => ({
  type: UNBOOKMARK_SUCCESS,
  payload: {postId },
});

export const bookmarkLikeSuccess = (userId, postId) => ({
  type: BOOKMARK_LIKE_SUCCESS,
  payload: {userId, postId },
});

export const bookmarkViewSuccess = (updatedArray, postId) => ({
  type: BOOKMARK_VIEW_SUCCESS,
  payload: {updatedArray, postId },
});

export const bookmarkUnlikeSuccess = (userId, postId) => ({
  type: BOOKMARK_UNLIKE_SUCCESS,
  payload: {userId, postId },
});

export const logout = () => ({
  type: LOGOUT,
});



export const userRequest = (response) => async (dispatch) => {
  if(response.data.user){
    dispatch(userSuccess(response.data.user));
  }
  else{
    dispatch(userFailure(response.data.message));
  }

};

export const createAvatar = (formData, userId) => async (dispatch) => {
  const creation = true;
  const response = await apiClient.post('/user/createAvatar', { formData, userId,  creation});
  if(response.data.avatar){
    await dispatch(successUpdateAvatar(response.data.avatar));
  } else{
    Swal.fire({
      title: 'I think we got an error creating your profile!',
      text: response.data.message,
      icon: 'error',
      confirmButtonText: 'OK'
    });
    
  }

}

export const updateAvatar = (formData, userId) => async (dispatch) => {
  const response = await apiClient.put('/user/updateAvatar', { formData, userId });
  if(response.data.avatar){
    await dispatch(successUpdateAvatar(response.data.avatar));
  } else{
    Swal.fire({
      title: 'I think we got an error updating your profile!',
      text: response.data.message,
      icon: 'error',
      confirmButtonText: 'OK'
    });
    
  }
}



export const handleFollow = (idFollower, idChannel, follow) => async (dispatch) => {
  const response = await apiClient.put('/user/follow', { idFollower, idChannel, follow });
  if(response.data.message=='Action succeeded'){
    if(follow){
      await dispatch(followSuccess(response.data.channel));
      // await dispatch(handleFollowingPosts(idChannel, 1));
    } else {
      await dispatch(unFollowSuccess(idChannel));
      // await dispatch(handleFollowingPosts(idChannel, 2));
    }
  } else{
    Swal.fire({
      title: 'I think we got an error!',
      text: response.data.message,
      icon: 'error',
      confirmButtonText: 'OK'
    });
    
  }
}

export const handleDeletePost = (postId) => async (dispatch) => {
  
  const response = await apiClient.delete(`post/deletePost/${postId}`);
  if(response.data.message==="Post deleted successfully"){3
    await dispatch(deletePostSuccess(postId));
  } else{
    Swal.fire({
      title: 'I think we got an error!',
      text: response.data.message,
      icon: 'error',
      confirmButtonText: 'OK'
    });
    
  }

};


export const handleBookmark = (userId, postId, isBookmarked, idChannel) => async (dispatch) => {
  const response = await apiClient.put('/user/bookmark', { userId, postId, isBookmarked, idChannel });
  if(response.data.message=='Action succeeded'){
    if(isBookmarked){
      await dispatch(unBookmarkSuccess(postId));
    } else {
      await dispatch(bookmarkSuccess(response.data.post));
    }
  } else{
    Swal.fire({
      title: 'I think we got an error!',
      text: response.data.message,
      icon: 'error',
      confirmButtonText: 'OK'
    });
    
  }
}

export const handleBookmarkChanges = (userId, postId, type) => async (dispatch) => {
  switch (type){
    case 'like':{
      dispatch(bookmarkLikeSuccess(userId, postId));
      break;
    }
    case 'unlike':{
      dispatch(bookmarkUnlikeSuccess(userId, postId));
      break;
    }
    case 'view':{
      dispatch(bookmarkViewSuccess(userId, postId));
      break;
    }
  }
}

