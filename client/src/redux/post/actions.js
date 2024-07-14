import {
  SUCCESS_GET_POSTS,
  FAILURE_GET_POSTS,
  SUCCESS_LIKE_REMOVED,
  SUCCESS_LIKE_ADDED,
  VIEW_SUCCESS,
  LOGOUT,
} from './actionTypes';
import apiClient from '../../utils/apiClient.js'

import {handleBookmarkChanges} from '../user/actions.js'

export const logout1 = () => ({
  type: LOGOUT,
});

export const getPostsSuccess = (posts, typeOfSort) => ({
  type: SUCCESS_GET_POSTS,
  payload: { posts, typeOfSort },
});

export const getPostsFailure = (error) => ({
  type: FAILURE_GET_POSTS,
  payload: { error },
});

export const postAddLike = (postId, userId) => ({
  type: SUCCESS_LIKE_ADDED,
  payload: { postId, userId },
});

export const postRemoveLike = (postId, userId) => ({
  type: SUCCESS_LIKE_REMOVED,
  payload: { postId, userId },
});


export const view_success = (postId, userId) => ({
  type: VIEW_SUCCESS,
  payload: { postId, userId },
})

export const getAllPosts = (userId, limit, exclude, typeOfSort) => async (dispatch) =>{
  const response = await apiClient.post('/post',{ userId, limit, exclude, typeOfSort });
  await dispatch(getPostsSuccess(response.data.listOfPosts, typeOfSort));
}


export const handlePostLike = (postId, userId, pressLike) => async (dispatch) =>{
  const response = await apiClient.put('/post/like', { postId, userId, pressLike });
  if(response.data.message ==='success'){
    if(pressLike){
      await dispatch(postAddLike(postId, userId));
      await dispatch(handleBookmarkChanges(userId, postId, 'like'));
    }
    else {
      console.log('unlike');
      await dispatch(postRemoveLike(postId, userId));
      await dispatch(handleBookmarkChanges(userId, postId, 'unlike'));

    }
  } else {
    console.log('error');
  }

}

export const handleView = (postId, userId) => async (dispatch) =>{

  const response = await apiClient.put(`/post/${postId}/view`, { userId });
  if(response.data.message == 'success'){
    await dispatch(view_success(postId, userId));
  } else {
    console.log('didnt increment view to the post ', postId);
  }

}

