import axios from 'axios';
import {
  LOGIN_REQUEST,
  LOGIN_SUCCESS,
  LOGIN_FAILURE,
  LOGOUT,
  REGISTER_REQUEST,
  REGISTER_SUCCESS,
  REGISTER_FAILURE,
} from './actionTypes';

import { userRequest } from '../user/actions.js';
import apiClient from '../../utils/apiClient.js'



export const logoutRequest = () => ({
  type: LOGOUT,
});


export const registerSuccess = (userEmail) => ({
  type: REGISTER_SUCCESS,
  payload: {userEmail },
});


export const registerFailure = (error) => ({
  type: REGISTER_FAILURE,
  payload: { error},
});


export const loginSuccess = (userEmail, token) => ({
  type: LOGIN_SUCCESS,
  payload: {userEmail, token},
});

export const loginFailure = (error) => ({
  type: LOGIN_FAILURE,
  payload: {error: error || 'Network error'},
});


export const login = (useremail, password) => async (dispatch) => {
  try {
    const response = await apiClient.post('/login', { useremail, password });

    try {
      sessionStorage.setItem('jwtToken', response.data.token);
      sessionStorage.setItem('userId', response.data.user._id);
    } catch (e) {
      
    }  

    await dispatch(loginSuccess(response.data.userEmail, response.data.token));
    await dispatch(userRequest(response));
    
  } catch (error) {
    dispatch(loginFailure(error.response.data.message));
  }
};




export const logoutAction = () => async (dispatch) => {
  await sessionStorage.removeItem('jwtToken');
  await sessionStorage.removeItem('userId');
  await dispatch(logoutRequest());
}





export const register = (emailUser, password) => async (dispatch) => {
  try {
    const response = await apiClient.post('/signup', { emailUser, password });

    sessionStorage.setItem('jwtToken', response.data.token);
    sessionStorage.setItem('userId', response.data.user._id);
  
    await dispatch(registerSuccess(response.data.emailUser));
    await dispatch(userRequest(response));
    
  } catch (error) {
    await dispatch(registerFailure(error.response.data.message));
  }
};

