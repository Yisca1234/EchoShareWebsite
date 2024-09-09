import { combineReducers } from 'redux';
import authReducer from './auth/authReducer';
import userReducer from './user/userReducer';
import channelReducer from './channel/channelReducer';
import postReducer from './post/postReducer';
import commentReducer from './comment/commentReducer.js';

const rootReducer = combineReducers({
  auth: authReducer,
  user: userReducer,         
  post: postReducer,          
  channel: channelReducer,
  comment: commentReducer,
});

export default rootReducer;