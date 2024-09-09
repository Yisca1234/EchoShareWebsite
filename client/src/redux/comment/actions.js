import axios from 'axios';
import {
  GET_COMMENTS,
  SUCCESS_CREATE_COMMENT,
  LOGOUT,
} from './actionTypes';

import {add_comment} from '../post/actions.js'

import apiClient from '../../utils/apiClient.js';



export const logoutRequest = () => ({
  type: LOGOUT,
});


export const create_comment = (comment) => ({
  type: SUCCESS_CREATE_COMMENT,
  payload: { comment },
});

export const get_comments = (postId, comments) => ({
  type: GET_COMMENTS,
  payload: {postId, comments},
});


export const handleGetComments = (postId) => async (dispatch) => {
  const response = await apiClient.get(`/comment/${postId}`);
  if(response.data.comments){
    await dispatch(get_comments(postId, response.data.comments));
  }

};


export const handleCreateComment = (postId, comment, userId) => async (dispatch) =>{

  const response = await apiClient.post(`/comment/${postId}`, { userId, comment });
  if(response.data.comment){
    await dispatch(create_comment(response.data.comment));
    // await dispatch(add_comment(comment._id,postId));
  } else {

  }

}

