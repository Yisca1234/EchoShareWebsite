import {
  SUCCESS_GET_POSTS,
  FAILURE_GET_POSTS,
  SUCCESS_LIKE_REMOVED,
  SUCCESS_LIKE_ADDED,
  VIEW_SUCCESS,
  FOLLOW_POSTS,
  UNFOLLOW_POSTS,
  CHANGE_OF_FOLLOWING,
  LOGOUT,
  ADD_COMMENT,
} from './actionTypes';
import apiClient from '../../utils/apiClient.js'

import {handleBookmarkChanges, bookmarkViewSuccess} from '../user/actions.js'

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


export const view_success = (updatedArray, userId) => ({
  type: VIEW_SUCCESS,
  payload: { updatedArray, userId },
});

export const follow_posts = (idChannel) => ({
  type: FOLLOW_POSTS,
  payload: { idChannel },
});

export const unfollow_posts = (idChannel) => ({
  type: UNFOLLOW_POSTS,
  payload: { idChannel },
});

export const add_comment = (idComment, postId) => ({
  type: ADD_COMMENT,
  payload: { idComment, postId},
});

export const change_of_following = () => ({
  type: CHANGE_OF_FOLLOWING,
});

export const getAllPosts = (userId, limit, exclude, typeOfSort) => async (dispatch) =>{
  const response = await apiClient.post('/post',{ userId, limit, exclude, typeOfSort });
  await dispatch(getPostsSuccess(response.data.listOfPosts, typeOfSort));
};


export const handlePostLike = (postId, userId, pressLike) => async (dispatch) =>{
  const response = await apiClient.put('/post/like', { postId, userId, pressLike });
  if(response.data.message ==='success'){
    if(pressLike){
      await dispatch(postAddLike(postId, userId));
      await dispatch(handleBookmarkChanges(userId, postId, 'like'));
    }
    else {
      //console.log('unlike');
      await dispatch(postRemoveLike(postId, userId));
      await dispatch(handleBookmarkChanges(userId, postId, 'unlike'));

    }
  } else {
    //console.log('error');
  }

}

export const handleView = (viewedPosts, userId) => async (dispatch) =>{

  const response = await apiClient.put('/post/view', { viewedPosts, userId });
  const updatedArray = response.data.viewedPosts;
  if(updatedArray.length<viewedPosts.length){
    //console.log('didnt increment view all the posts ');
  }
  if(updatedArray.length>0){
    await dispatch(view_success(updatedArray, userId));
    await dispatch(bookmarkViewSuccess(updatedArray, userId));
  }

}

export const handleFollowingPosts = (idChannel, type) => async (dispatch) =>{
  //type equal one if the follow button was pressed and two if the unfollow one
  if(type===1){
    await dispatch(follow_posts(idChannel));
  } else {
    await dispatch(unfollow_posts(idChannel));
  }
}

